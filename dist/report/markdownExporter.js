"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMarkdownPlan = exportMarkdownPlan;
exports.exportMarkdownProgress = exportMarkdownProgress;
exports.exportMarkdownReschedule = exportMarkdownReschedule;
/**
 * Export a deliverable plan as a human-readable Markdown report.
 */
function exportMarkdownPlan(plan) {
    const lines = [
        `# 📋 ${plan.task_name} – 项目执行计划`,
        '',
        `> 生成时间：${new Date().toISOString().slice(0, 10)}`,
        `> 截止日期：${plan.deadline}`,
        `> 计划周期：${plan.total_days} 天（每日 ${plan.daily_hours} 小时）`,
        '',
        '---',
        '',
        '## 📊 阶段概览',
        '',
    ];
    for (const phase of plan.phases) {
        lines.push(`### ${phase.phase_name}`);
        lines.push('');
        lines.push(`- **时间**：${phase.start_date} → ${phase.end_date}`);
        lines.push(`- **目标**：${phase.goal}`);
        lines.push(`- **交付物**：${phase.deliverables.join('、')}`);
        lines.push('');
        // List micro tasks for this phase
        const phaseTasks = plan.micro_tasks.filter((t) => t.phase_name === phase.phase_name);
        if (phaseTasks.length > 0) {
            lines.push('| 任务 | 耗时 | 优先级 | 完成标准 |');
            lines.push('|------|------|--------|----------|');
            for (const t of phaseTasks) {
                const prio = { high: '🔴 高', medium: '🟡 中', low: '🟢 低' }[t.priority];
                lines.push(`| ${t.name} | ${t.estimated_minutes}min | ${prio} | ${t.completion_criteria} |`);
            }
            lines.push('');
        }
    }
    lines.push('---');
    lines.push('');
    lines.push('## 📝 交付物清单');
    lines.push('');
    lines.push('| ID | 交付物 | 优先级 | 证据文件 |');
    lines.push('|----|--------|--------|----------|');
    for (const d of plan.deliverables) {
        const prio = { high: '🔴 高', medium: '🟡 中', low: '🟢 低' }[d.priority];
        lines.push(`| ${d.id} | ${d.name} | ${prio} | ${d.evidence_files.join(', ')} |`);
    }
    lines.push('');
    return lines.join('\n');
}
/**
 * Export a progress report as Markdown.
 */
function exportMarkdownProgress(report) {
    const lines = [
        `# 📊 进度证据检查报告`,
        '',
        `> 扫描路径：${report.scanned_path}`,
        `> 扫描时间：${report.scanned_at}`,
        `> 整体进度：**${report.progress_percent}%**`,
        `> 风险等级：**${riskEmoji(report.risk_level)} ${report.risk_level}**`,
        '',
        '---',
        '',
        '## ✅ 已完成的证据项',
        '',
    ];
    if (report.completed.length === 0) {
        lines.push('*暂无*');
    }
    else {
        for (const item of report.completed) {
            lines.push(`- ✅ **${item.description}** — ${item.detail}`);
        }
    }
    lines.push('');
    lines.push('## ❌ 缺失的证据项');
    lines.push('');
    if (report.missing.length === 0) {
        lines.push('*全部完成！*');
    }
    else {
        for (const item of report.missing) {
            lines.push(`- ❌ **${item.description}** — ${item.detail} *(权重: ${item.weight})*`);
        }
    }
    lines.push('');
    if (report.risks.length > 0) {
        lines.push('## ⚠️ 风险提示');
        lines.push('');
        for (const risk of report.risks) {
            lines.push(`- ${risk}`);
        }
        lines.push('');
    }
    // Progress bar
    const barLen = 20;
    const filled = Math.round((report.progress_percent / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
    lines.push('## 进度可视化');
    lines.push('');
    lines.push('```');
    lines.push(`${bar} ${report.progress_percent}%`);
    lines.push('```');
    lines.push('');
    return lines.join('\n');
}
/**
 * Export a reschedule result as Markdown.
 */
function exportMarkdownReschedule(result) {
    const lines = [
        `# 🔄 动态重排建议`,
        '',
        `> 是否正常：${result.is_on_track ? '✅ 进度正常' : `⚠️ 落后约 ${result.delay_days} 天`}`,
        '',
        '---',
        '',
        '## 💡 建议措施',
        '',
    ];
    for (const a of result.advice) {
        lines.push(`- ${a}`);
    }
    lines.push('');
    if (result.priority_tasks.length > 0) {
        lines.push('## 🔴 高优先级任务（必须完成）');
        lines.push('');
        for (const t of result.priority_tasks) {
            lines.push(`- **${t.name}** (${t.estimated_minutes}min) — ${t.completion_criteria}`);
        }
        lines.push('');
    }
    if (result.compressed_tasks.length > 0) {
        lines.push('## 🟡 压缩任务（缩短时间预估）');
        lines.push('');
        for (const t of result.compressed_tasks.slice(0, 10)) {
            lines.push(`- ${t.name} (${t.estimated_minutes}min)`);
        }
        lines.push('');
    }
    if (result.removed_tasks.length > 0) {
        lines.push('## ❌ 建议删除的低优先级任务');
        lines.push('');
        for (const t of result.removed_tasks) {
            lines.push(`- ~~${t.name}~~`);
        }
        lines.push('');
    }
    if (result.recommended_next_plan.length > 0) {
        lines.push('## 📅 重排后的阶段计划');
        lines.push('');
        for (const p of result.recommended_next_plan) {
            lines.push(`- **${p.phase_name}**：${p.start_date} → ${p.end_date}`);
            lines.push(`  - ${p.goal}`);
            lines.push(`  - 交付物：${p.deliverables.join('、')}`);
        }
        lines.push('');
    }
    return lines.join('\n');
}
function riskEmoji(level) {
    switch (level) {
        case 'critical':
            return '🔴';
        case 'high':
            return '🟠';
        case 'medium':
            return '🟡';
        case 'low':
            return '🟢';
        default:
            return '⚪';
    }
}
//# sourceMappingURL=markdownExporter.js.map