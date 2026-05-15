import type { TaskRequirements, InputType } from '../types';
/**
 * Parse task requirements from raw text using rule-based keyword matching.
 */
export declare function parseTaskRequirements(content: string, _inputType?: InputType): TaskRequirements;
/**
 * Calculate available days between now and a deadline.
 */
export declare function calcAvailableDays(deadlineISO: string): number;
//# sourceMappingURL=taskParser.d.ts.map