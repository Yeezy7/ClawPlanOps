"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGitEvidence = checkGitEvidence;
const child_process_1 = require("child_process");
/**
 * Collect Git evidence results for the given project path.
 * Returns empty array if the directory is not a git repository.
 */
function checkGitEvidence(projectPath, customRules) {
    if (!isGitRepo(projectPath)) {
        return [
            {
                rule_id: 'GIT-000',
                description: 'Git 仓库检测',
                passed: false,
                detail: '项目不是 Git 仓库，跳过 Git 证据检查',
                weight: 0,
            },
        ];
    }
    const rules = customRules && customRules.length > 0
        ? customRules
        : getDefaultGitRules();
    return rules.map((rule) => checkGitRule(projectPath, rule));
}
// ---- default rules --------------------------------------------
function getDefaultGitRules() {
    return [
        {
            id: 'GIT-001',
            description: '最近 24 小时有 Git 提交',
            file_patterns: [],
            check_type: 'recent_commits',
            weight: 10,
            deliverable_id: 'ANY',
            within_days: 1,
            min_count: 1,
        },
        {
            id: 'GIT-002',
            description: '最近 7 天至少有 3 次提交',
            file_patterns: [],
            check_type: 'recent_commits',
            weight: 8,
            deliverable_id: 'ANY',
            within_days: 7,
            min_count: 3,
        },
        {
            id: 'GIT-003',
            description: '项目总提交数不少于 5 次',
            file_patterns: [],
            check_type: 'commit_count',
            weight: 7,
            deliverable_id: 'ANY',
            min_count: 5,
        },
    ];
}
// ---- rule checkers --------------------------------------------
function checkGitRule(projectPath, rule) {
    try {
        switch (rule.check_type) {
            case 'recent_commits':
                return checkRecentCommits(projectPath, rule);
            case 'commit_count':
                return checkCommitCount(projectPath, rule);
            case 'specific_file_committed':
                return checkSpecificFile(projectPath, rule);
            default:
                return fail(rule, `未知 Git 检查类型: ${rule.check_type}`);
        }
    }
    catch (err) {
        return fail(rule, `Git 检查出错: ${err.message}`);
    }
}
function checkRecentCommits(projectPath, rule) {
    const days = rule.within_days ?? 1;
    const minCount = rule.min_count ?? 1;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);
    const output = git(projectPath, [
        'log',
        '--oneline',
        `--since=${sinceStr}`,
        '--',
        '.',
    ]);
    const commits = output.trim().split('\n').filter((l) => l.trim());
    const count = commits.length;
    if (count >= minCount) {
        return {
            rule_id: rule.id,
            description: rule.description,
            passed: true,
            detail: `最近 ${days} 天内有 ${count} 次提交（要求 ≥ ${minCount}）`,
            weight: rule.weight,
        };
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: `最近 ${days} 天内仅有 ${count} 次提交（要求 ≥ ${minCount}）`,
        weight: rule.weight,
    };
}
function checkCommitCount(projectPath, rule) {
    const minCount = rule.min_count ?? 5;
    const output = git(projectPath, ['rev-list', '--count', 'HEAD']);
    const count = parseInt(output.trim(), 10) || 0;
    if (count >= minCount) {
        return {
            rule_id: rule.id,
            description: rule.description,
            passed: true,
            detail: `仓库共有 ${count} 次提交（要求 ≥ ${minCount}）`,
            weight: rule.weight,
        };
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: `仓库仅有 ${count} 次提交（要求 ≥ ${minCount}）`,
        weight: rule.weight,
    };
}
function checkSpecificFile(projectPath, rule) {
    const file = rule.target_file;
    if (!file)
        return fail(rule, '未指定目标文件');
    const output = git(projectPath, ['log', '--oneline', '--', file]);
    const commits = output.trim().split('\n').filter((l) => l.trim());
    if (commits.length > 0) {
        return {
            rule_id: rule.id,
            description: rule.description,
            passed: true,
            detail: `${file} 有 ${commits.length} 次提交记录`,
            weight: rule.weight,
        };
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: `${file} 无提交记录`,
        weight: rule.weight,
    };
}
// ---- helpers --------------------------------------------------
function isGitRepo(projectPath) {
    try {
        git(projectPath, ['rev-parse', '--git-dir']);
        return true;
    }
    catch {
        return false;
    }
}
function git(cwd, args) {
    return (0, child_process_1.execSync)(`git ${args.join(' ')}`, {
        cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 10000,
    });
}
function fail(rule, detail) {
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail,
        weight: 0,
    };
}
//# sourceMappingURL=gitEvidence.js.map