import * as fs from 'fs';
import * as path from 'path';
import type { ProgressReport } from '../types';

export interface ProgressSnapshot {
  timestamp: string;
  progress_percent: number;
  risk_level: string;
  completed_count: number;
  missing_count: number;
  completed_ids: string[];
  missing_ids: string[];
}

export interface ProgressHistory {
  project_path: string;
  snapshots: ProgressSnapshot[];
}

export interface ProgressTrend {
  current_percent: number;
  previous_percent: number;
  delta_percent: number;
  trend_direction: 'improving' | 'stable' | 'declining';
  snapshots_count: number;
  avg_daily_progress: number;
  estimated_completion_date: string | null;
  risk_trend: string[];
}

const HISTORY_DIR = '.clawplanops/history';

export function saveProgressSnapshot(
  projectPath: string,
  report: ProgressReport
): ProgressSnapshot {
  const history = loadProgressHistory(projectPath);
  const snapshot: ProgressSnapshot = {
    timestamp: new Date().toISOString(),
    progress_percent: report.progress_percent,
    risk_level: report.risk_level,
    completed_count: report.completed.length,
    missing_count: report.missing.length,
    completed_ids: report.completed.map((r) => r.rule_id),
    missing_ids: report.missing.map((r) => r.rule_id),
  };

  history.snapshots.push(snapshot);
  saveProgressHistory(projectPath, history);
  return snapshot;
}

export function loadProgressHistory(projectPath: string): ProgressHistory {
  const historyPath = path.join(projectPath, HISTORY_DIR, 'progress_history.json');
  if (!fs.existsSync(historyPath)) {
    return { project_path: projectPath, snapshots: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  } catch {
    return { project_path: projectPath, snapshots: [] };
  }
}

export function saveProgressHistory(projectPath: string, history: ProgressHistory): void {
  const dir = path.join(projectPath, HISTORY_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'progress_history.json'),
    JSON.stringify(history, null, 2),
    'utf-8'
  );
}

export function analyzeProgressTrend(projectPath: string): ProgressTrend {
  const history = loadProgressHistory(projectPath);
  const snapshots = history.snapshots;

  if (snapshots.length === 0) {
    return {
      current_percent: 0,
      previous_percent: 0,
      delta_percent: 0,
      trend_direction: 'stable',
      snapshots_count: 0,
      avg_daily_progress: 0,
      estimated_completion_date: null,
      risk_trend: [],
    };
  }

  const current = snapshots[snapshots.length - 1];
  const previous = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : current;

  const delta = current.progress_percent - previous.progress_percent;
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (delta > 2) trend = 'improving';
  else if (delta < -2) trend = 'declining';

  let avgDaily = 0;
  let estimatedCompletion: string | null = null;
  if (snapshots.length >= 2) {
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const daysDiff = (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 0) {
      avgDaily = (last.progress_percent - first.progress_percent) / daysDiff;
      if (avgDaily > 0 && current.progress_percent < 100) {
        const daysRemaining = (100 - current.progress_percent) / avgDaily;
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + Math.ceil(daysRemaining));
        estimatedCompletion = estDate.toISOString().slice(0, 10);
      }
    }
  }

  const riskTrend = snapshots.slice(-7).map((s) => s.risk_level);

  return {
    current_percent: current.progress_percent,
    previous_percent: previous.progress_percent,
    delta_percent: delta,
    trend_direction: trend,
    snapshots_count: snapshots.length,
    avg_daily_progress: Math.round(avgDaily * 10) / 10,
    estimated_completion_date: estimatedCompletion,
    risk_trend: riskTrend,
  };
}

export function exportProgressTrendMarkdown(trend: ProgressTrend, history: ProgressHistory): string {
  const lines: string[] = [
    `# 📈 进度趋势报告`,
    '',
    `> 当前进度：**${trend.current_percent}%**`,
    `> 上次进度：${trend.previous_percent}%`,
    `> 变化：${trend.delta_percent > 0 ? '+' : ''}${trend.delta_percent}%`,
    `> 趋势：${
      trend.trend_direction === 'improving' ? '📈 上升' :
      trend.trend_direction === 'declining' ? '📉 下降' : '➡️ 平稳'
    }`,
    `> 快照数：${trend.snapshots_count}`,
    '',
    '---',
    '',
  ];

  if (trend.avg_daily_progress > 0) {
    lines.push('## ⏱️ 速度分析');
    lines.push('');
    lines.push(`- 日均进度: ${trend.avg_daily_progress}%`);
    if (trend.estimated_completion_date) {
      lines.push(`- 预计完成日期: ${trend.estimated_completion_date}`);
    }
    lines.push('');
  }

  if (trend.risk_trend.length > 0) {
    lines.push('## ⚠️ 风险趋势（最近 7 次）');
    lines.push('');
    const riskEmojis: Record<string, string> = {
      low: '🟢', medium: '🟡', high: '🟠', critical: '🔴',
    };
    lines.push(trend.risk_trend.map((r) => riskEmojis[r] || '⚪').join(' → '));
    lines.push('');
  }

  if (history.snapshots.length > 0) {
    lines.push('## 📊 历史快照');
    lines.push('');
    lines.push('| 时间 | 进度 | 已完成 | 缺失 | 风险 |');
    lines.push('|------|------|--------|------|------|');
    for (const s of history.snapshots.slice(-10)) {
      lines.push(
        `| ${s.timestamp.slice(0, 16).replace('T', ' ')} | ${s.progress_percent}% | ${s.completed_count} | ${s.missing_count} | ${s.risk_level} |`
      );
    }
    lines.push('');
  }

  const barLen = 20;
  const filled = Math.round((trend.current_percent / 100) * barLen);
  const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
  lines.push('## 进度可视化');
  lines.push('');
  lines.push('```');
  lines.push(`${bar} ${trend.current_percent}%`);
  lines.push('```');

  return lines.join('\n');
}
