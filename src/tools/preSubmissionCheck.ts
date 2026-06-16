import { runPreSubmissionCheck, exportPreSubmissionMarkdown } from '../report/preSubmissionCheck';
import type { DeliverablePlan, PreSubmissionCheck } from '../types';

interface PreSubmitParams {
  project_path: string;
  plan: DeliverablePlan;
}

export function preSubmissionCheckTool(params: PreSubmitParams): PreSubmissionCheck {
  return runPreSubmissionCheck({
    project_path: params.project_path,
    plan: params.plan,
  });
}

export { exportPreSubmissionMarkdown };
