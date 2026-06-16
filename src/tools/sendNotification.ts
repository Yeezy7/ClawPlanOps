import { sendSystemNotification, sendEventReminder } from '../notification/pushNotification';
import type { CalendarEvent, NotificationResult } from '../types';

interface NotifyParams {
  title: string;
  message: string;
  event?: CalendarEvent;
}

export function sendNotificationTool(params: NotifyParams): NotificationResult {
  if (params.event) {
    return sendEventReminder(params.event);
  }
  return sendSystemNotification(params.title, params.message);
}

export { sendSystemNotification, sendEventReminder };
