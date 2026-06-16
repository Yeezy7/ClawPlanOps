import type { CalendarEvent } from '../types';
export interface AppleCalendarResult {
    success: boolean;
    imported_count: number;
    calendar_name: string;
    errors: string[];
}
/**
 * Import calendar events directly into macOS Calendar.app using osascript.
 * Creates a dedicated "ClawPlanOps" calendar if it doesn't exist.
 */
export declare function importToAppleCalendar(events: CalendarEvent[]): AppleCalendarResult;
export declare function buildEnsureCalendarScript(calendarName?: string): string;
export declare function buildAddEventScript(event: CalendarEvent, calendarName?: string): string;
export declare function icsDateToAppleScriptDate(icsDate: string): string;
export declare function escapeAppleScriptString(s: string): string;
//# sourceMappingURL=appleCalendar.d.ts.map