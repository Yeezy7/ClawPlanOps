"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProgressEvidence = checkProgressEvidence;
const progressScorer_1 = require("../evidence/progressScorer");
const projectConfig_1 = require("../config/projectConfig");
function checkProgressEvidence(params) {
    const cfg = (0, projectConfig_1.resolveConfig)(params.project_path, {
        evidence_rules: params.evidence_rules,
        exclude_patterns: params.exclude_patterns,
    });
    return (0, progressScorer_1.checkProgress)(params.project_path, cfg.evidence_rules, cfg.exclude_patterns);
}
//# sourceMappingURL=checkProgressEvidence.js.map