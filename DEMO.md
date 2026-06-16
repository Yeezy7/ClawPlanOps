# ClawPlanOps 演示文档

> 基于交付物证据的项目执行规划 OpenClaw 技能插件

---

## 一、项目简介

ClawPlanOps 是一个 OpenClaw 技能插件，解决项目管理中的核心痛点：**计划与执行脱节**。

传统项目管理工具依赖用户手动打卡更新进度，而 ClawPlanOps 通过扫描真实文件和 Git 提交记录来判断任务是否完成，实现**证据驱动的进度追踪**。

### 核心理念

```
让 AI 做 AI 擅长的事（文本理解），让代码做代码擅长的事（确定性操作）。
```

---

## 二、功能演示

### 演示 1：从任务通知生成计划

**输入**：一段比赛通知文本

```
郑州大学第一届"四创"大赛E2赛道"技能插件开发赛"
截止时间：2026年6月22日12:00
需提交：OpenClaw 插件代码、README、申报表、PPT、演示视频
```

**输出**：自动生成结构化计划

```json
{
  "task_name": "郑州大学第一届"四创"大赛E2赛道"技能插件开发赛"",
  "deadline": "2026-06-22T12:00:00",
  "deliverables": ["OpenClaw 插件代码", "README.md", "申报表", "PPT", "演示视频"],
  "constraints": ["团队人数不超过5人", "需按时提交电子版材料"]
}
```

### 演示 2：反向拆解微任务

根据交付物自动拆解为 30-90 分钟的微任务：

| 阶段 | 时间 | 交付物 | 微任务数 |
|------|------|--------|----------|
| 第1阶段 | 06-15 → 06-17 | 插件代码、配置文件 | 9 个 |
| 第2阶段 | 06-18 → 06-20 | README、申报表 | 9 个 |
| 第3阶段 | 06-21 → 06-23 | PPT、演示视频 | 9 个 |

### 演示 3：导出日历

生成标准 ICS 日历文件，包含：
- 每个微任务的日程安排
- 30 分钟前提醒
- 高优任务 1 天前提醒

支持导入：Apple Calendar、Google Calendar、Outlook

### 演示 4：证据式进度检查

扫描项目目录，检查 12 项证据：

```
✅ package.json 存在
✅ openclaw.plugin.json 存在
✅ README.md 存在且非空
✅ src/index.ts 存在
❌ 申报书/申报表文件存在 (权重: 10)
❌ 答辩 PPT 文件存在 (权重: 10)
❌ 演示视频文件存在 (权重: 10)

进度: 64%  风险: high
```

### 演示 5：动态重排

当进度落后时，自动生成补救建议：

- 压缩低优先级任务时间
- 删除可选任务
- 优先完成高优交付物

---

## 三、v0.3.0 新功能

### 1. 周报生成

根据本周完成的微任务和 Git 提交自动生成周报，包含：
- 完成任务列表
- Git 提交记录
- 下周重点建议
- 阻塞项识别

### 2. 提交前检查

比赛提交前自动检查所有材料是否齐全，给出评分和缺失项：

```
检查评分: 72%
提交状态: ❌ 材料不全
缺少 3 个必需文件: 申报表、PPT、演示视频
```

### 3. 多任务并行

同时管理多个比赛/项目：
- 添加、切换、删除项目
- 查看所有项目状态
- 项目数据独立存储

### 4. 提醒推送

支持多种推送方式：
- 系统通知（macOS/Linux/Windows）
- 邮件通知
- Webhook 推送

### 5. Git 提交自动关联

分析 Git 提交与任务的关联关系，计算覆盖率，找出未关联的提交。

### 6. 历史进度追踪

保存进度快照，支持：
- 进度趋势分析
- 日均进度计算
- 预计完成时间

### 7. 跨平台日历

自动检测操作系统并导入日历：
- macOS: Apple Calendar
- Linux: gnome-calendar / korganizer
- Windows: 默认日历应用

---

## 四、技术亮点

| 特性 | 说明 |
|------|------|
| 零运行时依赖 | ICS 生成器、文件扫描器全部自实现 |
| 纯函数风格 | 每个函数输入输出明确，易于测试 |
| 130 个单元测试 | 覆盖所有核心功能 |
| TypeScript 类型安全 | 完整的类型定义 |
| OpenClaw 原生集成 | 13 个工具函数，支持 AI 模式 |

---

## 五、使用方式

### CLI 命令

```bash
# 完整流程
claw-planops full notice.txt .

# 单步操作
claw-planops parse notice.txt
claw-planops plan requirements.json
claw-planops calendar plan.json
claw-planops check .
claw-planops weekly . plan.json
claw-planops presubmit . plan.json
claw-planops projects list
claw-planops git-link . plan.json
claw-planops trend .
```

### 作为库使用

```typescript
import { parseTaskRequirements, buildDeliverablePlan } from 'claw-planops';

const reqs = parseTaskRequirements({ content: noticeText });
const plan = buildDeliverablePlan({ task_requirements: reqs });
```

---

## 六、项目结构

```
claw-planops/
├── src/
│   ├── index.ts              # 插件入口
│   ├── cli.ts                # CLI 入口
│   ├── types/index.ts        # 类型定义
│   ├── planner/              # 规划模块
│   ├── calendar/             # 日历模块
│   ├── evidence/             # 证据检查模块
│   ├── report/               # 报告模块
│   ├── notification/         # 提醒推送模块
│   ├── config/               # 配置模块
│   └── tools/                # 工具注册层
├── tests/                    # 130 个单元测试
├── skills/                   # OpenClaw 技能定义
├── examples/                 # 示例文件
└── dist/                     # 构建产物
```

---

## 七、答辩要点

### 一句话介绍

> 我做的是一个基于交付物证据的项目执行规划插件。它能从任务通知中识别要求，生成计划，并通过检查真实文件进度判断任务是否完成。

### 三个核心亮点

1. **从任务要求自动生成计划** — 输入通知文本，输出结构化计划
2. **从最终交付物反向拆解微任务** — 每个交付物拆成可执行的小任务
3. **不靠用户打卡，而靠真实文件证据检查进度** — 扫描目录 + Git 历史

### 演示流程

1. 输入四创大赛通知
2. 自动生成项目计划和微任务
3. 导出日历文件
4. 扫描项目目录检查进度
5. 发现缺失材料（PPT、视频等）
6. 生成动态重排建议

---

## 八、安装方式

```bash
# 从 ClawHub 安装
openclaw plugins install clawhub:claw-planops

# 或从源码安装
git clone <repo>
cd claw-planops
npm install
npm run build
```

---

## 九、联系方式

- 作者：Yeezy7
- 仓库：https://github.com/Yeezy7/ClawPlanOps
- ClawHub：https://clawhub.ai/plugins/claw-planops
