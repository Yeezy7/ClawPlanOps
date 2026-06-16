"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEventReminder = exports.sendSystemNotification = void 0;
exports.sendNotificationTool = sendNotificationTool;
const pushNotification_1 = require("../notification/pushNotification");
Object.defineProperty(exports, "sendSystemNotification", { enumerable: true, get: function () { return pushNotification_1.sendSystemNotification; } });
Object.defineProperty(exports, "sendEventReminder", { enumerable: true, get: function () { return pushNotification_1.sendEventReminder; } });
function sendNotificationTool(params) {
    if (params.event) {
        return (0, pushNotification_1.sendEventReminder)(params.event);
    }
    return (0, pushNotification_1.sendSystemNotification)(params.title, params.message);
}
//# sourceMappingURL=sendNotification.js.map