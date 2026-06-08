import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadProjectConfig, resolveConfig, generateConfigTemplate } from '../../src/config/projectConfig';

const testDir = path.join(__dirname, '../test_config_project');

beforeAll(() => {
  fs.mkdirSync(testDir, { recursive: true });
});

afterAll(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('loadProjectConfig', () => {
  it('should return empty config when no config file exists', () => {
    const cfg = loadProjectConfig(testDir);
    expect(cfg).toEqual({});
  });

  it('should load .planopsrc.json', () => {
    const configPath = path.join(testDir, '.planopsrc.json');
    fs.writeFileSync(configPath, JSON.stringify({ name: 'test-project', daily_available_hours: 3 }));
    const cfg = loadProjectConfig(testDir);
    expect(cfg.name).toBe('test-project');
    expect(cfg.daily_available_hours).toBe(3);
    fs.unlinkSync(configPath);
  });

  it('should handle malformed JSON gracefully', () => {
    const configPath = path.join(testDir, '.planopsrc.json');
    fs.writeFileSync(configPath, '{ invalid json }');
    const cfg = loadProjectConfig(testDir);
    expect(cfg).toEqual({});
    fs.unlinkSync(configPath);
  });
});

describe('resolveConfig', () => {
  it('should return defaults when no config file', () => {
    const cfg = resolveConfig(testDir);
    expect(cfg.preferred_work_time).toBe('20:00-22:00');
    expect(cfg.daily_available_hours).toBe(2);
    expect(cfg.output_dir).toBe('./output');
    expect(Array.isArray(cfg.exclude_patterns)).toBe(true);
  });

  it('should merge config file values', () => {
    const configPath = path.join(testDir, '.planopsrc.json');
    fs.writeFileSync(configPath, JSON.stringify({
      preferred_work_time: '09:00-12:00',
      daily_available_hours: 4,
      deliverables: {
        '自定义文档': { sub_tasks: ['写初稿'], evidence: ['doc.md'] },
      },
    }));
    const cfg = resolveConfig(testDir);
    expect(cfg.preferred_work_time).toBe('09:00-12:00');
    expect(cfg.daily_available_hours).toBe(4);
    expect(cfg.deliverables['自定义文档']).toBeDefined();
    fs.unlinkSync(configPath);
  });

  it('should allow overrides to take precedence', () => {
    const cfg = resolveConfig(testDir, { daily_available_hours: 8 });
    expect(cfg.daily_available_hours).toBe(8);
  });
});

describe('generateConfigTemplate', () => {
  it('should return a valid config object', () => {
    const template = generateConfigTemplate();
    expect(template.name).toBeTruthy();
    expect(template.preferred_work_time).toBeTruthy();
    expect(template.daily_available_hours).toBeGreaterThan(0);
    expect(template.evidence_rules!.length).toBeGreaterThan(0);
    expect(template.deliverables).toBeDefined();
  });
});
