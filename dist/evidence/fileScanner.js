"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanEvidence = scanEvidence;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Scan a project directory against evidence rules.
 */
function scanEvidence(projectPath, rules) {
    const results = [];
    const absolutePath = path.resolve(projectPath);
    if (!fs.existsSync(absolutePath)) {
        // All rules fail if directory doesn't exist
        return rules.map((rule) => ({
            rule_id: rule.id,
            description: rule.description,
            passed: false,
            detail: `项目路径不存在: ${absolutePath}`,
            weight: rule.weight,
        }));
    }
    for (const rule of rules) {
        results.push(checkRule(absolutePath, rule));
    }
    return results;
}
// ---- rule checkers -------------------------------------------
function checkRule(projectPath, rule) {
    switch (rule.check_type) {
        case 'file_exists':
            return checkFileExists(projectPath, rule);
        case 'file_not_empty':
            return checkFileNotEmpty(projectPath, rule);
        case 'directory_exists':
            return checkDirectoryExists(projectPath, rule);
        case 'file_modified_recently':
            return checkRecentModification(projectPath, rule);
        default:
            return {
                rule_id: rule.id,
                description: rule.description,
                passed: false,
                detail: `未知检查类型: ${rule.check_type}`,
                weight: rule.weight,
            };
    }
}
function checkFileExists(projectPath, rule) {
    for (const pattern of rule.file_patterns) {
        const matches = findMatches(projectPath, pattern);
        if (matches.length > 0) {
            return {
                rule_id: rule.id,
                description: rule.description,
                passed: true,
                detail: `找到文件: ${matches.join(', ')}`,
                weight: rule.weight,
            };
        }
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: `未找到匹配 "${rule.file_patterns.join(', ')}" 的文件`,
        weight: rule.weight,
    };
}
function checkFileNotEmpty(projectPath, rule) {
    for (const pattern of rule.file_patterns) {
        const matches = findMatches(projectPath, pattern);
        for (const match of matches) {
            const fullPath = path.join(projectPath, match);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isFile() && stat.size > 0) {
                    return {
                        rule_id: rule.id,
                        description: rule.description,
                        passed: true,
                        detail: `${match} 存在且非空 (${stat.size} bytes)`,
                        weight: rule.weight,
                    };
                }
            }
            catch {
                // continue searching
            }
        }
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: `未找到非空的 "${rule.file_patterns.join(', ')}" 文件`,
        weight: rule.weight,
    };
}
function checkDirectoryExists(projectPath, rule) {
    for (const pattern of rule.file_patterns) {
        const clean = pattern.replace(/\/$/, '');
        const dirPath = path.join(projectPath, clean);
        // Try exact match first
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            return {
                rule_id: rule.id,
                description: rule.description,
                passed: true,
                detail: `目录存在: ${clean}`,
                weight: rule.weight,
            };
        }
        // Try glob for directory
        const matches = findMatches(projectPath, pattern);
        for (const match of matches) {
            const full = path.join(projectPath, match);
            try {
                if (fs.statSync(full).isDirectory()) {
                    return {
                        rule_id: rule.id,
                        description: rule.description,
                        passed: true,
                        detail: `目录存在: ${match}`,
                        weight: rule.weight,
                    };
                }
            }
            catch {
                // continue
            }
        }
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: `目录不存在: "${rule.file_patterns.join(', ')}"`,
        weight: rule.weight,
    };
}
function checkRecentModification(projectPath, rule) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - oneDayMs;
    const recentFiles = [];
    walkDir(projectPath, (filePath, stat) => {
        if (stat.mtimeMs > cutoff) {
            recentFiles.push(path.relative(projectPath, filePath));
        }
    });
    if (recentFiles.length > 0) {
        return {
            rule_id: rule.id,
            description: rule.description,
            passed: true,
            detail: `最近修改的文件 (${recentFiles.length}): ${recentFiles.slice(0, 5).join(', ')}`,
            weight: rule.weight,
        };
    }
    return {
        rule_id: rule.id,
        description: rule.description,
        passed: false,
        detail: '最近 24 小时内无文件修改',
        weight: rule.weight,
    };
}
// ---- file system helpers -------------------------------------
function findMatches(dir, pattern) {
    const results = [];
    // If pattern has no wildcard, check exact path
    if (!pattern.includes('*')) {
        const exactPath = path.join(dir, pattern);
        if (fs.existsSync(exactPath)) {
            return [pattern];
        }
        // Also try fuzzy match for Chinese filenames
        const parent = path.dirname(pattern);
        const base = path.basename(pattern);
        const searchDir = parent === '.' ? dir : path.join(dir, parent);
        if (fs.existsSync(searchDir) && fs.statSync(searchDir).isDirectory()) {
            const entries = fs.readdirSync(searchDir);
            for (const entry of entries) {
                if (entry.includes(base) || base.includes(entry)) {
                    results.push(parent === '.' ? entry : path.join(parent, entry));
                }
            }
        }
        return results;
    }
    // Simple glob: only supports *.ext and **/*
    if (pattern === '**/*') {
        walkDir(dir, (filePath) => {
            results.push(path.relative(dir, filePath));
        });
        return results;
    }
    if (pattern.startsWith('*.')) {
        const ext = pattern.slice(1); // .ext
        walkDir(dir, (filePath) => {
            if (filePath.endsWith(ext)) {
                results.push(path.relative(dir, filePath));
            }
        });
        return results;
    }
    // directory/**/*.ts pattern
    const slashIdx = pattern.indexOf('/');
    if (slashIdx > 0) {
        const subDir = pattern.slice(0, slashIdx);
        const subPattern = pattern.slice(slashIdx + 1);
        const subPath = path.join(dir, subDir);
        if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
            return findMatches(subPath, subPattern).map((m) => path.join(subDir, m));
        }
    }
    return results;
}
function walkDir(dir, callback, maxDepth = 5) {
    if (maxDepth <= 0)
        return;
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    }
    catch {
        return;
    }
    for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules')
            continue;
        const fullPath = path.join(dir, entry.name);
        try {
            const stat = fs.statSync(fullPath);
            if (entry.isFile()) {
                callback(fullPath, stat);
            }
            else if (entry.isDirectory()) {
                walkDir(fullPath, callback, maxDepth - 1);
            }
        }
        catch {
            // skip inaccessible files
        }
    }
}
//# sourceMappingURL=fileScanner.js.map