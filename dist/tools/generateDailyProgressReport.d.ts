import type { DeliverablePlan, CalendarResult, DailyReport } from '../types';
interface DailyReportParams {
    project_path: string;
    plan: DeliverablePlan;
    schedule: CalendarResult;
}
export declare function generateDailyProgressReport(params: DailyReportParams): DailyReport;
export {};
//# sourceMappingURL=generateDailyProgressReport.d.ts.map