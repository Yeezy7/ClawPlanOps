import type {
  TaskRequirements,
  Phase,
  DeliverableItem,
  MicroTask,
  DeliverablePlan,
} from '../types';
import { calcAvailableDays } from './taskParser';
import { generateMicroTasks } from './microTaskGenerator';

/**
 * Build a deliverable plan from task requirements.
 * Reverse-plans from the final deadline backward.
 */
export function buildDeliverablePlan(
  taskRequirements: TaskRequirements,
  availableDays?: number,
  dailyAvailableHours?: number,
  customTemplates?: Record<string, { sub_tasks: string[]; evidence: string[] }>
): DeliverablePlan {
  const days =
    availableDays ??
    (taskRequirements.deadline !== '未设置截止时间'
      ? calcAvailableDays(taskRequirements.deadline)
      : 14);
  const hours = dailyAvailableHours ?? 2;

  const startDate = calcStartDate(days);
  const deliverables = buildDeliverableItems(taskRequirements, customTemplates);
  const phases = buildPhases(deliverables, startDate, days);
  const microTasks = generateMicroTasks(deliverables, phases, hours);

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

function calcStartDate(availableDays: number): string {
  const d = new Date();
  // Start from today
  return formatDate(d);
}

const DELIVERABLE_TEMPLATES: Record<string, { sub_tasks: string[]; evidence: string[] }> = {
  // ---- 代码/插件类 ----
  '插件代码': {
    sub_tasks: ['创建项目目录结构', '初始化项目配置文件', '编写核心功能代码', '编写测试', '集成联调'],
    evidence: ['src/', 'package.json'],
  },
  '源码': {
    sub_tasks: ['创建项目结构', '实现核心逻辑', '编写配置文件', '测试验证', '代码整理'],
    evidence: ['src/', 'package.json'],
  },
  'openclaw.plugin.json': {
    sub_tasks: ['定义插件元数据', '声明工具函数签名', '配置参数和返回值', '测试插件加载'],
    evidence: ['openclaw.plugin.json'],
  },

  // ---- 文档类 ----
  'README': {
    sub_tasks: ['写项目简介', '写安装说明', '写使用示例', '写API文档'],
    evidence: ['README.md'],
  },
  'README.md': {
    sub_tasks: ['写项目简介', '写安装说明', '写使用示例', '写API文档'],
    evidence: ['README.md'],
  },
  '技术文档': {
    sub_tasks: ['确定文档大纲', '写技术方案', '写接口文档', '写部署说明', '校对定稿'],
    evidence: ['技术文档.md', '技术文档.pdf'],
  },
  '设计文档': {
    sub_tasks: ['需求分析', '系统架构设计', '模块设计', '接口设计', '数据库设计'],
    evidence: ['设计文档.md', '设计文档.pdf'],
  },

  // ---- 申请表/申报书类 ----
  '申报表': {
    sub_tasks: ['填写基本信息', '填写项目方案', '填写创新点/特色', '排版校对', '打印签字'],
    evidence: ['申报表.docx', '申报表.pdf'],
  },
  '申请表': {
    sub_tasks: ['填写个人信息', '填写项目简介', '填写团队信息', '检查完整性和签名'],
    evidence: ['申请表.docx', '申请表.pdf'],
  },
  '项目申报表': {
    sub_tasks: ['填写项目基本信息', '填写技术方案', '填写创新点', '排版和校对'],
    evidence: ['申报表.docx', '申报表.pdf', '项目申报表.pdf'],
  },
  '项目申报书': {
    sub_tasks: ['立项背景与意义', '研究内容与方法', '预期成果', '进度安排', '经费预算'],
    evidence: ['申报书.docx', '申报书.pdf'],
  },
  '申报书': {
    sub_tasks: ['立项背景与意义', '研究内容与方法', '预期成果', '进度安排', '经费预算'],
    evidence: ['申报书.docx', '申报书.pdf'],
  },

  // ---- 答辩类 ----
  '答辩PPT': {
    sub_tasks: ['确定答辩大纲', '制作封面和目录', '制作核心内容页', '制作总结展望页', '排练计时'],
    evidence: ['答辩PPT.pptx', '答辩PPT.pdf'],
  },
  'PPT': {
    sub_tasks: ['确定大纲', '制作封面', '制作内容页', '排版美化', '排练计时'],
    evidence: ['*.pptx', '*.ppt'],
  },

  // ---- 视频/媒体类 ----
  '演示视频': {
    sub_tasks: ['编写演示脚本', '录制操作演示', '配音和字幕', '剪辑和导出'],
    evidence: ['演示视频.mp4', 'demo.mp4'],
  },
  '视频': {
    sub_tasks: ['编写脚本/大纲', '准备素材', '录制', '后期剪辑', '导出成片'],
    evidence: ['*.mp4', '*.mov'],
  },
  '海报': {
    sub_tasks: ['确定海报内容', '设计初稿', '修改完善', '打印输出'],
    evidence: ['海报.png', '海报.pdf', '海报.jpg'],
  },

  // ---- 论文/报告类 ----
  '论文': {
    sub_tasks: ['选题与文献调研', '撰写引言', '撰写方法', '实验与分析', '撰写结论', '修改润色'],
    evidence: ['论文.docx', '论文.pdf'],
  },
  '报告': {
    sub_tasks: ['确定报告大纲', '收集整理数据', '撰写正文', '制作图表', '修改润色'],
    evidence: ['报告.docx', '报告.pdf'],
  },
  '实验报告': {
    sub_tasks: ['整理实验数据', '撰写实验过程', '分析结果', '撰写结论'],
    evidence: ['实验报告.docx', '实验报告.pdf'],
  },
  '调研报告': {
    sub_tasks: ['确定调研提纲', '收集资料', '整理分析', '撰写报告'],
    evidence: ['调研报告.docx', '调研报告.pdf'],
  },

  // ---- 方案/计划类 ----
  '项目方案': {
    sub_tasks: ['需求分析', '技术路线设计', '实施计划制定', '预算评估', '风险评估'],
    evidence: ['项目方案.docx', '项目方案.pdf'],
  },
  '商业计划书': {
    sub_tasks: ['市场分析', '产品服务描述', '商业模式', '财务预测', '团队介绍'],
    evidence: ['商业计划书.docx', '商业计划书.pdf'],
  },
};

function buildDeliverableItems(
  reqs: TaskRequirements,
  customTemplates?: Record<string, { sub_tasks: string[]; evidence: string[] }>
): DeliverableItem[] {
  return reqs.deliverables.map((name, i) => {
    const id = `DEL-${(i + 1).toString().padStart(2, '0')}`;
    const template = findTemplate(name, customTemplates);

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

function findTemplate(
  name: string,
  customTemplates?: Record<string, { sub_tasks: string[]; evidence: string[] }>
) {
  // Custom templates take precedence
  if (customTemplates) {
    for (const [key, val] of Object.entries(customTemplates)) {
      if (name.includes(key) || key.includes(name)) return val;
    }
  }
  // Fall back to built-in templates
  for (const [key, val] of Object.entries(DELIVERABLE_TEMPLATES)) {
    if (name.includes(key) || key.includes(name)) return val;
  }
  return null;
}

function buildPhases(
  deliverables: DeliverableItem[],
  startDate: string,
  totalDays: number
): Phase[] {
  const numPhases = Math.min(5, Math.max(2, Math.ceil(totalDays / 3)));
  const itemsPerPhase = Math.ceil(deliverables.length / numPhases);

  const phases: Phase[] = [];
  for (let i = 0; i < numPhases; i++) {
    const chunk = deliverables.slice(i * itemsPerPhase, (i + 1) * itemsPerPhase);
    if (chunk.length === 0) break;

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

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
