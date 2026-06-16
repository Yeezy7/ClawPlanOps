import * as fs from 'fs';
import * as path from 'path';
import type { TaskRequirements, DeliverablePlan, ProgressReport, CalendarResult } from '../types';
import { buildDeliverablePlan } from '../planner/deliverablePlanner';
import { generateCalendarSchedule } from '../calendar/icsExporter';
import { checkProgressEvidence } from '../tools/checkProgressEvidence';
import { parseTaskRequirements } from '../planner/taskParser';

export interface ProjectEntry {
  id: string;
  name: string;
  project_path: string;
  task_requirements: TaskRequirements;
  plan: DeliverablePlan;
  calendar?: CalendarResult;
  progress?: ProgressReport;
  created_at: string;
  updated_at: string;
}

export interface MultiProjectState {
  projects: ProjectEntry[];
  active_project_id?: string;
}

const STATE_FILE = '.clawplanops/projects.json';

export function loadMultiProjectState(projectPath: string): MultiProjectState {
  const statePath = path.join(projectPath, STATE_FILE);
  if (!fs.existsSync(statePath)) {
    return { projects: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch {
    return { projects: [] };
  }
}

export function saveMultiProjectState(projectPath: string, state: MultiProjectState): void {
  const stateDir = path.join(projectPath, STATE_FILE);
  const dir = path.dirname(stateDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(stateDir, JSON.stringify(state, null, 2), 'utf-8');
}

export function addProject(
  projectPath: string,
  name: string,
  noticeText: string,
  projectDir: string
): ProjectEntry {
  const state = loadMultiProjectState(projectPath);
  const id = `proj_${Date.now().toString(36)}`;

  const reqs = parseTaskRequirements(noticeText);
  const plan = buildDeliverablePlan(
    reqs,
    undefined,
    undefined,
    undefined
  );
  const progress = checkProgressEvidence({ project_path: projectDir });

  const entry: ProjectEntry = {
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

export function switchProject(projectPath: string, projectId: string): ProjectEntry | null {
  const state = loadMultiProjectState(projectPath);
  const project = state.projects.find((p) => p.id === projectId);
  if (!project) return null;
  state.active_project_id = projectId;
  saveMultiProjectState(projectPath, state);
  return project;
}

export function getActiveProject(projectPath: string): ProjectEntry | null {
  const state = loadMultiProjectState(projectPath);
  if (!state.active_project_id) return state.projects[0] || null;
  return state.projects.find((p) => p.id === state.active_project_id) || null;
}

export function listProjects(projectPath: string): ProjectEntry[] {
  return loadMultiProjectState(projectPath).projects;
}

export function removeProject(projectPath: string, projectId: string): boolean {
  const state = loadMultiProjectState(projectPath);
  const idx = state.projects.findIndex((p) => p.id === projectId);
  if (idx < 0) return false;
  state.projects.splice(idx, 1);
  if (state.active_project_id === projectId) {
    state.active_project_id = state.projects[0]?.id;
  }
  saveMultiProjectState(projectPath, state);
  return true;
}

export function getOverallStatus(projectPath: string): {
  total_projects: number;
  projects_summary: Array<{
    id: string;
    name: string;
    progress: number;
    risk_level: string;
    deadline: string;
  }>;
} {
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
