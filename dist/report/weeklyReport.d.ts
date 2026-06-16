import type { MicroTask, ProgressReport, GitCommit } from '../types';
export interface WeeklyReport {
    week_start: string;
    week_end: string;
    total_tasks: number;
    completed_tasks: number;
    completed_details: CompletedTask[];
    git_commits: GitCommit[];
    progress_delta: number;
    next_week_focus: string[];
    blockers: string[];
}
export interface CompletedTask {
    task: MicroTask;
    completed_at: string;
    evidence: string[];
}
interface WeeklyReportParams {
    project_path: string;
    micro_tasks: MicroTask[];
    progress_report: ProgressReport;
    week_start?: string;
    week_end?: string;
}
export declare function generateWeeklyReport(params: WeeklyReportParams): WeeklyReport;
export declare function exportWeeklyReportMarkdown(report: WeeklyReport): string;
export {};
//# sourceMappingURL=weeklyReport.d.ts.map