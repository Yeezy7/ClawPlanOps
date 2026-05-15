"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCalendarSchedule = generateCalendarSchedule;
const icsExporter_1 = require("../calendar/icsExporter");
function generateCalendarSchedule(params) {
    return (0, icsExporter_1.generateCalendarSchedule)(params.micro_tasks, params.start_date, params.deadline, params.preferred_work_time ?? '20:00-22:00', params.output_path ?? './output/schedule.ics');
}
//# sourceMappingURL=generateCalendarSchedule.js.map