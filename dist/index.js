"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clawplanops_git_task_link = exports.clawplanops_multi_project_status = exports.clawplanops_pre_submission_check = exports.clawplanops_generate_weekly_report = exports.clawplanops_reschedule_plan = exports.clawplanops_generate_daily_progress_report = exports.clawplanops_check_progress_evidence = exports.clawplanops_generate_calendar_schedule = exports.clawplanops_build_deliverable_plan = exports.clawplanops_parse_task_requirements = exports.importToSystemCalendar = exports.exportProgressTrendMarkdown = exports.analyzeProgressTrend = exports.loadProgressHistory = exports.saveProgressSnapshot = exports.generateGitTaskMarkdown = exports.linkCommitsToTasks = exports.getRecentCommits = exports.sendBatchReminders = exports.sendEventReminder = exports.sendWebhookNotification = exports.sendEmailNotification = exports.sendSystemNotification = exports.getOverallStatus = exports.removeProject = exports.listProjects = exports.getActiveProject = exports.switchProject = exports.addProject = exports.loadMultiProjectState = exports.exportPreSubmissionMarkdown = exports.runPreSubmissionCheck = exports.exportWeeklyReportMarkdown = exports.generateWeeklyReport = exports.generateConfigTemplate = exports.resolveConfig = exports.loadProjectConfig = exports.exportMarkdownReschedule = exports.exportMarkdownProgress = exports.exportMarkdownPlan = exports.checkGitEvidence = exports.aiParseTaskRequirements = exports.fetchURLContent = exports.reschedulePlan = exports.generateDailyProgressReport = exports.checkProgressEvidence = exports.importToAppleCalendar = exports.generateCalendarSchedule = exports.buildDeliverablePlan = exports.parseTaskRequirements = void 0;
exports.clawplanops_cross_platform_calendar = exports.clawplanops_send_notification = exports.clawplanops_progress_trend = void 0;
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
// ---- Interactive tool descriptions ----
const TOOL_DESCRIPTIONS = {
    clawplanops_parse_task_requirements: `解析任务通知文本，提取结构化信息。

何时使用：用户提供了一段比赛通知、作业要求、或项目说明文本时。
输出：包含 task_name、deadline、deliverables、constraints 的 JSON。

注意：在对话流程中，你应该自己解析文本（LLM 能力更强），不要调用此工具。此工具仅用于 CLI 备用。`,
    clawplanops_build_deliverable_plan: `根据任务要求生成交付物计划和微任务。

何时使用：用户确认了任务信息后，生成详细的执行计划。
输入：task_requirements（从解析步骤获得）、可选的 available_days、daily_available_hours。
输出：包含 phases、deliverables、micro_tasks 的完整计划。

交互流程：
1. 确认用户已提供截止时间和交付物
2. 调用此工具生成计划
3. 用表格展示阶段划分
4. 询问用户是否需要调整`,
    clawplanops_generate_calendar_schedule: `生成 .ics 日历文件，包含 VALARM 提醒。

何时使用：用户确认计划后，导出日历。
输入：micro_tasks、start_date、deadline、可选的 preferred_work_time。
输出：日历文件路径和事件数量。

交互流程：
1. 询问用户偏好的工作时间段（默认 20:00-22:00）
2. 调用此工具生成日历
3. 告知文件位置和导入方法`,
    clawplanops_check_progress_evidence: `扫描项目目录，检查文件证据和 Git 提交，计算进度百分比。

何时使用：用户想了解项目当前状态时。
输入：project_path。
输出：progress_percent、risk_level、completed、missing。

交互流程：
1. 确认项目路径
2. 调用此工具检查进度
3. 用进度条和表格展示结果
4. 给出下一步建议`,
    clawplanops_generate_daily_progress_report: `生成每日进度报告，显示今日计划和下一步行动。

何时使用：用户问"今天该做什么"时。
输入：project_path、plan、schedule。
输出：planned_today、next_actions。

交互流程：
1. 调用此工具
2. 展示今日任务列表
3. 建议优先级`,
    clawplanops_reschedule_plan: `根据进度落后情况生成重排建议。

何时使用：进度检查显示落后时。
输入：progress_report、original_plan、deadline。
输出：delay_days、priority_tasks、removed_tasks、advice。

交互流程：
1. 调用此工具
2. 展示重排建议
3. 询问用户是否接受建议`,
    clawplanops_generate_weekly_report: `生成周报，包含完成任务、Git 提交、下周重点。

何时使用：用户要求生成周报或总结本周工作时。
输入：project_path、plan。
输出：completed_tasks、git_commits、next_week_focus。

交互流程：
1. 调用此工具
2. 用表格展示本周完成
3. 展示 Git 提交记录
4. 给出下周建议`,
    clawplanops_pre_submission_check: `提交前检查，验证所有材料是否齐全。

何时使用：用户准备提交材料前。
输入：project_path、plan。
输出：ready、score、checks、missing_files。

交互流程：
1. 调用此工具
2. 用表格展示检查结果
3. 标注缺失项
4. 建议补全顺序`,
    clawplanops_multi_project_status: `查看所有并行项目的状态概览。

何时使用：用户管理多个项目时。
输入：project_path。
输出：total_projects、projects_summary。

交互流程：
1. 调用此工具
2. 用表格展示所有项目
3. 询问用户要切换到哪个项目`,
    clawplanops_git_task_link: `分析 Git 提交与任务的关联关系。

何时使用：用户想了解代码提交和任务的对应关系时。
输入：project_path、plan。
输出：task_links、unlinked_commits、coverage_percent。

交互流程：
1. 调用此工具
2. 展示关联覆盖率
3. 列出已关联和未关联的提交`,
    clawplanops_progress_trend: `分析进度趋势，计算日均进度和预计完成时间。

何时使用：用户想了解进度趋势时。
输入：project_path。
输出：trend_direction、avg_daily_progress、estimated_completion_date。

交互流程：
1. 调用此工具
2. 展示趋势方向（上升/下降/平稳）
3. 展示预计完成时间`,
    clawplanops_send_notification: `发送系统通知提醒。

何时使用：用户想发送提醒时。
输入：title、message。
输出：success、method。

交互流程：
1. 确认标题和消息
2. 调用此工具
3. 确认发送成功`,
    clawplanops_cross_platform_calendar: `跨平台日历导入（自动检测系统）。

何时使用：用户想导入日历到系统日历应用时。
输入：events。
输出：success、platform、method。

交互流程：
1. 调用此工具
2. 告知检测到的系统和导入方式
3. 确认导入结果`,
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
            };
            // Register tools if api.registerTool is available
            if (api.registerTool) {
                for (const [name, impl] of Object.entries(toolRegistry)) {
                    api.registerTool({
                        name,
                        description: TOOL_DESCRIPTIONS[name] || '',
                        parameters: { type: 'object' },
                        async execute(_id, params) {
                            try {
                                const result = impl(params);
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
                    });
                }
                logger?.info?.(`[claw-planops] Registered ${Object.keys(toolRegistry).length} interactive tools`);
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