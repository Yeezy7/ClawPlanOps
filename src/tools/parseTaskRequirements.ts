import { parseTaskRequirements as parseRegex } from '../planner/taskParser';
import { aiParseTaskRequirements } from '../planner/aiParser';
import { fetchURLContent } from '../planner/urlFetcher';
import { validateParseParams } from '../utils/validation';
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
export async function parseTaskRequirements(
  params: ParseParams
): Promise<TaskRequirements> {
  validateParseParams(params);

  let content = params.content;
  const inputType = params.input_type ?? 'text';

  if (inputType === 'url') {
    content = await fetchURLContent(params.content);
  }

  if (params.callLLM) {
    return aiParseTaskRequirements({ content, callLLM: params.callLLM });
  }

  return parseRegex(content, inputType);
}
