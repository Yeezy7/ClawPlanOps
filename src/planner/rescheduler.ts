import type {
  ProgressReport,
  DeliverablePlan,
  MicroTask,
  Phase,
  RescheduleResult,
} from '../types';
import { calcAvailableDays } from './taskParser';

/**
 * Generate reschedule suggestions when behind schedule.
 *
 * Strategy:
 * 1. Calculate delay based on progress vs time elapsed
 * 2. If on track, return no changes
 * 3. If behind, prioritize: compress → defer low-priority → cut optional
 */
export function reschedulePlan(
  progressReport: ProgressReport,
  originalPlan: DeliverablePlan,
  deadline: string
): RescheduleResult {
  const totalDays = originalPlan.total_days;
  const elapsedDays = daysSinceStart(originalPlan.start_date);
  const remainingDays = calcAvailableDays(deadline);

  // Expected progress: how much should be done based on elapsed time
  const expectedPercent = Math.min(
    100,
    Math.round((elapsedDays / totalDays) * 100)
  );
  const actualPercent = progressReport.progress_percent;
  const delayDays = Math.max(
    0,
    Math.round(((expectedPercent - actualPercent) / 100) * totalDays)
  );

  const isOnTrack = actualPercent >= expectedPercent - 10; // 10% tolerance

  if (isOnTrack) {
    return {
      delay_days: 0,
      is_on_track: true,
      priority_tasks: originalPlan.micro_tasks.filter(
        (t) => t.priority === 'high'
      ),
      removed_tasks: [],
      compressed_tasks: [],
      recommended_next_plan: originalPlan.phases.filter(
        (p) => new Date(p.end_date) >= new Date()
      ),
      advice: ['进度正常，保持当前节奏', '建议预留 2 天缓冲时间应对突发情况'],
    };
  }

  // ---- Behind schedule: apply reschedule strategies ----

  const allTasks = [...originalPlan.micro_tasks];

  // Strategy 1: Compress medium/low tasks (reduce estimated time by 25%)
  const compressedTasks: MicroTask[] = [];
  const lowPrioTasks = allTasks.filter((t) => t.priority !== 'high');
  for (const task of lowPrioTasks) {
    compressedTasks.push({
      ...task,
      estimated_minutes: Math.max(30, Math.round(task.estimated_minutes * 0.75)),
      name: `[压缩] ${task.name}`,
    });
  }

  // Strategy 2: Remove lowest-priority tasks if severe delay
  const removedTasks: MicroTask[] = [];
  if (delayDays > 3) {
    const lowPrio = allTasks
      .filter((t) => t.priority === 'low')
      .slice(0, Math.ceil(delayDays * 2));
    removedTasks.push(...lowPrio);
  }

  // Strategy 3: Priority tasks (must-do)
  const priorityTasks = allTasks.filter(
    (t) =>
      t.priority === 'high' &&
      !removedTasks.some((r) => r.id === t.id)
  );

  // Generate compressed phases
  const keptTasks = [
    ...priorityTasks,
    ...compressedTasks.filter(
      (t) => !removedTasks.some((r) => r.id === t.id)
    ),
  ];

  const advice: string[] = [];
  if (delayDays > 0) {
    advice.push(`当前进度落后约 ${delayDays} 天，需要采取补救措施`);
  }
  if (removedTasks.length > 0) {
    advice.push(
      `建议删除 ${removedTasks.length} 个低优先级任务: ${removedTasks
        .map((t) => t.name)
        .join(', ')}`
    );
  }
  if (compressedTasks.length > 0) {
    advice.push(
      `建议压缩 ${compressedTasks.length} 个中低优先级任务的时间预估`
    );
  }
  advice.push(
    `剩余 ${remainingDays} 天，优先完成高优先级任务共 ${priorityTasks.length} 个`
  );

  // Generate recommended next plan phases
  const recommendedPhases = rebuildPhases(
    keptTasks,
    originalPlan.phases,
    remainingDays
  );

  return {
    delay_days: delayDays,
    is_on_track: false,
    priority_tasks: priorityTasks,
    removed_tasks: removedTasks,
    compressed_tasks: compressedTasks,
    recommended_next_plan: recommendedPhases,
    advice,
  };
}

// ---- private helpers -----------------------------------------

function daysSinceStart(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function rebuildPhases(
  tasks: MicroTask[],
  originalPhases: Phase[],
  remainingDays: number
): Phase[] {
  const taskIds = new Set(tasks.map((t) => t.id));
  const relevantPhases = originalPhases.filter((p) =>
    tasks.some((t) => t.phase_name === p.phase_name)
  );

  // Adjust phase dates
  const adjusted: Phase[] = [];
  const phaseSpan = Math.max(1, Math.ceil(remainingDays / Math.max(1, relevantPhases.length)));

  for (let i = 0; i < relevantPhases.length; i++) {
    const phaseStart = new Date();
    phaseStart.setDate(phaseStart.getDate() + i * phaseSpan);
    const phaseEnd = new Date(phaseStart);
    phaseEnd.setDate(phaseEnd.getDate() + phaseSpan - 1);

    adjusted.push({
      ...relevantPhases[i],
      start_date: phaseStart.toISOString().slice(0, 10),
      end_date: phaseEnd.toISOString().slice(0, 10),
      goal: `[重排] ${relevantPhases[i].goal}`,
    });
  }

  return adjusted;
}
