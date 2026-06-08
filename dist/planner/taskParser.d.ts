import type { TaskRequirements, InputType } from '../types';
/**
 * Parse task requirements from raw text using rule-based keyword matching.
 *
 * Strategy: broad patterns + keyword proximity instead of exhaustive format matching.
 * For complex/unusual formats, the embedding LLM (OpenClaw) provides fallback understanding.
 */
export declare function parseTaskRequirements(content: string, _inputType?: InputType): TaskRequirements;
export declare function calcAvailableDays(deadlineISO: string): number;
//# sourceMappingURL=taskParser.d.ts.map