import { importToSystemCalendar } from '../calendar/crossPlatformCalendar';
import type { CalendarEvent, CrossPlatformResult } from '../types';

interface CalendarImportParams {
  events: CalendarEvent[];
}

export function crossPlatformCalendarTool(params: CalendarImportParams): CrossPlatformResult {
  return importToSystemCalendar(params.events);
}

export { importToSystemCalendar };
