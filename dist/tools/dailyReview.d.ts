import type { ProgressReport, ProgressTrend } from '../types';
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
export declare function dailyReview(params: DailyReviewParams): DailyReviewResult;
export {};
//# sourceMappingURL=dailyReview.d.ts.map