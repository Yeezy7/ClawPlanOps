import { describe, it, expect } from 'vitest';
import { buildDeliverablePlan, addDays } from '../../src/planner/deliverablePlanner';
import type { TaskRequirements } from '../../src/types';

const mockReqs: TaskRequirements = {
  task_name: '测试任务',
  deadline: '2026-06-22T12:00:00',
  deliverables: ['插件代码', 'README.md', '答辩PPT'],
  constraints: ['团队不超过5人'],
  submission_rules: ['发送至 test@test.com'],
  raw_input: '测试输入',
};

describe('buildDeliverablePlan', () => {
  it('should generate a valid plan with phases and micro tasks', () => {
    const plan = buildDeliverablePlan(mockReqs, 30, 2);
    expect(plan.task_name).toBe('测试任务');
    expect(plan.deadline).toBe('2026-06-22T12:00:00');
    expect(plan.total_days).toBe(30);
    expect(plan.daily_hours).toBe(2);
    expect(plan.phases.length).toBeGreaterThan(0);
    expect(plan.deliverables.length).toBe(3);
    expect(plan.micro_tasks.length).toBeGreaterThan(0);
  });

  it('should assign correct IDs to deliverables', () => {
    const plan = buildDeliverablePlan(mockReqs, 30, 2);
    expect(plan.deliverables[0].id).toBe('DEL-01');
    expect(plan.deliverables[1].id).toBe('DEL-02');
    expect(plan.deliverables[2].id).toBe('DEL-03');
  });

  it('should assign priorities based on position', () => {
    const plan = buildDeliverablePlan(mockReqs, 30, 2);
    expect(plan.deliverables[0].priority).toBe('high');
    expect(plan.deliverables[1].priority).toBe('high');
    expect(plan.deliverables[2].priority).toBe('high');
  });

  it('should match templates for known deliverable types', () => {
    const plan = buildDeliverablePlan(mockReqs, 30, 2);
    // "插件代码" should match the template
    const codeDel = plan.deliverables.find((d) => d.name === '插件代码');
    expect(codeDel).toBeDefined();
    expect(codeDel!.sub_tasks.length).toBeGreaterThan(3);
    expect(codeDel!.evidence_files).toContain('src/');
  });

  it('should generate micro tasks with valid time estimates', () => {
    const plan = buildDeliverablePlan(mockReqs, 30, 2);
    for (const task of plan.micro_tasks) {
      expect(task.estimated_minutes).toBeGreaterThanOrEqual(30);
      expect(task.estimated_minutes).toBeLessThanOrEqual(90);
      expect(task.id).toMatch(/^T-\d{3}$/);
      expect(task.priority).toMatch(/^(high|medium|low)$/);
    }
  });

  it('should use custom templates when provided', () => {
    const customTemplates = {
      '插件代码': {
        sub_tasks: ['自定义任务1', '自定义任务2'],
        evidence: ['custom-file.ts'],
      },
    };
    const plan = buildDeliverablePlan(mockReqs, 30, 2, customTemplates);
    const codeDel = plan.deliverables.find((d) => d.name === '插件代码');
    expect(codeDel).toBeDefined();
    expect(codeDel!.sub_tasks).toEqual(['自定义任务1', '自定义任务2']);
    expect(codeDel!.evidence_files).toEqual(['custom-file.ts']);
  });

  it('should fall back to defaults when no custom template matches', () => {
    const customTemplates = {
      '不存在的类型': {
        sub_tasks: ['任务A'],
        evidence: ['a.txt'],
      },
    };
    const plan = buildDeliverablePlan(mockReqs, 30, 2, customTemplates);
    const codeDel = plan.deliverables.find((d) => d.name === '插件代码');
    expect(codeDel).toBeDefined();
    expect(codeDel!.sub_tasks).not.toEqual(['任务A']);
  });

  it('should calculate available days from deadline when not specified', () => {
    const plan = buildDeliverablePlan(mockReqs);
    expect(plan.total_days).toBeGreaterThanOrEqual(1);
  });
});

describe('addDays', () => {
  it('should add days to a date string', () => {
    expect(addDays('2026-01-01', 5)).toBe('2026-01-06');
  });

  it('should handle month boundaries', () => {
    expect(addDays('2026-01-30', 2)).toBe('2026-02-01');
  });

  it('should handle zero days', () => {
    expect(addDays('2026-06-15', 0)).toBe('2026-06-15');
  });
});
