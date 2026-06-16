"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importToSystemCalendar = void 0;
exports.crossPlatformCalendarTool = crossPlatformCalendarTool;
const crossPlatformCalendar_1 = require("../calendar/crossPlatformCalendar");
Object.defineProperty(exports, "importToSystemCalendar", { enumerable: true, get: function () { return crossPlatformCalendar_1.importToSystemCalendar; } });
function crossPlatformCalendarTool(params) {
    return (0, crossPlatformCalendar_1.importToSystemCalendar)(params.events);
}
//# sourceMappingURL=crossPlatformCalendar.js.map