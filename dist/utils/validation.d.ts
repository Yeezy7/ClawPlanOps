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
export declare function validateNonEmptyString(value: unknown, fieldName: string): ValidationError | null;
/**
 * Validate that a value is a valid date string (YYYY-MM-DD).
 */
export declare function validateDateString(value: unknown, fieldName: string): ValidationError | null;
/**
 * Validate that a value is a positive number.
 */
export declare function validatePositiveNumber(value: unknown, fieldName: string): ValidationError | null;
/**
 * Validate that a value is a non-empty array.
 */
export declare function validateNonEmptyArray(value: unknown, fieldName: string): ValidationError | null;
/**
 * Validate that an object has all required fields.
 */
export declare function validateRequiredFields(obj: Record<string, unknown>, requiredFields: string[]): ValidationError[];
/**
 * Collect all validation errors and throw if any exist.
 */
export declare function assertValid(errors: (ValidationError | null)[], context?: string): void;
/**
 * Validate parse_task_requirements parameters.
 */
export declare function validateParseParams(params: {
    content: string;
    input_type?: string;
}): void;
/**
 * Validate build_deliverable_plan parameters.
 */
export declare function validateBuildPlanParams(params: {
    task_requirements: unknown;
    available_days?: number;
    daily_available_hours?: number;
}): void;
/**
 * Validate generate_calendar_schedule parameters.
 */
export declare function validateCalendarParams(params: {
    micro_tasks: unknown;
    start_date: string;
    deadline: string;
}): void;
/**
 * Validate check_progress_evidence parameters.
 */
export declare function validateCheckProgressParams(params: {
    project_path: string;
}): void;
/**
 * Validate reschedule_plan parameters.
 */
export declare function validateRescheduleParams(params: {
    progress_report: unknown;
    original_plan: unknown;
    deadline: string;
}): void;
//# sourceMappingURL=validation.d.ts.map