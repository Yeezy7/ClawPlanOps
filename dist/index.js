"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clawplanops_git_task_link = exports.clawplanops_multi_project_status = exports.clawplanops_pre_submission_check = exports.clawplanops_generate_weekly_report = exports.clawplanops_reschedule_plan = exports.clawplanops_generate_daily_progress_report = exports.clawplanops_check_progress_evidence = exports.clawplanops_generate_calendar_schedule = exports.clawplanops_build_deliverable_plan = exports.clawplanops_parse_task_requirements = exports.importToSystemCalendar = exports.exportProgressTrendMarkdown = exports.analyzeProgressTrend = exports.loadProgressHistory = exports.saveProgressSnapshot = exports.generateGitTaskMarkdown = exports.linkCommitsToTasks = exports.getRecentCommits = exports.sendBatchReminders = exports.sendEventReminder = exports.sendWebhookNotification = exports.sendEmailNotification = exports.sendSystemNotification = exports.getOverallStatus = exports.removeProject = exports.listProjects = exports.getActiveProject = exports.switchProject = exports.addProject = exports.loadMultiProjectState = exports.exportPreSubmissionMarkdown = exports.runPreSubmissionCheck = exports.exportWeeklyReportMarkdown = exports.generateWeeklyReport = exports.generateConfigTemplate = exports.resolveConfig = exports.loadProjectConfig = exports.exportMarkdownReschedule = exports.exportMarkdownProgress = exports.exportMarkdownPlan = exports.checkGitEvidence = exports.aiParseTaskRequirements = exports.fetchURLContent = exports.reschedulePlan = exports.generateDailyProgressReport = exports.checkProgressEvidence = exports.importToAppleCalendar = exports.generateCalendarSchedule = exports.buildDeliverablePlan = exports.parseTaskRequirements = void 0;
exports.clawplanops_daily_review = exports.clawplanops_cross_platform_calendar = exports.clawplanops_send_notification = exports.clawplanops_progress_trend = void 0;
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
// New modules: v0.3.0
var weeklyReport_1 = require("./report/weeklyReport");
Object.defineProperty(exports, "generateWeeklyReport", { enumerable: true, get: function () { return weeklyReport_1.generateWeeklyReport; } });
Object.defineProperty(exports, "exportWeeklyReportMarkdown", { enumerable: true, get: function () { return weeklyReport_1.exportWeeklyReportMarkdown; } });
var preSubmissionCheck_1 = require("./report/preSubmissionCheck");
Object.defineProperty(exports, "runPreSubmissionCheck", { enumerable: true, get: function () { return preSubmissionCheck_1.runPreSubmissionCheck; } });
Object.defineProperty(exports, "exportPreSubmissionMarkdown", { enumerable: true, get: function () { return preSubmissionCheck_1.exportPreSubmissionMarkdown; } });
var multiProject_1 = require("./config/multiProject");
Object.defineProperty(exports, "loadMultiProjectState", { enumerable: true, get: function () { return multiProject_1.loadMultiProjectState; } });
Object.defineProperty(exports, "addProject", { enumerable: true, get: function () { return multiProject_1.addProject; } });
Object.defineProperty(exports, "switchProject", { enumerable: true, get: function () { return multiProject_1.switchProject; } });
Object.defineProperty(exports, "getActiveProject", { enumerable: true, get: function () { return multiProject_1.getActiveProject; } });
Object.defineProperty(exports, "listProjects", { enumerable: true, get: function () { return multiProject_1.listProjects; } });
Object.defineProperty(exports, "removeProject", { enumerable: true, get: function () { return multiProject_1.removeProject; } });
Object.defineProperty(exports, "getOverallStatus", { enumerable: true, get: function () { return multiProject_1.getOverallStatus; } });
var pushNotification_1 = require("./notification/pushNotification");
Object.defineProperty(exports, "sendSystemNotification", { enumerable: true, get: function () { return pushNotification_1.sendSystemNotification; } });
Object.defineProperty(exports, "sendEmailNotification", { enumerable: true, get: function () { return pushNotification_1.sendEmailNotification; } });
Object.defineProperty(exports, "sendWebhookNotification", { enumerable: true, get: function () { return pushNotification_1.sendWebhookNotification; } });
Object.defineProperty(exports, "sendEventReminder", { enumerable: true, get: function () { return pushNotification_1.sendEventReminder; } });
Object.defineProperty(exports, "sendBatchReminders", { enumerable: true, get: function () { return pushNotification_1.sendBatchReminders; } });
var gitTaskLink_1 = require("./evidence/gitTaskLink");
Object.defineProperty(exports, "getRecentCommits", { enumerable: true, get: function () { return gitTaskLink_1.getRecentCommits; } });
Object.defineProperty(exports, "linkCommitsToTasks", { enumerable: true, get: function () { return gitTaskLink_1.linkCommitsToTasks; } });
Object.defineProperty(exports, "generateGitTaskMarkdown", { enumerable: true, get: function () { return gitTaskLink_1.generateGitTaskMarkdown; } });
var progressHistory_1 = require("./evidence/progressHistory");
Object.defineProperty(exports, "saveProgressSnapshot", { enumerable: true, get: function () { return progressHistory_1.saveProgressSnapshot; } });
Object.defineProperty(exports, "loadProgressHistory", { enumerable: true, get: function () { return progressHistory_1.loadProgressHistory; } });
Object.defineProperty(exports, "analyzeProgressTrend", { enumerable: true, get: function () { return progressHistory_1.analyzeProgressTrend; } });
Object.defineProperty(exports, "exportProgressTrendMarkdown", { enumerable: true, get: function () { return progressHistory_1.exportProgressTrendMarkdown; } });
var crossPlatformCalendar_1 = require("./calendar/crossPlatformCalendar");
Object.defineProperty(exports, "importToSystemCalendar", { enumerable: true, get: function () { return crossPlatformCalendar_1.importToSystemCalendar; } });
// Import Type from typebox for tool parameter schemas
const typebox_1 = require("typebox");
// ---- Tool implementations (internal) ----
const parseTaskRequirements_2 = require("./tools/parseTaskRequirements");
Object.defineProperty(exports, "clawplanops_parse_task_requirements", { enumerable: true, get: function () { return parseTaskRequirements_2.parseTaskRequirements; } });
const buildDeliverablePlan_2 = require("./tools/buildDeliverablePlan");
Object.defineProperty(exports, "clawplanops_build_deliverable_plan", { enumerable: true, get: function () { return buildDeliverablePlan_2.buildDeliverablePlan; } });
const generateCalendarSchedule_2 = require("./tools/generateCalendarSchedule");
Object.defineProperty(exports, "clawplanops_generate_calendar_schedule", { enumerable: true, get: function () { return generateCalendarSchedule_2.generateCalendarSchedule; } });
const checkProgressEvidence_2 = require("./tools/checkProgressEvidence");
Object.defineProperty(exports, "clawplanops_check_progress_evidence", { enumerable: true, get: function () { return checkProgressEvidence_2.checkProgressEvidence; } });
const generateDailyProgressReport_2 = require("./tools/generateDailyProgressReport");
Object.defineProperty(exports, "clawplanops_generate_daily_progress_report", { enumerable: true, get: function () { return generateDailyProgressReport_2.generateDailyProgressReport; } });
const reschedulePlan_2 = require("./tools/reschedulePlan");
Object.defineProperty(exports, "clawplanops_reschedule_plan", { enumerable: true, get: function () { return reschedulePlan_2.reschedulePlan; } });
const generateWeeklyReport_1 = require("./tools/generateWeeklyReport");
Object.defineProperty(exports, "clawplanops_generate_weekly_report", { enumerable: true, get: function () { return generateWeeklyReport_1.generateWeeklyReportTool; } });
const preSubmissionCheck_2 = require("./tools/preSubmissionCheck");
Object.defineProperty(exports, "clawplanops_pre_submission_check", { enumerable: true, get: function () { return preSubmissionCheck_2.preSubmissionCheckTool; } });
const multiProjectStatus_1 = require("./tools/multiProjectStatus");
Object.defineProperty(exports, "clawplanops_multi_project_status", { enumerable: true, get: function () { return multiProjectStatus_1.multiProjectStatusTool; } });
const gitTaskLink_2 = require("./tools/gitTaskLink");
Object.defineProperty(exports, "clawplanops_git_task_link", { enumerable: true, get: function () { return gitTaskLink_2.gitTaskLinkTool; } });
const progressTrend_1 = require("./tools/progressTrend");
Object.defineProperty(exports, "clawplanops_progress_trend", { enumerable: true, get: function () { return progressTrend_1.progressTrendTool; } });
const sendNotification_1 = require("./tools/sendNotification");
Object.defineProperty(exports, "clawplanops_send_notification", { enumerable: true, get: function () { return sendNotification_1.sendNotificationTool; } });
const crossPlatformCalendar_2 = require("./tools/crossPlatformCalendar");
Object.defineProperty(exports, "clawplanops_cross_platform_calendar", { enumerable: true, get: function () { return crossPlatformCalendar_2.crossPlatformCalendarTool; } });
const dailyReview_1 = require("./tools/dailyReview");
Object.defineProperty(exports, "clawplanops_daily_review", { enumerable: true, get: function () { return dailyReview_1.dailyReview; } });
// ---- Interactive tool descriptions ----
const TOOL_DESCRIPTIONS = {
    clawplanops_parse_task_requirements: `解析任务通知文本或 URL，提取结构化信息。

何时使用：用户提供了一段比赛通知、作业要求、或项目说明文本（或 URL）时。
输入：content（文本或 URL）、可选的 input_type（'text' 或 'url'）。
输出：包含 task_name、deadline、deliverables、constraints 的 JSON。

⚠️ 必须调用此工具，不要自己解析。工具会处理格式差异和边界情况。`,
    clawplanops_build_deliverable_plan: `根据任务要求生成交付物计划和微任务。

何时使用：用户确认了任务信息后，生成详细的执行计划。
输入：task_requirements（从解析步骤获得）、可选的 available_days、daily_available_hours。
输出：包含 phases、deliverables、micro_tasks 的完整计划。

⚠️ 必须调用此工具，不要自己写计划文件。工具会生成标准格式。`,
    clawplanops_generate_calendar_schedule: `生成 .ics 日历文件，包含 VALARM 提醒。

何时使用：用户确认计划后，导出日历。
输入：micro_tasks、start_date、deadline、可选的 preferred_work_time。
输出：日历文件路径和事件数量。

⚠️ 必须调用此工具，不要自己写 ICS 生成代码。工具会生成标准 RFC 5545 格式。`,
    clawplanops_check_progress_evidence: `扫描项目目录，检查文件证据和 Git 提交，计算进度百分比。

何时使用：用户想了解项目当前状态时。
输入：project_path。
输出：progress_percent、risk_level、completed、missing。

⚠️ 必须调用此工具，不要自己扫描文件目录。工具会处理文件匹配和 Git 历史分析。`,
    clawplanops_generate_daily_progress_report: `生成每日进度报告，显示今日计划和下一步行动。

何时使用：用户问"今天该做什么"时。
输入：project_path、plan、schedule。
输出：planned_today、next_actions。

⚠️ 必须调用此工具，不要自己统计今日任务。工具会基于计划和进度生成报告。`,
    clawplanops_reschedule_plan: `根据进度落后情况生成重排建议。

何时使用：进度检查显示落后时。
输入：progress_report、original_plan、deadline。
输出：delay_days、priority_tasks、removed_tasks、advice。

⚠️ 必须调用此工具，不要自己计算重排方案。工具会生成优化的调整建议。`,
    clawplanops_generate_weekly_report: `生成周报，包含完成任务、Git 提交、下周重点。

何时使用：用户要求生成周报或总结本周工作时。
输入：project_path、plan。
输出：completed_tasks、git_commits、next_week_focus。

⚠️ 必须调用此工具，不要自己统计 Git 提交。工具会分析 Git 历史并生成标准化报告。`,
    clawplanops_pre_submission_check: `提交前检查，验证所有材料是否齐全。

何时使用：用户准备提交材料前。
输入：project_path、plan。
输出：ready、score、checks、missing_files。

⚠️ 必须调用此工具，不要自己检查文件完整性。工具会验证所有必需文件和格式。`,
    clawplanops_multi_project_status: `查看所有并行项目的状态概览。

何时使用：用户管理多个项目时。
输入：project_path。
输出：total_projects、projects_summary。

⚠️ 必须调用此工具，不要自己读取项目状态。工具会汇总所有项目的进度。`,
    clawplanops_git_task_link: `分析 Git 提交与任务的关联关系。

何时使用：用户想了解代码提交和任务的对应关系时。
输入：project_path、plan。
输出：task_links、unlinked_commits、coverage_percent。

⚠️ 必须调用此工具，不要自己分析 Git 提交。工具会解析 commit message 并匹配任务。`,
    clawplanops_progress_trend: `分析进度趋势，计算日均进度和预计完成时间。

何时使用：用户想了解进度趋势时。
输入：project_path。
输出：trend_direction、avg_daily_progress、estimated_completion_date。

⚠️ 必须调用此工具，不要自己计算趋势。工具会分析历史快照并预测完成时间。`,
    clawplanops_send_notification: `发送系统通知提醒。

何时使用：用户想发送提醒时。
输入：title、message。
输出：success、method。

⚠️ 必须调用此工具，不要自己调用系统命令。工具会处理跨平台通知。`,
    clawplanops_cross_platform_calendar: `跨平台日历导入（自动检测系统）。

何时使用：用户想导入日历到系统日历应用时。
输入：events。
输出：success、platform、method。

⚠️ 必须调用此工具，不要自己检测操作系统。工具会自动检测并调用正确的日历应用。`,
    clawplanops_daily_review: `每日项目审查，检查进度、识别风险、生成建议。

何时使用：收到定时触发（cron job）或用户说"每日审查"、"今日总结"时。
输入：project_path、plan（可选）。
输出：progress、trend、today_focus、overdue_tasks、risk_level、next_actions。

⚠️ 必须调用此工具，不要自己扫描文件目录或读取 Git 历史。工具会综合分析项目状态并生成审查报告。`,
};
// ---- Plugin entry (OpenClaw format) ----
function createPluginEntry() {
    return {
        id: 'claw-planops',
        name: 'ClawPlanOps',
        description: '基于交付物证据的项目执行规划插件。支持交互式项目规划、进度追踪、材料检查。',
        version: '0.3.0',
        register(api) {
            const logger = api.logger;
            // Register each tool with interactive descriptions
            const toolRegistry = {
                clawplanops_parse_task_requirements: parseTaskRequirements_2.parseTaskRequirements,
                clawplanops_build_deliverable_plan: buildDeliverablePlan_2.buildDeliverablePlan,
                clawplanops_generate_calendar_schedule: generateCalendarSchedule_2.generateCalendarSchedule,
                clawplanops_check_progress_evidence: checkProgressEvidence_2.checkProgressEvidence,
                clawplanops_generate_daily_progress_report: generateDailyProgressReport_2.generateDailyProgressReport,
                clawplanops_reschedule_plan: reschedulePlan_2.reschedulePlan,
                clawplanops_generate_weekly_report: generateWeeklyReport_1.generateWeeklyReportTool,
                clawplanops_pre_submission_check: preSubmissionCheck_2.preSubmissionCheckTool,
                clawplanops_multi_project_status: multiProjectStatus_1.multiProjectStatusTool,
                clawplanops_git_task_link: gitTaskLink_2.gitTaskLinkTool,
                clawplanops_progress_trend: progressTrend_1.progressTrendTool,
                clawplanops_send_notification: sendNotification_1.sendNotificationTool,
                clawplanops_cross_platform_calendar: crossPlatformCalendar_2.crossPlatformCalendarTool,
                clawplanops_daily_review: dailyReview_1.dailyReview,
            };
            // Tool parameter schemas for OpenClaw (using TypeBox format)
            const TOOL_PARAMETERS = {
                clawplanops_parse_task_requirements: typebox_1.Type.Object({
                    content: typebox_1.Type.String({ description: '任务通知文本或 URL 内容' }),
                    input_type: typebox_1.Type.Optional(typebox_1.Type.String({ enum: ['text', 'url'], description: '输入类型，默认 text' })),
                }),
                clawplanops_build_deliverable_plan: typebox_1.Type.Object({
                    task_requirements: typebox_1.Type.Object({}, { description: '从 parse_task_requirements 获取的任务要求' }),
                    available_days: typebox_1.Type.Optional(typebox_1.Type.Number({ description: '可用天数' })),
                    daily_available_hours: typebox_1.Type.Optional(typebox_1.Type.Number({ description: '每日可用小时数' })),
                    custom_templates: typebox_1.Type.Optional(typebox_1.Type.Object({}, { description: '自定义交付物模板' })),
                }),
                clawplanops_generate_calendar_schedule: typebox_1.Type.Object({
                    micro_tasks: typebox_1.Type.Array(typebox_1.Type.Object({}), { description: '微任务列表' }),
                    start_date: typebox_1.Type.String({ description: '开始日期 YYYY-MM-DD' }),
                    deadline: typebox_1.Type.String({ description: '截止日期 YYYY-MM-DD' }),
                    preferred_work_time: typebox_1.Type.Optional(typebox_1.Type.String({ description: '偏好工作时间段，如 20:00-22:00' })),
                    output_path: typebox_1.Type.Optional(typebox_1.Type.String({ description: '输出文件路径' })),
                }),
                clawplanops_check_progress_evidence: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                    evidence_rules: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.Object({}), { description: '自定义证据规则' })),
                    exclude_patterns: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String(), { description: '排除的文件模式' })),
                }),
                clawplanops_generate_daily_progress_report: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                    plan: typebox_1.Type.Optional(typebox_1.Type.Object({}, { description: '项目计划' })),
                    schedule: typebox_1.Type.Optional(typebox_1.Type.Object({}, { description: '日程安排' })),
                }),
                clawplanops_reschedule_plan: typebox_1.Type.Object({
                    progress_report: typebox_1.Type.Object({}, { description: '进度报告' }),
                    original_plan: typebox_1.Type.Object({}, { description: '原始计划' }),
                    deadline: typebox_1.Type.String({ description: '截止日期' }),
                }),
                clawplanops_generate_weekly_report: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                    plan: typebox_1.Type.Optional(typebox_1.Type.Object({}, { description: '项目计划' })),
                }),
                clawplanops_pre_submission_check: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                    plan: typebox_1.Type.Object({}, { description: '项目计划' }),
                }),
                clawplanops_multi_project_status: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                }),
                clawplanops_git_task_link: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                    plan: typebox_1.Type.Object({}, { description: '项目计划' }),
                }),
                clawplanops_progress_trend: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                }),
                clawplanops_send_notification: typebox_1.Type.Object({
                    title: typebox_1.Type.String({ description: '通知标题' }),
                    message: typebox_1.Type.String({ description: '通知内容' }),
                }),
                clawplanops_cross_platform_calendar: typebox_1.Type.Object({
                    events: typebox_1.Type.Array(typebox_1.Type.Object({}), { description: '日历事件列表' }),
                }),
                clawplanops_daily_review: typebox_1.Type.Object({
                    project_path: typebox_1.Type.String({ description: '项目目录路径' }),
                    plan: typebox_1.Type.Optional(typebox_1.Type.Object({}, { description: '项目计划文件' })),
                }),
            };
            // Register tools if api.registerTool is available
            if (api.registerTool) {
                for (const [name, impl] of Object.entries(toolRegistry)) {
                    try {
                        api.registerTool({
                            name,
                            description: TOOL_DESCRIPTIONS[name] || '',
                            parameters: TOOL_PARAMETERS[name] || { type: 'object' },
                            async execute(_id, params) {
                                try {
                                    const result = await impl(params);
                                    return {
                                        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                                    };
                                }
                                catch (err) {
                                    return {
                                        content: [{ type: 'text', text: `错误: ${err.message}` }],
                                        isError: true,
                                    };
                                }
                            },
                        }, { optional: false });
                        logger?.info?.(`[claw-planops] Successfully registered tool: ${name}`);
                    }
                    catch (err) {
                        logger?.error?.(`[claw-planops] Failed to register tool ${name}: ${err.message}`);
                    }
                }
                logger?.info?.(`[claw-planops] Registered ${Object.keys(toolRegistry).length} interactive tools`);
            }
            else {
                logger?.error?.(`[claw-planops] api.registerTool is not available`);
            }
            // Register lifecycle hooks
            if (api.on) {
                api.on('session:start', () => {
                    logger?.info?.('[claw-planops] Session started – ClawPlanOps ready');
                });
            }
        },
    };
}
// Default export for OpenClaw plugin system
exports.default = createPluginEntry();
// Legacy register function for compatibility
function register(api) {
    const entry = createPluginEntry();
    entry.register(api);
}
//# sourceMappingURL=index.js.map