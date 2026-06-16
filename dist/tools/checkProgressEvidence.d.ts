import type { ProgressReport, EvidenceRule } from '../types';
interface CheckParams {
    project_path: string;
    evidence_rules?: EvidenceRule[];
    exclude_patterns?: string[];
}
export declare function checkProgressEvidence(params: CheckParams): ProgressReport;
export {};
//# sourceMappingURL=checkProgressEvidence.d.ts.map