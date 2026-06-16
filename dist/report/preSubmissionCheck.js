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
exports.runPreSubmissionCheck = runPreSubmissionCheck;
exports.exportPreSubmissionMarkdown = exportPreSubmissionMarkdown;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const REQUIRED_FILES = [
    { category: '核心代码', name: 'package.json', patterns: ['package.json'], required: true },
    { category: '核心代码', name: 'openclaw.plugin.json', patterns: ['openclaw.plugin.json'], required: true },
    { category: '核心代码', name: 'src/index.ts', patterns: ['src/index.ts'], required: true },
    { category: '核心代码', name: 'tsconfig.json', patterns: ['tsconfig.json'], required: true },
    { category: '文档', name: 'README.md', patterns: ['README.md'], required: true },
    { category: '构建产物', name: 'dist/', patterns: ['dist/'], required: true },
    { category: '参赛材料', name: '项目申报表', patterns: ['申报表*', '申报书*', '*.docx', '*.pdf'], required: true },
    { category: '参赛材料', name: '答辩 PPT', patterns: ['*.pptx', '*.ppt', '答辩*'], required: true },
    { category: '参赛材料', name: '演示视频', patterns: ['*.mp4', '*.mov', '演示*', '*demo*'], required: true },
    { category: '示例', name: 'examples/', patterns: ['examples/'], required: false },
    { category: '示例', name: '演示脚本', patterns: ['examples/demo.sh', 'examples/*.sh'], required: false },
];
function runPreSubmissionCheck(params) {
    const { project_path, plan } = params;
    const checks = [];
    const missingFiles = [];
    const warnings = [];
    for (const item of REQUIRED_FILES) {
        const found = item.patterns.some((p) => matchPattern(project_path, p));
        checks.push({
            category: item.category,
            name: item.name,
            required: item.required,
            status: found ? 'pass' : item.required ? 'fail' : 'warn',
            detail: found ? '已找到' : `未找到: ${item.patterns.join(' / ')}`,
        });
        if (!found) {
            if (item.required)
                missingFiles.push(item.name);
            else
                warnings.push(`可选文件缺失: ${item.name}`);
        }
    }
    const distIndex = path.join(project_path, 'dist', 'index.js');
    if (fs.existsSync(distIndex)) {
        const content = fs.readFileSync(distIndex, 'utf-8');
        const tools = [
            'clawplanops_parse_task_requirements',
            'clawplanops_build_deliverable_plan',
            'clawplanops_generate_calendar_schedule',
            'clawplanops_check_progress_evidence',
            'clawplanops_generate_daily_progress_report',
            'clawplanops_reschedule_plan',
            'clawplanops_generate_weekly_report',
            'clawplanops_pre_submission_check',
            'clawplanops_multi_project_status',
            'clawplanops_git_task_link',
            'clawplanops_progress_trend',
            'clawplanops_send_notification',
            'clawplanops_cross_platform_calendar',
        ];
        const missingTools = tools.filter((t) => !content.includes(t));
        if (missingTools.length > 0) {
            checks.push({
                category: '工具导出',
                name: `${tools.length} 个工具函数`,
                required: true,
                status: 'fail',
                detail: `缺失 ${missingTools.length} 个: ${missingTools.slice(0, 3).join(', ')}${missingTools.length > 3 ? '...' : ''}`,
            });
            missingFiles.push('工具函数导出');
        }
        else {
            checks.push({
                category: '工具导出',
                name: `${tools.length} 个工具函数`,
                required: true,
                status: 'pass',
                detail: `所有 ${tools.length} 个工具函数已正确导出`,
            });
        }
    }
    const readmePath = path.join(project_path, 'README.md');
    if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8');
        if (content.length < 200) {
            checks.push({
                category: '文档质量',
                name: 'README.md 内容',
                required: false,
                status: 'warn',
                detail: `README 内容较短 (${content.length} 字节)，建议补充`,
            });
            warnings.push('README 内容较短，建议补充使用说明');
        }
        else {
            checks.push({
                category: '文档质量',
                name: 'README.md 内容',
                required: false,
                status: 'pass',
                detail: `README 内容充实 (${content.length} 字节)`,
            });
        }
    }
    const score = Math.round((checks.filter((c) => c.status === 'pass').length / checks.length) * 100);
    const ready = missingFiles.length === 0;
    const summary = ready
        ? '所有必需材料已就绪，可以提交'
        : `缺少 ${missingFiles.length} 个必需文件: ${missingFiles.join('、')}`;
    return {
        project_name: plan.task_name,
        deadline: plan.deadline,
        ready,
        score,
        checks,
        missing_files: missingFiles,
        warnings,
        summary,
    };
}
function exportPreSubmissionMarkdown(result) {
    const lines = [
        `# 📋 提交前检查报告`,
        '',
        `> 项目：${result.project_name}`,
        `> 截止：${result.deadline}`,
        `> 检查评分：**${result.score}%**`,
        `> 提交状态：${result.ready ? '✅ 可以提交' : '❌ 材料不全'}`,
        '',
        '---',
        '',
    ];
    const categories = [...new Set(result.checks.map((c) => c.category))];
    for (const cat of categories) {
        lines.push(`## ${cat}`);
        lines.push('');
        lines.push('| 状态 | 名称 | 必需 | 说明 |');
        lines.push('|------|------|------|------|');
        const items = result.checks.filter((c) => c.category === cat);
        for (const item of items) {
            const emoji = item.status === 'pass' ? '✅' : item.status === 'fail' ? '❌' : '⚠️';
            const req = item.required ? '是' : '否';
            lines.push(`| ${emoji} | ${item.name} | ${req} | ${item.detail} |`);
        }
        lines.push('');
    }
    if (result.missing_files.length > 0) {
        lines.push('## ❌ 必须补全');
        lines.push('');
        for (const f of result.missing_files) {
            lines.push(`- ${f}`);
        }
        lines.push('');
    }
    if (result.warnings.length > 0) {
        lines.push('## ⚠️ 建议改进');
        lines.push('');
        for (const w of result.warnings) {
            lines.push(`- ${w}`);
        }
        lines.push('');
    }
    return lines.join('\n');
}
function matchPattern(projectPath, pattern) {
    if (pattern.endsWith('/')) {
        return fs.existsSync(path.join(projectPath, pattern));
    }
    if (pattern.includes('*')) {
        const dir = path.dirname(pattern);
        const base = pattern.replace('*', '');
        const searchDir = dir === '.' ? projectPath : path.join(projectPath, dir);
        if (!fs.existsSync(searchDir))
            return false;
        try {
            const entries = fs.readdirSync(searchDir);
            return entries.some((e) => e.includes(base));
        }
        catch {
            return false;
        }
    }
    return fs.existsSync(path.join(projectPath, pattern));
}
//# sourceMappingURL=preSubmissionCheck.js.map