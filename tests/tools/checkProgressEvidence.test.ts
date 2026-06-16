import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { checkProgressEvidence } from '../../src/tools/checkProgressEvidence';

const testDir = path.join(__dirname, '../test_tool_progress_project');

afterEach(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('checkProgressEvidence', () => {
  it('should load exclude_patterns from project config', () => {
    fs.mkdirSync(path.join(testDir, 'dist'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, '.planopsrc.json'),
      JSON.stringify({ exclude_patterns: ['dist'] })
    );
    fs.writeFileSync(path.join(testDir, 'dist', 'bundle.js'), 'recent build output');

    const report = checkProgressEvidence({
      project_path: testDir,
      evidence_rules: [
        {
          id: 'RECENT',
          description: 'recent non-output files',
          file_patterns: ['**/*'],
          check_type: 'file_modified_recently',
          weight: 100,
          deliverable_id: 'DEL-01',
        },
      ],
    });

    const recentRule = report.missing.find((r) => r.rule_id === 'RECENT');
    expect(recentRule?.passed).toBe(false);
    expect(recentRule?.detail).toBe('最近 24 小时内无文件修改');
  });
});
