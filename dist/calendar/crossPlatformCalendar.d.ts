import type { CalendarEvent } from '../types';
export interface CrossPlatformResult {
    success: boolean;
    platform: string;
    method: string;
    imported_count: number;
    errors: string[];
}
export declare function importToSystemCalendar(events: CalendarEvent[]): CrossPlatformResult;
//# sourceMappingURL=crossPlatformCalendar.d.ts.map