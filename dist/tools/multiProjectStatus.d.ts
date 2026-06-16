import { listProjects } from '../config/multiProject';
interface MultiProjectParams {
    project_path: string;
}
export declare function multiProjectStatusTool(params: MultiProjectParams): {
    total_projects: number;
    projects_summary: Array<{
        id: string;
        name: string;
        progress: number;
        risk_level: string;
        deadline: string;
    }>;
};
export { listProjects };
//# sourceMappingURL=multiProjectStatus.d.ts.map