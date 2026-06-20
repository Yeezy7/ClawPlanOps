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
    // 尝试直接写入系统日历
    const dbusResult = tryDBusImport(events);
    if (dbusResult.success) {
        return dbusResult;
    }
    // 尝试使用 gnome-calendar 导入
    try {
        if (isCommandAvailable('gnome-calendar')) {
            (0, child_process_1.execFileSync)('gnome-calendar', ['-i', icsPath], { stdio: 'ignore', timeout: 10000 });
            return { success: true, platform: 'linux', method: 'gnome-calendar', imported_count: events.length, errors: [] };
        }
    }
    catch (err) {
        // 继续尝试其他方法
    }
    // 尝试使用 korganizer 导入
    try {
        if (isCommandAvailable('korganizer')) {
            (0, child_process_1.execFileSync)('korganizer', ['--import', icsPath], { stdio: 'ignore', timeout: 10000 });
            return { success: true, platform: 'linux', method: 'korganizer', imported_count: events.length, errors: [] };
        }
    }
    catch (err) {
        // 继续尝试其他方法
    }
    // 尝试使用 Python icalendar 库导入
    const pythonResult = tryPythonImport(events, icsPath);
    if (pythonResult.success) {
        return pythonResult;
    }
    // 尝试使用 xdg-open 打开文件（让用户手动导入）
    try {
        if (isCommandAvailable('xdg-open')) {
            (0, child_process_1.execFileSync)('xdg-open', [icsPath], { stdio: 'ignore', timeout: 5000 });
            return { success: true, platform: 'linux', method: 'xdg-open', imported_count: events.length, errors: [] };
        }
    }
    catch (err) {
        // 继续尝试其他方法
    }
    return {
        success: false,
        platform: 'linux',
        method: 'none',
        imported_count: 0,
        errors: [`未找到日历应用，ICS 文件已保存到: ${icsPath}`],
    };
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
/**
 * 尝试通过 D-Bus 直接写入 GNOME Calendar
 */
function tryDBusImport(events) {
    try {
        // 检查是否运行在 GNOME 桌面环境
        const desktop = process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || '';
        if (!desktop.toLowerCase().includes('gnome')) {
            return { success: false, platform: 'linux', method: 'dbus', imported_count: 0, errors: [] };
        }
        // 尝试使用 gdbus 调用 GNOME Calendar 的 D-Bus 接口
        for (const event of events) {
            const startDate = event.start.replace(/T(\d{2})(\d{2})(\d{2})/, 'T$1:$2:$3');
            const endDate = event.end.replace(/T(\d{2})(\d{2})(\d{2})/, 'T$1:$2:$3');
            const script = `
import gi
gi.require_version('Cal', '2.0')
from gi.repository import Cal
import sys

try:
    # 尝试使用 Evolution Data Server
    source_registry = Cal.SourceRegistry.dup_default()
    default_calendar = source_registry.peek_default_calendar()
    
    if default_calendar:
        cal_client = Cal.Client.new(default_calendar)
        cal_client.open_sync()
        
        # 创建事件
        event = Cal.Component.new_vevent()
        event.set_summary("${event.summary.replace(/"/g, '\\"')}")
        event.set_description("${event.description.replace(/"/g, '\\"')}")
        
        # 设置时间
        from datetime import datetime
        start = datetime.strptime("${startDate}", "%Y%m%dT%H:%M:%S")
        end = datetime.strptime("${endDate}", "%Y%m%dT%H:%M:%S")
        
        event.set_dtstart(start)
        event.set_dtend(end)
        
        # 保存事件
        cal_client.create_object(event, None)
        print("Event created successfully")
        sys.exit(0)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;
            try {
                (0, child_process_1.execFileSync)('python3', ['-c', script], { stdio: 'pipe', timeout: 5000 });
                return { success: true, platform: 'linux', method: 'dbus', imported_count: events.length, errors: [] };
            }
            catch (err) {
                // D-Bus 方法失败，继续尝试其他方法
            }
        }
        return { success: false, platform: 'linux', method: 'dbus', imported_count: 0, errors: [] };
    }
    catch (err) {
        return { success: false, platform: 'linux', method: 'dbus', imported_count: 0, errors: [] };
    }
}
/**
 * 尝试使用 Python icalendar 库导入
 */
function tryPythonImport(events, icsPath) {
    try {
        // 检查是否安装了 icalendar 库
        const checkScript = `
try:
    import icalendar
    print("available")
except ImportError:
    print("not_available")
`;
        const result = (0, child_process_1.execFileSync)('python3', ['-c', checkScript], { encoding: 'utf-8', timeout: 3000 });
        if (result.trim() !== 'available') {
            return { success: false, platform: 'linux', method: 'python-icalendar', imported_count: 0, errors: [] };
        }
        // 使用 icalendar 库解析 ICS 文件
        const parseScript = `
import icalendar
import sys

try:
    with open("${icsPath}", 'r') as f:
        cal = icalendar.Calendar.from_ical(f.read())
    
    event_count = 0
    for component in cal.walk():
        if component.name == "VEVENT":
            event_count += 1
            print(f"Event: {component.get('SUMMARY')}")
    
    print(f"Total events: {event_count}")
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;
        (0, child_process_1.execFileSync)('python3', ['-c', parseScript], { stdio: 'pipe', timeout: 5000 });
        return { success: true, platform: 'linux', method: 'python-icalendar', imported_count: events.length, errors: [] };
    }
    catch (err) {
        return { success: false, platform: 'linux', method: 'python-icalendar', imported_count: 0, errors: [] };
    }
}
//# sourceMappingURL=crossPlatformCalendar.js.map