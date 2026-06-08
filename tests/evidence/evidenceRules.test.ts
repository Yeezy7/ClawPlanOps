import { describe, it, expect } from 'vitest';
import { DEFAULT_EVIDENCE_RULES, mergeRules } from '../../src/evidence/evidenceRules';
import type { EvidenceRule } from '../../src/types';

describe('DEFAULT_EVIDENCE_RULES', () => {
  it('should have 12 rules', () => {
    expect(DEFAULT_EVIDENCE_RULES).toHaveLength(12);
  });

  it('should have weights summing to 100', () => {
    const totalWeight = DEFAULT_EVIDENCE_RULES.reduce((sum, r) => sum + r.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('should have unique IDs', () => {
    const ids = DEFAULT_EVIDENCE_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid check types', () => {
    const validTypes = ['file_exists', 'file_not_empty', 'directory_exists', 'file_modified_recently'];
    for (const rule of DEFAULT_EVIDENCE_RULES) {
      expect(validTypes).toContain(rule.check_type);
    }
  });

  it('should have non-empty file_patterns', () => {
    for (const rule of DEFAULT_EVIDENCE_RULES) {
      expect(rule.file_patterns.length).toBeGreaterThan(0);
    }
  });
});

describe('mergeRules', () => {
  it('should return defaults when no user rules provided', () => {
    const merged = mergeRules([]);
    expect(merged).toEqual(DEFAULT_EVIDENCE_RULES);
  });

  it('should add user rules with new IDs', () => {
    const userRule: EvidenceRule = {
      id: 'CUSTOM-001',
      description: 'Custom rule',
      file_patterns: ['custom.txt'],
      check_type: 'file_exists',
      weight: 5,
      deliverable_id: 'DEL-01',
    };
    const merged = mergeRules([userRule]);
    expect(merged.length).toBe(DEFAULT_EVIDENCE_RULES.length + 1);
    expect(merged.find((r) => r.id === 'CUSTOM-001')).toBeDefined();
  });

  it('should override existing rules with same ID', () => {
    const override: EvidenceRule = {
      id: 'E-001',
      description: 'Overridden description',
      file_patterns: ['custom.json'],
      check_type: 'file_exists',
      weight: 20,
      deliverable_id: 'DEL-01',
    };
    const merged = mergeRules([override]);
    const rule = merged.find((r) => r.id === 'E-001');
    expect(rule!.description).toBe('Overridden description');
    expect(rule!.weight).toBe(20);
    expect(merged.length).toBe(DEFAULT_EVIDENCE_RULES.length);
  });
});
