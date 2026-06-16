import { getRecentCommits, linkCommitsToTasks, generateGitTaskMarkdown } from '../evidence/gitTaskLink';
import type { DeliverablePlan, GitTaskReport } from '../types';

interface GitLinkParams {
  project_path: string;
  plan: DeliverablePlan;
  days?: number;
}

export function gitTaskLinkTool(params: GitLinkParams): GitTaskReport {
  const commits = getRecentCommits(params.project_path, params.days || 30);
  const report = linkCommitsToTasks(commits, params.plan.micro_tasks);
  report.project_path = params.project_path;
  return report;
}

export { generateGitTaskMarkdown };
