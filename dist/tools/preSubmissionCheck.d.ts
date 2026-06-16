import { exportPreSubmissionMarkdown } from '../report/preSubmissionCheck';
import type { DeliverablePlan, PreSubmissionCheck } from '../types';
interface PreSubmitParams {
    project_path: string;
    plan: DeliverablePlan;
}
export declare function preSubmissionCheckTool(params: PreSubmitParams): PreSubmissionCheck;
export { exportPreSubmissionMarkdown };
//# sourceMappingURL=preSubmissionCheck.d.ts.map