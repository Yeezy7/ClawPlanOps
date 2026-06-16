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
  clawplanops_parse_task_requirements: `解析任务通知文本，提取结构化信息。

何时使用：用户提供了一段比赛通知、作业要求、或项目说明文本时。
输出：包含 task_name、deadline、deliverables、constraints 的 JSON。

注意：在对话流程中，你应该自己解析文本（LLM 能力更强），不要调用此工具。此工具仅用于 CLI 备用。`,

  clawplanops_build_deliverable_plan: `根据任务要求生成交付物计划和微任务。

何时使用：用户确认了任务信息后，生成详细的执行计划。
输入：task_requirements（从解析步骤获得）、可选的 available_days、daily_available_hours。
输出：包含 phases、deliverables、micro_tasks 的完整计划。

交互流程：
1. 确认用户已提供截止时间和交付物
2. 调用此工具生成计划
3. 用表格展示阶段划分
4. 询问用户是否需要调整`,

  clawplanops_generate_calendar_schedule: `生成 .ics 日历文件，包含 VALARM 提醒。

何时使用：用户确认计划后，导出日历。
输入：micro_tasks、start_date、deadline、可选的 preferred_work_time。
输出：日历文件路径和事件数量。

交互流程：
1. 询问用户偏好的工作时间段（默认 20:00-22:00）
2. 调用此工具生成日历
3. 告知文件位置和导入方法`,

  clawplanops_check_progress_evidence: `扫描项目目录，检查文件证据和 Git 提交，计算进度百分比。

何时使用：用户想了解项目当前状态时。
输入：project_path。
输出：progress_percent、risk_level、completed、missing。

交互流程：
1. 确认项目路径
2. 调用此工具检查进度
3. 用进度条和表格展示结果
4. 给出下一步建议`,

  clawplanops_generate_daily_progress_report: `生成每日进度报告，显示今日计划和下一步行动。

何时使用：用户问"今天该做什么"时。
输入：project_path、plan、schedule。
输出：planned_today、next_actions。

交互流程：
1. 调用此工具
2. 展示今日任务列表
3. 建议优先级`,

  clawplanops_reschedule_plan: `根据进度落后情况生成重排建议。

何时使用：进度检查显示落后时。
输入：progress_report、original_plan、deadline。
输出：delay_days、priority_tasks、removed_tasks、advice。

交互流程：
1. 调用此工具
2. 展示重排建议
3. 询问用户是否接受建议`,

  clawplanops_generate_weekly_report: `生成周报，包含完成任务、Git 提交、下周重点。

何时使用：用户要求生成周报或总结本周工作时。
输入：project_path、plan。
输出：completed_tasks、git_commits、next_week_focus。

交互流程：
1. 调用此工具
2. 用表格展示本周完成
3. 展示 Git 提交记录
4. 给出下周建议`,

  clawplanops_pre_submission_check: `提交前检查，验证所有材料是否齐全。

何时使用：用户准备提交材料前。
输入：project_path、plan。
输出：ready、score、checks、missing_files。

交互流程：
1. 调用此工具
2. 用表格展示检查结果
3. 标注缺失项
4. 建议补全顺序`,

  clawplanops_multi_project_status: `查看所有并行项目的状态概览。

何时使用：用户管理多个项目时。
输入：project_path。
输出：total_projects、projects_summary。

交互流程：
1. 调用此工具
2. 用表格展示所有项目
3. 询问用户要切换到哪个项目`,

  clawplanops_git_task_link: `分析 Git 提交与任务的关联关系。

何时使用：用户想了解代码提交和任务的对应关系时。
输入：project_path、plan。
输出：task_links、unlinked_commits、coverage_percent。

交互流程：
1. 调用此工具
2. 展示关联覆盖率
3. 列出已关联和未关联的提交`,

  clawplanops_progress_trend: `分析进度趋势，计算日均进度和预计完成时间。

何时使用：用户想了解进度趋势时。
输入：project_path。
输出：trend_direction、avg_daily_progress、estimated_completion_date。

交互流程：
1. 调用此工具
2. 展示趋势方向（上升/下降/平稳）
3. 展示预计完成时间`,

  clawplanops_send_notification: `发送系统通知提醒。

何时使用：用户想发送提醒时。
输入：title、message。
输出：success、method。

交互流程：
1. 确认标题和消息
2. 调用此工具
3. 确认发送成功`,

  clawplanops_cross_platform_calendar: `跨平台日历导入（自动检测系统）。

何时使用：用户想导入日历到系统日历应用时。
输入：events。
输出：success、platform、method。

交互流程：
1. 调用此工具
2. 告知检测到的系统和导入方式
3. 确认导入结果`,
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

      // Register tools if api.registerTool is available
      if (api.registerTool) {
        for (const [name, impl] of Object.entries(toolRegistry)) {
          api.registerTool({
            name,
            description: TOOL_DESCRIPTIONS[name as keyof typeof TOOL_DESCRIPTIONS] || '',
            parameters: { type: 'object' },
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
