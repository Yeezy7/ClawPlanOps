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
export declare function saveProgressSnapshot(projectPath: string, report: ProgressReport): ProgressSnapshot;
export declare function loadProgressHistory(projectPath: string): ProgressHistory;
export declare function saveProgressHistory(projectPath: string, history: ProgressHistory): void;
export declare function analyzeProgressTrend(projectPath: string): ProgressTrend;
export declare function exportProgressTrendMarkdown(trend: ProgressTrend, history: ProgressHistory): string;
//# sourceMappingURL=progressHistory.d.ts.map