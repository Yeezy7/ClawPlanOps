/**
 * Input validation utilities for all tool functions.
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate that a value is a non-empty string.
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string
): ValidationError | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} 必须是非空字符串`,
    };
  }
  return null;
}

/**
 * Validate that a value is a valid date string (YYYY-MM-DD).
 */
export function validateDateString(
  value: unknown,
  fieldName: string
): ValidationError | null {
  if (typeof value !== 'string') {
    return { field: fieldName, message: `${fieldName} 必须是日期字符串` };
  }
  // Accept ISO format or YYYY-MM-DD
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return {
      field: fieldName,
      message: `${fieldName} 不是有效的日期格式，请使用 YYYY-MM-DD`,
    };
  }
  return null;
}

/**
 * Validate that a value is a positive number.
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string
): ValidationError | null {
  if (typeof value !== 'number' || value <= 0 || !isFinite(value)) {
    return {
      field: fieldName,
      message: `${fieldName} 必须是正数`,
    };
  }
  return null;
}

/**
 * Validate that a value is a non-empty array.
 */
export function validateNonEmptyArray(
  value: unknown,
  fieldName: string
): ValidationError | null {
  if (!Array.isArray(value) || value.length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} 必须是非空数组`,
    };
  }
  return null;
}

/**
 * Validate that an object has all required fields.
 */
export function validateRequiredFields(
  obj: Record<string, unknown>,
  requiredFields: string[]
): ValidationError[] {
  return requiredFields
    .filter((field) => obj[field] === undefined || obj[field] === null)
    .map((field) => ({
      field,
      message: `缺少必需字段: ${field}`,
    }));
}

/**
 * Collect all validation errors and throw if any exist.
 */
export function assertValid(
  errors: (ValidationError | null)[],
  context: string = ''
): void {
  const actual = errors.filter((e): e is ValidationError => e !== null);
  if (actual.length > 0) {
    const prefix = context ? `${context}: ` : '';
    const messages = actual.map((e) => `  - ${e.field}: ${e.message}`).join('\n');
    throw new Error(`${prefix}参数校验失败:\n${messages}`);
  }
}

/**
 * Validate parse_task_requirements parameters.
 */
export function validateParseParams(params: {
  content: string;
  input_type?: string;
}): void {
  const errors: (ValidationError | null)[] = [
    validateNonEmptyString(params.content, 'content'),
  ];
  if (params.input_type && !['text', 'url'].includes(params.input_type)) {
    errors.push({
      field: 'input_type',
      message: 'input_type 只能是 "text" 或 "url"',
    });
  }
  assertValid(errors, 'parse_task_requirements');
}

/**
 * Validate build_deliverable_plan parameters.
 */
export function validateBuildPlanParams(params: {
  task_requirements: unknown;
  available_days?: number;
  daily_available_hours?: number;
}): void {
  const errors: (ValidationError | null)[] = [];
  if (!params.task_requirements || typeof params.task_requirements !== 'object') {
    errors.push({
      field: 'task_requirements',
      message: 'task_requirements 必须是有效对象',
    });
  }
  if (params.available_days !== undefined) {
    errors.push(validatePositiveNumber(params.available_days, 'available_days'));
  }
  if (params.daily_available_hours !== undefined) {
    errors.push(
      validatePositiveNumber(params.daily_available_hours, 'daily_available_hours')
    );
  }
  assertValid(errors, 'build_deliverable_plan');
}

/**
 * Validate generate_calendar_schedule parameters.
 */
export function validateCalendarParams(params: {
  micro_tasks: unknown;
  start_date: string;
  deadline: string;
}): void {
  assertValid(
    [
      validateNonEmptyArray(params.micro_tasks, 'micro_tasks'),
      validateDateString(params.start_date, 'start_date'),
      validateDateString(params.deadline, 'deadline'),
    ],
    'generate_calendar_schedule'
  );
}

/**
 * Validate check_progress_evidence parameters.
 */
export function validateCheckProgressParams(params: {
  project_path: string;
}): void {
  assertValid(
    [validateNonEmptyString(params.project_path, 'project_path')],
    'check_progress_evidence'
  );
}

/**
 * Validate reschedule_plan parameters.
 */
export function validateRescheduleParams(params: {
  progress_report: unknown;
  original_plan: unknown;
  deadline: string;
}): void {
  assertValid(
    [
      params.progress_report
        ? null
        : { field: 'progress_report', message: 'progress_report 不能为空' },
      params.original_plan
        ? null
        : { field: 'original_plan', message: 'original_plan 不能为空' },
      validateDateString(params.deadline, 'deadline'),
    ],
    'reschedule_plan'
  );
}
