"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportWeeklyReportMarkdown = void 0;
exports.generateWeeklyReportTool = generateWeeklyReportTool;
const weeklyReport_1 = require("../report/weeklyReport");
Object.defineProperty(exports, "exportWeeklyReportMarkdown", { enumerable: true, get: function () { return weeklyReport_1.exportWeeklyReportMarkdown; } });
const checkProgressEvidence_1 = require("./checkProgressEvidence");
function generateWeeklyReportTool(params) {
    const progress = (0, checkProgressEvidence_1.checkProgressEvidence)({ project_path: params.project_path });
    return (0, weeklyReport_1.generateWeeklyReport)({
        project_path: params.project_path,
        micro_tasks: params.plan.micro_tasks,
        progress_report: progress,
    });
}
//# sourceMappingURL=generateWeeklyReport.js.map