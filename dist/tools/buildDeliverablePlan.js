"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeliverablePlan = buildDeliverablePlan;
const deliverablePlanner_1 = require("../planner/deliverablePlanner");
function buildDeliverablePlan(params) {
    return (0, deliverablePlanner_1.buildDeliverablePlan)(params.task_requirements, params.available_days, params.daily_available_hours);
}
//# sourceMappingURL=buildDeliverablePlan.js.map