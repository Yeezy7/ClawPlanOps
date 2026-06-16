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
exports.importToSystemCalendar = importToSystemCalendar;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CALENDAR_NAME = 'ClawPlanOps';
function importToSystemCalendar(events) {
    const platform = process.platform;
    if (events.length === 0) {
        return {
            success: true,
            platform,
            method: 'none',
            imported_count: 0,
            errors: [],
        };
    }
    if (platform === 'darwin') {
        return importToMacOS(events);
    }
    else if (platform === 'linux') {
        return importToLinux(events);
    }
    else if (platform === 'win32') {
        return importToWindows(events);
    }
    return {
        success: false,
        platform,
        method: 'unknown',
        imported_count: 0,
        errors: [`不支持的平台: ${platform}`],
    };
}
function importToMacOS(events) {
    try {
        ensureMacCalendar();
        let imported = 0;
        const errors = [];
        for (const event of events) {
            try {
                addMacEvent(event);
                imported++;
            }
            catch (err) {
                errors.push(`[${event.summary}] ${err.message}`);
            }
        }
        return { success: imported > 0, platform: 'darwin', method: 'osascript', imported_count: imported, errors };
    }
    catch (err) {
        return { success: false, platform: 'darwin', method: 'osascript', imported_count: 0, errors: [err.message] };
    }
}
function importToLinux(events) {
    const icsContent = buildICS(events);
    const homeDir = process.env.HOME || '/tmp';
    const outputDir = path.join(homeDir, '.clawplanops');
    if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir, { recursive: true });
    const icsPath = path.join(outputDir, `schedule_${Date.now()}.ics`);
    fs.writeFileSync(icsPath, icsContent, 'utf-8');
    try {
        if (isCommandAvailable('gnome-calendar')) {
            (0, child_process_1.execFileSync)('gnome-calendar', ['-i', icsPath], { stdio: 'ignore', timeout: 10000 });
            return { success: true, platform: 'linux', method: 'gnome-calendar', imported_count: events.length, errors: [] };
        }
        if (isCommandAvailable('korganizer')) {
            (0, child_process_1.execFileSync)('korganizer', ['--import', icsPath], { stdio: 'ignore', timeout: 10000 });
            return { success: true, platform: 'linux', method: 'korganizer', imported_count: events.length, errors: [] };
        }
        if (isCommandAvailable('xdg-open')) {
            (0, child_process_1.execFileSync)('xdg-open', [icsPath], { stdio: 'ignore', timeout: 5000 });
            return { success: true, platform: 'linux', method: 'xdg-open', imported_count: events.length, errors: [] };
        }
        return {
            success: false,
            platform: 'linux',
            method: 'none',
            imported_count: 0,
            errors: [`未找到日历应用，ICS 文件已保存到: ${icsPath}`],
        };
    }
    catch (err) {
        return { success: false, platform: 'linux', method: 'error', imported_count: 0, errors: [err.message, `ICS 文件已保存到: ${icsPath}`] };
    }
}
function importToWindows(events) {
    const icsContent = buildICS(events);
    const homeDir = process.env.USERPROFILE || process.env.HOME || '';
    const outputDir = path.join(homeDir, '.clawplanops');
    if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir, { recursive: true });
    const icsPath = path.join(outputDir, `schedule_${Date.now()}.ics`);
    fs.writeFileSync(icsPath, icsContent, 'utf-8');
    try {
        (0, child_process_1.execFileSync)('cmd', ['/c', 'start', '', icsPath], { stdio: 'ignore', timeout: 10000 });
        return { success: true, platform: 'win32', method: 'default-app', imported_count: events.length, errors: [] };
    }
    catch (err) {
        try {
            const psScript = `Start-Process "${icsPath}"`;
            (0, child_process_1.execFileSync)('powershell', ['-Command', psScript], { stdio: 'ignore', timeout: 10000 });
            return { success: true, platform: 'win32', method: 'powershell', imported_count: events.length, errors: [] };
        }
        catch (err2) {
            return {
                success: false,
                platform: 'win32',
                method: 'error',
                imported_count: 0,
                errors: [err2.message, `ICS 文件已保存到: ${icsPath}`],
            };
        }
    }
}
function ensureMacCalendar() {
    const script = `
tell application "Calendar"
  if not (exists calendar "${CALENDAR_NAME}") then
    make new calendar with properties {name:"${CALENDAR_NAME}"}
  end if
end tell`;
    (0, child_process_1.execFileSync)('osascript', ['-e', script], { encoding: 'utf-8', timeout: 10000 });
}
function addMacEvent(event) {
    const startDate = icsDateToAppleScriptDate(event.start);
    const endDate = icsDateToAppleScriptDate(event.end);
    const summary = escapeAppleScript(event.summary);
    const description = escapeAppleScript(event.description.replace(/\\n/g, ' | '));
    const alarmClauses = [];
    alarmClauses.push(`make new sound alarm at event end date with properties {trigger:-30}`);
    if (event.risk_note) {
        alarmClauses.push(`make new sound alarm at event end date with properties {trigger:-1440}`);
    }
    const script = `
tell application "Calendar"
  tell calendar "${CALENDAR_NAME}"
    set newEvent to make new event with properties {summary:"${summary}", start date:${startDate}, end date:${endDate}, description:"${description}"}
    tell newEvent
      ${alarmClauses.join('\n      ')}
    end tell
  end tell
end tell`;
    (0, child_process_1.execFileSync)('osascript', ['-e', script], { encoding: 'utf-8', timeout: 10000 });
}
function buildICS(events) {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ClawPlanOps//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:ClawPlanOps Schedule',
    ];
    for (const ev of events) {
        lines.push('BEGIN:VEVENT');
        lines.push(`DTSTART:${ev.start}`);
        lines.push(`DTEND:${ev.end}`);
        lines.push(`SUMMARY:${ev.summary}`);
        lines.push(`DESCRIPTION:${ev.description}`);
        lines.push(`UID:${ev.uid}`);
        lines.push('BEGIN:VALARM');
        lines.push('TRIGGER:-PT30M');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${ev.summary}`);
        lines.push('END:VALARM');
        lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
}
function icsDateToAppleScriptDate(icsDate) {
    const y = icsDate.slice(0, 4);
    const m = icsDate.slice(4, 6);
    const d = icsDate.slice(6, 8);
    const hh = icsDate.slice(9, 11);
    const mm = icsDate.slice(11, 13);
    const ss = icsDate.slice(13, 15);
    return `date "${y}-${m}-${d} ${hh}:${mm}:${ss}"`;
}
function escapeAppleScript(s) {
    return s.replace(/\r?\n/g, ' | ').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
function isCommandAvailable(cmd) {
    try {
        (0, child_process_1.execFileSync)('which', [cmd], { stdio: 'ignore', timeout: 3000 });
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=crossPlatformCalendar.js.map