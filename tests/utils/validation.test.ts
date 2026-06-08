import { describe, it, expect } from 'vitest';
import {
  validateNonEmptyString,
  validateDateString,
  validatePositiveNumber,
  validateNonEmptyArray,
  validateRequiredFields,
  assertValid,
  validateParseParams,
  validateBuildPlanParams,
  validateCalendarParams,
  validateCheckProgressParams,
  validateRescheduleParams,
} from '../../src/utils/validation';

describe('validateNonEmptyString', () => {
  it('should return null for valid strings', () => {
    expect(validateNonEmptyString('hello', 'field')).toBeNull();
  });

  it('should return error for empty string', () => {
    const err = validateNonEmptyString('', 'field');
    expect(err).not.toBeNull();
    expect(err!.field).toBe('field');
  });

  it('should return error for whitespace-only string', () => {
    expect(validateNonEmptyString('   ', 'field')).not.toBeNull();
  });

  it('should return error for non-string values', () => {
    expect(validateNonEmptyString(123, 'field')).not.toBeNull();
    expect(validateNonEmptyString(null, 'field')).not.toBeNull();
    expect(validateNonEmptyString(undefined, 'field')).not.toBeNull();
  });
});

describe('validateDateString', () => {
  it('should return null for valid date strings', () => {
    expect(validateDateString('2026-06-22', 'date')).toBeNull();
    expect(validateDateString('2026-06-22T12:00:00', 'date')).toBeNull();
  });

  it('should return error for invalid dates', () => {
    expect(validateDateString('not-a-date', 'date')).not.toBeNull();
    expect(validateDateString('', 'date')).not.toBeNull();
  });

  it('should return error for non-strings', () => {
    expect(validateDateString(123, 'date')).not.toBeNull();
  });
});

describe('validatePositiveNumber', () => {
  it('should return null for positive numbers', () => {
    expect(validatePositiveNumber(1, 'num')).toBeNull();
    expect(validatePositiveNumber(0.5, 'num')).toBeNull();
  });

  it('should return error for zero and negative', () => {
    expect(validatePositiveNumber(0, 'num')).not.toBeNull();
    expect(validatePositiveNumber(-1, 'num')).not.toBeNull();
  });

  it('should return error for non-numbers', () => {
    expect(validatePositiveNumber('5', 'num')).not.toBeNull();
  });
});

describe('validateNonEmptyArray', () => {
  it('should return null for non-empty arrays', () => {
    expect(validateNonEmptyArray([1, 2], 'arr')).toBeNull();
  });

  it('should return error for empty arrays', () => {
    expect(validateNonEmptyArray([], 'arr')).not.toBeNull();
  });

  it('should return error for non-arrays', () => {
    expect(validateNonEmptyArray('hello', 'arr')).not.toBeNull();
  });
});

describe('validateRequiredFields', () => {
  it('should return empty array when all fields present', () => {
    const errors = validateRequiredFields({ a: 1, b: 2 }, ['a', 'b']);
    expect(errors).toHaveLength(0);
  });

  it('should return errors for missing fields', () => {
    const errors = validateRequiredFields({ a: 1 }, ['a', 'b', 'c']);
    expect(errors).toHaveLength(2);
    expect(errors.map((e) => e.field)).toEqual(['b', 'c']);
  });
});

describe('assertValid', () => {
  it('should not throw when no errors', () => {
    expect(() => assertValid([null, null])).not.toThrow();
  });

  it('should throw with formatted message', () => {
    expect(() =>
      assertValid([
        null,
        { field: 'name', message: 'required' },
        { field: 'age', message: 'must be positive' },
      ])
    ).toThrow('name');
  });
});

describe('validateParseParams', () => {
  it('should pass for valid params', () => {
    expect(() => validateParseParams({ content: 'hello' })).not.toThrow();
  });

  it('should throw for empty content', () => {
    expect(() => validateParseParams({ content: '' })).toThrow();
  });

  it('should throw for invalid input_type', () => {
    expect(() =>
      validateParseParams({ content: 'hello', input_type: 'invalid' })
    ).toThrow();
  });
});

describe('validateBuildPlanParams', () => {
  it('should pass for valid params', () => {
    expect(() =>
      validateBuildPlanParams({ task_requirements: { task_name: 'test' } })
    ).not.toThrow();
  });

  it('should throw for missing task_requirements', () => {
    expect(() => validateBuildPlanParams({ task_requirements: null })).toThrow();
  });
});

describe('validateCalendarParams', () => {
  it('should pass for valid params', () => {
    expect(() =>
      validateCalendarParams({
        micro_tasks: [{ id: 'T-001' }],
        start_date: '2026-06-01',
        deadline: '2026-06-30',
      })
    ).not.toThrow();
  });

  it('should throw for empty micro_tasks', () => {
    expect(() =>
      validateCalendarParams({
        micro_tasks: [],
        start_date: '2026-06-01',
        deadline: '2026-06-30',
      })
    ).toThrow();
  });
});

describe('validateCheckProgressParams', () => {
  it('should pass for valid path', () => {
    expect(() => validateCheckProgressParams({ project_path: '.' })).not.toThrow();
  });

  it('should throw for empty path', () => {
    expect(() => validateCheckProgressParams({ project_path: '' })).toThrow();
  });
});

describe('validateRescheduleParams', () => {
  it('should pass for valid params', () => {
    expect(() =>
      validateRescheduleParams({
        progress_report: { progress_percent: 50 },
        original_plan: { task_name: 'test' },
        deadline: '2026-06-30',
      })
    ).not.toThrow();
  });

  it('should throw for missing progress_report', () => {
    expect(() =>
      validateRescheduleParams({
        progress_report: null,
        original_plan: { task_name: 'test' },
        deadline: '2026-06-30',
      })
    ).toThrow();
  });
});
