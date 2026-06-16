import type { ProgressReport } from '../types';
import type { EvidenceRule } from '../types';
/**
 * Check progress by scanning a project directory against evidence rules.
 * Also includes Git commit history as evidence.
 * Returns a ProgressReport with percentage, completed/missing items, and risk level.
 */
export declare function checkProgress(projectPath: string, customRules?: EvidenceRule[], excludePatterns?: string[]): ProgressReport;
//# sourceMappingURL=progressScorer.d.ts.map