import type { EvidenceRule } from '../types';
/**
 * Default evidence rules for a typical OpenClaw plugin project.
 * These rules define what files/directories should exist to prove
 * each deliverable is complete.
 */
export declare const DEFAULT_EVIDENCE_RULES: EvidenceRule[];
/**
 * Merge user-provided rules with defaults.
 * User rules take precedence (override same-id defaults).
 */
export declare function mergeRules(userRules?: EvidenceRule[]): EvidenceRule[];
//# sourceMappingURL=evidenceRules.d.ts.map