import { analyzeProgressTrend, loadProgressHistory, exportProgressTrendMarkdown } from '../evidence/progressHistory';
import type { ProgressTrend } from '../types';

interface TrendParams {
  project_path: string;
}

export function progressTrendTool(params: TrendParams): {
  trend: ProgressTrend;
  history_count: number;
} {
  const trend = analyzeProgressTrend(params.project_path);
  const history = loadProgressHistory(params.project_path);
  return { trend, history_count: history.snapshots.length };
}

export { exportProgressTrendMarkdown };
