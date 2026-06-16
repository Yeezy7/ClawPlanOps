import type { CalendarEvent } from '../types';
export interface NotificationConfig {
    enabled: boolean;
    method: 'system' | 'email' | 'webhook' | 'all';
    email?: {
        smtp_host: string;
        smtp_port: number;
        username: string;
        password: string;
        from: string;
        to: string;
    };
    webhook_url?: string;
    reminder_minutes_before: number[];
}
export interface NotificationResult {
    success: boolean;
    method: string;
    sent_count: number;
    errors: string[];
}
export declare function sendSystemNotification(title: string, message: string): NotificationResult;
export declare function sendEmailNotification(config: NotificationConfig['email'], subject: string, body: string): NotificationResult;
export declare function sendWebhookNotification(webhookUrl: string, payload: Record<string, unknown>): NotificationResult;
export declare function sendEventReminder(event: CalendarEvent, config?: Partial<NotificationConfig>): NotificationResult;
export declare function sendBatchReminders(events: CalendarEvent[], config?: Partial<NotificationConfig>): NotificationResult;
//# sourceMappingURL=pushNotification.d.ts.map