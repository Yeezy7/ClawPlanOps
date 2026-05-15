"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyProgressReport = generateDailyProgressReport;
const dailyReport_1 = require("../report/dailyReport");
function generateDailyProgressReport(params) {
    return (0, dailyReport_1.generateDailyReport)(params.project_path, params.plan, params.schedule);
}
//# sourceMappingURL=generateDailyProgressReport.js.map