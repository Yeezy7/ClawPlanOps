import type { ProgressReport, DeliverablePlan, RescheduleResult } from '../types';
interface RescheduleParams {
    progress_report: ProgressReport;
    original_plan: DeliverablePlan;
    deadline: string;
}
export declare function reschedulePlan(params: RescheduleParams): RescheduleResult;
export {};
//# sourceMappingURL=reschedulePlan.d.ts.map