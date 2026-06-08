#!/bin/bash
# ClawPlanOps 演示脚本
# 展示完整的 6 步流程

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   ClawPlanOps 完整功能演示               ║"
echo "║   基于交付物证据的项目执行规划插件        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

BIN="node dist/cli.js"
NOTICE="examples/zzu_four_creation_notice.txt"
PROJECT="."

# Step 1: Parse
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1/6: 解析任务要求"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN parse "$NOTICE" | head -20
echo ""

# Step 2: Plan (save to temp file)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2/6: 生成交付物计划"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN parse "$NOTICE" > /tmp/clawplanops_reqs.json
$BIN plan /tmp/clawplanops_reqs.json > /tmp/clawplanops_plan.json 2>/dev/null
cat /tmp/clawplanops_plan.json | head -30
echo ""

# Step 3: Calendar
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3/6: 生成 .ics 日历文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN calendar /tmp/clawplanops_plan.json
echo ""
echo "  日历文件已生成，可导入系统日历："
echo "    - Apple Calendar: 双击 output/schedule.ics"
echo "    - Google Calendar: 设置 → 导入 → output/schedule.ics"
echo "    - Outlook: 文件 → 打开 → output/schedule.ics"
echo ""

# Step 4: Progress Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 4/6: 检查项目进度证据"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN check "$PROJECT"
echo ""

# Step 5: Daily Report
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 5/6: 生成每日进度报告"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN report "$PROJECT" /tmp/clawplanops_plan.json
echo ""

# Step 6: Full pipeline
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 6/6: 完整流程演示 (full)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN full "$NOTICE" "$PROJECT"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   演示完成！                              ║"
echo "║   所有输出文件在 output/ 目录中           ║"
echo "╚══════════════════════════════════════════╝"
