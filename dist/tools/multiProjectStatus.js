"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = void 0;
exports.multiProjectStatusTool = multiProjectStatusTool;
const multiProject_1 = require("../config/multiProject");
Object.defineProperty(exports, "listProjects", { enumerable: true, get: function () { return multiProject_1.listProjects; } });
function multiProjectStatusTool(params) {
    return (0, multiProject_1.getOverallStatus)(params.project_path);
}
//# sourceMappingURL=multiProjectStatus.js.map