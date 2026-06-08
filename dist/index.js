"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateConfigTemplate = exports.resolveConfig = exports.loadProjectConfig = exports.exportMarkdownReschedule = exports.exportMarkdownProgress = exports.exportMarkdownPlan = exports.checkGitEvidence = exports.aiParseTaskRequirements = exports.fetchURLContent = exports.clawplanops_reschedule_plan = exports.clawplanops_generate_daily_progress_report = exports.clawplanops_check_progress_evidence = exports.clawplanops_generate_calendar_schedule = exports.clawplanops_build_deliverable_plan = exports.clawplanops_parse_task_requirements = exports.reschedulePlan = exports.generateDailyProgressReport = exports.checkProgressEvidence = exports.importToAppleCalendar = exports.generateCalendarSchedule = exports.buildDeliverablePlan = exports.parseTaskRequirements = void 0;
exports.register = register;
// Re-export all public APIs for programmatic use
var parseTaskRequirements_1 = require("./tools/parseTaskRequirements");
Object.defineProperty(exports, "parseTaskRequirements", { enumerable: true, get: function () { return parseTaskRequirements_1.parseTaskRequirements; } });
var buildDeliverablePlan_1 = require("./tools/buildDeliverablePlan");
Object.defineProperty(exports, "buildDeliverablePlan", { enumerable: true, get: function () { return buildDeliverablePlan_1.buildDeliverablePlan; } });
var generateCalendarSchedule_1 = require("./tools/generateCalendarSchedule");
Object.defineProperty(exports, "generateCalendarSchedule", { enumerable: true, get: function () { return generateCalendarSchedule_1.generateCalendarSchedule; } });
var appleCalendar_1 = require("./calendar/appleCalendar");
Object.defineProperty(exports, "importToAppleCalendar", { enumerable: true, get: function () { return appleCalendar_1.importToAppleCalendar; } });
var checkProgressEvidence_1 = require("./tools/checkProgressEvidence");
Object.defineProperty(exports, "checkProgressEvidence", { enumerable: true, get: function () { return checkProgressEvidence_1.checkProgressEvidence; } });
var generateDailyProgressReport_1 = require("./tools/generateDailyProgressReport");
Object.defineProperty(exports, "generateDailyProgressReport", { enumerable: true, get: function () { return generateDailyProgressReport_1.generateDailyProgressReport; } });
var reschedulePlan_1 = require("./tools/reschedulePlan");
Object.defineProperty(exports, "reschedulePlan", { enumerable: true, get: function () { return reschedulePlan_1.reschedulePlan; } });
var parseTaskRequirements_2 = require("./tools/parseTaskRequirements");
Object.defineProperty(exports, "clawplanops_parse_task_requirements", { enumerable: true, get: function () { return parseTaskRequirements_2.parseTaskRequirements; } });
var buildDeliverablePlan_2 = require("./tools/buildDeliverablePlan");
Object.defineProperty(exports, "clawplanops_build_deliverable_plan", { enumerable: true, get: function () { return buildDeliverablePlan_2.buildDeliverablePlan; } });
var generateCalendarSchedule_2 = require("./tools/generateCalendarSchedule");
Object.defineProperty(exports, "clawplanops_generate_calendar_schedule", { enumerable: true, get: function () { return generateCalendarSchedule_2.generateCalendarSchedule; } });
var checkProgressEvidence_2 = require("./tools/checkProgressEvidence");
Object.defineProperty(exports, "clawplanops_check_progress_evidence", { enumerable: true, get: function () { return checkProgressEvidence_2.checkProgressEvidence; } });
var generateDailyProgressReport_2 = require("./tools/generateDailyProgressReport");
Object.defineProperty(exports, "clawplanops_generate_daily_progress_report", { enumerable: true, get: function () { return generateDailyProgressReport_2.generateDailyProgressReport; } });
var reschedulePlan_2 = require("./tools/reschedulePlan");
Object.defineProperty(exports, "clawplanops_reschedule_plan", { enumerable: true, get: function () { return reschedulePlan_2.reschedulePlan; } });
var urlFetcher_1 = require("./planner/urlFetcher");
Object.defineProperty(exports, "fetchURLContent", { enumerable: true, get: function () { return urlFetcher_1.fetchURLContent; } });
var aiParser_1 = require("./planner/aiParser");
Object.defineProperty(exports, "aiParseTaskRequirements", { enumerable: true, get: function () { return aiParser_1.aiParseTaskRequirements; } });
var gitEvidence_1 = require("./evidence/gitEvidence");
Object.defineProperty(exports, "checkGitEvidence", { enumerable: true, get: function () { return gitEvidence_1.checkGitEvidence; } });
var markdownExporter_1 = require("./report/markdownExporter");
Object.defineProperty(exports, "exportMarkdownPlan", { enumerable: true, get: function () { return markdownExporter_1.exportMarkdownPlan; } });
Object.defineProperty(exports, "exportMarkdownProgress", { enumerable: true, get: function () { return markdownExporter_1.exportMarkdownProgress; } });
Object.defineProperty(exports, "exportMarkdownReschedule", { enumerable: true, get: function () { return markdownExporter_1.exportMarkdownReschedule; } });
var projectConfig_1 = require("./config/projectConfig");
Object.defineProperty(exports, "loadProjectConfig", { enumerable: true, get: function () { return projectConfig_1.loadProjectConfig; } });
Object.defineProperty(exports, "resolveConfig", { enumerable: true, get: function () { return projectConfig_1.resolveConfig; } });
Object.defineProperty(exports, "generateConfigTemplate", { enumerable: true, get: function () { return projectConfig_1.generateConfigTemplate; } });
/**
 * Plugin lifecycle: called when OpenClaw loads this plugin.
 * Provides the OpenClaw API for registering tools, hooks, etc.
 */
function register(api) {
    const logger = api.logger;
    logger?.info('[claw-planops] Plugin loaded – 6 tools available via CLI and skill');
}
/**
 * Default export for OpenClaw plugin entry.
 */
const pluginEntry = {
    id: 'claw-planops',
    name: 'ClawPlanOps',
    description: '基于交付物证据的项目执行规划插件。输入任务通知 → 自动解析要求 → 生成计划 → 导出日历 → 检查真实进度 → 动态重排。',
    register,
};
exports.default = pluginEntry;
//# sourceMappingURL=index.js.map