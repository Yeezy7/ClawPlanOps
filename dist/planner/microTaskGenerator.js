"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMicroTasks = generateMicroTasks;
/**
 * Generate micro tasks (30-90 min each) from deliverables and phases.
 */
function generateMicroTasks(deliverables, phases, dailyHours) {
    const tasks = [];
    let taskCounter = 0;
    for (const del of deliverables) {
        const phase = phases.find((p) => p.deliverables.includes(del.name));
        if (!phase)
            continue;
        for (const sub of del.sub_tasks) {
            taskCounter++;
            const estMin = estimateMinutes(sub, dailyHours);
            tasks.push({
                id: `T-${taskCounter.toString().padStart(3, '0')}`,
                name: sub,
                estimated_minutes: estMin,
                deliverable_id: del.id,
                phase_name: phase.phase_name,
                completion_criteria: buildCriteria(sub, del),
                priority: del.priority,
            });
        }
    }
    return tasks;
}
// ---- private helpers -----------------------------------------
function estimateMinutes(taskName, dailyHours) {
    const name = taskName.toLowerCase();
    if (name.includes('测试') || name.includes('集成'))
        return 90;
    if (name.includes('创建') || name.includes('初始化'))
        return 45;
    if (name.includes('编写') || name.includes('实现') || name.includes('制作'))
        return 60;
    if (name.includes('排练') || name.includes('录制'))
        return 90;
    if (name.includes('剪辑') || name.includes('配音'))
        return 90;
    if (name.includes('填写') || name.includes('排版'))
        return 45;
    if (name.includes('检查') || name.includes('确认') || name.includes('校对'))
        return 30;
    if (name.includes('大纲') || name.includes('脚本') || name.includes('定义'))
        return 30;
    // default: one daily block
    return dailyHours * 30;
}
function buildCriteria(subTask, deliverable) {
    if (subTask.includes('创建') || subTask.includes('初始化')) {
        return `目录结构已创建，核心文件已就位`;
    }
    if (subTask.includes('编写') || subTask.includes('实现')) {
        return `${deliverable.name} 相关代码/内容已完成并通过初步检查`;
    }
    if (subTask.includes('测试')) {
        return `测试通过，${deliverable.name} 功能验证正常`;
    }
    if (subTask.includes('填写')) {
        return `${deliverable.name} 信息填写完整`;
    }
    if (subTask.includes('答辩') || subTask.includes('PPT') || subTask.includes('大纲')) {
        return `内容大纲清晰，涵盖所有必需章节`;
    }
    if (subTask.includes('录制') || subTask.includes('视频')) {
        return `视频录制完成，时长符合要求`;
    }
    if (subTask.includes('检查') || subTask.includes('确认') || subTask.includes('校对')) {
        return `${deliverable.name} 质量检查通过`;
    }
    return `${deliverable.name} 的 ${subTask} 已完成`;
}
//# sourceMappingURL=microTaskGenerator.js.map