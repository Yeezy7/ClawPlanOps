"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGitTaskMarkdown = void 0;
exports.gitTaskLinkTool = gitTaskLinkTool;
const gitTaskLink_1 = require("../evidence/gitTaskLink");
Object.defineProperty(exports, "generateGitTaskMarkdown", { enumerable: true, get: function () { return gitTaskLink_1.generateGitTaskMarkdown; } });
function gitTaskLinkTool(params) {
    const commits = (0, gitTaskLink_1.getRecentCommits)(params.project_path, params.days || 30);
    const report = (0, gitTaskLink_1.linkCommitsToTasks)(commits, params.plan.micro_tasks);
    report.project_path = params.project_path;
    return report;
}
//# sourceMappingURL=gitTaskLink.js.map