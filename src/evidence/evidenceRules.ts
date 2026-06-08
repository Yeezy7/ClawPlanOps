import type { EvidenceRule } from '../types';

/**
 * Default evidence rules for a typical OpenClaw plugin project.
 * These rules define what files/directories should exist to prove
 * each deliverable is complete.
 */
export const DEFAULT_EVIDENCE_RULES: EvidenceRule[] = [
  // ---- Project structure evidence ----
  {
    id: 'E-001',
    description: 'package.json 存在',
    file_patterns: ['package.json'],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-01',
  },
  {
    id: 'E-002',
    description: 'tsconfig.json 存在',
    file_patterns: ['tsconfig.json'],
    check_type: 'file_exists',
    weight: 5,
    deliverable_id: 'DEL-01',
  },
  {
    id: 'E-003',
    description: 'openclaw.plugin.json 存在',
    file_patterns: ['openclaw.plugin.json'],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-01',
  },
  {
    id: 'E-004',
    description: 'README.md 存在且非空',
    file_patterns: ['README.md'],
    check_type: 'file_not_empty',
    weight: 10,
    deliverable_id: 'DEL-01',
  },
  {
    id: 'E-005',
    description: 'src/index.ts 存在',
    file_patterns: ['src/index.ts'],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-01',
  },

  // ---- Source code evidence ----
  {
    id: 'E-006',
    description: 'src/tools/ 目录存在且有 .ts 文件',
    file_patterns: ['src/tools/*.ts'],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-01',
  },
  {
    id: 'E-007',
    description: 'src/planner/ 目录存在',
    file_patterns: ['src/planner/'],
    check_type: 'directory_exists',
    weight: 5,
    deliverable_id: 'DEL-01',
  },

  // ---- Documentation evidence ----
  {
    id: 'E-008',
    description: 'examples/ 目录存在',
    file_patterns: ['examples/'],
    check_type: 'directory_exists',
    weight: 5,
    deliverable_id: 'DEL-01',
  },

  // ---- Submission material evidence ----
  {
    id: 'E-009',
    description: '申报书/申报表文件存在',
    file_patterns: [
      '*.docx', '*.doc', '*.pdf',
      '申报表*', '申报书*', '项目申报*',
    ],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-04',
  },
  {
    id: 'E-010',
    description: '答辩 PPT 文件存在',
    file_patterns: ['*.pptx', '*.ppt', '答辩*', '*PPT*', '*ppt*'],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-05',
  },
  {
    id: 'E-011',
    description: '演示视频文件存在',
    file_patterns: ['*.mp4', '*.mov', '*.avi', '演示*', '*demo*', '*视频*'],
    check_type: 'file_exists',
    weight: 10,
    deliverable_id: 'DEL-06',
  },

  // ---- Recent activity evidence ----
  {
    id: 'E-012',
    description: '最近 24 小时内有文件修改',
    file_patterns: ['**/*'],
    check_type: 'file_modified_recently',
    weight: 5,
    deliverable_id: 'DEL-01',
  },
];

/**
 * Merge user-provided rules with defaults.
 * User rules take precedence (override same-id defaults).
 */
export function mergeRules(userRules: EvidenceRule[] = []): EvidenceRule[] {
  if (userRules.length === 0) return DEFAULT_EVIDENCE_RULES;

  const merged = [...DEFAULT_EVIDENCE_RULES];
  for (const ur of userRules) {
    const idx = merged.findIndex((r) => r.id === ur.id);
    if (idx >= 0) {
      merged[idx] = ur;
    } else {
      merged.push(ur);
    }
  }
  return merged;
}
