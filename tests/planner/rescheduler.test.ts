import { describe, it, expect } from 'vitest';
import { reschedulePlan } from '../../src/planner/rescheduler';
import type { ProgressReport, DeliverablePlan, MicroTask, Phase } from '../../src/types';

function dateDaysFromNow(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function deadlineDaysFromNow(days: number): string {
  return `${dateDaysFromNow(days)}T23:59:00`;
}

const mockMicroTasks: MicroTask[] = [
  { id: 'T-001', name: '高优任务', estimated_minutes: 60, deliverable_id: 'DEL-01', phase_name: 'P1', completion_criteria: '完成', priority: 'high' },
  { id: 'T-002', name: '中优任务', estimated_minutes: 45, deliverable_id: 'DEL-01', phase_name: 'P1', completion_criteria: '完成', priority: 'medium' },
  { id: 'T-003', name: '低优任务', estimated_minutes: 30, deliverable_id: 'DEL-02', phase_name: 'P2', completion_criteria: '完成', priority: 'low' },
  { id: 'T-004', name: '另一个低优', estimated_minutes: 30, deliverable_id: 'DEL-02', phase_name: 'P2', completion_criteria: '完成', priority: 'low' },
];

const mockPhases: Phase[] = [
  { phase_name: 'P1', start_date: dateDaysFromNow(-15), end_date: dateDaysFromNow(-1), goal: 'g1', deliverables: ['DEL-01'] },
  { phase_name: 'P2', start_date: dateDaysFromNow(0), end_date: dateDaysFromNow(14), goal: 'g2', deliverables: ['DEL-02'] },
];

const mockPlan: DeliverablePlan = {
  task_name: '测试',
  deadline: deadlineDaysFromNow(15),
  start_date: dateDaysFromNow(-15),
  total_days: 30,
  daily_hours: 2,
  phases: mockPhases,
  deliverables: [],
  micro_tasks: mockMicroTasks,
};

describe('reschedulePlan', () => {
  it('should report on track when progress is good', () => {
    const progress: ProgressReport = {
      progress_percent: 80,
      completed: [],
      missing: [],
      risks: [],
      risk_level: 'low',
      scanned_path: '.',
      scanned_at: new Date().toISOString(),
    };
    const result = reschedulePlan(progress, mockPlan, mockPlan.deadline);
    expect(result.is_on_track).toBe(true);
    expect(result.delay_days).toBe(0);
    expect(result.removed_tasks).toHaveLength(0);
  });

  it('should compress tasks when behind schedule', () => {
    const progress: ProgressReport = {
      progress_percent: 10,
      completed: [],
      missing: [],
      risks: ['落后'],
      risk_level: 'high',
      scanned_path: '.',
      scanned_at: new Date().toISOString(),
    };
    const result = reschedulePlan(progress, mockPlan, mockPlan.deadline);
    expect(result.is_on_track).toBe(false);
    expect(result.delay_days).toBeGreaterThan(0);
    expect(result.compressed_tasks.length).toBeGreaterThan(0);
  });

  it('should remove low-priority tasks when severely delayed', () => {
    const progress: ProgressReport = {
      progress_percent: 0,
      completed: [],
      missing: [],
      risks: ['严重落后'],
      risk_level: 'critical',
      scanned_path: '.',
      scanned_at: new Date().toISOString(),
    };
    const result = reschedulePlan(progress, mockPlan, mockPlan.deadline);
    expect(result.delay_days).toBeGreaterThan(3);
    expect(result.removed_tasks.length).toBeGreaterThan(0);
  });

  it('should always keep high-priority tasks', () => {
    const progress: ProgressReport = {
      progress_percent: 5,
      completed: [],
      missing: [],
      risks: [],
      risk_level: 'critical',
      scanned_path: '.',
      scanned_at: new Date().toISOString(),
    };
    const result = reschedulePlan(progress, mockPlan, mockPlan.deadline);
    expect(result.priority_tasks.some((t) => t.id === 'T-001')).toBe(true);
  });

  it('should generate advice', () => {
    const progress: ProgressReport = {
      progress_percent: 10,
      completed: [],
      missing: [],
      risks: [],
      risk_level: 'high',
      scanned_path: '.',
      scanned_at: new Date().toISOString(),
    };
    const result = reschedulePlan(progress, mockPlan, mockPlan.deadline);
    expect(result.advice.length).toBeGreaterThan(0);
    expect(result.advice.some((a) => a.includes('落后'))).toBe(true);
  });

  it('should generate recommended phases when behind', () => {
    const progress: ProgressReport = {
      progress_percent: 10,
      completed: [],
      missing: [],
      risks: [],
      risk_level: 'high',
      scanned_path: '.',
      scanned_at: new Date().toISOString(),
    };
    const result = reschedulePlan(progress, mockPlan, mockPlan.deadline);
    expect(result.recommended_next_plan.length).toBeGreaterThan(0);
  });
});
