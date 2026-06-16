import { execFileSync } from 'child_process';
import type { CalendarEvent } from '../types';

const CALENDAR_NAME = 'ClawPlanOps';

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
export function importToAppleCalendar(
  events: CalendarEvent[]
): AppleCalendarResult {
  if (process.platform !== 'darwin') {
    return {
      success: false,
      imported_count: 0,
      calendar_name: CALENDAR_NAME,
      errors: ['仅支持 macOS 系统'],
    };
  }

  const errors: string[] = [];
  let imported = 0;

  // Ensure calendar exists
  try {
    ensureCalendar();
  } catch (err: any) {
    return {
      success: false,
      imported_count: 0,
      calendar_name: CALENDAR_NAME,
      errors: [`创建日历失败: ${err.message}`],
    };
  }

  // Import events
  for (const event of events) {
    try {
      addEvent(event);
      imported++;
    } catch (err: any) {
      errors.push(`导入失败 [${event.summary}]: ${err.message}`);
    }
  }

  return {
    success: imported > 0,
    imported_count: imported,
    calendar_name: CALENDAR_NAME,
    errors,
  };
}

// ---- AppleScript helpers ------------------------------------

function ensureCalendar(): void {
  runAppleScript(buildEnsureCalendarScript());
}

export function buildEnsureCalendarScript(calendarName: string = CALENDAR_NAME): string {
  const safeCalendarName = escapeAppleScriptString(calendarName);
  return `
tell application "Calendar"
  if not (exists calendar "${safeCalendarName}") then
    make new calendar with properties {name:"${safeCalendarName}"}
  end if
end tell`;
}

function addEvent(event: CalendarEvent): void {
  runAppleScript(buildAddEventScript(event));
}

export function buildAddEventScript(
  event: CalendarEvent,
  calendarName: string = CALENDAR_NAME
): string {
  // Parse ICS date format: 20260601T200000 → Date string for AppleScript
  const startDate = icsDateToAppleScriptDate(event.start);
  const endDate = icsDateToAppleScriptDate(event.end);

  const safeCalendarName = escapeAppleScriptString(calendarName);
  const summary = escapeAppleScriptString(event.summary);
  const description = escapeAppleScriptString(event.description.replace(/\\n/g, ' | '));

  // Build alarm clauses
  const alarmClauses: string[] = [];
  // 30 min reminder for all events
  alarmClauses.push(`make new sound alarm at event end date with properties {trigger:-30}`);
  // 1 day reminder for high-priority tasks
  if (event.risk_note) {
    alarmClauses.push(`make new sound alarm at event end date with properties {trigger:-1440}`);
  }

  return `
tell application "Calendar"
  tell calendar "${safeCalendarName}"
    set newEvent to make new event with properties {summary:"${summary}", start date:${startDate}, end date:${endDate}, description:"${description}"}
    tell newEvent
      ${alarmClauses.join('\n      ')}
    end tell
  end tell
end tell`;
}

function runAppleScript(script: string): string {
  try {
    return execFileSync('osascript', ['-e', script], {
      encoding: 'utf-8',
      timeout: 10000,
    }).trim();
  } catch (err: any) {
    throw new Error(err.stderr || err.message);
  }
}

export function icsDateToAppleScriptDate(icsDate: string): string {
  if (!/^\d{8}T\d{6}$/.test(icsDate)) {
    throw new Error(`无效 ICS 日期: ${icsDate}`);
  }
  // 20260601T200000 → "date \"2026-06-01 20:00:00\""
  const y = icsDate.slice(0, 4);
  const m = icsDate.slice(4, 6);
  const d = icsDate.slice(6, 8);
  const hh = icsDate.slice(9, 11);
  const mm = icsDate.slice(11, 13);
  const ss = icsDate.slice(13, 15);
  return `date "${y}-${m}-${d} ${hh}:${mm}:${ss}"`;
}

export function escapeAppleScriptString(s: string): string {
  return s
    .replace(/\r?\n/g, ' | ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}
