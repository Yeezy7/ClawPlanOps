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

const PARSE_PROMPT = `你是一个任务解析器。从以下通知文本中提取结构化信息，返回纯 JSON（不要 markdown 代码块，不要额外解释）。

JSON 格式：
{
  "task_name": "任务/比赛/活动名称（字符串）",
  "deadline": "最终截止时间，ISO 格式 YYYY-MM-DDTHH:mm:ss，如果文本没写时间默认 23:59:00，如果完全没有日期填 '未设置截止时间'",
  "deliverables": ["需要提交/交付的材料列表，每项一句话"],
  "constraints": ["参赛条件、限制规则、注意事项"],
  "submission_rules": ["提交方式、邮箱、文件命名格式等"]
}

规则：
- task_name: 提取完整的比赛/任务名称，去掉"关于举办""的通知"等套话
- deadline: 找作品提交/材料报送的截止时间，不要取报名截止时间。如果同一日有多个时间，取最晚的。
- deliverables: 列出所有需要提交的东西（代码、文档、PPT、视频、申报表等）
- constraints: 参赛资格、人数限制、原创性要求等
- submission_rules: 邮箱地址、提交方式、命名格式、打包要求等

通知文本：
---
{content}
---`;

/**
 * Parse task requirements using an LLM.
 * The AI handles all the text understanding; we just provide the prompt template.
 */
export async function aiParseTaskRequirements(
  options: AIParseOptions
): Promise<TaskRequirements> {
  const prompt = PARSE_PROMPT.replace('{content}', options.content);
  const response = await options.callLLM(prompt);

  // Extract JSON from response (handle markdown code blocks if present)
  const json = extractJSON(response);

  const data = json as Record<string, unknown>;
  return {
    task_name: (data.task_name as string) || '未命名任务',
    deadline: normalizeDeadline(data.deadline as string),
    deliverables: Array.isArray(data.deliverables) ? (data.deliverables as string[]) : [],
    constraints: Array.isArray(data.constraints) ? (data.constraints as string[]) : [],
    submission_rules: Array.isArray(data.submission_rules) ? (data.submission_rules as string[]) : [],
    raw_input: options.content,
  };
}

// ---- helpers -------------------------------------------------

function extractJSON(text: string): Record<string, unknown> {
  // Try to extract from markdown code block
  let m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = m ? m[1].trim() : text.trim();

  // Find the outermost { } pair
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      // continue
    }
  }

  // Last resort: try parsing the whole thing
  try {
    return JSON.parse(candidate);
  } catch {
    return {} as Record<string, unknown>;
  }
}

function normalizeDeadline(deadline: unknown): string {
  if (typeof deadline !== 'string' || !deadline || deadline === '未设置截止时间') {
    return '未设置截止时间';
  }
  // Accept various ISO-like formats
  const m = deadline.match(
    /(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})[日]?[T\s]?(\d{1,2}):?(\d{2})?/
  );
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T${(m[4] || '23').padStart(2, '0')}:${(m[5] || '59').padStart(2, '0')}:00`;
  }
  return deadline;
}
