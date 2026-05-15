import { generateCalendarSchedule as generate } from '../calendar/icsExporter';
import type { MicroTask, CalendarResult } from '../types';

interface CalendarParams {
  micro_tasks: MicroTask[];
  start_date: string;
  deadline: string;
  preferred_work_time?: string;
  output_path?: string;
}

export function generateCalendarSchedule(
  params: CalendarParams
): CalendarResult {
  return generate(
    params.micro_tasks,
    params.start_date,
    params.deadline,
    params.preferred_work_time ?? '20:00-22:00',
    params.output_path ?? './output/schedule.ics'
  );
}
