import type { EvidenceRule } from '../types';
/**
 * Project-level configuration interface.
 */
export interface ProjectConfig {
    /** Project name */
    name?: string;
    /** Preferred daily work time range, e.g. "20:00-22:00" */
    preferred_work_time?: string;
    /** Daily available hours */
    daily_available_hours?: number;
    /** Custom evidence rules */
    evidence_rules?: EvidenceRule[];
    /** Files/patterns to exclude from scanning */
    exclude_patterns?: string[];
    /** Output directory for generated files */
    output_dir?: string;
    /** Default deadline (YYYY-MM-DD) */
    default_deadline?: string;
    /** Deliverable templates to merge with defaults */
    deliverables?: Record<string, {
        sub_tasks: string[];
        evidence: string[];
    }>;
}
/**
 * Load project configuration from the project directory.
 * Searches for .planopsrc.json, .planops.json, planops.json in order.
 * Returns default config if no config file found.
 */
export declare function loadProjectConfig(projectPath: string): ProjectConfig;
/**
 * Merge project config with defaults.
 */
export declare function resolveConfig(projectPath: string, overrides?: Partial<ProjectConfig>): Required<Omit<ProjectConfig, 'evidence_rules' | 'deliverables' | 'exclude_patterns'>> & {
    evidence_rules: EvidenceRule[];
    deliverables: Record<string, {
        sub_tasks: string[];
        evidence: string[];
    }>;
    exclude_patterns: string[];
};
/**
 * Generate a template .planopsrc.json file.
 */
export declare function generateConfigTemplate(): ProjectConfig;
//# sourceMappingURL=projectConfig.d.ts.map