import { describe, it, expect } from 'vitest';
import { analyzeProgressTrend, saveProgressSnapshot, loadProgressHistory, exportProgressTrendMarkdown } from '../../src/evidence/progressHistory';
import type { ProgressReport } from '../../src/types';

describe('progressHistory', () => {
  const mockReport: ProgressReport = {
    progress_percent: 60,
    risk_level: 'medium',
    completed: [],
    missing: [],
    risks: [],
    scanned_path: '.',
    scanned_at: new Date().toISOString(),
  };

  it('should analyze progress trend with no history', () => {
    const trend = analyzeProgressTrend('/tmp/test_nonexistent');
    expect(trend.current_percent).toBe(0);
    expect(trend.snapshots_count).toBe(0);
    expect(trend.trend_direction).toBe('stable');
  });

  it('should export progress trend as markdown', () => {
    const trend = analyzeProgressTrend('/tmp/test_nonexistent');
    const md = exportProgressTrendMarkdown(trend, { project_path: '.', snapshots: [] });
    expect(md).toContain('进度趋势报告');
    expect(md).toContain('当前进度');
  });
});
