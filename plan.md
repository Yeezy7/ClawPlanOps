下面是一版 **ClawPlanOps 开发规划**，按“能做出 MVP、能参赛演示、后续可扩展”的节奏设计。

# ClawPlanOps 开发规划

## 一、开发目标

开发一个 OpenClaw 技能插件，实现：

> 输入任务通知/链接/说明文本 → 自动解析任务要求 → 生成交付物计划 → 生成日历文件 → 检查真实进度证据 → 动态调整后续计划。

MVP 阶段不追求大而全，重点做出完整闭环：

```text
任务解析 → 计划生成 → 日历导出 → 进度检查 → 重排建议
```

---

# 二、MVP 功能范围

## 必做功能

### 1. 任务要求解析

支持输入：

```text
一段通知文本
比赛/活动链接内容的纯文本
课程作业说明
用户自然语言目标
```

输出结构化信息：

```json
{
  "task_name": "郑州大学第一届四创大赛 E2 技能插件开发赛",
  "deadline": "2026-06-22 12:00",
  "deliverables": [
    "OpenClaw 插件代码",
    "openclaw.plugin.json",
    "README.md",
    "项目申报表",
    "答辩 PPT",
    "演示视频"
  ],
  "constraints": [
    "团队人数不超过5人",
    "需开发具有实际功能的技能插件",
    "需按时提交电子版材料"
  ]
}
```

---

### 2. 交付物反向规划

根据最终交付物自动拆任务。

例如：

```text
OpenClaw 插件代码
├── 创建项目结构
├── 编写 openclaw.plugin.json
├── 实现核心工具函数
├── 准备测试样例
└── 编写 README
```

---

### 3. 微任务生成

将大任务拆成 30—90 分钟内可完成的小任务。

示例：

```text
创建插件项目目录
写出 5 个工具函数名称
完成 openclaw.plugin.json 初版
实现 parse_task_requirements
准备一个任务通知样例
生成 README Usage 部分
```

---

### 4. 日历导出

生成 `.ics` 文件，可导入：

```text
Apple Calendar
Outlook
Google Calendar
系统日历
```

每个日历事件包含：

```text
任务名称
时间段
完成标准
关联交付物
风险提示
```

---

### 5. 证据式进度检查

扫描项目目录，判断任务是否真的完成。

MVP 先检查这些证据：

```text
README.md 是否存在
openclaw.plugin.json 是否存在
src/index.ts 是否存在
examples/ 是否存在
申报书文件是否存在
PPT 文件是否存在
演示视频是否存在
最近是否有文件修改
```

---

### 6. 动态重排建议

如果进度落后，输出补救方案：

```text
当前进度落后 1 天
建议删除低优先级功能
优先完成 MVP 工具函数
今晚补 openclaw.plugin.json
明天完成 README 和演示数据
```

MVP 阶段可以先只生成重排建议，不必自动改日历；后续版本再重新生成 `.ics`。

---

# 三、插件工具函数设计

建议第一版实现 6 个工具。

## 1. `parse_task_requirements`

作用：解析任务要求。

输入：

```json
{
  "content": "任务通知、链接正文或用户目标",
  "input_type": "text"
}
```

输出：

```json
{
  "task_name": "string",
  "deadline": "string",
  "deliverables": [],
  "constraints": [],
  "submission_rules": []
}
```

---

## 2. `build_deliverable_plan`

作用：根据任务要求生成交付物计划。

输入：

```json
{
  "task_requirements": {},
  "available_days": 14,
  "daily_available_hours": 2
}
```

输出：

```json
{
  "phases": [],
  "deliverables": [],
  "micro_tasks": []
}
```

---

## 3. `generate_calendar_schedule`

作用：生成 `.ics` 日历文件。

输入：

```json
{
  "micro_tasks": [],
  "start_date": "2026-05-18",
  "deadline": "2026-06-22",
  "preferred_work_time": "20:00-22:00"
}
```

输出：

```json
{
  "ics_file": "claw_planops_schedule.ics",
  "event_count": 18
}
```

---

## 4. `check_progress_evidence`

作用：检查项目真实进度。

输入：

```json
{
  "project_path": "./claw-planops",
  "evidence_rules": []
}
```

输出：

```json
{
  "progress_percent": 42,
  "completed": [],
  "missing": [],
  "risks": [],
  "risk_level": "medium"
}
```

---

## 5. `generate_daily_progress_report`

作用：生成每日进度报告。

输出：

```json
{
  "planned_today": [],
  "actual_evidence": [],
  "missing_evidence": [],
  "risk_level": "medium",
  "next_actions": []
}
```

---

## 6. `reschedule_plan`

作用：根据进度落后情况生成重排建议。

输出：

```json
{
  "delay_days": 1.5,
  "priority_tasks": [],
  "removed_tasks": [],
  "compressed_tasks": [],
  "recommended_next_plan": []
}
```

---

# 四、项目目录结构

建议目录：

```text
claw-planops/
├── package.json
├── openclaw.plugin.json
├── README.md
├── src/
│   ├── index.ts
│   ├── tools/
│   │   ├── parseTaskRequirements.ts
│   │   ├── buildDeliverablePlan.ts
│   │   ├── generateCalendarSchedule.ts
│   │   ├── checkProgressEvidence.ts
│   │   ├── generateDailyProgressReport.ts
│   │   └── reschedulePlan.ts
│   ├── planner/
│   │   ├── taskParser.ts
│   │   ├── deliverablePlanner.ts
│   │   ├── microTaskGenerator.ts
│   │   └── rescheduler.ts
│   ├── calendar/
│   │   └── icsExporter.ts
│   ├── evidence/
│   │   ├── fileScanner.ts
│   │   ├── evidenceRules.ts
│   │   └── progressScorer.ts
│   └── report/
│       └── dailyReport.ts
├── examples/
│   ├── zzu_four_creation_notice.txt
│   ├── sample_project/
│   └── expected_output.json
└── output/
    ├── project_plan.md
    ├── schedule.ics
    └── progress_report.md
```

---

# 五、开发阶段安排

## 第 1 阶段：需求与插件骨架

时间：1—2 天

目标：

```text
明确插件边界
完成项目结构
完成 openclaw.plugin.json
完成 README 初稿
定义 6 个工具函数
```

产出：

```text
项目目录
插件配置文件
工具函数接口说明
样例任务通知
```

---

## 第 2 阶段：任务解析与计划生成

时间：2—3 天

目标：

```text
实现 parse_task_requirements
实现 build_deliverable_plan
实现微任务拆解逻辑
支持四创通知样例
```

优先用规则 + LLM 输出结构化 JSON 的方式，不要一开始做复杂 NLP。

产出：

```text
任务要求 JSON
交付物计划 JSON
微任务列表
project_plan.md
```

---

## 第 3 阶段：日历导出

时间：1—2 天

目标：

```text
实现 .ics 文件生成
支持任务标题、时间段、描述、完成标准
支持用户指定每日可用时间
```

产出：

```text
schedule.ics
可导入系统日历的演示文件
```

---

## 第 4 阶段：进度证据检查

时间：2—3 天

目标：

```text
实现项目目录扫描
检查 README/openclaw.plugin.json/src/examples/PPT/视频等证据
生成进度百分比
输出缺失项和风险等级
```

产出：

```text
progress_report.md
progress_report.json
```

---

## 第 5 阶段：动态重排

时间：1—2 天

目标：

```text
根据缺失证据和剩余时间判断延期风险
给出压缩任务、砍功能、优先级调整建议
```

MVP 不需要完全自动生成新计划，但要能输出合理重排建议。

产出：

```text
reschedule_report.md
recommended_next_plan.json
```

---

## 第 6 阶段：演示与参赛材料

时间：2 天

目标：

```text
准备演示样例
录制 1—2 分钟演示视频
整理 README
准备项目申报表
准备答辩 PPT
```

演示重点：

```text
输入四创通知
生成项目计划
导出日历
扫描项目目录
发现 openclaw.plugin.json 缺失
生成重排建议
```

---

# 六、推荐 10 天开发节奏

## Day 1

```text
确定项目名称和范围
创建项目结构
写 openclaw.plugin.json
写 README 初稿
```

## Day 2

```text
实现 parse_task_requirements
准备四创通知样例
输出结构化任务要求 JSON
```

## Day 3

```text
实现 build_deliverable_plan
生成阶段计划和交付物清单
```

## Day 4

```text
实现 micro task 生成
输出 project_plan.md
```

## Day 5

```text
实现 generate_calendar_schedule
导出 schedule.ics
测试导入电脑日历
```

## Day 6

```text
实现 check_progress_evidence
扫描项目目录和核心文件
```

## Day 7

```text
实现 progress scoring
生成 progress_report.md
```

## Day 8

```text
实现 reschedule_plan
输出延期补救建议
```

## Day 9

```text
联调完整流程
准备演示数据
修 README
```

## Day 10

```text
录制演示视频
整理申报书
准备答辩 PPT
```

---

# 七、MVP 验收标准

开发完成后，至少要能演示以下流程：

```text
1. 输入一段四创大赛通知
2. 插件识别任务名称、截止时间、交付物和约束
3. 插件生成项目阶段计划和微任务
4. 插件导出 .ics 日历文件
5. 插件扫描一个项目文件夹
6. 插件发现缺失 openclaw.plugin.json / README / PPT 等问题
7. 插件生成每日进度报告
8. 插件给出动态重排建议
```

只要这 8 步跑通，就够参赛初版使用。

---

# 八、答辩展示重点

答辩时不要说：

> 我做了一个项目规划工具。

要说：

> 我做的是一个基于交付物证据的项目执行规划插件。它能从任务通知中识别要求，生成计划，并通过检查真实文件进度判断任务是否完成。

重点突出三句话：

```text
1. 从任务要求自动生成计划。
2. 从最终交付物反向拆解微任务。
3. 不靠用户打卡，而靠真实文件证据检查进度。
```

---

# 九、后续扩展方向

MVP 后可以扩展：

```text
1. 自动读取网页链接内容
2. 支持 PDF/Word 任务书解析
3. 支持 Google Calendar API
4. 支持每日自动提醒
5. 支持 Git 提交记录作为进度证据
6. 支持团队成员任务分配
7. 支持周报自动生成
8. 支持提交前材料检查
```

建议比赛初版只做前 5 个 MVP 功能，不要贪多。
