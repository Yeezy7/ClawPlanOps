"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProgressEvidence = checkProgressEvidence;
const progressScorer_1 = require("../evidence/progressScorer");
function checkProgressEvidence(params) {
    return (0, progressScorer_1.checkProgress)(params.project_path, params.evidence_rules ?? []);
}
//# sourceMappingURL=checkProgressEvidence.js.map