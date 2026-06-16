"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportProgressTrendMarkdown = void 0;
exports.progressTrendTool = progressTrendTool;
const progressHistory_1 = require("../evidence/progressHistory");
Object.defineProperty(exports, "exportProgressTrendMarkdown", { enumerable: true, get: function () { return progressHistory_1.exportProgressTrendMarkdown; } });
function progressTrendTool(params) {
    const trend = (0, progressHistory_1.analyzeProgressTrend)(params.project_path);
    const history = (0, progressHistory_1.loadProgressHistory)(params.project_path);
    return { trend, history_count: history.snapshots.length };
}
//# sourceMappingURL=progressTrend.js.map