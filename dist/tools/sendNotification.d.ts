import { sendSystemNotification, sendEventReminder } from '../notification/pushNotification';
import type { CalendarEvent, NotificationResult } from '../types';
interface NotifyParams {
    title: string;
    message: string;
    event?: CalendarEvent;
}
export declare function sendNotificationTool(params: NotifyParams): NotificationResult;
export { sendSystemNotification, sendEventReminder };
//# sourceMappingURL=sendNotification.d.ts.map