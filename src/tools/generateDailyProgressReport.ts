import { generateDailyReport as generate } from '../report/dailyReport';
import type { DeliverablePlan, CalendarResult, DailyReport } from '../types';

interface DailyReportParams {
  project_path: string;
  plan: DeliverablePlan;
  schedule: CalendarResult;
}

export function generateDailyProgressReport(
  params: DailyReportParams
): DailyReport {
  return generate(params.project_path, params.plan, params.schedule);
}
