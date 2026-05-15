import type { MicroTask, CalendarResult } from '../types';
/**
 * Generate an .ics calendar file from micro tasks.
 * Pure implementation, zero dependencies.
 */
export declare function generateCalendarSchedule(microTasks: MicroTask[], startDate: string, deadline: string, preferredWorkTime?: string, outputPath?: string): CalendarResult;
//# sourceMappingURL=icsExporter.d.ts.map