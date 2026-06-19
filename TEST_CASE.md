# ClawPlanOps 插件测试用例

## 测试目标

验证插件在 OpenClaw Web 上正确调用工具，而不是自己实现功能。

---

## 测试用例 1：基础规划（必过）

### 测试输入

```
帮我规划一个比赛：
- 名称：校园APP创新大赛
- 截止时间：2026年7月15日
- 交付物：APP原型、设计文档、演示视频
- 团队：3人
- 每天投入：3小时
- 项目目录：~/Projects/campus-app-contest
```

### 预期行为

1. ✅ 调用 `clawplanops_parse_task_requirements` 解析任务
2. ✅ 调用 `clawplanops_build_deliverable_plan` 生成计划
3. ✅ 展示阶段划分表格
4. ✅ 询问是否导出日历

### 验证点

- [ ] 检查对话记录，确认调用了 `clawplanops_parse_task_requirements`
- [ ] 检查对话记录，确认调用了 `clawplanops_build_deliverable_plan`
- [ ] 没有看到 AI 自己写 PLAN.md 或用 curl 解析

---

## 测试用例 2：带 URL 的规划

### 测试输入

```
/claw_planops full https://www5.zzu.edu.cn/student/info/1003/12715.htm
```

然后补充信息：

```
参加 E2 赛道，2人团队，每天2小时
```

### 预期行为

1. ✅ 调用 `clawplanops_parse_task_requirements` 解析 URL 内容
2. ✅ 调用 `clawplanops_build_deliverable_plan` 生成计划
3. ✅ 展示计划摘要

### 验证点

- [ ] 没有用 curl/web_fetch 自己抓取网页
- [ ] 没有自己解析 HTML 内容
- [ ] 工具被正确调用

---

## 测试用例 3：进度检查

### 前置条件

先用测试用例 1 生成一个计划，然后在项目目录中创建一些文件：

```bash
mkdir -p ~/Projects/campus-app-contest
cd ~/Projects/campus-app-contest
echo "# 校园APP" > README.md
git init && git add -A && git commit -m "初始化项目"
```

### 测试输入

```
检查一下 ~/Projects/campus-app-contest 的进度
```

### 预期行为

1. ✅ 调用 `clawplanops_check_progress_evidence`
2. ✅ 展示进度百分比和风险等级
3. ✅ 列出已完成和缺失的交付物

### 验证点

- [ ] 没有自己扫描文件目录
- [ ] 没有自己读取 Git 历史
- [ ] 工具被正确调用

---

## 测试用例 4：日历导出

### 测试输入

```
导出日历到 ~/Projects/campus-app-contest
```

### 预期行为

1. ✅ 调用 `clawplanops_generate_calendar_schedule`
2. ✅ 生成 .ics 文件
3. ✅ 告知文件位置和导入方法

### 验证点

- [ ] 没有自己写 ICS 生成代码
- [ ] 没有用 Python/Node 脚本生成日历
- [ ] 工具被正确调用

---

## 快速验证脚本

在 OpenClaw Web 测试后，用以下命令检查对话记录：

```bash
# 找到最新的对话记录
ls -lt ~/.openclaw/agents/main/sessions/*.jsonl | head -1

# 检查是否调用了工具（应该看到 clawplanops_ 开头的工具调用）
grep -o '"name":"clawplanops_[^"]*"' ~/.openclaw/agents/main/sessions/<最新文件>.jsonl | sort | uniq -c
```

### 预期输出示例

```
   2 clawplanops_parse_task_requirements
   2 clawplanops_build_deliverable_plan
   1 clawplanops_generate_calendar_schedule
```

### 如果看到以下内容，说明插件工作正常

- ✅ `"name":"clawplanops_parse_task_requirements"` — 工具被调用
- ✅ `"name":"clawplanops_build_deliverable_plan"` — 工具被调用

### 如果看到以下内容，说明插件有问题

- ❌ `"command":"curl ..."` — AI 自己用 curl 抓取网页
- ❌ `"command":"cat > PLAN.md ..."` — AI 自己写计划文件
- ❌ `"command":"python ... ics ..."` — AI 自己生成日历

---

## 测试通过标准

| 测试用例 | 必须调用的工具 | 通过条件 |
|---------|---------------|---------|
| 用例 1 | parse_task_requirements, build_deliverable_plan | 两个工具都被调用 |
| 用例 2 | parse_task_requirements, build_deliverable_plan | 没有用 curl/web_fetch |
| 用例 3 | check_progress_evidence | 没有自己扫描文件 |
| 用例 4 | generate_calendar_schedule | 没有自己写 ICS 代码 |

**所有用例通过 = 插件功能正常**
