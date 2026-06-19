import { checkProgress } from '../evidence/progressScorer';
import { loadProgressHistory, analyzeProgressTrend } from '../evidence/progressHistory';
import { resolveConfig } from '../config/projectConfig';
import type { ProgressReport, ProgressTrend, ProgressSnapshot, EvidenceResult } from '../types';

interface DailyReviewParams {
  project_path: string;
  plan?: any;
}

interface DailyReviewResult {
  project_path: string;
  review_date: string;
  progress: ProgressReport;
  trend?: ProgressTrend;
  today_focus: string[];
  overdue_tasks: string[];
  risk_level: string;
  summary: string;
  next_actions: string[];
}

export function dailyReview(params: DailyReviewParams): DailyReviewResult {
  const { project_path, plan } = params;
  const review_date = new Date().toISOString().split('T')[0];

  // 1. 检查当前进度
  const cfg = resolveConfig(project_path, {});
  const progress = checkProgress(project_path, cfg.evidence_rules, cfg.exclude_patterns);

  // 2. 分析进度趋势
  let trend: ProgressTrend | undefined;
  try {
    const history = loadProgressHistory(project_path);
    if (history && history.snapshots && history.snapshots.length > 0) {
      trend = analyzeProgressTrend(project_path);
    }
  } catch (e) {
    // 忽略历史加载错误
  }

  // 3. 确定今日重点
  const today_focus = identifyTodayFocus(progress, plan);

  // 4. 检查逾期任务
  const overdue_tasks = identifyOverdueTasks(progress, plan);

  // 5. 评估风险等级
  const risk_level = assessRiskLevel(progress, trend);

  // 6. 生成摘要
  const summary = generateSummary(progress, trend, today_focus, overdue_tasks);

  // 7. 生成下一步建议
  const next_actions = generateNextActions(progress, risk_level);

  return {
    project_path,
    review_date,
    progress,
    trend,
    today_focus,
    overdue_tasks,
    risk_level,
    summary,
    next_actions,
  };
}

function identifyTodayFocus(progress: ProgressReport, plan?: any): string[] {
  const focus: string[] = [];

  // 基于优先级和进度确定今日重点
  if (progress.missing.length > 0) {
    // 缺失项优先
    const highPriority = progress.missing
      .slice(0, 3);
    
    for (const item of highPriority) {
      focus.push(`完成: ${item.description}`);
    }
  }

  // 如果有计划，基于计划确定今日任务
  if (plan && plan.micro_tasks) {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = plan.micro_tasks.filter((t: any) => {
      const taskDate = t.start_date || t.due_date;
      return taskDate && taskDate.startsWith(today);
    });

    for (const task of todayTasks.slice(0, 3)) {
      focus.push(`任务: ${task.name}`);
    }
  }

  // 如果没有明确任务，给出通用建议
  if (focus.length === 0) {
    if (progress.missing.length > 0) {
      focus.push('继续推进未完成的交付物');
    } else {
      focus.push('检查已完成的交付物质量');
    }
  }

  return focus;
}

function identifyOverdueTasks(progress: ProgressReport, plan?: any): string[] {
  const overdue: string[] = [];

  if (plan && plan.micro_tasks) {
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = plan.micro_tasks.filter((t: any) => {
      const dueDate = t.due_date || t.end_date;
      return dueDate && dueDate < today && t.status !== 'completed';
    });

    for (const task of overdueTasks) {
      overdue.push(`逾期: ${task.name} (截止: ${task.due_date || task.end_date})`);
    }
  }

  return overdue;
}

function assessRiskLevel(progress: ProgressReport, trend?: ProgressTrend): string {
  const progressPercent = progress.progress_percent;

  if (progressPercent >= 80) {
    return 'low';
  } else if (progressPercent >= 50) {
    if (trend && trend.trend_direction === 'declining') {
      return 'high';
    }
    return 'medium';
  } else {
    if (trend && trend.trend_direction === 'improving') {
      return 'medium';
    }
    return 'high';
  }
}

function generateSummary(
  progress: ProgressReport,
  trend: ProgressTrend | undefined,
  todayFocus: string[],
  overdueTasks: string[]
): string {
  const lines: string[] = [];

  lines.push(`当前进度: ${progress.progress_percent}%`);
  
  if (trend) {
    lines.push(`趋势: ${trend.trend_direction}`);
    lines.push(`日均进度: ${trend.avg_daily_progress}%`);
    if (trend.estimated_completion_date) {
      lines.push(`预计完成: ${trend.estimated_completion_date}`);
    }
  }

  if (overdueTasks.length > 0) {
    lines.push(`\n⚠️ 逾期任务 (${overdueTasks.length} 个):`);
    for (const task of overdueTasks.slice(0, 3)) {
      lines.push(`- ${task}`);
    }
  }

  return lines.join('\n');
}

function generateNextActions(progress: ProgressReport, riskLevel: string): string[] {
  const actions: string[] = [];

  if (riskLevel === 'high') {
    actions.push('立即处理高优先级缺失项');
    actions.push('考虑简化非核心功能');
    actions.push('增加每日投入时间（如果可能）');
  } else if (riskLevel === 'medium') {
    actions.push('按计划推进当前阶段');
    actions.push('关注即将到期的任务');
  } else {
    actions.push('保持当前节奏');
    actions.push('检查已完成交付物的质量');
  }

  if (progress.missing.length > 0) {
    actions.push(`优先完成: ${progress.missing[0].description}`);
  }

  return actions;
}
