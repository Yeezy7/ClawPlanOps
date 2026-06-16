import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
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

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  method: 'system',
  reminder_minutes_before: [30, 1440],
};

export interface NotificationResult {
  success: boolean;
  method: string;
  sent_count: number;
  errors: string[];
}

export function sendSystemNotification(title: string, message: string): NotificationResult {
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      execSync(
        `osascript -e 'display notification "${escapeShell(message)}" with title "${escapeShell(title)}"'`,
        { stdio: 'ignore', timeout: 5000 }
      );
    } else if (platform === 'linux') {
      execSync(`notify-send "${escapeShell(title)}" "${escapeShell(message)}"`, {
        stdio: 'ignore',
        timeout: 5000,
      });
    } else if (platform === 'win32') {
      execSync(
        `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(5000, '${escapeShell(title)}', '${escapeShell(message)}', 'Info')"`,
        { stdio: 'ignore', timeout: 10000 }
      );
    }
    return { success: true, method: 'system', sent_count: 1, errors: [] };
  } catch (err: any) {
    return { success: false, method: 'system', sent_count: 0, errors: [err.message] };
  }
}

export function sendEmailNotification(
  config: NotificationConfig['email'],
  subject: string,
  body: string
): NotificationResult {
  if (!config) {
    return { success: false, method: 'email', sent_count: 0, errors: ['未配置邮件'] };
  }
  try {
    const mailScript = `#!/usr/bin/env python3
import smtplib
from email.mime.text import MIMEText

msg = MIMEText("""${body}""", 'plain', 'utf-8')
msg['Subject'] = '${subject}'
msg['From'] = '${config.username}'
msg['To'] = '${config.to}'

with smtplib.SMTP('${config.smtp_host}', ${config.smtp_port}) as server:
    server.starttls()
    server.login('${config.username}', '${config.password}')
    server.send_message(msg)
`;
    const tmpFile = path.join('/tmp', `clawplanops_mail_${Date.now()}.py`);
    fs.writeFileSync(tmpFile, mailScript, 'utf-8');
    execSync(`python3 ${tmpFile}`, { stdio: 'ignore', timeout: 30000 });
    fs.unlinkSync(tmpFile);
    return { success: true, method: 'email', sent_count: 1, errors: [] };
  } catch (err: any) {
    return { success: false, method: 'email', sent_count: 0, errors: [err.message] };
  }
}

export function sendWebhookNotification(
  webhookUrl: string,
  payload: Record<string, unknown>
): NotificationResult {
  try {
    execSync(
      `curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "${webhookUrl}"`,
      { stdio: 'ignore', timeout: 10000 }
    );
    return { success: true, method: 'webhook', sent_count: 1, errors: [] };
  } catch (err: any) {
    return { success: false, method: 'webhook', sent_count: 0, errors: [err.message] };
  }
}

export function sendEventReminder(
  event: CalendarEvent,
  config: Partial<NotificationConfig> = {}
): NotificationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  if (!cfg.enabled) {
    return { success: true, method: 'none', sent_count: 0, errors: [] };
  }

  const title = `⏰ 提醒: ${event.summary}`;
  const message = [
    `完成标准: ${event.completion_criteria}`,
    `关联交付物: ${event.deliverable_id}`,
    event.risk_note ? `风险: ${event.risk_note}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  if (cfg.method === 'system' || cfg.method === 'all') {
    return sendSystemNotification(title, message);
  }
  if (cfg.method === 'email' && cfg.email) {
    return sendEmailNotification(cfg.email, title, message);
  }
  if (cfg.method === 'webhook' && cfg.webhook_url) {
    return sendWebhookNotification(cfg.webhook_url, { title, message, event });
  }

  return sendSystemNotification(title, message);
}

export function sendBatchReminders(
  events: CalendarEvent[],
  config: Partial<NotificationConfig> = {}
): NotificationResult {
  const results: NotificationResult[] = [];
  for (const event of events) {
    results.push(sendEventReminder(event, config));
  }
  const successCount = results.filter((r) => r.success).length;
  const allErrors = results.flatMap((r) => r.errors);
  return {
    success: successCount > 0,
    method: 'batch',
    sent_count: successCount,
    errors: allErrors,
  };
}

function escapeShell(s: string): string {
  return s.replace(/'/g, "'\\''").replace(/"/g, '\\"').replace(/\n/g, ' ');
}
