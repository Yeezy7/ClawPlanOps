import type { TaskRequirements, DeliverablePlan } from '../types';
/**
 * Build a deliverable plan from task requirements.
 * Reverse-plans from the final deadline backward.
 */
export declare function buildDeliverablePlan(taskRequirements: TaskRequirements, availableDays?: number, dailyAvailableHours?: number): DeliverablePlan;
export declare function addDays(dateStr: string, days: number): string;
//# sourceMappingURL=deliverablePlanner.d.ts.map