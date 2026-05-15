"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProgress = checkProgress;
const evidenceRules_1 = require("./evidenceRules");
const fileScanner_1 = require("./fileScanner");
const gitEvidence_1 = require("./gitEvidence");
/**
 * Check progress by scanning a project directory against evidence rules.
 * Also includes Git commit history as evidence.
 * Returns a ProgressReport with percentage, completed/missing items, and risk level.
 */
function checkProgress(projectPath, customRules = []) {
    const rules = (0, evidenceRules_1.mergeRules)(customRules);
    const fileResults = (0, fileScanner_1.scanEvidence)(projectPath, rules);
    // Also check Git evidence
    const gitResults = (0, gitEvidence_1.checkGitEvidence)(projectPath);
    const activeGitResults = gitResults.filter((r) => r.weight > 0);
    // Merge all results
    const allResults = [...fileResults, ...activeGitResults];
    const completed = allResults.filter((r) => r.passed);
    const missing = allResults.filter((r) => !r.passed);
    // Calculate weighted progress
    const totalWeight = allResults.reduce((sum, r) => sum + r.weight, 0);
    const completedWeight = completed.reduce((sum, r) => sum + r.weight, 0);
    const progressPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    // Identify risks based on specific missing evidence
    const risks = identifyRisks(missing);
    const riskLevel = calculateRiskLevel(progressPercent, missing);
    return {
        progress_percent: progressPercent,
        completed,
        missing,
        risks,
        risk_level: riskLevel,
        scanned_path: projectPath,
        scanned_at: new Date().toISOString(),
    };
}
// ---- private helpers -----------------------------------------
function identifyRisks(missing) {
    const risks = [];
    const criticalMissing = missing.filter((r) => r.weight >= 10);
    if (criticalMissing.length > 0) {
        risks.push(`关键缺失项 (${criticalMissing.length}): ${criticalMissing
            .map((r) => r.description)
            .join('; ')}`);
    }
    if (missing.length > 5) {
        risks.push(`缺失项过多 (${missing.length} 项未完成)，建议集中补全`);
    }
    const hasCode = missing.some((r) => ['E-005', 'E-006'].includes(r.rule_id));
    if (hasCode) {
        risks.push('核心代码文件缺失，项目尚未启动或结构不完整');
    }
    const noDoc = missing.some((r) => r.rule_id === 'E-004');
    if (noDoc) {
        risks.push('README.md 缺失，建议优先完成项目文档');
    }
    // Git-related risks
    const noGit = missing.some((r) => r.rule_id === 'GIT-000');
    if (noGit) {
        risks.push('项目未使用 Git 版本控制，建议初始化 Git 仓库以跟踪进度');
    }
    const noRecentCommits = missing.some((r) => r.rule_id === 'GIT-001');
    if (noRecentCommits) {
        risks.push('最近 24 小时无 Git 提交，开发活动可能停滞');
    }
    return risks;
}
function calculateRiskLevel(percent, missing) {
    const missingHighWeight = missing.filter((r) => r.weight >= 10).length;
    if (percent < 25 || missingHighWeight >= 5)
        return 'critical';
    if (percent < 50 || missingHighWeight >= 3)
        return 'high';
    if (percent < 75 || missing.length >= 4)
        return 'medium';
    return 'low';
}
//# sourceMappingURL=progressScorer.js.map