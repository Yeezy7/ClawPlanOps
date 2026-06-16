"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSystemNotification = sendSystemNotification;
exports.sendEmailNotification = sendEmailNotification;
exports.sendWebhookNotification = sendWebhookNotification;
exports.sendEventReminder = sendEventReminder;
exports.sendBatchReminders = sendBatchReminders;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_CONFIG = {
    enabled: true,
    method: 'system',
    reminder_minutes_before: [30, 1440],
};
function sendSystemNotification(title, message) {
    const platform = process.platform;
    try {
        if (platform === 'darwin') {
            (0, child_process_1.execSync)(`osascript -e 'display notification "${escapeShell(message)}" with title "${escapeShell(title)}"'`, { stdio: 'ignore', timeout: 5000 });
        }
        else if (platform === 'linux') {
            (0, child_process_1.execSync)(`notify-send "${escapeShell(title)}" "${escapeShell(message)}"`, {
                stdio: 'ignore',
                timeout: 5000,
            });
        }
        else if (platform === 'win32') {
            (0, child_process_1.execSync)(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(5000, '${escapeShell(title)}', '${escapeShell(message)}', 'Info')"`, { stdio: 'ignore', timeout: 10000 });
        }
        return { success: true, method: 'system', sent_count: 1, errors: [] };
    }
    catch (err) {
        return { success: false, method: 'system', sent_count: 0, errors: [err.message] };
    }
}
function sendEmailNotification(config, subject, body) {
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
        (0, child_process_1.execSync)(`python3 ${tmpFile}`, { stdio: 'ignore', timeout: 30000 });
        fs.unlinkSync(tmpFile);
        return { success: true, method: 'email', sent_count: 1, errors: [] };
    }
    catch (err) {
        return { success: false, method: 'email', sent_count: 0, errors: [err.message] };
    }
}
function sendWebhookNotification(webhookUrl, payload) {
    try {
        (0, child_process_1.execSync)(`curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "${webhookUrl}"`, { stdio: 'ignore', timeout: 10000 });
        return { success: true, method: 'webhook', sent_count: 1, errors: [] };
    }
    catch (err) {
        return { success: false, method: 'webhook', sent_count: 0, errors: [err.message] };
    }
}
function sendEventReminder(event, config = {}) {
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
function sendBatchReminders(events, config = {}) {
    const results = [];
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
function escapeShell(s) {
    return s.replace(/'/g, "'\\''").replace(/"/g, '\\"').replace(/\n/g, ' ');
}
//# sourceMappingURL=pushNotification.js.map