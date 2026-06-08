import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { scanEvidence } from '../../src/evidence/fileScanner';
import type { EvidenceRule } from '../../src/types';

const testDir = path.join(__dirname, '../test_project');

beforeAll(() => {
  // Create a test project structure
  fs.mkdirSync(testDir, { recursive: true });
  fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(testDir, 'package.json'), '{"name":"test"}');
  fs.writeFileSync(path.join(testDir, 'README.md'), '# Test Project');
  fs.writeFileSync(path.join(testDir, 'src', 'index.ts'), 'export default {}');
  fs.mkdirSync(path.join(testDir, 'empty-dir'), { recursive: true });
});

afterAll(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('scanEvidence', () => {
  it('should pass for existing files', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-001',
        description: 'package.json exists',
        file_patterns: ['package.json'],
        check_type: 'file_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(true);
    expect(results[0].detail).toContain('package.json');
  });

  it('should fail for missing files', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-002',
        description: 'missing file',
        file_patterns: ['nonexistent.txt'],
        check_type: 'file_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    expect(results[0].passed).toBe(false);
  });

  it('should check file_not_empty correctly', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-003',
        description: 'README not empty',
        file_patterns: ['README.md'],
        check_type: 'file_not_empty',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    expect(results[0].passed).toBe(true);
    expect(results[0].detail).toContain('bytes');
  });

  it('should check directory_exists correctly', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-004',
        description: 'src dir exists',
        file_patterns: ['src/'],
        check_type: 'directory_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    expect(results[0].passed).toBe(true);
  });

  it('should check file_modified_recently', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-005',
        description: 'recently modified',
        file_patterns: ['**/*'],
        check_type: 'file_modified_recently',
        weight: 5,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    expect(results[0].passed).toBe(true);
  });

  it('should handle wildcard glob patterns', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-006',
        description: 'ts files',
        file_patterns: ['*.ts'],
        check_type: 'file_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    expect(results[0].passed).toBe(true);
  });

  it('should handle nonexistent project path', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-007',
        description: 'test',
        file_patterns: ['test.txt'],
        check_type: 'file_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence('/nonexistent/path', rules);
    expect(results[0].passed).toBe(false);
    expect(results[0].detail).toContain('不存在');
  });

  it('should handle multiple patterns (OR logic)', () => {
    const rules: EvidenceRule[] = [
      {
        id: 'T-008',
        description: 'doc files',
        file_patterns: ['*.docx', '*.pdf', 'README.md'],
        check_type: 'file_exists',
        weight: 10,
        deliverable_id: 'DEL-01',
      },
    ];
    const results = scanEvidence(testDir, rules);
    // README.md matches even though *.docx and *.pdf don't
    expect(results[0].passed).toBe(true);
  });
});
