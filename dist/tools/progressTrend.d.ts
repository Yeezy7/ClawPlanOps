import { exportProgressTrendMarkdown } from '../evidence/progressHistory';
import type { ProgressTrend } from '../types';
interface TrendParams {
    project_path: string;
}
export declare function progressTrendTool(params: TrendParams): {
    trend: ProgressTrend;
    history_count: number;
};
export { exportProgressTrendMarkdown };
//# sourceMappingURL=progressTrend.d.ts.map