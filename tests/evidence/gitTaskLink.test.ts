import { describe, it, expect } from 'vitest';
import { linkCommitsToTasks, generateGitTaskMarkdown } from '../../src/evidence/gitTaskLink';
import type { MicroTask } from '../../src/types';

describe('gitTaskLink', () => {
  const mockTasks: MicroTask[] = [
    {
      id: 'T-001',
      name: '编写 README',
      estimated_minutes: 60,
      deliverable_id: 'DEL-01',
      phase_name: '第1阶段',
      completion_criteria: 'README.md 文件存在',
      priority: 'high',
    },
    {
      id: 'T-002',
      name: '实现解析器',
      estimated_minutes: 90,
      deliverable_id: 'DEL-01',
      phase_name: '第1阶段',
      completion_criteria: 'parser 代码完成',
      priority: 'high',
    },
  ];

  const mockCommits = [
    {
      hash: 'abc1234567890',
      short_hash: 'abc1234',
      date: '2026-06-15T10:00:00',
      message: 'add README',
      files_changed: ['README.md'],
      author: 'test',
    },
    {
      hash: 'def1234567890',
      short_hash: 'def1234',
      date: '2026-06-15T11:00:00',
      message: 'implement parser',
      files_changed: ['src/parser.ts'],
      author: 'test',
    },
  ];

  it('should link commits to tasks', () => {
    const report = linkCommitsToTasks(mockCommits, mockTasks);
    expect(report.total_commits).toBe(2);
    expect(report.task_links.length).toBeGreaterThan(0);
    expect(report.coverage_percent).toBeGreaterThan(0);
  });

  it('should generate git task markdown', () => {
    const report = linkCommitsToTasks(mockCommits, mockTasks);
    report.project_path = '.';
    const md = generateGitTaskMarkdown(report);
    expect(md).toContain('Git 提交与任务关联报告');
    expect(md).toContain('总提交数');
  });
});
