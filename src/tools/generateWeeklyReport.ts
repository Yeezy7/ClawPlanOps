import { generateWeeklyReport, exportWeeklyReportMarkdown } from '../report/weeklyReport';
import { checkProgressEvidence } from './checkProgressEvidence';
import type { DeliverablePlan, WeeklyReport } from '../types';

interface WeeklyParams {
  project_path: string;
  plan: DeliverablePlan;
}

export function generateWeeklyReportTool(params: WeeklyParams): WeeklyReport {
  const progress = checkProgressEvidence({ project_path: params.project_path });
  return generateWeeklyReport({
    project_path: params.project_path,
    micro_tasks: params.plan.micro_tasks,
    progress_report: progress,
  });
}

export { exportWeeklyReportMarkdown };
