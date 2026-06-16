import type { DeliverablePlan } from '../types';
export interface PreSubmissionCheck {
    project_name: string;
    deadline: string;
    ready: boolean;
    score: number;
    checks: SubmissionCheckItem[];
    missing_files: string[];
    warnings: string[];
    summary: string;
}
export interface SubmissionCheckItem {
    category: string;
    name: string;
    required: boolean;
    status: 'pass' | 'fail' | 'warn';
    detail: string;
}
interface PreSubmissionParams {
    project_path: string;
    plan: DeliverablePlan;
    custom_checks?: string[];
}
export declare function runPreSubmissionCheck(params: PreSubmissionParams): PreSubmissionCheck;
export declare function exportPreSubmissionMarkdown(result: PreSubmissionCheck): string;
export {};
//# sourceMappingURL=preSubmissionCheck.d.ts.map