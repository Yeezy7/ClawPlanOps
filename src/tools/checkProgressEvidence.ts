import { checkProgress } from '../evidence/progressScorer';
import type { ProgressReport, EvidenceRule } from '../types';
import { resolveConfig } from '../config/projectConfig';

interface CheckParams {
  project_path: string;
  evidence_rules?: EvidenceRule[];
  exclude_patterns?: string[];
}

export function checkProgressEvidence(params: CheckParams): ProgressReport {
  const cfg = resolveConfig(params.project_path, {
    evidence_rules: params.evidence_rules,
    exclude_patterns: params.exclude_patterns,
  });

  return checkProgress(
    params.project_path,
    cfg.evidence_rules,
    cfg.exclude_patterns
  );
}
