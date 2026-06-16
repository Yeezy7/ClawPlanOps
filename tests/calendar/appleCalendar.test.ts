import { describe, it, expect } from 'vitest';
import {
  buildAddEventScript,
  buildEnsureCalendarScript,
  escapeAppleScriptString,
  icsDateToAppleScriptDate,
} from '../../src/calendar/appleCalendar';
import type { CalendarEvent } from '../../src/types';

const mockEvent: CalendarEvent = {
  uid: 'T-001@test',
  summary: '整理 "PPT" \\ 资料',
  description: '第一行\\n第二行 "quote" \\ path',
  start: '20260601T200000',
  end: '20260601T210000',
  completion_criteria: '完成',
  deliverable_id: 'DEL-01',
  risk_note: '高优先级',
};

describe('Apple Calendar helpers', () => {
  it('should format ICS dates for AppleScript', () => {
    expect(icsDateToAppleScriptDate('20260601T200000')).toBe(
      'date "2026-06-01 20:00:00"'
    );
  });

  it('should reject invalid ICS dates', () => {
    expect(() => icsDateToAppleScriptDate('2026-06-01')).toThrow('无效 ICS 日期');
  });

  it('should escape AppleScript string content', () => {
    expect(escapeAppleScriptString('A "quote" \\ path\nnext')).toBe(
      'A \\"quote\\" \\\\ path | next'
    );
  });

  it('should build safe calendar creation script', () => {
    const script = buildEnsureCalendarScript('Claw "PlanOps"');
    expect(script).toContain('calendar "Claw \\"PlanOps\\""');
    expect(script).not.toContain('Claw "PlanOps"');
  });

  it('should build event script without raw user-controlled quotes', () => {
    const script = buildAddEventScript(mockEvent, 'Claw "PlanOps"');
    expect(script).toContain('summary:"整理 \\"PPT\\" \\\\ 资料"');
    expect(script).toContain('description:"第一行 | 第二行 \\"quote\\" \\\\ path"');
    expect(script).toContain('calendar "Claw \\"PlanOps\\""');
    expect(script).toContain('trigger:-30');
    expect(script).toContain('trigger:-1440');
  });
});
