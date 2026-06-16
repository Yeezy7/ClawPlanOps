import type { TaskRequirements, DeliverablePlan, ProgressReport, CalendarResult } from '../types';
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
export declare function loadMultiProjectState(projectPath: string): MultiProjectState;
export declare function saveMultiProjectState(projectPath: string, state: MultiProjectState): void;
export declare function addProject(projectPath: string, name: string, noticeText: string, projectDir: string): ProjectEntry;
export declare function switchProject(projectPath: string, projectId: string): ProjectEntry | null;
export declare function getActiveProject(projectPath: string): ProjectEntry | null;
export declare function listProjects(projectPath: string): ProjectEntry[];
export declare function removeProject(projectPath: string, projectId: string): boolean;
export declare function getOverallStatus(projectPath: string): {
    total_projects: number;
    projects_summary: Array<{
        id: string;
        name: string;
        progress: number;
        risk_level: string;
        deadline: string;
    }>;
};
//# sourceMappingURL=multiProject.d.ts.map