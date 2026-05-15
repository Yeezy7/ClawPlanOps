"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reschedulePlan = reschedulePlan;
const rescheduler_1 = require("../planner/rescheduler");
function reschedulePlan(params) {
    return (0, rescheduler_1.reschedulePlan)(params.progress_report, params.original_plan, params.deadline);
}
//# sourceMappingURL=reschedulePlan.js.map