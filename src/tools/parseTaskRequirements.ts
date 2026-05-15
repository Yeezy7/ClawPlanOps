import { parseTaskRequirements as parse } from '../planner/taskParser';
import { fetchURLContent } from '../planner/urlFetcher';
import { validateParseParams } from '../utils/validation';
import type { TaskRequirements, InputType } from '../types';

interface ParseParams {
  content: string;
  input_type?: InputType;
}

/**
 * Parse task requirements from text or URL content.
 * When input_type is 'url', fetches the URL content first, then parses it.
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

  return parse(content, inputType);
}
