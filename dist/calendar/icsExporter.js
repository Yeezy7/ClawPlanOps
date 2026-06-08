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
exports.generateCalendarSchedule = generateCalendarSchedule;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Generate an .ics calendar file from micro tasks.
 * Pure implementation, zero dependencies.
 */
function generateCalendarSchedule(microTasks, startDate, deadline, preferredWorkTime = '20:00-22:00', outputPath = './output/schedule.ics') {
    // Parse preferred work time
    const [startHH, startMM, endHH, endMM] = parseWorkTime(preferredWorkTime);
    // Schedule tasks onto days
    const events = scheduleEvents(microTasks, startDate, deadline, startHH, startMM, endHH, endMM);
    // Build ICS content
    const icsContent = buildICS(events);
    // Write file
    const fullPath = path.resolve(outputPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, icsContent, 'utf-8');
    return {
        ics_file_path: fullPath,
        ics_content: icsContent,
        event_count: events.length,
        events,
    };
}
// ---- scheduling ----------------------------------------------
function scheduleEvents(tasks, startDate, deadline, startHH, startMM, endHH, endMM) {
    const events = [];
    const slotMinutes = (endHH * 60 + endMM) - (startHH * 60 + startMM);
    const sorted = [...tasks].sort((a, b) => {
        const pOrder = { high: 0, medium: 1, low: 2 };
        return pOrder[a.priority] - pOrder[b.priority];
    });
    let currentDate = new Date(startDate);
    const endDate = new Date(deadline);
    let daySlotRemaining = slotMinutes;
    let currentSlotStart = new Date(currentDate);
    currentSlotStart.setHours(startHH, startMM, 0, 0);
    for (const task of sorted) {
        const taskMin = task.estimated_minutes;
        // If doesn't fit in today's remaining slot, move to next day
        if (taskMin > daySlotRemaining) {
            currentDate.setDate(currentDate.getDate() + 1);
            daySlotRemaining = slotMinutes;
            currentSlotStart = new Date(currentDate);
            currentSlotStart.setHours(startHH, startMM, 0, 0);
        }
        // If task longer than remaining slot, cap it
        const actualMin = Math.min(taskMin, daySlotRemaining);
        const endTime = new Date(currentSlotStart);
        endTime.setMinutes(endTime.getMinutes() + actualMin);
        const isPastDeadline = currentSlotStart > endDate;
        const riskNote = [
            task.priority === 'high' ? '高优先级，延期将影响整体进度' : '',
            isPastDeadline ? '排期已超出截止时间，请增加每日可用时间或压缩任务' : '',
        ].filter(Boolean).join('；');
        events.push({
            uid: `${task.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@claw-planops`,
            summary: task.name,
            description: [
                `完成标准：${task.completion_criteria}`,
                `关联交付物：${task.deliverable_id}`,
                `所属阶段：${task.phase_name}`,
                `优先级：${task.priority}`,
                `预计耗时：${actualMin} 分钟`,
                isPastDeadline ? `风险提示：排期已超出截止时间 ${deadline}` : '',
            ].filter(Boolean).join('\\n'),
            start: formatICSDate(currentSlotStart),
            end: formatICSDate(endTime),
            completion_criteria: task.completion_criteria,
            deliverable_id: task.deliverable_id,
            risk_note: riskNote,
        });
        daySlotRemaining -= actualMin;
        currentSlotStart = endTime;
    }
    return events;
}
// ---- ICS builder ---------------------------------------------
function buildICS(events) {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ClawPlanOps//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:ClawPlanOps Schedule',
        'X-WR-TIMEZONE:Asia/Shanghai',
    ];
    for (const ev of events) {
        lines.push('BEGIN:VEVENT');
        lines.push(`DTSTART:${ev.start}`);
        lines.push(`DTEND:${ev.end}`);
        lines.push(`SUMMARY:${ev.summary}`);
        lines.push(`DESCRIPTION:${ev.description}`);
        lines.push(`UID:${ev.uid}`);
        // VALARM: 30 minutes before event
        lines.push('BEGIN:VALARM');
        lines.push('TRIGGER:-PT30M');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:⏰ ${ev.summary} - ${ev.completion_criteria}`);
        lines.push('END:VALARM');
        // VALARM: 1 day before for high-priority tasks
        if (ev.risk_note) {
            lines.push('BEGIN:VALARM');
            lines.push('TRIGGER:-P1D');
            lines.push('ACTION:DISPLAY');
            lines.push(`DESCRIPTION:⚠️ 高优先级任务明天截止: ${ev.summary}`);
            lines.push('END:VALARM');
        }
        lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
}
// ---- helpers -------------------------------------------------
function parseWorkTime(timeStr) {
    const m = timeStr.match(/(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/);
    if (m) {
        return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];
    }
    // default: 20:00-22:00
    return [20, 0, 22, 0];
}
function formatICSDate(d) {
    const pad = (n) => n.toString().padStart(2, '0');
    return (d.getFullYear().toString() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        'T' +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        '00');
}
//# sourceMappingURL=icsExporter.js.map