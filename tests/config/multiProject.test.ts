import { describe, it, expect } from 'vitest';
import { loadMultiProjectState, getOverallStatus } from '../../src/config/multiProject';

describe('multiProject', () => {
  it('should load empty state', () => {
    const state = loadMultiProjectState('/tmp/test_nonexistent');
    expect(state.projects).toEqual([]);
  });

  it('should get overall status', () => {
    const status = getOverallStatus('/tmp/test_nonexistent');
    expect(status.total_projects).toBe(0);
    expect(status.projects_summary).toEqual([]);
  });
});
