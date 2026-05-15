import type {
  DeliverablePlan,
  CalendarResult,
  DailyReport,
  MicroTask,
  EvidenceResult,
} from '../types';
import { checkProgress } from '../evidence/progressScorer';

/**
 * Generate a daily progress report comparing planned vs actual progress.
 */
export function generateDailyReport(
  projectPath: string,
  plan: DeliverablePlan,
  schedule: CalendarResult
): DailyReport {
  const today = new Date().toISOString().slice(0, 10);

  // Determine which tasks were planned for today
  const plannedToday = getTasksForToday(plan.micro_tasks, schedule, today);

  // Check actual evidence in project directory
  const progressReport = checkProgress(projectPath);
  const actualEvidence = progressReport.completed;
  const missingEvidence = progressReport.missing;

  // Count how many of today's planned tasks have evidence of completion
  const plannedDeliverableIds = new Set(
    plannedToday.map((t) => t.deliverable_id)
  );

  // Generate next actions
  const nextActions = generateNextActions(
    plannedToday,
    missingEvidence,
    plan
  );

  return {
    report_date: today,
    planned_today: plannedToday,
    actual_evidence: actualEvidence,
    missing_evidence: missingEvidence,
    progress_delta: progressReport.progress_percent,
    risk_level: progressReport.risk_level,
    next_actions: nextActions,
  };
}

// ---- private helpers -----------------------------------------

function getTasksForToday(
  microTasks: MicroTask[],
  schedule: CalendarResult,
  today: string
): MicroTask[] {
  const todayEvents = schedule.events.filter((ev) => {
    const evDate = ev.start.slice(0, 10).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    return evDate === today;
  });

  const taskIds = new Set(todayEvents.map((ev) => ev.deliverable_id));
  return microTasks.filter((t) => taskIds.has(t.deliverable_id));
}

function generateNextActions(
  plannedToday: MicroTask[],
  missing: EvidenceResult[],
  plan: DeliverablePlan
): string[] {
  const actions: string[] = [];

  // High-priority tasks planned for today that need evidence
  const highPrioPlanned = plannedToday.filter((t) => t.priority === 'high');
  if (highPrioPlanned.length > 0) {
    actions.push(
      `完成今日高优先级任务: ${highPrioPlanned
        .map((t) => t.name)
        .join(', ')}`
    );
  }

  // Missing critical evidence
  const criticalMissing = missing.filter((m) => m.weight >= 10);
  if (criticalMissing.length > 0) {
    actions.push(
      `优先补全关键缺失: ${criticalMissing
        .map((m) => m.description)
        .join('; ')}`
    );
  }

  // Suggest next deliverable if all current tasks are done
  if (missing.length === 0) {
    actions.push('所有证据检查通过，可以开始下一阶段或准备答辩材料');
  }

  // Fallback
  if (actions.length === 0) {
    actions.push('按计划继续执行当前阶段任务');
    actions.push(
      `建议今天完成至少 ${plan.daily_hours} 小时的有效工作时间`
    );
  }

  return actions;
}
