"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaskRequirements = parseTaskRequirements;
exports.calcAvailableDays = calcAvailableDays;
/**
 * Parse task requirements from raw text using rule-based keyword matching.
 *
 * Strategy: broad patterns + keyword proximity instead of exhaustive format matching.
 * For complex/unusual formats, the embedding LLM (OpenClaw) provides fallback understanding.
 */
function parseTaskRequirements(content, _inputType = 'text') {
    const clean = content.trim();
    return {
        task_name: extractTaskName(clean),
        deadline: extractDeadline(clean),
        deliverables: extractDeliverables(clean),
        constraints: extractConstraints(clean),
        submission_rules: extractSubmissionRules(clean),
        raw_input: clean,
    };
}
// ---- task name -----------------------------------------------
function extractTaskName(text) {
    // "关于...的通知" / "关于...的大赛"
    let m = text.match(/关于(?:举办|开展|组织|举行)?(.+?)(?:的通知|的公告|的通告)/);
    if (m) {
        const inner = m[1].replace(/^[《「『【]|[》」』】]$/g, '').trim();
        if (inner.length > 4)
            return inner;
    }
    // "XX大赛" / "XX竞赛" etc
    m = text.match(/(.{4,60}(?:大赛|竞赛|比赛|挑战赛))/);
    if (m)
        return m[1].trim();
    // First substantial non-empty line
    const lines = text.split(/[\n\r]+/).filter((l) => l.trim().length > 5);
    return lines[0]?.trim().slice(0, 60) || '未命名任务';
}
function extractDeadline(text) {
    const allDates = findAllDates(text);
    if (allDates.length === 0)
        return '未设置截止时间';
    // Priority 0: compound deadline phrases – strongest signal
    const deadlinePhrases = [
        '提交截止', '作品提交', '材料提交', '报送截止', '上交截止',
    ];
    for (const phrase of deadlinePhrases) {
        const idx = text.indexOf(phrase);
        if (idx >= 0) {
            // Find date closest AFTER this phrase (within 40 chars)
            let best = null;
            for (const d of allDates) {
                const dist = d.index - idx;
                if (dist >= 0 && dist < 40 && (!best || dist < Math.abs(best.index - idx))) {
                    best = d;
                }
            }
            if (best)
                return best.iso;
        }
    }
    // Priority 1: general submission keywords – proximity-based
    const submitKeywords = [
        '发送至', '报送至', '递交至', '提交至', '上交至',
        '发送到', '报送', '提交', '上交', '递交',
        '截止', 'DDL', 'deadline', '前】', '前]',
    ];
    // Find date closest to any submission keyword
    let bestDate = null;
    let bestDist = Infinity;
    for (const kw of submitKeywords) {
        const kwIdx = text.indexOf(kw);
        if (kwIdx < 0)
            continue;
        for (const d of allDates) {
            const dist = Math.abs(kwIdx - d.index);
            if (dist < bestDist) {
                // Bonus: prefer dates with explicit times when distances are similar
                const effectiveDist = d.hasExplicitTime ? dist : dist + 50;
                if (effectiveDist < bestDist + 50) {
                    bestDate = d;
                    bestDist = dist;
                }
            }
        }
    }
    if (bestDate)
        return bestDate.iso;
    // No keyword found – prefer latest date with explicit time
    const withTime = allDates.filter((d) => d.hasExplicitTime);
    if (withTime.length > 0) {
        withTime.sort((a, b) => b.iso.localeCompare(a.iso));
        return withTime[0].iso;
    }
    // Fallback: absolute latest
    allDates.sort((a, b) => b.iso.localeCompare(a.iso));
    return allDates[0].iso;
}
function findAllDates(text) {
    const results = [];
    // Full date: 2026年6月22日12:00 or 2026年6月22日
    const reFull = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2}:\d{2})?/g;
    for (const m of text.matchAll(reFull)) {
        results.push({
            full: m[0],
            iso: formatISODate(m[1], m[2], m[3], m[4] || '23:59'),
            index: m.index,
            hasExplicitTime: !!m[4],
        });
    }
    // Short date without year: 6月22日 (exclude those already matched with year)
    const reShort = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/g;
    const year = new Date().getFullYear().toString();
    for (const m of text.matchAll(reShort)) {
        // Skip if this match is part of a full date (check if preceded by 4-digit year)
        const before = text.slice(Math.max(0, m.index - 6), m.index);
        if (/\d{4}\s*年\s*$/.test(before))
            continue;
        results.push({
            full: m[0],
            iso: formatISODate(year, m[1], m[2], '23:59'),
            index: m.index,
            hasExplicitTime: false,
        });
    }
    // ISO date: 2026-06-22 or 2026/06/22
    const reISO = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})[\sT](\d{1,2}:\d{2})?/g;
    for (const m of text.matchAll(reISO)) {
        results.push({
            full: m[0],
            iso: formatISODate(m[1], m[2], m[3], m[4] || '23:59'),
            index: m.index,
            hasExplicitTime: !!m[4],
        });
    }
    // Also extract time from "下午14:00-18:00" style patterns near dates
    // Look for 下午/上午 near dates and adjust the time
    for (const r of results) {
        if (r.hasExplicitTime)
            continue;
        const afterText = text.slice(r.index + r.full.length, r.index + r.full.length + 20);
        const timeMatch = afterText.match(/(?:下午|上午|晚上)?(\d{1,2}):(\d{2})/);
        if (timeMatch && timeMatch.index < 15) {
            let hour = parseInt(timeMatch[1]);
            if (afterText.includes('下午') && hour < 12)
                hour += 12;
            const isoMatch = r.iso.match(/^(\d{4}-\d{2}-\d{2})T/);
            if (isoMatch) {
                r.iso = `${isoMatch[1]}T${hour.toString().padStart(2, '0')}:${timeMatch[2]}:00`;
                r.hasExplicitTime = true;
            }
        }
    }
    return results;
}
// ---- deliverables --------------------------------------------
function extractDeliverables(text) {
    const found = [];
    // Pattern 1: "将XX发送至" / "将XX报送至" → XX is the deliverable
    const sendPat = /将([^将]{2,40}?)(?:发送|报送|提交|上交|递交)(?:至|到|给)/g;
    for (const m of text.matchAll(sendPat)) {
        const item = m[1].trim().replace(/[【】\[\]《》「」『』]/g, '');
        if (item.length > 2 && item.length < 50)
            found.push(item);
    }
    // Pattern 2: Bullet-point list under deliverable-related section headers
    // Handles formats like:
    //   三、交付物清单
    //   参赛团队需提交以下材料：
    //   - OpenClaw 插件代码（含完整项目源码）
    //   - README.md 项目说明文档
    const bulletSectionMatch = text.match(/(?:交付物|提交材料|需提交|需准备|需报送|报名材料|提交以下)[^\n]{0,30}[：:\s]*\n((?:[^\n]*[-•*]\s+\S+[^\n]*\n?)+)/);
    if (bulletSectionMatch) {
        const lines = bulletSectionMatch[1].split(/[\n\r]+/);
        for (const line of lines) {
            // Extract text after bullet marker: "- item（备注）" → "item"
            const bulletMatch = line.match(/[-•*]\s+(.+)/);
            if (bulletMatch) {
                const item = bulletMatch[1]
                    .replace(/[（(][^）)]*[）)]/g, '') // remove parenthetical notes
                    .replace(/[【】\[\]《》「」『』]/g, '')
                    .trim();
                if (item.length > 2 && item.length < 80)
                    found.push(item);
            }
        }
    }
    // Pattern 3: Section-style with indented/numbered items
    if (found.length === 0) {
        const sectionMatch = text.match(/(?:交付物|提交材料|需提交|需准备|需报送|报名材料)[^。\n]{0,10}[：:\s]*\n([\s\S]{20,300}?)(?:\n\n|\n[五六七八九]|\n【|$)/);
        if (sectionMatch) {
            const lines = sectionMatch[1].split(/[\n\r]+/);
            for (const line of lines) {
                const clean = line.replace(/^[\s\d.\-•*]+/, '').trim();
                if (clean.length > 2 && clean.length < 80 && !clean.startsWith('--')) {
                    found.push(clean);
                }
            }
        }
    }
    // Pattern 4: Keyword scanning for common deliverable types
    if (found.length === 0) {
        const keywords = [
            '申请表', '申报表', '申报书', '报名表',
            'PPT', '答辩', '演示视频', '视频',
            '插件代码', '源码', 'openclaw.plugin.json',
            'README', '技术文档', '设计文档', '项目方案',
        ];
        for (const kw of keywords) {
            if (text.includes(kw) && !found.some((d) => d.includes(kw))) {
                found.push(kw);
            }
        }
    }
    // Clean up
    return [...new Set(found)]
        .map((d) => d.replace(/[）\)」』】]$/, '').trim())
        .filter((d) => {
        if (d.length < 2 || d.length > 80)
            return false;
        if (/^(以下|如下|包括|包含|需|需要|提交|各|请|参赛|所有|作品|更多|欢迎)/.test(d))
            return false;
        if (/需提交|需准备|交付物|材料清单|提交以下/.test(d))
            return false;
        if (/[。；;]/.test(d))
            return false;
        return true;
    });
}
// ---- constraints ---------------------------------------------
function extractConstraints(text) {
    const constraints = [];
    // Extract from 【】 bracket sections: "【竞赛对象】非毕业年级本科生..."
    const sectionPatterns = [
        /【(?:竞赛对象|参赛对象|参赛要求|报名条件|注意事项|基本要求)】\s*([^【\n]+)/g,
        /【[^】]*?】[^【\n]*?(?:不超过|不多于|不少于|至少|需|必须|不得|应当|限报|须为|≤|≥)[^【\n]*/g,
    ];
    for (const pat of sectionPatterns) {
        for (const m of text.matchAll(pat)) {
            constraints.push(m[0].replace(/^【[^】]*】/, '').trim());
        }
    }
    // Broader scan: any line containing constraint keywords
    const lines = text.split(/[\n\r]+/);
    for (const line of lines) {
        const clean = line.replace(/【[^】]*】/g, '').trim();
        if (clean.length > 4 && clean.length < 120) {
            if (/不超过|不多于|不少于|至少|需|必须|不得|应当|限报|须为|≤|≥|仅限/.test(clean)) {
                if (!constraints.includes(clean))
                    constraints.push(clean);
            }
        }
    }
    return [...new Set(constraints)].slice(0, 10);
}
// ---- submission rules ----------------------------------------
function extractSubmissionRules(text) {
    const rules = [];
    // Extract lines with submission info
    const lines = text.split(/[\n\r]+/);
    for (const line of lines) {
        const clean = line.replace(/【[^】]*】/g, '').trim();
        if (clean.length > 5 && clean.length < 150) {
            if (/发送|邮箱|邮件|格式|命名|打包|ZIP|报送|电子版|纸质版/.test(clean)) {
                rules.push(clean);
            }
        }
    }
    if (rules.length === 0) {
        // Extract email addresses directly
        for (const m of text.matchAll(/\S+@\S+\.\S+/g)) {
            rules.push(`电子邮箱: ${m[0]}`);
        }
        // Extract QQ group
        for (const m of text.matchAll(/QQ[群交流]*[：:\s]*(\d+)/g)) {
            rules.push(`QQ交流群: ${m[1]}`);
        }
    }
    return [...new Set(rules)];
}
// ---- helpers -------------------------------------------------
function formatISODate(year, month, day, time) {
    const y = year.padStart(4, '0');
    const mo = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    return `${y}-${mo}-${d}T${time}:00`;
}
function calcAvailableDays(deadlineISO) {
    if (deadlineISO === '未设置截止时间')
        return 30;
    const dl = new Date(deadlineISO);
    const now = new Date();
    const diffMs = dl.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
//# sourceMappingURL=taskParser.js.map