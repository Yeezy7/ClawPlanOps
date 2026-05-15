import type { ProgressReport, DeliverablePlan, RescheduleResult } from '../types';
/**
 * Generate reschedule suggestions when behind schedule.
 *
 * Strategy:
 * 1. Calculate delay based on progress vs time elapsed
 * 2. If on track, return no changes
 * 3. If behind, prioritize: compress → defer low-priority → cut optional
 */
export declare function reschedulePlan(progressReport: ProgressReport, originalPlan: DeliverablePlan, deadline: string): RescheduleResult;
//# sourceMappingURL=rescheduler.d.ts.map