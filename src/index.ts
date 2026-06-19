// Re-export all public APIs for programmatic use
export { parseTaskRequirements } from './tools/parseTaskRequirements';
export { buildDeliverablePlan } from './tools/buildDeliverablePlan';
export { generateCalendarSchedule } from './tools/generateCalendarSchedule';
export { importToAppleCalendar } from './calendar/appleCalendar';
export { checkProgressEvidence } from './tools/checkProgressEvidence';
export { generateDailyProgressReport } from './tools/generateDailyProgressReport';
export { reschedulePlan } from './tools/reschedulePlan';

export { fetchURLContent } from './planner/urlFetcher';
export { aiParseTaskRequirements } from './planner/aiParser';
export { checkGitEvidence } from './evidence/gitEvidence';
export { exportMarkdownPlan, exportMarkdownProgress, exportMarkdownReschedule } from './report/markdownExporter';
export { loadProjectConfig, resolveConfig, generateConfigTemplate } from './config/projectConfig';

// New modules: v0.3.0
export { generateWeeklyReport, exportWeeklyReportMarkdown } from './report/weeklyReport';
export { runPreSubmissionCheck, exportPreSubmissionMarkdown } from './report/preSubmissionCheck';
export { loadMultiProjectState, addProject, switchProject, getActiveProject, listProjects, removeProject, getOverallStatus } from './config/multiProject';
export { sendSystemNotification, sendEmailNotification, sendWebhookNotification, sendEventReminder, sendBatchReminders } from './notification/pushNotification';
export { getRecentCommits, linkCommitsToTasks, generateGitTaskMarkdown } from './evidence/gitTaskLink';
export { saveProgressSnapshot, loadProgressHistory, analyzeProgressTrend, exportProgressTrendMarkdown } from './evidence/progressHistory';
export { importToSystemCalendar } from './calendar/crossPlatformCalendar';

export type {
  TaskRequirements,
  DeliverablePlan,
  CalendarResult,
  ProgressReport,
  DailyReport,
  RescheduleResult,
  Phase,
  MicroTask,
  DeliverableItem,
  EvidenceRule,
  EvidenceResult,
  CalendarEvent,
  RiskLevel,
  WeeklyReport,
  CompletedTask,
  GitCommit,
  PreSubmissionCheck,
  SubmissionCheckItem,
  ProjectEntry,
  MultiProjectState,
  ProgressSnapshot,
  ProgressTrend,
  TaskGitLink,
  GitTaskReport,
  NotificationConfig,
  NotificationResult,
  CrossPlatformResult,
} from './types';

export type { GitEvidenceRule } from './evidence/gitEvidence';
export type { ProjectConfig } from './config/projectConfig';
export type { AppleCalendarResult } from './calendar/appleCalendar';

// ---- Tool implementations (internal) ----

import { parseTaskRequirements as parseImpl } from './tools/parseTaskRequirements';
import { buildDeliverablePlan as buildImpl } from './tools/buildDeliverablePlan';
import { generateCalendarSchedule as calImpl } from './tools/generateCalendarSchedule';
import { checkProgressEvidence as checkImpl } from './tools/checkProgressEvidence';
import { generateDailyProgressReport as reportImpl } from './tools/generateDailyProgressReport';
import { reschedulePlan as rescheduleImpl } from './tools/reschedulePlan';
import { generateWeeklyReportTool as weeklyImpl } from './tools/generateWeeklyReport';
import { preSubmissionCheckTool as presubmitImpl } from './tools/preSubmissionCheck';
import { multiProjectStatusTool as multiProjImpl } from './tools/multiProjectStatus';
import { gitTaskLinkTool as gitLinkImpl } from './tools/gitTaskLink';
import { progressTrendTool as trendImpl } from './tools/progressTrend';
import { sendNotificationTool as notifyImpl } from './tools/sendNotification';
import { crossPlatformCalendarTool as calImportImpl } from './tools/crossPlatformCalendar';

// ---- Interactive tool descriptions ----

const TOOL_DESCRIPTIONS = {
  clawplanops_parse_task_requirements: `解析任务通知文本或 URL，提取结构化信息。

何时使用：用户提供了一段比赛通知、作业要求、或项目说明文本（或 URL）时。
输入：content（文本或 URL）、可选的 input_type（'text' 或 'url'）。
输出：包含 task_name、deadline、deliverables、constraints 的 JSON。

⚠️ 必须调用此工具，不要自己解析。工具会处理格式差异和边界情况。`,

  clawplanops_build_deliverable_plan: `根据任务要求生成交付物计划和微任务。

何时使用：用户确认了任务信息后，生成详细的执行计划。
输入：task_requirements（从解析步骤获得）、可选的 available_days、daily_available_hours。
输出：包含 phases、deliverables、micro_tasks 的完整计划。

⚠️ 必须调用此工具，不要自己写计划文件。工具会生成标准格式。`,

  clawplanops_generate_calendar_schedule: `生成 .ics 日历文件，包含 VALARM 提醒。

何时使用：用户确认计划后，导出日历。
输入：micro_tasks、start_date、deadline、可选的 preferred_work_time。
输出：日历文件路径和事件数量。

⚠️ 必须调用此工具，不要自己写 ICS 生成代码。工具会生成标准 RFC 5545 格式。`,

  clawplanops_check_progress_evidence: `扫描项目目录，检查文件证据和 Git 提交，计算进度百分比。

何时使用：用户想了解项目当前状态时。
输入：project_path。
输出：progress_percent、risk_level、completed、missing。

⚠️ 必须调用此工具，不要自己扫描文件目录。工具会处理文件匹配和 Git 历史分析。`,

  clawplanops_generate_daily_progress_report: `生成每日进度报告，显示今日计划和下一步行动。

何时使用：用户问"今天该做什么"时。
输入：project_path、plan、schedule。
输出：planned_today、next_actions。

⚠️ 必须调用此工具，不要自己统计今日任务。工具会基于计划和进度生成报告。`,

  clawplanops_reschedule_plan: `根据进度落后情况生成重排建议。

何时使用：进度检查显示落后时。
输入：progress_report、original_plan、deadline。
输出：delay_days、priority_tasks、removed_tasks、advice。

⚠️ 必须调用此工具，不要自己计算重排方案。工具会生成优化的调整建议。`,

  clawplanops_generate_weekly_report: `生成周报，包含完成任务、Git 提交、下周重点。

何时使用：用户要求生成周报或总结本周工作时。
输入：project_path、plan。
输出：completed_tasks、git_commits、next_week_focus。

⚠️ 必须调用此工具，不要自己统计 Git 提交。工具会分析 Git 历史并生成标准化报告。`,

  clawplanops_pre_submission_check: `提交前检查，验证所有材料是否齐全。

何时使用：用户准备提交材料前。
输入：project_path、plan。
输出：ready、score、checks、missing_files。

⚠️ 必须调用此工具，不要自己检查文件完整性。工具会验证所有必需文件和格式。`,

  clawplanops_multi_project_status: `查看所有并行项目的状态概览。

何时使用：用户管理多个项目时。
输入：project_path。
输出：total_projects、projects_summary。

⚠️ 必须调用此工具，不要自己读取项目状态。工具会汇总所有项目的进度。`,

  clawplanops_git_task_link: `分析 Git 提交与任务的关联关系。

何时使用：用户想了解代码提交和任务的对应关系时。
输入：project_path、plan。
输出：task_links、unlinked_commits、coverage_percent。

⚠️ 必须调用此工具，不要自己分析 Git 提交。工具会解析 commit message 并匹配任务。`,

  clawplanops_progress_trend: `分析进度趋势，计算日均进度和预计完成时间。

何时使用：用户想了解进度趋势时。
输入：project_path。
输出：trend_direction、avg_daily_progress、estimated_completion_date。

⚠️ 必须调用此工具，不要自己计算趋势。工具会分析历史快照并预测完成时间。`,

  clawplanops_send_notification: `发送系统通知提醒。

何时使用：用户想发送提醒时。
输入：title、message。
输出：success、method。

⚠️ 必须调用此工具，不要自己调用系统命令。工具会处理跨平台通知。`,

  clawplanops_cross_platform_calendar: `跨平台日历导入（自动检测系统）。

何时使用：用户想导入日历到系统日历应用时。
输入：events。
输出：success、platform、method。

⚠️ 必须调用此工具，不要自己检测操作系统。工具会自动检测并调用正确的日历应用。`,
};

// ---- Plugin entry (OpenClaw format) ----

function createPluginEntry() {
  return {
    id: 'claw-planops',
    name: 'ClawPlanOps',
    description: '基于交付物证据的项目执行规划插件。支持交互式项目规划、进度追踪、材料检查。',
    version: '0.3.0',

    register(api: any) {
      const logger = api.logger;

      // Register each tool with interactive descriptions
      const toolRegistry = {
        clawplanops_parse_task_requirements: parseImpl,
        clawplanops_build_deliverable_plan: buildImpl,
        clawplanops_generate_calendar_schedule: calImpl,
        clawplanops_check_progress_evidence: checkImpl,
        clawplanops_generate_daily_progress_report: reportImpl,
        clawplanops_reschedule_plan: rescheduleImpl,
        clawplanops_generate_weekly_report: weeklyImpl,
        clawplanops_pre_submission_check: presubmitImpl,
        clawplanops_multi_project_status: multiProjImpl,
        clawplanops_git_task_link: gitLinkImpl,
        clawplanops_progress_trend: trendImpl,
        clawplanops_send_notification: notifyImpl,
        clawplanops_cross_platform_calendar: calImportImpl,
      };

      // Tool parameter schemas for OpenClaw
      const TOOL_PARAMETERS: Record<string, any> = {
        clawplanops_parse_task_requirements: {
          type: 'object',
          properties: {
            content: { type: 'string', description: '任务通知文本或 URL 内容' },
            input_type: { type: 'string', enum: ['text', 'url'], description: '输入类型，默认 text' },
          },
          required: ['content'],
        },
        clawplanops_build_deliverable_plan: {
          type: 'object',
          properties: {
            task_requirements: { type: 'object', description: '从 parse_task_requirements 获取的任务要求' },
            available_days: { type: 'number', description: '可用天数' },
            daily_available_hours: { type: 'number', description: '每日可用小时数' },
            custom_templates: { type: 'object', description: '自定义交付物模板' },
          },
          required: ['task_requirements'],
        },
        clawplanops_generate_calendar_schedule: {
          type: 'object',
          properties: {
            micro_tasks: { type: 'array', description: '微任务列表' },
            start_date: { type: 'string', description: '开始日期 YYYY-MM-DD' },
            deadline: { type: 'string', description: '截止日期 YYYY-MM-DD' },
            preferred_work_time: { type: 'string', description: '偏好工作时间段，如 20:00-22:00' },
            output_path: { type: 'string', description: '输出文件路径' },
          },
          required: ['micro_tasks', 'start_date', 'deadline'],
        },
        clawplanops_check_progress_evidence: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
            evidence_rules: { type: 'array', description: '自定义证据规则' },
            exclude_patterns: { type: 'array', description: '排除的文件模式' },
          },
          required: ['project_path'],
        },
        clawplanops_generate_daily_progress_report: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
            plan: { type: 'object', description: '项目计划' },
            schedule: { type: 'object', description: '日程安排' },
          },
          required: ['project_path'],
        },
        clawplanops_reschedule_plan: {
          type: 'object',
          properties: {
            progress_report: { type: 'object', description: '进度报告' },
            original_plan: { type: 'object', description: '原始计划' },
            deadline: { type: 'string', description: '截止日期' },
          },
          required: ['progress_report', 'original_plan', 'deadline'],
        },
        clawplanops_generate_weekly_report: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
            plan: { type: 'object', description: '项目计划' },
          },
          required: ['project_path'],
        },
        clawplanops_pre_submission_check: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
            plan: { type: 'object', description: '项目计划' },
          },
          required: ['project_path', 'plan'],
        },
        clawplanops_multi_project_status: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
          },
          required: ['project_path'],
        },
        clawplanops_git_task_link: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
            plan: { type: 'object', description: '项目计划' },
          },
          required: ['project_path', 'plan'],
        },
        clawplanops_progress_trend: {
          type: 'object',
          properties: {
            project_path: { type: 'string', description: '项目目录路径' },
          },
          required: ['project_path'],
        },
        clawplanops_send_notification: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '通知标题' },
            message: { type: 'string', description: '通知内容' },
          },
          required: ['title', 'message'],
        },
        clawplanops_cross_platform_calendar: {
          type: 'object',
          properties: {
            events: { type: 'array', description: '日历事件列表' },
          },
          required: ['events'],
        },
      };

      // Register tools if api.registerTool is available
      if (api.registerTool) {
        for (const [name, impl] of Object.entries(toolRegistry)) {
          api.registerTool({
            name,
            description: TOOL_DESCRIPTIONS[name as keyof typeof TOOL_DESCRIPTIONS] || '',
            parameters: TOOL_PARAMETERS[name] || { type: 'object' },
            async execute(_id: string, params: any) {
              try {
                const result = (impl as any)(params);
                return {
                  content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                };
              } catch (err: any) {
                return {
                  content: [{ type: 'text', text: `错误: ${err.message}` }],
                  isError: true,
                };
              }
            },
          });
        }
        logger?.info?.(`[claw-planops] Registered ${Object.keys(toolRegistry).length} interactive tools`);
      }

      // Register lifecycle hooks
      if (api.on) {
        api.on('session:start', () => {
          logger?.info?.('[claw-planops] Session started – ClawPlanOps ready');
        });
      }
    },
  };
}

// ---- Exports for OpenClaw ----

// Named tool exports for direct function calls
export { parseImpl as clawplanops_parse_task_requirements };
export { buildImpl as clawplanops_build_deliverable_plan };
export { calImpl as clawplanops_generate_calendar_schedule };
export { checkImpl as clawplanops_check_progress_evidence };
export { reportImpl as clawplanops_generate_daily_progress_report };
export { rescheduleImpl as clawplanops_reschedule_plan };
export { weeklyImpl as clawplanops_generate_weekly_report };
export { presubmitImpl as clawplanops_pre_submission_check };
export { multiProjImpl as clawplanops_multi_project_status };
export { gitLinkImpl as clawplanops_git_task_link };
export { trendImpl as clawplanops_progress_trend };
export { notifyImpl as clawplanops_send_notification };
export { calImportImpl as clawplanops_cross_platform_calendar };

// Default export for OpenClaw plugin system
export default createPluginEntry();

// Legacy register function for compatibility
export function register(api: Record<string, unknown>): void {
  const entry = createPluginEntry();
  entry.register(api);
}
