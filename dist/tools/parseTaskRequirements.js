"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaskRequirements = parseTaskRequirements;
const taskParser_1 = require("../planner/taskParser");
const urlFetcher_1 = require("../planner/urlFetcher");
const validation_1 = require("../utils/validation");
/**
 * Parse task requirements from text or URL content.
 * When input_type is 'url', fetches the URL content first, then parses it.
 */
async function parseTaskRequirements(params) {
    (0, validation_1.validateParseParams)(params);
    let content = params.content;
    const inputType = params.input_type ?? 'text';
    if (inputType === 'url') {
        content = await (0, urlFetcher_1.fetchURLContent)(params.content);
    }
    return (0, taskParser_1.parseTaskRequirements)(content, inputType);
}
//# sourceMappingURL=parseTaskRequirements.js.map