import { describe, it, expect } from 'vitest';
import { generateWeeklyReport, exportWeeklyReportMarkdown } from '../../src/report/weeklyReport';

describe('weeklyReport', () => {
  const mockTasks = [
    {
      id: 'T-001',
      name: '创建项目结构',
      estimated_minutes: 45,
      deliverable_id: 'DEL-01',
      phase_name: '第1阶段',
      completion_criteria: '目录结构已创建',
      priority: 'high' as const,
    },
    {
      id: 'T-002',
      name: '编写 README',
      estimated_minutes: 60,
      deliverable_id: 'DEL-03',
      phase_name: '第2阶段',
      completion_criteria: 'README.md 存在',
      priority: 'medium' as const,
    },
  ];

  const mockProgress = {
    progress_percent: 50,
    risk_level: 'medium' as const,
    completed: [],
    missing: [],
    risks: [],
    scanned_path: '.',
    scanned_at: new Date().toISOString(),
  };

  it('should generate a weekly report', () => {
    const report = generateWeeklyReport({
      project_path: '.',
      micro_tasks: mockTasks,
      progress_report: mockProgress,
    });

    expect(report).toHaveProperty('week_start');
    expect(report).toHaveProperty('week_end');
    expect(report).toHaveProperty('total_tasks', 2);
    expect(report).toHaveProperty('completed_tasks');
    expect(report).toHaveProperty('git_commits');
    expect(report).toHaveProperty('progress_delta');
    expect(report).toHaveProperty('next_week_focus');
    expect(report).toHaveProperty('blockers');
  });

  it('should export weekly report as markdown', () => {
    const report = generateWeeklyReport({
      project_path: '.',
      micro_tasks: mockTasks,
      progress_report: mockProgress,
    });

    const md = exportWeeklyReportMarkdown(report);
    expect(md).toContain('周报');
    expect(md).toContain('本周完成的任务');
    expect(md).toContain('Git 提交记录');
  });
});
