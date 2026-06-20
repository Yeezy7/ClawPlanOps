# ClawPlanOps

> 基于交付物证据的项目执行规划 OpenClaw 技能插件

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](https://github.com/Yeezy7/ClawPlanOps)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Plugin-orange.svg)](https://docs.openclaw.ai)

**输入任务通知 → 自动解析要求 → 生成计划 → 导出日历 → 检查进度 → 动态调整**

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🎯 **智能任务解析** | 从通知文本自动提取任务名称、截止时间、交付物、约束条件 |
| 📋 **反向拆解计划** | 从最终交付物反向拆解 30-90 分钟的微任务，按优先级排序 |
| 🔍 **真实进度检查** | 扫描项目目录 + Git 历史，基于文件证据计算进度百分比 |
| 🔄 **自动重排** | 进度落后时自动压缩低优先级任务、重建时间线 |
| 📅 **日历导出** | RFC 5545 标准 ICS 文件，含 VALARM 提醒 |
| ⏰ **每日自动审查** | 定时检查项目进度，发送审查报告和提醒 |
| 📊 **周报生成** | 根据本周完成的微任务和 Git 提交自动生成周报 |
| ✅ **提交前检查** | 比赛提交前自动检查所有材料是否齐全，给出评分 |
| 🚀 **多项目并行** | 同时管理多个比赛/项目的计划，支持切换和状态查看 |
| 🔔 **智能提醒** | 支持系统通知（macOS/Linux/Windows）、邮件、Webhook |

---

## 🚀 快速开始

### 作为 OpenClaw 插件（推荐）

```bash
# 1. 安装插件
openclaw plugins install /path/to/ClawPlanOps --link

# 2. 在对话中使用
帮我规划一个比赛：
- 名称：校园APP创新大赛
- 截止时间：2026年7月15日
- 交付物：APP原型、设计文档、演示视频
- 团队：3人
- 每天投入：3小时
```

### 作为 CLI 使用

```bash
# 安装
npm install
npm run build

# 完整流程
claw-planops full <通知文件> <项目目录>

# 单步操作
claw-planops parse <通知文件>              # 解析任务
claw-planops plan <requirements.json>      # 生成计划
claw-planops calendar <plan.json>          # 导出日历
claw-planops check <项目目录>              # 检查进度
claw-planops daily <项目目录>              # 每日审查
```

### 作为库使用

```typescript
import {
  parseTaskRequirements,
  buildDeliverablePlan,
  generateCalendarSchedule,
  checkProgressEvidence,
  dailyReview,
} from 'claw-planops';

// 解析任务
const reqs = await parseTaskRequirements({ content: noticeText });

// 生成计划
const plan = buildDeliverablePlan({
  task_requirements: reqs,
  daily_available_hours: 3,
});

// 导出日历
const cal = generateCalendarSchedule({
  micro_tasks: plan.micro_tasks,
  start_date: plan.start_date,
  deadline: reqs.deadline,
});

// 检查进度
const progress = checkProgressEvidence({ project_path: './my-project' });

// 每日审查
const review = dailyReview({ project_path: './my-project' });
```

---

## 📦 安装

### 前置要求

- Node.js >= 18
- npm >= 9
- OpenClaw >= 2026.3.24（作为插件使用时）

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/Yeezy7/ClawPlanOps.git
cd ClawPlanOps

# 安装依赖
npm install

# 构建
npm run build
```

### 作为 OpenClaw 插件安装

```bash
# 方式 1：本地链接
openclaw plugins install /path/to/ClawPlanOps --link

# 方式 2：从 Git 安装
openclaw plugins install git:github.com/Yeezy7/ClawPlanOps

# 方式 3：从 npm 安装（发布后）
openclaw plugins install claw-planops
```

---

## 🛠️ 使用指南

### 场景 1：规划新项目

```
帮我规划一个比赛：
- 名称：校园APP创新大赛
- 截止时间：2026年7月15日
- 交付物：APP原型、设计文档、演示视频
- 团队：3人
- 每天投入：3小时
- 项目目录：~/Projects/campus-app-contest
```

**输出示例：**

```
📋 项目计划已生成

| 阶段 | 时间 | 交付物 | 微任务数 |
|------|------|--------|----------|
| 第1阶段 | 06-19 → 06-24 | APP原型 | 6 个 |
| 第2阶段 | 06-25 → 06-30 | 设计文档 | 8 个 |
| 第3阶段 | 07-01 → 07-06 | 演示视频 | 6 个 |

总计：20 个微任务，26 天完成
```

### 场景 2：检查项目进度

```
检查一下 ~/Projects/campus-app-contest 的进度
```

**输出示例：**

```
📊 进度检查结果

当前进度：45% ████████████░░░░░░░░
风险等级：🟡 中

✅ 已完成 (5 项)：
- README.md
- package.json
- src/index.ts

❌ 缺失 (3 项)：
- 商业计划书.pdf (权重: 15)
- 演示视频 (权重: 20)
```

### 场景 3：每日自动审查

通过 cron 任务实现每日自动审查：

```bash
# 创建每日审查任务（每天早上 9:00）
openclaw cron create "0 9 * * *" \
  --name "每日项目审查" \
  --session main \
  --system-event "请执行每日项目审查" \
  --tz "Asia/Shanghai"
```

### 场景 4：导出日历

```
导出日历到 ~/Projects/campus-app-contest
```

**输出：**
- 生成 `schedule.ics` 文件
- 包含 VALARM 提醒（30分钟前 + 高优任务1天前）

---

## 🔧 配置

在项目根目录创建 `.planopsrc.json` 自定义行为：

```json
{
  "name": "my-project",
  "preferred_work_time": "09:00-12:00",
  "daily_available_hours": 3,
  "output_dir": "./output",
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

---

## 📋 工具列表

| 工具 | 说明 |
|------|------|
| `clawplanops_parse_task_requirements` | 解析任务通知文本 |
| `clawplanops_build_deliverable_plan` | 生成交付物计划 + 微任务 |
| `clawplanops_generate_calendar_schedule` | 生成 .ics 日历文件 |
| `clawplanops_check_progress_evidence` | 扫描项目文件 + Git 证据 |
| `clawplanops_daily_review` | 每日项目审查 |
| `clawplanops_generate_weekly_report` | 生成周报 |
| `clawplanops_pre_submission_check` | 提交前检查 |
| `clawplanops_reschedule_plan` | 动态重排建议 |
| `clawplanops_multi_project_status` | 多项目状态概览 |
| `clawplanops_git_task_link` | Git 提交关联分析 |
| `clawplanops_progress_trend` | 进度趋势分析 |
| `clawplanops_send_notification` | 发送系统通知 |
| `clawplanops_cross_platform_calendar` | 跨平台日历导入 |

---

## 📁 项目结构

```
ClawPlanOps/
├── src/
│   ├── index.ts              # 插件入口
│   ├── cli.ts                # CLI 入口
│   ├── types/                # 类型定义
│   ├── planner/              # 规划模块
│   ├── calendar/             # 日历模块
│   ├── evidence/             # 证据检查
│   ├── report/               # 报告生成
│   ├── config/               # 配置管理
│   └── tools/                # 工具实现
├── skills/
│   └── claw-planops/SKILL.md # OpenClaw 技能定义
├── tests/                    # 单元测试
├── examples/                 # 示例文件
├── openclaw.plugin.json      # 插件清单
└── package.json
```

---

## 🧪 测试

```bash
# 类型检查
npm run typecheck

# 运行全部测试
npm test

# 监听模式
npm run test:watch

# 构建
npm run build

# 交付健康检查
npm run delivery:check
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

## 🔗 相关链接

- [OpenClaw 文档](https://docs.openclaw.ai)
- [ClawHub 插件市场](https://clawhub.ai)
- [问题反馈](https://github.com/Yeezy7/ClawPlanOps/issues)

---

## 🙏 致谢

- [OpenClaw](https://docs.openclaw.ai) - AI 助手框架
- [ClawHub](https://clawhub.ai) - 插件市场
