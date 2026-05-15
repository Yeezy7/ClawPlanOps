import type { TaskRequirements, InputType } from '../types';
interface ParseParams {
    content: string;
    input_type?: InputType;
}
/**
 * Parse task requirements from text or URL content.
 * When input_type is 'url', fetches the URL content first, then parses it.
 */
export declare function parseTaskRequirements(params: ParseParams): Promise<TaskRequirements>;
export {};
//# sourceMappingURL=parseTaskRequirements.d.ts.map