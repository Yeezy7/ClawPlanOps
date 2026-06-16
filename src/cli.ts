#!/usr/bin/env node
/**
 * ClawPlanOps CLI – 命令行工具入口
 *
 * Usage:
 *   claw-planops parse <file|text> [--ai <api-url>]
 *   claw-planops plan <requirements.json|file>
 *   claw-planops calendar <plan.json>
 *   claw-planops check <project-path>
 *   claw-planops report <project-path> <plan.json>
 *   claw-planops reschedule <progress.json> <plan.json>
 *   claw-planops full <notice-file> <project-path> [--ai <api-url>]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { parseTaskRequirements } from './tools/parseTaskRequirements';
import { buildDeliverablePlan } from './tools/buildDeliverablePlan';
import { generateCalendarSchedule } from './tools/generateCalendarSchedule';
import { checkProgressEvidence } from './tools/checkProgressEvidence';
import { generateDailyProgressReport } from './tools/generateDailyProgressReport';
import { reschedulePlan } from './tools/reschedulePlan';
import { exportMarkdownPlan, exportMarkdownProgress, exportMarkdownReschedule } from './report/markdownExporter';
import type { DeliverablePlan } from './types';
import { resolveConfig } from './config/projectConfig';
import { importToAppleCalendar } from './calendar/appleCalendar';
import { generateWeeklyReport, exportWeeklyReportMarkdown } from './report/weeklyReport';
import { runPreSubmissionCheck, exportPreSubmissionMarkdown } from './report/preSubmissionCheck';
import { addProject, listProjects, switchProject, removeProject, getOverallStatus } from './config/multiProject';
import { sendEventReminder, sendBatchReminders } from './notification/pushNotification';
import { getRecentCommits, linkCommitsToTasks, generateGitTaskMarkdown } from './evidence/gitTaskLink';
import { saveProgressSnapshot, loadProgressHistory, analyzeProgressTrend, exportProgressTrendMarkdown } from './evidence/progressHistory';
import { importToSystemCalendar } from './calendar/crossPlatformCalendar';

const cmd = process.argv[2];
const rawArgs = process.argv.slice(3);

// Parse flags
let aiMode = false;
let aiEndpoint = '';
let appleCalMode = false;
const args: string[] = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === '--ai') {
    aiMode = true;
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('--')) {
      aiEndpoint = rawArgs[i + 1];
      i++;
    }
  } else if (rawArgs[i] === '--apple-cal') {
    appleCalMode = true;
  } else {
    args.push(rawArgs[i]);
  }
}

function printHelp(): void {
  console.log(`
ClawPlanOps – 基于交付物证据的项目执行规划工具

命令:
  parse <file> [--ai [url]]   解析任务通知，--ai 使用 AI 解析（更准确）
  plan <req.json> [days] [hrs]  根据任务要求生成交付物计划
  calendar <plan.json> [--apple-cal]  生成 .ics 日历文件，--apple-cal 导入 macOS 日历
  check <project-path>        检查项目进度证据
  report <project-path> <plan.json>  生成每日进度报告
  reschedule <progress.json> <plan.json>  生成动态重排建议
  full <notice-file> <project-path> [--ai [url]] [--apple-cal]  完整 6 步流程

新功能:
  weekly <project-path> <plan.json>  生成周报
  presubmit <project-path> <plan.json>  提交前检查
  projects list                   列出所有并行项目
  projects add <name> <notice> <path>  添加新项目
  projects switch <id>            切换活动项目
  projects remove <id>            删除项目
  projects status                 查看所有项目状态
  git-link <project-path> <plan.json>  Git 提交与任务关联
  trend <project-path>            查看进度趋势
  notify test                     测试系统通知
  notify send <title> <message>   发送通知
  calendar-import <plan.json>     跨平台日历导入（自动检测系统）
  help                            显示此帮助信息

AI 模式:
  使用 --ai 标志启用 AI 解析，可处理任意格式的通知文本。
  --ai          使用默认 OpenAI 兼容端点 (127.0.0.1:11434)
  --ai <url>    指定 API 端点 URL

示例:
  claw-planops parse examples/zzu_four_creation_notice.txt
  claw-planops parse notice.txt --ai
  claw-planops full notice.txt . --ai http://localhost:11434/v1
  claw-planops weekly . plan.json
  claw-planops presubmit . plan.json
  claw-planops projects list
  claw-planops git-link . plan.json
  claw-planops trend .
`);
}

function readJSON(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function printJSON(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function askConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

function createAICaller(): (prompt: string) => Promise<string> {
  const endpoint = aiEndpoint || 'http://127.0.0.1:11434/v1/chat/completions';
  return async (prompt: string): Promise<string> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'default',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0,
      }),
    });
    if (!res.ok) throw new Error(`AI API error: ${res.status} ${res.statusText}`);
    const data = await res.json() as Record<string, unknown>;
    const choices = data.choices as Array<{ message: { content: string } }>;
    if (!choices?.[0]?.message?.content) throw new Error('AI API returned no content');
    return choices[0].message.content;
  };
}

// ---- command handlers ----

async function cmdParse(): Promise<void> {
  const input = args[0];
  if (!input) {
    console.error('错误: 请提供任务通知文件路径或文本');
    process.exit(1);
  }
  let content: string;
  if (fs.existsSync(input)) {
    content = readText(input);
  } else if (input.startsWith('http://') || input.startsWith('https://')) {
    const result = await parseTaskRequirements({
      content: input,
      input_type: 'url',
      callLLM: aiMode ? createAICaller() : undefined,
    });
    printJSON(result);
    return;
  } else {
    content = input;
  }
  const result = await parseTaskRequirements({
    content,
    callLLM: aiMode ? createAICaller() : undefined,
  });
  console.error(aiMode ? '[AI 模式]' : '[正则模式]');
  printJSON(result);
}

function cmdPlan(): void {
  const filePath = args[0];
  if (!filePath) {
    console.error('错误: 请提供任务要求 JSON 文件路径');
    process.exit(1);
  }
  const reqs = readJSON(filePath) as Parameters<typeof buildDeliverablePlan>[0]['task_requirements'];
  const days = args[1] ? parseInt(args[1]) : undefined;
  const hours = args[2] ? parseInt(args[2]) : undefined;
  const cfg = resolveConfig('.');
  const result = buildDeliverablePlan({
    task_requirements: reqs,
    available_days: days,
    daily_available_hours: hours,
    custom_templates: Object.keys(cfg.deliverables).length > 0 ? cfg.deliverables : undefined,
  });
  printJSON(result);

  // Also export markdown
  const md = exportMarkdownPlan(result);
  const mdPath = path.resolve('./output/project_plan.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\nMarkdown 计划已导出: ${mdPath}`);
}

async function cmdCalendar(): Promise<void> {
  const filePath = args[0];
  if (!filePath) {
    console.error('错误: 请提供计划 JSON 文件路径');
    process.exit(1);
  }
  const plan = readJSON(filePath) as DeliverablePlan;
  const result = generateCalendarSchedule({
    micro_tasks: plan.micro_tasks,
    start_date: plan.start_date,
    deadline: plan.deadline,
    preferred_work_time: args[1] || undefined,
    output_path: args[2] || './output/schedule.ics',
  });
  console.log(`日历已生成: ${result.ics_file_path}`);
  console.log(`事件数: ${result.event_count}`);

  // Apple Calendar import with confirmation
  if (appleCalMode) {
    console.log(`\n即将导入 ${result.event_count} 个事件到 macOS 日历 (日历名: ClawPlanOps)`);
    console.log('包含：');
    const highPrio = result.events.filter((e) => e.risk_note).length;
    console.log(`  - ${result.event_count} 个事件，每个带 30 分钟提醒`);
    if (highPrio > 0) console.log(`  - ${highPrio} 个高优先级事件额外带 1 天前提醒`);
    const confirmed = await askConfirmation('确认导入到 macOS 日历？');
    if (confirmed) {
      const importResult = importToAppleCalendar(result.events);
      if (importResult.success) {
        console.log(`✅ 成功导入 ${importResult.imported_count} 个事件到 "${importResult.calendar_name}" 日历`);
      } else {
        console.error(`❌ 导入失败: ${importResult.errors.join(', ')}`);
      }
    } else {
      console.log('已取消导入');
    }
  }
}

function cmdCheck(): void {
  const projectPath = args[0] || '.';
  const result = checkProgressEvidence({ project_path: projectPath });
  printJSON(result);

  // Also export markdown
  const md = exportMarkdownProgress(result);
  const mdPath = path.resolve('./output/progress_report.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\nMarkdown 报告已导出: ${mdPath}`);
}

function cmdReport(): void {
  const projectPath = args[0] || '.';
  const planPath = args[1];
  if (!planPath) {
    console.error('错误: 请提供计划 JSON 文件路径');
    process.exit(1);
  }
  const plan = readJSON(planPath) as Parameters<typeof generateDailyProgressReport>[0]['plan'];
  // Build a minimal schedule from plan
  const schedule = {
    ics_file_path: '',
    ics_content: '',
    event_count: 0,
    events: [],
  };
  const result = generateDailyProgressReport({
    project_path: projectPath,
    plan,
    schedule,
  });
  printJSON(result);
}

function cmdReschedule(): void {
  const progressPath = args[0];
  const planPath = args[1];
  if (!progressPath || !planPath) {
    console.error('错误: 请提供进度报告和计划 JSON 文件路径');
    process.exit(1);
  }
  const progress = readJSON(progressPath) as Parameters<typeof reschedulePlan>[0]['progress_report'];
  const plan = readJSON(planPath) as DeliverablePlan;
  const deadline = plan.deadline || '2026-12-31';
  const result = reschedulePlan({
    progress_report: progress,
    original_plan: plan,
    deadline,
  });
  printJSON(result);

  // Export markdown
  const md = exportMarkdownReschedule(result);
  const mdPath = path.resolve('./output/reschedule_report.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\nMarkdown 重排报告已导出: ${mdPath}`);
}

function cmdWeekly(): void {
  const projectPath = args[0] || '.';
  const planPath = args[1];
  if (!planPath) {
    console.error('错误: 请提供计划 JSON 文件路径');
    process.exit(1);
  }
  const plan = readJSON(planPath) as DeliverablePlan;
  const progress = checkProgressEvidence({ project_path: projectPath });
  const report = generateWeeklyReport({
    project_path: projectPath,
    micro_tasks: plan.micro_tasks,
    progress_report: progress,
  });
  printJSON(report);

  const md = exportWeeklyReportMarkdown(report);
  const mdPath = path.resolve('./output/weekly_report.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\n周报已导出: ${mdPath}`);
}

function cmdPreSubmit(): void {
  const projectPath = args[0] || '.';
  const planPath = args[1];
  if (!planPath) {
    console.error('错误: 请提供计划 JSON 文件路径');
    process.exit(1);
  }
  const plan = readJSON(planPath) as DeliverablePlan;
  const result = runPreSubmissionCheck({ project_path: projectPath, plan });
  printJSON(result);

  const md = exportPreSubmissionMarkdown(result);
  const mdPath = path.resolve('./output/pre_submission_check.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\n提交前检查报告已导出: ${mdPath}`);
}

function cmdProjects(): void {
  const subCmd = args[0];
  const projectPath = args[1] || '.';

  switch (subCmd) {
    case 'list': {
      const projects = listProjects(projectPath);
      if (projects.length === 0) {
        console.log('暂无并行项目');
        return;
      }
      console.log(`共 ${projects.length} 个项目:\n`);
      for (const p of projects) {
        console.log(`  ${p.id}  ${p.name}  进度: ${p.progress?.progress_percent || 0}%  截止: ${p.plan.deadline}`);
      }
      break;
    }
    case 'add': {
      const name = args[2];
      const noticeFile = args[3];
      const targetPath = args[4] || '.';
      if (!name || !noticeFile) {
        console.error('错误: 请提供项目名称和通知文件路径');
        process.exit(1);
      }
      const notice = readText(noticeFile);
      const entry = addProject(projectPath, name, notice, targetPath);
      console.log(`已添加项目: ${entry.name} (ID: ${entry.id})`);
      break;
    }
    case 'switch': {
      const id = args[2];
      if (!id) {
        console.error('错误: 请提供项目 ID');
        process.exit(1);
      }
      const entry = switchProject(projectPath, id);
      if (entry) {
        console.log(`已切换到: ${entry.name}`);
      } else {
        console.error('未找到项目');
      }
      break;
    }
    case 'remove': {
      const id = args[2];
      if (!id) {
        console.error('错误: 请提供项目 ID');
        process.exit(1);
      }
      if (removeProject(projectPath, id)) {
        console.log('已删除');
      } else {
        console.error('未找到项目');
      }
      break;
    }
    case 'status': {
      const status = getOverallStatus(projectPath);
      printJSON(status);
      break;
    }
    default:
      console.log('用法: projects <list|add|switch|remove|status> [args...]');
  }
}

function cmdGitLink(): void {
  const projectPath = args[0] || '.';
  const planPath = args[1];
  if (!planPath) {
    console.error('错误: 请提供计划 JSON 文件路径');
    process.exit(1);
  }
  const plan = readJSON(planPath) as DeliverablePlan;
  const commits = getRecentCommits(projectPath, 30);
  const report = linkCommitsToTasks(commits, plan.micro_tasks);
  report.project_path = projectPath;
  printJSON(report);

  const md = generateGitTaskMarkdown(report);
  const mdPath = path.resolve('./output/git_task_link.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\nGit 任务关联报告已导出: ${mdPath}`);
}

function cmdTrend(): void {
  const projectPath = args[0] || '.';
  const trend = analyzeProgressTrend(projectPath);
  const history = loadProgressHistory(projectPath);
  printJSON({ trend, history_count: history.snapshots.length });

  const md = exportProgressTrendMarkdown(trend, history);
  const mdPath = path.resolve('./output/progress_trend.md');
  const dir = path.dirname(mdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.error(`\n进度趋势报告已导出: ${mdPath}`);
}

function cmdNotify(): void {
  const subCmd = args[0];
  switch (subCmd) {
    case 'test': {
      const result = sendEventReminder({
        uid: 'test-1',
        summary: '测试通知',
        description: '这是一条测试通知',
        start: '',
        end: '',
        completion_criteria: '测试',
        deliverable_id: 'TEST',
        risk_note: '',
      });
      if (result.success) {
        console.log('✅ 通知发送成功');
      } else {
        console.error(`❌ 通知发送失败: ${result.errors.join(', ')}`);
      }
      break;
    }
    case 'send': {
      const title = args[1];
      const message = args[2];
      if (!title || !message) {
        console.error('错误: 请提供标题和消息');
        process.exit(1);
      }
      const { sendSystemNotification } = require('./notification/pushNotification');
      const result = sendSystemNotification(title, message);
      if (result.success) {
        console.log('✅ 通知发送成功');
      } else {
        console.error(`❌ 通知发送失败: ${result.errors.join(', ')}`);
      }
      break;
    }
    default:
      console.log('用法: notify <test|send> [title] [message]');
  }
}

function cmdCalendarImport(): void {
  const planPath = args[0];
  if (!planPath) {
    console.error('错误: 请提供计划 JSON 文件路径');
    process.exit(1);
  }
  const plan = readJSON(planPath) as DeliverablePlan;
  const cal = generateCalendarSchedule({
    micro_tasks: plan.micro_tasks,
    start_date: plan.start_date,
    deadline: plan.deadline,
  });
  const result = importToSystemCalendar(cal.events);
  if (result.success) {
    console.log(`✅ 成功导入 ${result.imported_count} 个事件 (${result.platform} / ${result.method})`);
  } else {
    console.error(`❌ 导入失败: ${result.errors.join(', ')}`);
  }
}

async function cmdFull(): Promise<void> {
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
  console.log(`━ Step 1/6: 解析任务要求${aiMode ? ' [AI 模式]' : ''}`);
  const content = readText(noticeFile);
  const reqs = await parseTaskRequirements({
    content,
    callLLM: aiMode ? createAICaller() : undefined,
  });
  console.log(`  任务: ${reqs.task_name}`);
  console.log(`  截止: ${reqs.deadline}`);
  console.log(`  交付物: ${reqs.deliverables.length} 项`);
  console.log(`  约束: ${reqs.constraints.length} 条\n`);

  // Step 2: Plan
  console.log('━ Step 2/6: 生成交付物计划');
  const cfg = resolveConfig(projectPath);
  const plan = buildDeliverablePlan({
    task_requirements: reqs,
    custom_templates: Object.keys(cfg.deliverables).length > 0 ? cfg.deliverables : undefined,
  });
  console.log(`  周期: ${plan.total_days} 天`);
  console.log(`  阶段: ${plan.phases.length} 个`);
  console.log(`  微任务: ${plan.micro_tasks.length} 个`);
  for (const p of plan.phases) {
    console.log(`    ${p.phase_name} [${p.start_date} → ${p.end_date}]`);
  }
  console.log();

  // Export plan markdown
  const planMd = exportMarkdownPlan(plan);
  const outDir = path.resolve('./output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'project_plan.md'), planMd, 'utf-8');

  // Step 3: Calendar
  console.log('━ Step 3/6: 生成日历文件');
  const cal = generateCalendarSchedule({
    micro_tasks: plan.micro_tasks,
    start_date: plan.start_date,
    deadline: reqs.deadline,
  });
  console.log(`  文件: ${cal.ics_file_path}`);
  console.log(`  事件: ${cal.event_count} 个`);

  // Apple Calendar import with confirmation
  if (appleCalMode) {
    console.log(`\n  即将导入 ${cal.event_count} 个事件到 macOS 日历 (日历名: ClawPlanOps)`);
    const confirmed = await askConfirmation('  确认导入到 macOS 日历？');
    if (confirmed) {
      const importResult = importToAppleCalendar(cal.events);
      if (importResult.success) {
        console.log(`  ✅ 成功导入 ${importResult.imported_count} 个事件到 "${importResult.calendar_name}" 日历`);
      } else {
        console.error(`  ❌ 导入失败: ${importResult.errors.join(', ')}`);
      }
    } else {
      console.log('  已取消导入');
    }
  }
  console.log();

  // Step 4: Check progress
  console.log('━ Step 4/6: 检查进度证据');
  const progress = checkProgressEvidence({ project_path: projectPath });
  console.log(`  进度: ${progress.progress_percent}%`);
  console.log(`  风险: ${progress.risk_level}`);
  console.log(`  完成: ${progress.completed.length} / ${progress.completed.length + progress.missing.length}`);
  if (progress.missing.length > 0) {
    console.log('  缺失:');
    progress.missing.forEach((m) => console.log(`    ✗ ${m.description}`));
  }
  console.log();

  // Export progress markdown
  fs.writeFileSync(
    path.join(outDir, 'progress_report.md'),
    exportMarkdownProgress(progress),
    'utf-8'
  );

  // Step 5: Daily report
  console.log('━ Step 5/6: 生成每日进度报告');
  const report = generateDailyProgressReport({
    project_path: projectPath,
    plan,
    schedule: cal,
  });
  console.log(`  今日计划: ${report.planned_today.length} 项`);
  console.log(`  下一步: ${report.next_actions.join('; ')}\n`);

  // Step 6: Reschedule
  console.log('━ Step 6/6: 动态重排建议');
  const re = reschedulePlan({
    progress_report: progress,
    original_plan: plan,
    deadline: reqs.deadline,
  });
  if (re.is_on_track) {
    console.log('  状态: ✅ 进度正常');
  } else {
    console.log(`  状态: ⚠️ 落后约 ${re.delay_days} 天`);
  }
  re.advice.forEach((a) => console.log(`  → ${a}`));
  console.log();

  // Export reschedule markdown
  fs.writeFileSync(
    path.join(outDir, 'reschedule_report.md'),
    exportMarkdownReschedule(re),
    'utf-8'
  );

  // Export full results JSON
  const fullResult = { task_requirements: reqs, plan, calendar: cal, progress, daily_report: report, reschedule: re };
  fs.writeFileSync(
    path.join(outDir, 'full_output.json'),
    JSON.stringify(fullResult, null, 2),
    'utf-8'
  );

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
      await cmdCalendar();
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
    case 'weekly':
      cmdWeekly();
      break;
    case 'presubmit':
      cmdPreSubmit();
      break;
    case 'projects':
      cmdProjects();
      break;
    case 'git-link':
      cmdGitLink();
      break;
    case 'trend':
      cmdTrend();
      break;
    case 'notify':
      cmdNotify();
      break;
    case 'calendar-import':
      cmdCalendarImport();
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
