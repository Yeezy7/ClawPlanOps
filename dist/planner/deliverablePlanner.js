"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeliverablePlan = buildDeliverablePlan;
exports.addDays = addDays;
const taskParser_1 = require("./taskParser");
const microTaskGenerator_1 = require("./microTaskGenerator");
/**
 * Build a deliverable plan from task requirements.
 * Reverse-plans from the final deadline backward.
 */
function buildDeliverablePlan(taskRequirements, availableDays, dailyAvailableHours) {
    const days = availableDays ??
        (taskRequirements.deadline !== '未设置截止时间'
            ? (0, taskParser_1.calcAvailableDays)(taskRequirements.deadline)
            : 14);
    const hours = dailyAvailableHours ?? 2;
    const startDate = calcStartDate(days);
    const deliverables = buildDeliverableItems(taskRequirements);
    const phases = buildPhases(deliverables, startDate, days);
    const microTasks = (0, microTaskGenerator_1.generateMicroTasks)(deliverables, phases, hours);
    return {
        task_name: taskRequirements.task_name,
        deadline: taskRequirements.deadline,
        start_date: startDate,
        total_days: days,
        daily_hours: hours,
        phases,
        deliverables,
        micro_tasks: microTasks,
    };
}
// ---- private helpers -----------------------------------------
function calcStartDate(availableDays) {
    const d = new Date();
    // Start from today
    return formatDate(d);
}
const DELIVERABLE_TEMPLATES = {
    '插件代码': {
        sub_tasks: [
            '创建项目目录结构',
            '初始化 package.json 和 tsconfig.json',
            '编写核心工具函数',
            '编写单元测试',
            '集成测试',
        ],
        evidence: ['src/index.ts', 'src/tools/', 'package.json'],
    },
    'openclaw.plugin.json': {
        sub_tasks: [
            '定义插件元数据',
            '声明工具函数签名',
            '配置参数和返回值',
            '测试插件加载',
        ],
        evidence: ['openclaw.plugin.json'],
    },
    'README.md': {
        sub_tasks: [
            '写项目简介',
            '写安装说明',
            '写使用示例',
            '写API文档',
        ],
        evidence: ['README.md'],
    },
    '项目申报表': {
        sub_tasks: [
            '填写项目基本信息',
            '填写技术方案',
            '填写创新点',
            '排版和校对',
        ],
        evidence: ['申报表.docx', '申报表.pdf', '项目申报表.pdf'],
    },
    '答辩PPT': {
        sub_tasks: [
            '确定答辩大纲',
            '制作封面和目录',
            '制作技术方案页',
            '制作演示效果页',
            '制作总结和展望页',
            '排练计时',
        ],
        evidence: ['答辩PPT.pptx', '答辩PPT.pdf', '答辩.pptx'],
    },
    '演示视频': {
        sub_tasks: [
            '编写演示脚本',
            '录制操作演示',
            '配音和字幕',
            '剪辑和导出',
        ],
        evidence: ['演示视频.mp4', 'demo.mp4', '演示.mp4'],
    },
    '源码': {
        sub_tasks: [
            '创建项目结构',
            '实现核心逻辑',
            '编写配置文件',
            '测试验证',
            '代码整理',
        ],
        evidence: ['src/', 'package.json', 'tsconfig.json'],
    },
};
function buildDeliverableItems(reqs) {
    return reqs.deliverables.map((name, i) => {
        const id = `DEL-${(i + 1).toString().padStart(2, '0')}`;
        const template = findTemplate(name);
        return {
            id,
            name,
            description: `${name} – 比赛必需交付物`,
            sub_tasks: template?.sub_tasks ?? [
                `完成 ${name} 初稿`,
                `检查 ${name} 内容`,
                `最终确认 ${name}`,
            ],
            evidence_files: template?.evidence ?? [name],
            priority: i < 3 ? 'high' : i < 5 ? 'medium' : 'low',
        };
    });
}
function findTemplate(name) {
    for (const [key, val] of Object.entries(DELIVERABLE_TEMPLATES)) {
        if (name.includes(key) || key.includes(name))
            return val;
    }
    return null;
}
function buildPhases(deliverables, startDate, totalDays) {
    const numPhases = Math.min(5, Math.max(2, Math.ceil(totalDays / 3)));
    const itemsPerPhase = Math.ceil(deliverables.length / numPhases);
    const phases = [];
    for (let i = 0; i < numPhases; i++) {
        const chunk = deliverables.slice(i * itemsPerPhase, (i + 1) * itemsPerPhase);
        if (chunk.length === 0)
            break;
        const phaseDays = Math.ceil(totalDays / numPhases);
        const phaseStart = addDays(startDate, i * phaseDays);
        const phaseEnd = addDays(startDate, (i + 1) * phaseDays - 1);
        phases.push({
            phase_name: `第${i + 1}阶段：${chunk.map((d) => d.name).join('、')}`,
            start_date: phaseStart,
            end_date: phaseEnd,
            goal: `完成 ${chunk.map((d) => d.name).join('、')}`,
            deliverables: chunk.map((d) => d.name),
        });
    }
    return phases;
}
function formatDate(d) {
    return d.toISOString().slice(0, 10);
}
function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return formatDate(d);
}
//# sourceMappingURL=deliverablePlanner.js.map