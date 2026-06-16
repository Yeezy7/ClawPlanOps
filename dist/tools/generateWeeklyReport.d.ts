import { exportWeeklyReportMarkdown } from '../report/weeklyReport';
import type { DeliverablePlan, WeeklyReport } from '../types';
interface WeeklyParams {
    project_path: string;
    plan: DeliverablePlan;
}
export declare function generateWeeklyReportTool(params: WeeklyParams): WeeklyReport;
export { exportWeeklyReportMarkdown };
//# sourceMappingURL=generateWeeklyReport.d.ts.map