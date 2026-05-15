import * as fs from 'fs';
import * as path from 'path';
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
  deliverables?: Record<string, { sub_tasks: string[]; evidence: string[] }>;
}

const CONFIG_FILE_NAMES = ['.planopsrc.json', '.planops.json', 'planops.json'];

/**
 * Load project configuration from the project directory.
 * Searches for .planopsrc.json, .planops.json, planops.json in order.
 * Returns default config if no config file found.
 */
export function loadProjectConfig(projectPath: string): ProjectConfig {
  for (const name of CONFIG_FILE_NAMES) {
    const configPath = path.join(projectPath, name);
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw) as ProjectConfig;
      } catch (err: any) {
        console.error(`警告: 配置文件 ${name} 解析失败: ${err.message}`);
      }
    }
  }
  return {};
}

/**
 * Merge project config with defaults.
 */
export function resolveConfig(
  projectPath: string,
  overrides?: Partial<ProjectConfig>
): Required<Omit<ProjectConfig, 'evidence_rules' | 'deliverables' | 'exclude_patterns'>> & {
  evidence_rules: EvidenceRule[];
  deliverables: Record<string, { sub_tasks: string[]; evidence: string[] }>;
  exclude_patterns: string[];
} {
  const cfg = loadProjectConfig(projectPath);

  return {
    name: overrides?.name ?? cfg.name ?? path.basename(projectPath),
    preferred_work_time:
      overrides?.preferred_work_time ?? cfg.preferred_work_time ?? '20:00-22:00',
    daily_available_hours:
      overrides?.daily_available_hours ?? cfg.daily_available_hours ?? 2,
    evidence_rules:
      overrides?.evidence_rules ?? cfg.evidence_rules ?? [],
    exclude_patterns:
      overrides?.exclude_patterns ?? cfg.exclude_patterns ?? [
        'node_modules',
        '.git',
        'dist',
        '.claude',
      ],
    output_dir: overrides?.output_dir ?? cfg.output_dir ?? './output',
    default_deadline:
      overrides?.default_deadline ?? cfg.default_deadline ?? '',
    deliverables: overrides?.deliverables ?? cfg.deliverables ?? {},
  };
}

/**
 * Generate a template .planopsrc.json file.
 */
export function generateConfigTemplate(): ProjectConfig {
  return {
    name: 'my-project',
    preferred_work_time: '20:00-22:00',
    daily_available_hours: 2,
    evidence_rules: [
      {
        id: 'CUSTOM-001',
        description: '自定义：检查 src/ 目录',
        file_patterns: ['src/'],
        check_type: 'directory_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ],
    exclude_patterns: ['node_modules', '.git', 'dist'],
    output_dir: './output',
    deliverables: {
      '自定义文档': {
        sub_tasks: ['写初稿', '审核', '定稿'],
        evidence: ['自定义文档.md'],
      },
    },
  };
}
