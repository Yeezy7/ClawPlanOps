// Tools
import { parseTaskRequirements } from './tools/parseTaskRequirements';
import { buildDeliverablePlan } from './tools/buildDeliverablePlan';
import { generateCalendarSchedule } from './tools/generateCalendarSchedule';
import { checkProgressEvidence } from './tools/checkProgressEvidence';
import { generateDailyProgressReport } from './tools/generateDailyProgressReport';
import { reschedulePlan } from './tools/reschedulePlan';

// Core modules
import { fetchURLContent } from './planner/urlFetcher';
import { checkGitEvidence } from './evidence/gitEvidence';
import type { GitEvidenceRule } from './evidence/gitEvidence';
import { exportMarkdownPlan, exportMarkdownProgress, exportMarkdownReschedule } from './report/markdownExporter';
import { loadProjectConfig, resolveConfig, generateConfigTemplate } from './config/projectConfig';
import type { ProjectConfig } from './config/projectConfig';

// Types
import type {
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

export {
  // 6 main tools
  parseTaskRequirements,
  buildDeliverablePlan,
  generateCalendarSchedule,
  checkProgressEvidence,
  generateDailyProgressReport,
  reschedulePlan,

  // Extended features
  fetchURLContent,
  checkGitEvidence,
  exportMarkdownPlan,
  exportMarkdownProgress,
  exportMarkdownReschedule,
  loadProjectConfig,
  resolveConfig,
  generateConfigTemplate,
};

export type {
  // Core types
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
  // Extended types
  GitEvidenceRule,
  ProjectConfig,
};

export const plugin = {
  name: 'claw-planops',
  version: '0.2.0',
  tools: {
    parse_task_requirements: parseTaskRequirements,
    build_deliverable_plan: buildDeliverablePlan,
    generate_calendar_schedule: generateCalendarSchedule,
    check_progress_evidence: checkProgressEvidence,
    generate_daily_progress_report: generateDailyProgressReport,
    reschedule_plan: reschedulePlan,
  },
};
