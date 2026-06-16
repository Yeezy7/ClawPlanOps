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
exports.loadMultiProjectState = loadMultiProjectState;
exports.saveMultiProjectState = saveMultiProjectState;
exports.addProject = addProject;
exports.switchProject = switchProject;
exports.getActiveProject = getActiveProject;
exports.listProjects = listProjects;
exports.removeProject = removeProject;
exports.getOverallStatus = getOverallStatus;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const deliverablePlanner_1 = require("../planner/deliverablePlanner");
const checkProgressEvidence_1 = require("../tools/checkProgressEvidence");
const taskParser_1 = require("../planner/taskParser");
const STATE_FILE = '.clawplanops/projects.json';
function loadMultiProjectState(projectPath) {
    const statePath = path.join(projectPath, STATE_FILE);
    if (!fs.existsSync(statePath)) {
        return { projects: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
    catch {
        return { projects: [] };
    }
}
function saveMultiProjectState(projectPath, state) {
    const stateDir = path.join(projectPath, STATE_FILE);
    const dir = path.dirname(stateDir);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(stateDir, JSON.stringify(state, null, 2), 'utf-8');
}
function addProject(projectPath, name, noticeText, projectDir) {
    const state = loadMultiProjectState(projectPath);
    const id = `proj_${Date.now().toString(36)}`;
    const reqs = (0, taskParser_1.parseTaskRequirements)(noticeText);
    const plan = (0, deliverablePlanner_1.buildDeliverablePlan)(reqs, undefined, undefined, undefined);
    const progress = (0, checkProgressEvidence_1.checkProgressEvidence)({ project_path: projectDir });
    const entry = {
        id,
        name,
        project_path: projectDir,
        task_requirements: reqs,
        plan,
        progress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    state.projects.push(entry);
    state.active_project_id = id;
    saveMultiProjectState(projectPath, state);
    return entry;
}
function switchProject(projectPath, projectId) {
    const state = loadMultiProjectState(projectPath);
    const project = state.projects.find((p) => p.id === projectId);
    if (!project)
        return null;
    state.active_project_id = projectId;
    saveMultiProjectState(projectPath, state);
    return project;
}
function getActiveProject(projectPath) {
    const state = loadMultiProjectState(projectPath);
    if (!state.active_project_id)
        return state.projects[0] || null;
    return state.projects.find((p) => p.id === state.active_project_id) || null;
}
function listProjects(projectPath) {
    return loadMultiProjectState(projectPath).projects;
}
function removeProject(projectPath, projectId) {
    const state = loadMultiProjectState(projectPath);
    const idx = state.projects.findIndex((p) => p.id === projectId);
    if (idx < 0)
        return false;
    state.projects.splice(idx, 1);
    if (state.active_project_id === projectId) {
        state.active_project_id = state.projects[0]?.id;
    }
    saveMultiProjectState(projectPath, state);
    return true;
}
function getOverallStatus(projectPath) {
    const state = loadMultiProjectState(projectPath);
    return {
        total_projects: state.projects.length,
        projects_summary: state.projects.map((p) => ({
            id: p.id,
            name: p.name,
            progress: p.progress?.progress_percent || 0,
            risk_level: p.progress?.risk_level || 'unknown',
            deadline: p.plan.deadline,
        })),
    };
}
//# sourceMappingURL=multiProject.js.map