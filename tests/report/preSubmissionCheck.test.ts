import { describe, it, expect } from 'vitest';
import { runPreSubmissionCheck, exportPreSubmissionMarkdown } from '../../src/report/preSubmissionCheck';
import type { DeliverablePlan } from '../../src/types';

describe('preSubmissionCheck', () => {
  const mockPlan: DeliverablePlan = {
    task_name: '测试项目',
    deadline: '2026-06-22T12:00:00',
    start_date: '2026-06-15',
    total_days: 7,
    daily_hours: 2,
    phases: [],
    deliverables: [],
    micro_tasks: [],
  };

  it('should run pre-submission check', () => {
    const result = runPreSubmissionCheck({
      project_path: '.',
      plan: mockPlan,
    });

    expect(result).toHaveProperty('project_name', '测试项目');
    expect(result).toHaveProperty('deadline');
    expect(result).toHaveProperty('ready');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('checks');
    expect(result).toHaveProperty('missing_files');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('summary');
    expect(Array.isArray(result.checks)).toBe(true);
  });

  it('should export pre-submission check as markdown', () => {
    const result = runPreSubmissionCheck({
      project_path: '.',
      plan: mockPlan,
    });

    const md = exportPreSubmissionMarkdown(result);
    expect(md).toContain('提交前检查报告');
    expect(md).toContain('检查评分');
    expect(md).toContain('核心代码');
  });
});
