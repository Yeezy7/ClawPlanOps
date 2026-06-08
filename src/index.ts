// Re-export all public APIs for programmatic use
export { parseTaskRequirements } from './tools/parseTaskRequirements';
export { buildDeliverablePlan } from './tools/buildDeliverablePlan';
export { generateCalendarSchedule } from './tools/generateCalendarSchedule';
export { importToAppleCalendar } from './calendar/appleCalendar';
export { checkProgressEvidence } from './tools/checkProgressEvidence';
export { generateDailyProgressReport } from './tools/generateDailyProgressReport';
export { reschedulePlan } from './tools/reschedulePlan';

export { parseTaskRequirements as clawplanops_parse_task_requirements } from './tools/parseTaskRequirements';
export { buildDeliverablePlan as clawplanops_build_deliverable_plan } from './tools/buildDeliverablePlan';
export { generateCalendarSchedule as clawplanops_generate_calendar_schedule } from './tools/generateCalendarSchedule';
export { checkProgressEvidence as clawplanops_check_progress_evidence } from './tools/checkProgressEvidence';
export { generateDailyProgressReport as clawplanops_generate_daily_progress_report } from './tools/generateDailyProgressReport';
export { reschedulePlan as clawplanops_reschedule_plan } from './tools/reschedulePlan';

export { fetchURLContent } from './planner/urlFetcher';
export { aiParseTaskRequirements } from './planner/aiParser';
export { checkGitEvidence } from './evidence/gitEvidence';
export { exportMarkdownPlan, exportMarkdownProgress, exportMarkdownReschedule } from './report/markdownExporter';
export { loadProjectConfig, resolveConfig, generateConfigTemplate } from './config/projectConfig';

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
} from './types';

export type { GitEvidenceRule } from './evidence/gitEvidence';
export type { ProjectConfig } from './config/projectConfig';
export type { AppleCalendarResult } from './calendar/appleCalendar';

/**
 * Plugin lifecycle: called when OpenClaw loads this plugin.
 * Provides the OpenClaw API for registering tools, hooks, etc.
 */
export function register(api: Record<string, unknown>): void {
  const logger = api.logger as { info: (msg: string) => void } | undefined;
  logger?.info('[claw-planops] Plugin loaded – 6 tools available via CLI and skill');
}

/**
 * Default export for OpenClaw plugin entry.
 */
const pluginEntry = {
  id: 'claw-planops',
  name: 'ClawPlanOps',
  description:
    '基于交付物证据的项目执行规划插件。输入任务通知 → 自动解析要求 → 生成计划 → 导出日历 → 检查真实进度 → 动态重排。',
  register,
};

export default pluginEntry;
