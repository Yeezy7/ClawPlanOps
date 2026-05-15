import { checkProgress } from '../evidence/progressScorer';
import type { ProgressReport, EvidenceRule } from '../types';

interface CheckParams {
  project_path: string;
  evidence_rules?: EvidenceRule[];
}

export function checkProgressEvidence(params: CheckParams): ProgressReport {
  return checkProgress(params.project_path, params.evidence_rules ?? []);
}
