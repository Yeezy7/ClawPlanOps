import type { TaskRequirements, InputType } from '../types';

/**
 * Parse task requirements from raw text using rule-based keyword matching.
 */
export function parseTaskRequirements(
  content: string,
  _inputType: InputType = 'text'
): TaskRequirements {
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

function extractTaskName(text: string): string {
  // Match "关于举办...的通知" style
  let m = text.match(/关于举办(.+?)的通知/);
  if (m) {
    const inner = m[1].replace(/^[《「『]|[》」』]$/g, '').trim();
    if (inner.length > 4) return inner;
  }

  // Match "XX大赛" / "XX竞赛"
  m = text.match(/(.{4,50}(?:大赛|竞赛|比赛|挑战赛))/);
  if (m) return m[1].trim();

  // Match bookmarked title
  m = text.match(/[《「『](.{3,50})[》」』]/);
  if (m) return m[1].trim();

  // First non-empty substantial line
  const lines = text.split(/[\n\r]+/).filter((l) => l.trim().length > 5);
  return lines[0]?.trim().slice(0, 60) || '未命名任务';
}

// ---- deadline ------------------------------------------------

interface DateMatch {
  full: string;
  iso: string;
  index: number;
}

function extractDeadline(text: string): string {
  const allDates: DateMatch[] = [];

  // Pattern: "2026年6月22日12:00前"
  const reFull = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2}:\d{2})?/g;
  let m: RegExpExecArray | null;
  while ((m = reFull.exec(text)) !== null) {
    allDates.push({
      full: m[0],
      iso: formatISODate(m[1], m[2], m[3], m[4] || '23:59'),
      index: m.index,
    });
  }

  // Pattern: "6月22日12:00前" (no year)
  const reShort = /(?<!\d{4}\s*年\s*)(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2}:\d{2})?/g;
  const year = new Date().getFullYear().toString();
  while ((m = reShort.exec(text)) !== null) {
    allDates.push({
      full: m[0],
      iso: formatISODate(year, m[1], m[2], m[3] || '23:59'),
      index: m.index,
    });
  }

  // Pattern: "2026-06-22 12:00" or "2026/06/22"
  const reISO = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})[\sT](\d{1,2}:\d{2})?/g;
  while ((m = reISO.exec(text)) !== null) {
    allDates.push({
      full: m[0],
      iso: formatISODate(m[1], m[2], m[3], m[4] || '23:59'),
      index: m.index,
    });
  }

  if (allDates.length === 0) return '未设置截止时间';

  // Priority 1: date immediately after "提交截止" / "作品提交" etc.
  const criticalPatterns = [
    /提交截止[：:\s]*/,
    /作品提交[：:\s]*/,
    /材料提交[：:\s]*/,
    /DDL[：:\s]*/i,
    /deadline[：:\s]*/i,
  ];
  for (const pat of criticalPatterns) {
    const m = text.match(pat);
    if (m) {
      const afterIdx = m.index! + m[0].length;
      const afterText = text.slice(afterIdx, afterIdx + 40);
      const dateM = afterText.match(
        /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2}:\d{2})?/
      );
      if (dateM) {
        return formatISODate(dateM[1], dateM[2], dateM[3], dateM[4] || '23:59');
      }
    }
  }

  // Priority 2: date closest to "截止" (but after excluding "报名截止")
  const nonRegDeadlineIdx = text.search(/(?<!报名)截止/);
  if (nonRegDeadlineIdx >= 0) {
    let closest = allDates[0];
    let closestDist = Math.abs(nonRegDeadlineIdx - allDates[0].index);
    for (const d of allDates) {
      const dist = Math.abs(nonRegDeadlineIdx - d.index);
      if (dist < closestDist) {
        closest = d;
        closestDist = dist;
      }
    }
    return closest.iso;
  }

  // Priority 3: date closest to "提交"
  const submitIdx = text.indexOf('提交');
  if (submitIdx >= 0) {
    // Find the last "提交" occurrence that's near a date
    const allSubmitIdxs: number[] = [];
    let searchFrom = 0;
    while (true) {
      const idx = text.indexOf('提交', searchFrom);
      if (idx < 0) break;
      allSubmitIdxs.push(idx);
      searchFrom = idx + 1;
    }
    // Use the last "提交" (more likely to be the actual submission deadline)
    const lastSubmit = allSubmitIdxs[allSubmitIdxs.length - 1];
    let closest = allDates[0];
    let closestDist = Math.abs(lastSubmit - allDates[0].index);
    for (const d of allDates) {
      const dist = Math.abs(lastSubmit - d.index);
      if (dist < closestDist) {
        closest = d;
        closestDist = dist;
      }
    }
    return closest.iso;
  }

  // Fallback: latest date (usually the submission deadline is later)
  allDates.sort((a, b) => b.iso.localeCompare(a.iso));
  return allDates[0].iso;
}

// ---- deliverables --------------------------------------------

function extractDeliverables(text: string): string[] {
  const deliverables: string[] = [];

  // Try to find the "交付物清单" or "需提交" section
  const sectionPatterns = [
    /(?:交付物|提交材料|需提交|需准备)[^。\n]{0,10}[：:\s]*\n([\s\S]{20,300}?)(?:\n\n|\n[五六七八九]|$)/,
    /(?:交付物清单|提交材料清单)[：:\s]*([\s\S]{20,300}?)(?:\n\n|$)/,
  ];

  for (const p of sectionPatterns) {
    const m = text.match(p);
    if (m) {
      // Extract bullet points: lines starting with "- " or "  - " or numbers
      const section = m[1];
      const lines = section.split(/[\n\r]+/);
      for (const line of lines) {
        const clean = line.replace(/^[\s\d.\-•*]+/, '').trim();
        if (clean.length > 3 && clean.length < 80 && !clean.startsWith('--')) {
          deliverables.push(clean);
        }
      }
      if (deliverables.length > 0) break;
    }
  }

  // Fallback: keyword scanning
  if (deliverables.length === 0) {
    const keywordDeliverables = [
      'OpenClaw 插件代码', '插件代码', '源码', 'openclaw.plugin.json',
      'README.md', '项目申报表', '申报书', '申报表',
      '答辩 PPT', 'PPT', '演示视频', '技术文档',
      '设计文档', '测试报告', '用户手册',
    ];
    for (const kw of keywordDeliverables) {
      if (text.includes(kw) && !deliverables.some((d) => d.includes(kw))) {
        deliverables.push(kw);
      }
    }
  }

  // Clean up: remove garbage and section headers
  const cleaned = deliverables
    .map((d) => d.replace(/[）\)」』]$/, '').trim())
    .filter((d) => {
      if (d.length < 3 || d.length > 80) return false;
      // Section headers and non-deliverable text
      if (/^(以下|如下|包括|包含|含|需|需要|提交|各|请|参赛|所有|作品)/.test(d)) return false;
      if (/需提交|需准备|交付物|材料清单|提交以下/.test(d)) return false;
      if (/[。；;]/.test(d)) return false;
      return true;
    });

  return [...new Set(cleaned)];
}

// ---- constraints ---------------------------------------------

function extractConstraints(text: string): string[] {
  const constraints: string[] = [];

  // Try to find "参赛要求" or "注意事项" section
  const sectionMatch = text.match(
    /(?:参赛要求|报名条件|注意事项|基本要求)[：:\s]*([\s\S]{30,500}?)(?:\n\n|\n[五六七八九]|$)/
  );
  const searchText = sectionMatch ? sectionMatch[1] : text;

  // Extract numbered/bulleted constraints
  const lines = searchText.split(/[\n\r]+/);
  for (const line of lines) {
    const clean = line.replace(/^[\s\d.\-•*]+/, '').trim();
    if (clean.length > 6 && clean.length < 100 && !clean.startsWith('--')) {
      // Only lines that look like constraints
      if (
        /不超过|不多于|不少于|至少|需|必须|不得|应当|限报|须为|不得/.test(clean)
      ) {
        constraints.push(clean);
      }
    }
  }

  // Fallback patterns
  if (constraints.length === 0) {
    const patterns = [
      /(?:不超过|不多于|最多)[^\n。]{5,40}/g,
      /(?:不少于|至少)[^\n。]{5,40}/g,
      /需[^\n。]{5,40}/g,
      /不得[^\n。]{5,40}/g,
    ];
    for (const p of patterns) {
      let m: RegExpExecArray | null;
      while ((m = p.exec(searchText)) !== null) {
        constraints.push(m[0].trim());
      }
    }
  }

  return [...new Set(constraints)].slice(0, 10);
}

// ---- submission rules ----------------------------------------

function extractSubmissionRules(text: string): string[] {
  const rules: string[] = [];

  // Try to find "提交方式" section
  const sectionMatch = text.match(
    /(?:提交方式|提交地址|报送方式)[：:\s]*([\s\S]{30,400}?)(?:\n\n|\n[五六七八九]|$)/
  );
  const searchText = sectionMatch ? sectionMatch[1] : text;

  // Extract lines with submission info
  const lines = searchText.split(/[\n\r]+/);
  for (const line of lines) {
    const clean = line.replace(/^[\s\d.\-•*]+/, '').trim();
    if (clean.length > 5 && clean.length < 100) {
      if (/发送|邮箱|邮件|格式|命名|打包|ZIP|zip|提交|电子/.test(clean)) {
        rules.push(clean);
      }
    }
  }

  if (rules.length === 0) {
    // Fallback patterns
    const patterns = [
      /(?:提交方式|提交地址|发送至|邮箱)[：:\s]+[^\n]{5,60}/g,
      /(?:电子版|纸质版|纸质材料|电子材料)[^\n。]*/g,
      /(?:命名格式|文件命名)[：:\s]+[^\n]{5,60}/g,
      /发送[至到]\s*\S+@\S+/g,
    ];
    for (const p of patterns) {
      let m: RegExpExecArray | null;
      while ((m = p.exec(searchText)) !== null) {
        rules.push(m[0].trim());
      }
    }
  }

  return [...new Set(rules)];
}

// ---- helpers -------------------------------------------------

function formatISODate(
  year: string,
  month: string,
  day: string,
  time: string
): string {
  const y = year.padStart(4, '0');
  const mo = month.padStart(2, '0');
  const d = day.padStart(2, '0');
  return `${y}-${mo}-${d}T${time}:00`;
}

/**
 * Calculate available days between now and a deadline.
 */
export function calcAvailableDays(deadlineISO: string): number {
  if (deadlineISO === '未设置截止时间') return 30;
  const dl = new Date(deadlineISO);
  const now = new Date();
  const diffMs = dl.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
