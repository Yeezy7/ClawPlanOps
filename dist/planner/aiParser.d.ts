import type { TaskRequirements } from '../types';
/**
 * AI-powered task parser.
 *
 * Instead of regex-matching every possible text pattern (impossible),
 * we use a structured prompt that any LLM can follow to extract
 * task_name, deadline, deliverables, constraints, submission_rules.
 *
 * The caller provides a `callLLM` function – in OpenClaw this is the
 * built-in model, in CLI mode it can be any API-compatible backend.
 */
export interface AIParseOptions {
    /** The raw notice text or URL content */
    content: string;
    /** Function that sends prompt to LLM and returns the response text */
    callLLM: (prompt: string) => Promise<string>;
}
/**
 * Parse task requirements using an LLM.
 * The AI handles all the text understanding; we just provide the prompt template.
 */
export declare function aiParseTaskRequirements(options: AIParseOptions): Promise<TaskRequirements>;
//# sourceMappingURL=aiParser.d.ts.map