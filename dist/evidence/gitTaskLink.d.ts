import type { MicroTask, GitCommit } from '../types';
export interface TaskGitLink {
    task: MicroTask;
    commits: GitCommit[];
    linked_files: string[];
    last_commit_date: string;
}
export interface GitTaskReport {
    project_path: string;
    total_commits: number;
    task_links: TaskGitLink[];
    unlinked_commits: GitCommit[];
    coverage_percent: number;
}
export declare function getRecentCommits(projectPath: string, days?: number): GitCommit[];
export declare function linkCommitsToTasks(commits: GitCommit[], tasks: MicroTask[]): GitTaskReport;
export declare function generateGitTaskMarkdown(report: GitTaskReport): string;
//# sourceMappingURL=gitTaskLink.d.ts.map