import { buildDeliverablePlan as build } from '../planner/deliverablePlanner';
import type { TaskRequirements, DeliverablePlan } from '../types';

interface BuildParams {
  task_requirements: TaskRequirements;
  available_days?: number;
  daily_available_hours?: number;
  custom_templates?: Record<string, { sub_tasks: string[]; evidence: string[] }>;
}

export function buildDeliverablePlan(params: BuildParams): DeliverablePlan {
  return build(
    params.task_requirements,
    params.available_days,
    params.daily_available_hours,
    params.custom_templates
  );
}
