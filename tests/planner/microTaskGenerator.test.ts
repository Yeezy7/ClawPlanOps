import { describe, it, expect } from 'vitest';
import { generateMicroTasks } from '../../src/planner/microTaskGenerator';
import type { DeliverableItem, Phase } from '../../src/types';

const mockDeliverables: DeliverableItem[] = [
  {
    id: 'DEL-01',
    name: '插件代码',
    description: '代码',
    sub_tasks: ['创建项目目录结构', '编写核心功能代码', '编写测试'],
    evidence_files: ['src/'],
    priority: 'high',
  },
  {
    id: 'DEL-02',
    name: 'README',
    description: '文档',
    sub_tasks: ['写项目简介', '写使用示例'],
    evidence_files: ['README.md'],
    priority: 'medium',
  },
];

const mockPhases: Phase[] = [
  {
    phase_name: '第1阶段：插件代码',
    start_date: '2026-05-20',
    end_date: '2026-06-01',
    goal: '完成代码',
    deliverables: ['插件代码'],
  },
  {
    phase_name: '第2阶段：README',
    start_date: '2026-06-02',
    end_date: '2026-06-10',
    goal: '完成文档',
    deliverables: ['README'],
  },
];

describe('generateMicroTasks', () => {
  it('should generate tasks for all sub-tasks of all deliverables', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    expect(tasks).toHaveLength(5); // 3 + 2
  });

  it('should assign sequential IDs', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    expect(tasks[0].id).toBe('T-001');
    expect(tasks[1].id).toBe('T-002');
    expect(tasks[2].id).toBe('T-003');
  });

  it('should assign correct deliverable IDs', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    expect(tasks[0].deliverable_id).toBe('DEL-01');
    expect(tasks[3].deliverable_id).toBe('DEL-02');
  });

  it('should estimate time within 30-90 range', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    for (const task of tasks) {
      expect(task.estimated_minutes).toBeGreaterThanOrEqual(30);
      expect(task.estimated_minutes).toBeLessThanOrEqual(90);
    }
  });

  it('should assign phase names from matching phase', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    expect(tasks[0].phase_name).toBe('第1阶段：插件代码');
    expect(tasks[3].phase_name).toBe('第2阶段：README');
  });

  it('should generate completion criteria', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    for (const task of tasks) {
      expect(task.completion_criteria).toBeTruthy();
      expect(task.completion_criteria.length).toBeGreaterThan(5);
    }
  });

  it('should inherit priority from deliverable', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    expect(tasks[0].priority).toBe('high');
    expect(tasks[3].priority).toBe('medium');
  });

  it('should estimate higher time for test/integration tasks', () => {
    const tasks = generateMicroTasks(mockDeliverables, mockPhases, 2);
    const testTask = tasks.find((t) => t.name.includes('测试'));
    expect(testTask).toBeDefined();
    expect(testTask!.estimated_minutes).toBe(90);
  });

  it('should estimate lower time for check/review tasks', () => {
    const dels: DeliverableItem[] = [
      {
        id: 'DEL-01',
        name: '文档',
        description: '',
        sub_tasks: ['检查内容', '校对文字'],
        evidence_files: [],
        priority: 'low',
      },
    ];
    const phases: Phase[] = [
      { phase_name: 'P1', start_date: '2026-01-01', end_date: '2026-01-10', goal: 'g', deliverables: ['文档'] },
    ];
    const tasks = generateMicroTasks(dels, phases, 2);
    expect(tasks[0].estimated_minutes).toBe(30);
    expect(tasks[1].estimated_minutes).toBe(30);
  });
});
