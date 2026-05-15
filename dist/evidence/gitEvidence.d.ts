import type { EvidenceRule, EvidenceResult } from '../types';
/**
 * Check Git commit history as progress evidence.
 *
 * Evidence types:
 * - recent_commits: commits within the last N days
 * - commit_count: total commit count in the repo
 * - specific_file_committed: whether a specific file was ever committed
 */
export interface GitEvidenceRule extends EvidenceRule {
    check_type: 'recent_commits' | 'commit_count' | 'specific_file_committed';
    min_count?: number;
    within_days?: number;
    target_file?: string;
}
/**
 * Collect Git evidence results for the given project path.
 * Returns empty array if the directory is not a git repository.
 */
export declare function checkGitEvidence(projectPath: string, customRules?: GitEvidenceRule[]): EvidenceResult[];
//# sourceMappingURL=gitEvidence.d.ts.map