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
exports.loadProjectConfig = loadProjectConfig;
exports.resolveConfig = resolveConfig;
exports.generateConfigTemplate = generateConfigTemplate;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG_FILE_NAMES = ['.planopsrc.json', '.planops.json', 'planops.json'];
/**
 * Load project configuration from the project directory.
 * Searches for .planopsrc.json, .planops.json, planops.json in order.
 * Returns default config if no config file found.
 */
function loadProjectConfig(projectPath) {
    for (const name of CONFIG_FILE_NAMES) {
        const configPath = path.join(projectPath, name);
        if (fs.existsSync(configPath)) {
            try {
                const raw = fs.readFileSync(configPath, 'utf-8');
                return JSON.parse(raw);
            }
            catch (err) {
                console.error(`警告: 配置文件 ${name} 解析失败: ${err.message}`);
            }
        }
    }
    return {};
}
/**
 * Merge project config with defaults.
 */
function resolveConfig(projectPath, overrides) {
    const cfg = loadProjectConfig(projectPath);
    return {
        name: overrides?.name ?? cfg.name ?? path.basename(projectPath),
        preferred_work_time: overrides?.preferred_work_time ?? cfg.preferred_work_time ?? '20:00-22:00',
        daily_available_hours: overrides?.daily_available_hours ?? cfg.daily_available_hours ?? 2,
        evidence_rules: overrides?.evidence_rules ?? cfg.evidence_rules ?? [],
        exclude_patterns: overrides?.exclude_patterns ?? cfg.exclude_patterns ?? [
            'node_modules',
            '.git',
            'dist',
            '.claude',
        ],
        output_dir: overrides?.output_dir ?? cfg.output_dir ?? './output',
        default_deadline: overrides?.default_deadline ?? cfg.default_deadline ?? '',
        deliverables: overrides?.deliverables ?? cfg.deliverables ?? {},
    };
}
/**
 * Generate a template .planopsrc.json file.
 */
function generateConfigTemplate() {
    return {
        name: 'my-project',
        preferred_work_time: '20:00-22:00',
        daily_available_hours: 2,
        evidence_rules: [
            {
                id: 'CUSTOM-001',
                description: '自定义：检查 src/ 目录',
                file_patterns: ['src/'],
                check_type: 'directory_exists',
                weight: 10,
                deliverable_id: 'DEL-01',
            },
        ],
        exclude_patterns: ['node_modules', '.git', 'dist'],
        output_dir: './output',
        deliverables: {
            '自定义文档': {
                sub_tasks: ['写初稿', '审核', '定稿'],
                evidence: ['自定义文档.md'],
            },
        },
    };
}
//# sourceMappingURL=projectConfig.js.map