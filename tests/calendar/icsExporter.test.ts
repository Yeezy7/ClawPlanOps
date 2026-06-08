import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateCalendarSchedule } from '../../src/calendar/icsExporter';
import type { MicroTask } from '../../src/types';

const mockTasks: MicroTask[] = [
  {
    id: 'T-001',
    name: '编写核心代码',
    estimated_minutes: 60,
    deliverable_id: 'DEL-01',
    phase_name: '第1阶段',
    completion_criteria: '代码完成',
    priority: 'high',
  },
  {
    id: 'T-002',
    name: '写README',
    estimated_minutes: 45,
    deliverable_id: 'DEL-02',
    phase_name: '第2阶段',
    completion_criteria: '文档完成',
    priority: 'medium',
  },
  {
    id: 'T-003',
    name: '检查代码',
    estimated_minutes: 30,
    deliverable_id: 'DEL-01',
    phase_name: '第1阶段',
    completion_criteria: '检查通过',
    priority: 'low',
  },
];

const testOutputPath = path.join(__dirname, '../test_output/schedule.ics');

afterEach(() => {
  try {
    if (fs.existsSync(testOutputPath)) fs.unlinkSync(testOutputPath);
    const dir = path.dirname(testOutputPath);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  } catch {
    // ignore cleanup errors
  }
});

describe('generateCalendarSchedule', () => {
  it('should generate a valid ICS file', () => {
    const result = generateCalendarSchedule(
      mockTasks,
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00',
      testOutputPath
    );

    expect(result.event_count).toBe(3);
    expect(fs.existsSync(result.ics_file_path)).toBe(true);
    expect(result.ics_content).toContain('BEGIN:VCALENDAR');
    expect(result.ics_content).toContain('END:VCALENDAR');
  });

  it('should include VALARM reminders', () => {
    const result = generateCalendarSchedule(
      mockTasks,
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00',
      testOutputPath
    );

    expect(result.ics_content).toContain('BEGIN:VALARM');
    expect(result.ics_content).toContain('TRIGGER:-PT30M');
  });

  it('should include extra alarm for high-priority tasks', () => {
    const result = generateCalendarSchedule(
      mockTasks,
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00',
      testOutputPath
    );

    expect(result.ics_content).toContain('TRIGGER:-P1D');
  });

  it('should schedule tasks sorted by priority', () => {
    const result = generateCalendarSchedule(
      mockTasks,
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00',
      testOutputPath
    );

    // High priority task should be first event
    const summaries = result.events.map((e) => e.summary);
    expect(summaries[0]).toBe('编写核心代码');
  });

  it('should respect preferred work time', () => {
    const result = generateCalendarSchedule(
      mockTasks,
      '2026-06-01',
      '2026-06-30',
      '09:00-11:00',
      testOutputPath
    );

    // Events should start at 09:00
    expect(result.events[0].start).toContain('T0900');
  });

  it('should move to next day when slot is full', () => {
    const manyTasks: MicroTask[] = Array.from({ length: 5 }, (_, i) => ({
      id: `T-${i.toString().padStart(3, '0')}`,
      name: `任务${i}`,
      estimated_minutes: 90,
      deliverable_id: 'DEL-01',
      phase_name: 'P1',
      completion_criteria: '完成',
      priority: 'medium' as const,
    }));

    const result = generateCalendarSchedule(
      manyTasks,
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00', // 120 min slot, each task is 90 min
      testOutputPath
    );

    // 5 tasks * 90min = 450min, with 120min/day = needs 4 days
    const dates = result.events.map((e) => e.start.slice(0, 8));
    const uniqueDates = [...new Set(dates)];
    expect(uniqueDates.length).toBeGreaterThanOrEqual(4);
  });

  it('should keep every task even when schedule exceeds deadline', () => {
    const manyTasks: MicroTask[] = Array.from({ length: 4 }, (_, i) => ({
      id: `T-${i.toString().padStart(3, '0')}`,
      name: `超期任务${i}`,
      estimated_minutes: 90,
      deliverable_id: 'DEL-01',
      phase_name: 'P1',
      completion_criteria: '完成',
      priority: 'medium' as const,
    }));

    const result = generateCalendarSchedule(
      manyTasks,
      '2026-06-01',
      '2026-06-01T23:59:00',
      '20:00-22:00',
      testOutputPath
    );

    expect(result.event_count).toBe(manyTasks.length);
    expect(result.events.some((e) => e.risk_note.includes('超出截止时间'))).toBe(true);
    expect(result.ics_content).toContain('风险提示：排期已超出截止时间');
  });

  it('should handle empty task list', () => {
    const result = generateCalendarSchedule(
      [],
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00',
      testOutputPath
    );

    expect(result.event_count).toBe(0);
    expect(result.ics_content).toContain('BEGIN:VCALENDAR');
  });

  it('should produce RFC 5545 compliant content', () => {
    const result = generateCalendarSchedule(
      mockTasks,
      '2026-06-01',
      '2026-06-30',
      '20:00-22:00',
      testOutputPath
    );

    expect(result.ics_content).toContain('VERSION:2.0');
    expect(result.ics_content).toContain('PRODID:-//ClawPlanOps//EN');
    expect(result.ics_content).toContain('CALSCALE:GREGORIAN');
    expect(result.ics_content).toMatch(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
  });
});
