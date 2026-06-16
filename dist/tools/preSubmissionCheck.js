"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportPreSubmissionMarkdown = void 0;
exports.preSubmissionCheckTool = preSubmissionCheckTool;
const preSubmissionCheck_1 = require("../report/preSubmissionCheck");
Object.defineProperty(exports, "exportPreSubmissionMarkdown", { enumerable: true, get: function () { return preSubmissionCheck_1.exportPreSubmissionMarkdown; } });
function preSubmissionCheckTool(params) {
    return (0, preSubmissionCheck_1.runPreSubmissionCheck)({
        project_path: params.project_path,
        plan: params.plan,
    });
}
//# sourceMappingURL=preSubmissionCheck.js.map