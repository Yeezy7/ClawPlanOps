import type { TaskRequirements, InputType } from '../types';
interface ParseParams {
    content: string;
    input_type?: InputType;
    /** Pass a function that sends a prompt to an LLM and returns the response. Enables AI-powered parsing. */
    callLLM?: (prompt: string) => Promise<string>;
}
/**
 * Parse task requirements from text or URL content.
 *
 * - If `callLLM` is provided → AI-powered parsing (handles ANY text format)
 * - If `input_type` is 'url' → fetches URL content first, then parses
 * - Otherwise → regex-based parsing (fast, offline, best-effort)
 */
export declare function parseTaskRequirements(params: ParseParams): Promise<TaskRequirements>;
export {};
//# sourceMappingURL=parseTaskRequirements.d.ts.map