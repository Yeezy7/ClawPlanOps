# ClawPlanOps

基于交付物证据的项目执行规划 OpenClaw 技能插件。

> 输入任务通知 → 自动解析任务要求 → 生成交付物计划 → 生成日历文件 → 检查真实进度证据 → 动态调整后续计划。

## 核心特性

1. **从任务要求自动生成计划** — 输入一段通知文本，自动识别任务名称、截止时间、交付物、约束条件
2. **从最终交付物反向拆解微任务** — 每个交付物拆成 30-90 分钟的微任务
3. **不靠用户打卡，而靠真实文件证据检查进度** — 扫描项目目录，检查文件是否存在来判断进度

## 安装

```bash
npm install
npm run build
```

## 工具列表

| 工具 | 说明 |
|------|------|
| `parse_task_requirements` | 解析任务通知文本，输出结构化任务要求 |
| `build_deliverable_plan` | 根据任务要求生成交付物计划和微任务 |
| `generate_calendar_schedule` | 生成 .ics 日历文件 |
| `check_progress_evidence` | 检查项目目录中的真实进度证据 |
| `generate_daily_progress_report` | 生成每日进度报告 |
| `reschedule_plan` | 进度落后时生成重排建议 |

## 使用示例

```typescript
import { parseTaskRequirements, buildDeliverablePlan, generateCalendarSchedule } from 'claw-planops';

// 1. 解析任务
const reqs = parseTaskRequirements({ content: noticeText });

// 2. 生成计划
const plan = buildDeliverablePlan({ task_requirements: reqs });

// 3. 导出日历
const cal = generateCalendarSchedule({
  micro_tasks: plan.micro_tasks,
  start_date: '2026-05-18',
  deadline: '2026-06-22',
});

// 4. 检查进度
import { checkProgressEvidence } from 'claw-planops';
const progress = checkProgressEvidence({ project_path: './my-project' });

// 5. 重排建议
import { reschedulePlan } from 'claw-planops';
const reschedule = reschedulePlan({
  progress_report: progress,
  original_plan: plan,
  deadline: '2026-06-22',
});
```

## 项目结构

```
claw-planops/
├── src/
│   ├── index.ts              # 插件入口
│   ├── types/index.ts        # 类型定义
│   ├── planner/              # 规划模块
│   │   ├── taskParser.ts
│   │   ├── deliverablePlanner.ts
│   │   ├── microTaskGenerator.ts
│   │   └── rescheduler.ts
│   ├── calendar/             # 日历模块
│   │   └── icsExporter.ts
│   ├── evidence/             # 证据检查模块
│   │   ├── evidenceRules.ts
│   │   ├── fileScanner.ts
│   │   └── progressScorer.ts
│   ├── report/               # 报告模块
│   │   └── dailyReport.ts
│   └── tools/                # 工具注册层
│       ├── parseTaskRequirements.ts
│       ├── buildDeliverablePlan.ts
│       ├── generateCalendarSchedule.ts
│       ├── checkProgressEvidence.ts
│       ├── generateDailyProgressReport.ts
│       └── reschedulePlan.ts
├── examples/
│   ├── zzu_four_creation_notice.txt
│   ├── sample_project/
│   └── expected_output.json
└── output/
```

## License

MIT
