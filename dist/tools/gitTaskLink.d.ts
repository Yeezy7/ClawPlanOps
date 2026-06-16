import { generateGitTaskMarkdown } from '../evidence/gitTaskLink';
import type { DeliverablePlan, GitTaskReport } from '../types';
interface GitLinkParams {
    project_path: string;
    plan: DeliverablePlan;
    days?: number;
}
export declare function gitTaskLinkTool(params: GitLinkParams): GitTaskReport;
export { generateGitTaskMarkdown };
//# sourceMappingURL=gitTaskLink.d.ts.map