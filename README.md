# ClawPlanOps

基于交付物证据的项目执行规划 OpenClaw 技能插件。

> 输入任务通知 → 自动解析任务要求 → 生成交付物计划 → 导出日历 → 检查真实进度证据 → 动态调整后续计划。

## 核心特性

- **从任务要求自动生成计划** — 输入一段通知文本，自动识别任务名称、截止时间、交付物、约束条件
- **从最终交付物反向拆解微任务** — 每个交付物拆成 30-90 分钟的微任务，按优先级排序
- **不靠用户打卡，而靠真实文件证据检查进度** — 扫描项目目录 + Git 历史，加权计算进度百分比
- **进度落后时自动重排** — 压缩低优先级任务、删除可选任务、重建阶段时间线
- **RFC 5545 标准日历导出** — ICS 文件含 VALARM 提醒（30分钟前 + 高优任务1天前）
- **零运行时依赖** — ICS 生成器、文件扫描器、HTML 解析器全部自实现

### v0.3.0 新功能

- **周报生成** — 根据本周完成的微任务和 Git 提交自动生成周报
- **提交前检查** — 比赛提交前自动检查所有材料是否齐全，给出评分
- **多任务并行** — 同时管理多个比赛/项目的计划，支持切换和状态查看
- **提醒推送** — 支持系统通知（macOS/Linux/Windows）、邮件、Webhook
- **Git 提交自动关联** — 自动分析 Git 提交与任务的关联关系
- **历史进度追踪** — 保存进度快照，支持趋势分析和预计完成时间
- **跨平台日历** — 支持 macOS Calendar、Linux (gnome-calendar/korganizer)、Windows 默认日历

## 安装

```bash
npm install
npm run build
```

## 快速开始

### 作为 OpenClaw 插件使用

1. 将项目目录添加到 OpenClaw 插件路径
2. 在对话中直接提供任务通知文本，ClawPlanOps 会自动解析并生成计划
3. 使用 `/clawplanops` 命令触发完整流程

### 作为 CLI 使用

```bash
# 完整 6 步流程
claw-planops full <通知文件> <项目目录>
claw-planops full <通知文件> <项目目录> --apple-cal # 同步导入 macOS 日历

# 单步操作
claw-planops parse <通知文件>              # 解析任务要求
claw-planops plan <requirements.json>      # 生成交付物计划
claw-planops calendar <plan.json>          # 导出 .ics 日历
claw-planops calendar <plan.json> --apple-cal # 导入 macOS 日历
claw-planops check <项目目录>              # 检查进度证据
claw-planops report <项目目录> <plan.json> # 生成每日进度报告
claw-planops reschedule <progress.json> <plan.json> # 动态重排建议

# 新功能 (v0.3.0)
claw-planops weekly <项目目录> <plan.json>      # 生成周报
claw-planops presubmit <项目目录> <plan.json>   # 提交前检查
claw-planops projects list                       # 列出并行项目
claw-planops projects add <名称> <通知> <路径>   # 添加新项目
claw-planops projects switch <id>                # 切换活动项目
claw-planops git-link <项目目录> <plan.json>     # Git 提交关联
claw-planops trend <项目目录>                    # 查看进度趋势
claw-planops notify test                         # 测试系统通知
claw-planops calendar-import <plan.json>         # 跨平台日历导入

# AI 模式（更准确的解析）
claw-planops parse <通知文件> --ai
claw-planops parse <通知文件> --ai http://localhost:11434/v1/chat/completions
```

### 最小演示

```bash
npm install
npm run build
node dist/cli.js full examples/zzu_four_creation_notice.txt .
bash examples/demo.sh
```

### 作为库使用

```typescript
import {
  parseTaskRequirements,
  buildDeliverablePlan,
  generateCalendarSchedule,
  checkProgressEvidence,
  reschedulePlan,
} from 'claw-planops';

// 1. 解析任务
const reqs = await parseTaskRequirements({ content: noticeText });

// 2. 生成计划（支持自定义模板）
const plan = buildDeliverablePlan({
  task_requirements: reqs,
  custom_templates: {
    '商业计划书': {
      sub_tasks: ['市场调研', '撰写正文', '财务分析'],
      evidence: ['商业计划书.pdf'],
    },
  },
});

// 3. 导出日历
const cal = generateCalendarSchedule({
  micro_tasks: plan.micro_tasks,
  start_date: plan.start_date,
  deadline: reqs.deadline,
  preferred_work_time: '09:00-12:00',
});

// 4. 检查进度
const progress = checkProgressEvidence({ project_path: './my-project' });

// 5. 重排建议
const reschedule = reschedulePlan({
  progress_report: progress,
  original_plan: plan,
  deadline: reqs.deadline,
});
```

## 配置文件

在项目根目录创建 `.planopsrc.json` 自定义行为：

```json
{
  "name": "my-project",
  "preferred_work_time": "09:00-12:00",
  "daily_available_hours": 3,
  "output_dir": "./output",
  "deliverables": {
    "商业计划书": {
      "sub_tasks": ["市场调研", "撰写正文"],
      "evidence": ["商业计划书.pdf"]
    }
  },
  "evidence_rules": [
    {
      "id": "CUSTOM-001",
      "description": "检查测试目录",
      "file_patterns": ["tests/"],
      "check_type": "directory_exists",
      "weight": 10,
      "deliverable_id": "DEL-01"
    }
  ],
  "exclude_patterns": ["node_modules", ".git", "dist"]
}
```

支持的配置文件名（按优先级）：`.planopsrc.json`、`.planops.json`、`planops.json`

## 输出文件

CLI 默认把计划、日历、进度报告、重排建议等生成物写入 `output/`。该目录属于运行输出，已在 `.gitignore` 中忽略，不建议作为源码交付物提交。

## 工具列表

| 工具 | 说明 | 核心参数 |
|------|------|----------|
| `clawplanops_parse_task_requirements` | 解析任务通知文本（CLI 备用；技能流程优先由 AI 直接理解） | `content`, `input_type?` |
| `clawplanops_build_deliverable_plan` | 生成交付物计划 + 微任务 | `task_requirements`, `available_days?`, `daily_available_hours?`, `custom_templates?` |
| `clawplanops_generate_calendar_schedule` | 生成 .ics 日历文件 | `micro_tasks`, `start_date`, `deadline`, `preferred_work_time?` |
| `clawplanops_check_progress_evidence` | 扫描项目文件 + Git 证据 | `project_path` |
| `clawplanops_generate_daily_progress_report` | 生成每日进度报告 | `project_path`, `plan`, `schedule` |
| `clawplanops_reschedule_plan` | 动态重排建议 | `progress_report`, `original_plan`, `deadline` |

## 证据检查规则

默认检查 12 项证据，权重总和 100：

| 规则 | 检查内容 | 权重 |
|------|----------|------|
| E-001 | package.json 存在 | 10 |
| E-002 | tsconfig.json 存在 | 5 |
| E-003 | openclaw.plugin.json 存在 | 10 |
| E-004 | README.md 存在且非空 | 10 |
| E-005 | src/index.ts 存在 | 10 |
| E-006 | src/tools/ 目录有 .ts 文件 | 10 |
| E-007 | src/planner/ 目录存在 | 5 |
| E-008 | examples/ 目录存在 | 5 |
| E-009 | 申报书/申报表文件存在 | 10 |
| E-010 | 答辩 PPT 文件存在 | 10 |
| E-011 | 演示视频文件存在 | 10 |
| E-012 | 最近 24 小时有文件修改 | 5 |

可通过 `.planopsrc.json` 的 `evidence_rules` 字段自定义或覆盖。

## 测试

```bash
npm run typecheck # 类型检查
npm test          # 运行全部测试
npm run test:watch # 监听模式
npm run build     # 构建 dist 发布产物
npm run delivery:check # 一键交付健康检查
```

## 项目结构

```
claw-planops/
├── src/
│   ├── index.ts              # 插件入口
│   ├── cli.ts                # CLI 入口
│   ├── types/index.ts        # 类型定义
│   ├── planner/              # 规划模块
│   │   ├── taskParser.ts     # 正则解析器
│   │   ├── aiParser.ts       # AI 解析器
│   │   ├── deliverablePlanner.ts
│   │   ├── microTaskGenerator.ts
│   │   └── rescheduler.ts
│   ├── calendar/
│   │   ├── icsExporter.ts    # ICS 日历生成
│   │   └── appleCalendar.ts  # macOS 日历导入
│   ├── evidence/
│   │   ├── evidenceRules.ts  # 证据规则定义
│   │   ├── fileScanner.ts    # 文件扫描器
│   │   ├── gitEvidence.ts    # Git 证据
│   │   └── progressScorer.ts # 进度评分
│   ├── report/
│   │   ├── dailyReport.ts
│   │   └── markdownExporter.ts
│   ├── config/
│   │   └── projectConfig.ts
│   ├── tools/                # 工具注册层
│   └── utils/
│       └── validation.ts     # 输入校验
├── scripts/
│   └── delivery-check.js     # 交付健康检查
├── tests/                    # 单元测试 (116 tests)
├── skills/
│   └── claw-planops/SKILL.md # OpenClaw 技能定义
├── examples/
│   ├── zzu_four_creation_notice.txt
│   └── sample_project/
└── openclaw.plugin.json      # 插件清单
```

## License

MIT
