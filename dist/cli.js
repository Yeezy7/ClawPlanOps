#!/usr/bin/env node
"use strict";
/**
 * ClawPlanOps CLI – 命令行工具入口
 *
 * Usage:
 *   claw-planops parse <file|text>
 *   claw-planops plan <requirements.json|file>
 *   claw-planops calendar <plan.json>
 *   claw-planops check <project-path>
 *   claw-planops report <project-path> <plan.json>
 *   claw-planops reschedule <progress.json> <plan.json>
 *   claw-planops full <notice-file> <project-path>
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const parseTaskRequirements_1 = require("./tools/parseTaskRequirements");
const buildDeliverablePlan_1 = require("./tools/buildDeliverablePlan");
const generateCalendarSchedule_1 = require("./tools/generateCalendarSchedule");
const checkProgressEvidence_1 = require("./tools/checkProgressEvidence");
const generateDailyProgressReport_1 = require("./tools/generateDailyProgressReport");
const reschedulePlan_1 = require("./tools/reschedulePlan");
const markdownExporter_1 = require("./report/markdownExporter");
const cmd = process.argv[2];
const args = process.argv.slice(3);
function printHelp() {
    console.log(`
ClawPlanOps – 基于交付物证据的项目执行规划工具

命令:
  parse <file>               解析任务通知，输出结构化任务要求 JSON
  plan <req.json> [days] [hrs]  根据任务要求生成交付物计划
  calendar <plan.json>       生成 .ics 日历文件
  check <project-path>       检查项目进度证据
  report <project-path> <plan.json>  生成每日进度报告
  reschedule <progress.json> <plan.json>  生成动态重排建议
  full <notice-file> <project-path>      运行完整 6 步流程
  help                       显示此帮助信息

示例:
  claw-planops parse examples/zzu_four_creation_notice.txt
  claw-planops full examples/zzu_four_creation_notice.txt .
`);
}
function readJSON(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}
function readText(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}
function printJSON(data) {
    console.log(JSON.stringify(data, null, 2));
}
// ---- command handlers ----
async function cmdParse() {
    const input = args[0];
    if (!input) {
        console.error('错误: 请提供任务通知文件路径或文本');
        process.exit(1);
    }
    let content;
    if (fs.existsSync(input)) {
        content = readText(input);
    }
    else if (input.startsWith('http://') || input.startsWith('https://')) {
        const result = await (0, parseTaskRequirements_1.parseTaskRequirements)({ content: input, input_type: 'url' });
        printJSON(result);
        return;
    }
    else {
        content = input;
    }
    const result = await (0, parseTaskRequirements_1.parseTaskRequirements)({ content });
    printJSON(result);
}
function cmdPlan() {
    const filePath = args[0];
    if (!filePath) {
        console.error('错误: 请提供任务要求 JSON 文件路径');
        process.exit(1);
    }
    const reqs = readJSON(filePath);
    const days = args[1] ? parseInt(args[1]) : undefined;
    const hours = args[2] ? parseInt(args[2]) : undefined;
    const result = (0, buildDeliverablePlan_1.buildDeliverablePlan)({
        task_requirements: reqs,
        available_days: days,
        daily_available_hours: hours,
    });
    printJSON(result);
    // Also export markdown
    const md = (0, markdownExporter_1.exportMarkdownPlan)(result);
    const mdPath = path.resolve('./output/project_plan.md');
    const dir = path.dirname(mdPath);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.error(`\nMarkdown 计划已导出: ${mdPath}`);
}
function cmdCalendar() {
    const filePath = args[0];
    if (!filePath) {
        console.error('错误: 请提供计划 JSON 文件路径');
        process.exit(1);
    }
    const plan = readJSON(filePath);
    const result = (0, generateCalendarSchedule_1.generateCalendarSchedule)({
        micro_tasks: plan.micro_tasks,
        start_date: plan.start_date,
        deadline: plan.deadline,
        preferred_work_time: args[1] || undefined,
        output_path: args[2] || './output/schedule.ics',
    });
    console.log(`日历已生成: ${result.ics_file_path}`);
    console.log(`事件数: ${result.event_count}`);
}
function cmdCheck() {
    const projectPath = args[0] || '.';
    const result = (0, checkProgressEvidence_1.checkProgressEvidence)({ project_path: projectPath });
    printJSON(result);
    // Also export markdown
    const { exportMarkdownProgress } = require('./report/markdownExporter');
    const md = exportMarkdownProgress(result);
    const mdPath = path.resolve('./output/progress_report.md');
    const dir = path.dirname(mdPath);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.error(`\nMarkdown 报告已导出: ${mdPath}`);
}
function cmdReport() {
    const projectPath = args[0] || '.';
    const planPath = args[1];
    if (!planPath) {
        console.error('错误: 请提供计划 JSON 文件路径');
        process.exit(1);
    }
    const plan = readJSON(planPath);
    // Build a minimal schedule from plan
    const schedule = {
        ics_file_path: '',
        ics_content: '',
        event_count: 0,
        events: [],
    };
    const result = (0, generateDailyProgressReport_1.generateDailyProgressReport)({
        project_path: projectPath,
        plan,
        schedule,
    });
    printJSON(result);
}
function cmdReschedule() {
    const progressPath = args[0];
    const planPath = args[1];
    if (!progressPath || !planPath) {
        console.error('错误: 请提供进度报告和计划 JSON 文件路径');
        process.exit(1);
    }
    const progress = readJSON(progressPath);
    const plan = readJSON(planPath);
    const deadline = plan.deadline || '2026-12-31';
    const result = (0, reschedulePlan_1.reschedulePlan)({
        progress_report: progress,
        original_plan: plan,
        deadline,
    });
    printJSON(result);
    // Export markdown
    const { exportMarkdownReschedule } = require('./report/markdownExporter');
    const md = exportMarkdownReschedule(result);
    const mdPath = path.resolve('./output/reschedule_report.md');
    const dir = path.dirname(mdPath);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.error(`\nMarkdown 重排报告已导出: ${mdPath}`);
}
async function cmdFull() {
    const noticeFile = args[0];
    const projectPath = args[1] || '.';
    if (!noticeFile) {
        console.error('错误: 请提供任务通知文件路径');
        process.exit(1);
    }
    console.log('═══════════════════════════════════════════');
    console.log('  ClawPlanOps – 完整流程演示');
    console.log('═══════════════════════════════════════════\n');
    // Step 1: Parse
    console.log('━ Step 1/6: 解析任务要求');
    const content = readText(noticeFile);
    const reqs = await (0, parseTaskRequirements_1.parseTaskRequirements)({ content });
    console.log(`  任务: ${reqs.task_name}`);
    console.log(`  截止: ${reqs.deadline}`);
    console.log(`  交付物: ${reqs.deliverables.length} 项`);
    console.log(`  约束: ${reqs.constraints.length} 条\n`);
    // Step 2: Plan
    console.log('━ Step 2/6: 生成交付物计划');
    const plan = (0, buildDeliverablePlan_1.buildDeliverablePlan)({ task_requirements: reqs });
    console.log(`  周期: ${plan.total_days} 天`);
    console.log(`  阶段: ${plan.phases.length} 个`);
    console.log(`  微任务: ${plan.micro_tasks.length} 个`);
    for (const p of plan.phases) {
        console.log(`    ${p.phase_name} [${p.start_date} → ${p.end_date}]`);
    }
    console.log();
    // Export plan markdown
    const planMd = (0, markdownExporter_1.exportMarkdownPlan)(plan);
    const outDir = path.resolve('./output');
    if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'project_plan.md'), planMd, 'utf-8');
    // Step 3: Calendar
    console.log('━ Step 3/6: 生成日历文件');
    const cal = (0, generateCalendarSchedule_1.generateCalendarSchedule)({
        micro_tasks: plan.micro_tasks,
        start_date: plan.start_date,
        deadline: reqs.deadline,
    });
    console.log(`  文件: ${cal.ics_file_path}`);
    console.log(`  事件: ${cal.event_count} 个\n`);
    // Step 4: Check progress
    console.log('━ Step 4/6: 检查进度证据');
    const progress = (0, checkProgressEvidence_1.checkProgressEvidence)({ project_path: projectPath });
    console.log(`  进度: ${progress.progress_percent}%`);
    console.log(`  风险: ${progress.risk_level}`);
    console.log(`  完成: ${progress.completed.length} / ${progress.completed.length + progress.missing.length}`);
    if (progress.missing.length > 0) {
        console.log('  缺失:');
        progress.missing.forEach((m) => console.log(`    ✗ ${m.description}`));
    }
    console.log();
    // Export progress markdown
    const { exportMarkdownProgress } = require('./report/markdownExporter');
    fs.writeFileSync(path.join(outDir, 'progress_report.md'), exportMarkdownProgress(progress), 'utf-8');
    // Step 5: Daily report
    console.log('━ Step 5/6: 生成每日进度报告');
    const report = (0, generateDailyProgressReport_1.generateDailyProgressReport)({
        project_path: projectPath,
        plan,
        schedule: cal,
    });
    console.log(`  今日计划: ${report.planned_today.length} 项`);
    console.log(`  下一步: ${report.next_actions.join('; ')}\n`);
    // Step 6: Reschedule
    console.log('━ Step 6/6: 动态重排建议');
    const re = (0, reschedulePlan_1.reschedulePlan)({
        progress_report: progress,
        original_plan: plan,
        deadline: reqs.deadline,
    });
    if (re.is_on_track) {
        console.log('  状态: ✅ 进度正常');
    }
    else {
        console.log(`  状态: ⚠️ 落后约 ${re.delay_days} 天`);
    }
    re.advice.forEach((a) => console.log(`  → ${a}`));
    console.log();
    // Export reschedule markdown
    const { exportMarkdownReschedule } = require('./report/markdownExporter');
    fs.writeFileSync(path.join(outDir, 'reschedule_report.md'), exportMarkdownReschedule(re), 'utf-8');
    // Export full results JSON
    const fullResult = { task_requirements: reqs, plan, calendar: cal, progress, daily_report: report, reschedule: re };
    fs.writeFileSync(path.join(outDir, 'full_output.json'), JSON.stringify(fullResult, null, 2), 'utf-8');
    console.log('═══════════════════════════════════════════');
    console.log('  所有输出文件已保存到 output/ 目录');
    console.log('═══════════════════════════════════════════');
}
// ---- main ----
(async () => {
    switch (cmd) {
        case 'parse':
            await cmdParse();
            break;
        case 'plan':
            cmdPlan();
            break;
        case 'calendar':
            cmdCalendar();
            break;
        case 'check':
            cmdCheck();
            break;
        case 'report':
            cmdReport();
            break;
        case 'reschedule':
            cmdReschedule();
            break;
        case 'full':
            await cmdFull();
            break;
        case 'help':
        case '--help':
        case '-h':
        default:
            printHelp();
            break;
    }
})().catch((err) => {
    console.error('运行错误:', err.message);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map