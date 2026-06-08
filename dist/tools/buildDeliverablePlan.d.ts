import type { TaskRequirements, DeliverablePlan } from '../types';
interface BuildParams {
    task_requirements: TaskRequirements;
    available_days?: number;
    daily_available_hours?: number;
    custom_templates?: Record<string, {
        sub_tasks: string[];
        evidence: string[];
    }>;
}
export declare function buildDeliverablePlan(params: BuildParams): DeliverablePlan;
export {};
//# sourceMappingURL=buildDeliverablePlan.d.ts.map