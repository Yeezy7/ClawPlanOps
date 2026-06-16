import { getOverallStatus, listProjects } from '../config/multiProject';
import type { MultiProjectState } from '../types';

interface MultiProjectParams {
  project_path: string;
}

export function multiProjectStatusTool(params: MultiProjectParams): {
  total_projects: number;
  projects_summary: Array<{
    id: string;
    name: string;
    progress: number;
    risk_level: string;
    deadline: string;
  }>;
} {
  return getOverallStatus(params.project_path);
}

export { listProjects };
