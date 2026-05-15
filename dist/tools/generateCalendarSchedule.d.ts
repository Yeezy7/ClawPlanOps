import type { MicroTask, CalendarResult } from '../types';
interface CalendarParams {
    micro_tasks: MicroTask[];
    start_date: string;
    deadline: string;
    preferred_work_time?: string;
    output_path?: string;
}
export declare function generateCalendarSchedule(params: CalendarParams): CalendarResult;
export {};
//# sourceMappingURL=generateCalendarSchedule.d.ts.map