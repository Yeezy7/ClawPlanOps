import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { checkProgress } from '../../src/evidence/progressScorer';

const testDir = path.join(__dirname, '../test_progress_project');

beforeAll(() => {
  fs.mkdirSync(testDir, { recursive: true });
  fs.mkdirSync(path.join(testDir, 'src', 'tools'), { recursive: true });
  fs.mkdirSync(path.join(testDir, 'src', 'planner'), { recursive: true });
  fs.writeFileSync(path.join(testDir, 'package.json'), '{"name":"test"}');
  fs.writeFileSync(path.join(testDir, 'tsconfig.json'), '{}');
  fs.writeFileSync(path.join(testDir, 'openclaw.plugin.json'), '{}');
  fs.writeFileSync(path.join(testDir, 'README.md'), '# Test');
  fs.writeFileSync(path.join(testDir, 'src', 'index.ts'), 'export default {}');
  fs.writeFileSync(path.join(testDir, 'src', 'tools', 'test.ts'), '');
  fs.mkdirSync(path.join(testDir, 'examples'), { recursive: true });
});

afterAll(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('checkProgress', () => {
  it('should return a valid progress report', () => {
    const report = checkProgress(testDir);
    expect(report.progress_percent).toBeGreaterThanOrEqual(0);
    expect(report.progress_percent).toBeLessThanOrEqual(100);
    expect(report.risk_level).toMatch(/^(low|medium|high|critical)$/);
    expect(report.scanned_path).toBe(testDir);
    expect(report.scanned_at).toBeTruthy();
  });

  it('should have completed and missing arrays', () => {
    const report = checkProgress(testDir);
    expect(Array.isArray(report.completed)).toBe(true);
    expect(Array.isArray(report.missing)).toBe(true);
    expect(report.completed.length + report.missing.length).toBeGreaterThan(0);
  });

  it('should calculate weighted progress correctly', () => {
    const report = checkProgress(testDir);
    // Most project structure files exist, so progress should be > 50%
    expect(report.progress_percent).toBeGreaterThan(50);
  });

  it('should identify risks based on missing evidence', () => {
    const report = checkProgress(testDir);
    expect(Array.isArray(report.risks)).toBe(true);
  });

  it('should accept custom rules', () => {
    const customRules = [
      {
        id: 'CUSTOM-001',
        description: 'Custom check',
        file_patterns: ['package.json'],
        check_type: 'file_exists' as const,
        weight: 50,
        deliverable_id: 'DEL-01',
      },
    ];
    const report = checkProgress(testDir, customRules);
    expect(report.progress_percent).toBeGreaterThan(0);
  });
});
