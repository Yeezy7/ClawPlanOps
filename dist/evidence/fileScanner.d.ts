import type { EvidenceRule, EvidenceResult } from '../types';
export interface ScanOptions {
    exclude_patterns?: string[];
}
/**
 * Scan a project directory against evidence rules.
 */
export declare function scanEvidence(projectPath: string, rules: EvidenceRule[], options?: ScanOptions): EvidenceResult[];
//# sourceMappingURL=fileScanner.d.ts.map