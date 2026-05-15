import { reschedulePlan as reschedule } from '../planner/rescheduler';
import type {
  ProgressReport,
  DeliverablePlan,
  RescheduleResult,
} from '../types';

interface RescheduleParams {
  progress_report: ProgressReport;
  original_plan: DeliverablePlan;
  deadline: string;
}

export function reschedulePlan(params: RescheduleParams): RescheduleResult {
  return reschedule(
    params.progress_report,
    params.original_plan,
    params.deadline
  );
}
