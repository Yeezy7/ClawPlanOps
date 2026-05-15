import type { TaskRequirements, DeliverablePlan } from '../types';
interface BuildParams {
    task_requirements: TaskRequirements;
    available_days?: number;
    daily_available_hours?: number;
}
export declare function buildDeliverablePlan(params: BuildParams): DeliverablePlan;
export {};
//# sourceMappingURL=buildDeliverablePlan.d.ts.map