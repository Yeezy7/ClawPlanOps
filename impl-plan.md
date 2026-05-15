# ClawPlanOps 实现规划

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js
- **插件框架**: OpenClaw
- **日历**: 自实现 ICS 生成器（零依赖）
- **文件扫描**: Node.js fs 模块
- **构建**: tsc

## 实现顺序

按依赖关系排序：底层模块先行，上层工具后行。

---

## Phase 1: 项目骨架

| # | 文件 | 说明 |
|---|------|------|
| 1.1 | `package.json` | Node 项目配置 |
| 1.2 | `tsconfig.json` | TypeScript 编译配置 |
| 1.3 | `openclaw.plugin.json` | OpenClaw 插件声明 |
| 1.4 | `src/index.ts` | 插件入口，注册 6 个工具 |

---

## Phase 2: 核心类型定义

| # | 文件 | 说明 |
|---|------|------|
| 2.1 | `src/types/index.ts` | 所有接口/类型定义 |

---

## Phase 3: 任务解析模块

| # | 文件 | 说明 |
|---|------|------|
| 3.1 | `src/planner/taskParser.ts` | `parse_task_requirements` 实现 |

策略：纯规则解析 + 关键字匹配，输出结构化 JSON。不做 NLP。

---

## Phase 4: 计划生成模块

| # | 文件 | 说明 |
|---|------|------|
| 4.1 | `src/planner/deliverablePlanner.ts` | `build_deliverable_plan` 实现 |
| 4.2 | `src/planner/microTaskGenerator.ts` | 微任务拆解 |

---

## Phase 5: 日历导出模块

| # | 文件 | 说明 |
|---|------|------|
| 5.1 | `src/calendar/icsExporter.ts` | `generate_calendar_schedule` 实现 |

策略：自拼接 ICS 文本，不依赖第三方库。

---

## Phase 6: 进度证据检查模块

| # | 文件 | 说明 |
|---|------|------|
| 6.1 | `src/evidence/evidenceRules.ts` | 证据规则定义 |
| 6.2 | `src/evidence/fileScanner.ts` | 文件系统扫描 |
| 6.3 | `src/evidence/progressScorer.ts` | 进度打分与风险判定 |

---

## Phase 7: 报告与重排模块

| # | 文件 | 说明 |
|---|------|------|
| 7.1 | `src/report/dailyReport.ts` | `generate_daily_progress_report` |
| 7.2 | `src/planner/rescheduler.ts` | `reschedule_plan` 实现 |

---

## Phase 8: 工具注册（连接层）

| # | 文件 | 说明 |
|---|------|------|
| 8.1 | `src/tools/parseTaskRequirements.ts` | 工具 wrapper |
| 8.2 | `src/tools/buildDeliverablePlan.ts` | 工具 wrapper |
| 8.3 | `src/tools/generateCalendarSchedule.ts` | 工具 wrapper |
| 8.4 | `src/tools/checkProgressEvidence.ts` | 工具 wrapper |
| 8.5 | `src/tools/generateDailyProgressReport.ts` | 工具 wrapper |
| 8.6 | `src/tools/reschedulePlan.ts` | 工具 wrapper |

---

## Phase 9: 示例与测试数据

| # | 文件 | 说明 |
|---|------|------|
| 9.1 | `examples/zzu_four_creation_notice.txt` | 四创大赛通知样例 |
| 9.2 | `examples/sample_project/` | 模拟项目目录（用于测试进度检查） |
| 9.3 | `examples/expected_output.json` | 预期输出样例 |

---

## 模块依赖图

```
types/index.ts
    │
    ├── planner/taskParser.ts ─────────────────────────────────────────────────────┐
    │       │                                                                       │
    │       └── planner/deliverablePlanner.ts ──┐                                   │
    │               │                           │                                   │
    │               └── planner/microTaskGenerator.ts                               │
    │                       │                   │                                   │
    │                       └── calendar/icsExporter.ts                             │
    │                                           │                                   │
    ├── evidence/evidenceRules.ts ──┐           │                                   │
    │       │                      │           │                                   │
    │       ├── evidence/fileScanner.ts         │                                   │
    │       │       │              │           │                                   │
    │       └── evidence/progressScorer.ts      │                                   │
    │               │              │           │                                   │
    ├── report/dailyReport.ts ─────┘           │                                   │
    │       │                                  │                                   │
    └── planner/rescheduler.ts ────────────────┘                                   │
            │                                                                       │
            └── tools/*.ts ─── index.ts ─── openclaw.plugin.json
```

## 执行策略

按 Phase 1→9 顺序执行，每个 Phase 内文件可并行编写。
每完成一个 Phase，验证 TypeScript 编译通过。

## 质量约束

- 不引入任何第三方 npm 依赖（calendar/ics 库等都不需要）
- 每个函数保持纯函数风格，输入输出明确
- 所有日期计算用 UTC 避免时区问题
- ICS 文件严格遵循 RFC 5545
