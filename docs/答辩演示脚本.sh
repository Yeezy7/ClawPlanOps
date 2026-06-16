#!/bin/bash
# ClawPlanOps 答辩演示脚本
# 时长：1-2 分钟

set -e

echo "═══════════════════════════════════════════"
echo "  ClawPlanOps – 答辩演示"
echo "═══════════════════════════════════════════"
echo ""

# 自动检测 node
if [ -z "$(command -v node 2>/dev/null)" ]; then
  for nvmSh in "$HOME/.nvm/nvm.sh" "/opt/homebrew/opt/nvm/nvm.sh" "/usr/local/opt/nvm/nvm.sh"; do
    if [ -s "$nvmSh" ]; then . "$nvmSh"; break; fi
  done
fi

BIN="$(command -v node) dist/cli.js"
NOTICE="examples/zzu_four_creation_notice.txt"

echo "【演示 1】解析比赛通知"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "输入：郑州大学四创大赛通知"
echo ""
$BIN parse "$NOTICE" 2>/dev/null | head -15
echo ""
echo ""

echo "【演示 2】生成项目计划"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN parse "$NOTICE" > /tmp/demo_reqs.json 2>/dev/null
$BIN plan /tmp/demo_reqs.json > /tmp/demo_plan.json 2>/dev/null
echo "已生成："
cat /tmp/demo_plan.json | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('  阶段数：'+d.phases.length);
console.log('  微任务：'+d.micro_tasks.length+' 个');
console.log('  计划周期：'+d.total_days+' 天');
d.phases.forEach(p=>console.log('  - '+p.phase_name));
"
echo ""
echo ""

echo "【演示 3】检查项目进度"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN check . 2>/dev/null | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('  进度：'+d.progress_percent+'%');
console.log('  风险：'+d.risk_level);
console.log('  已完成：'+d.completed.length+' 项');
console.log('  缺失：'+d.missing.length+' 项');
d.missing.slice(0,3).forEach(m=>console.log('    ✗ '+m.description));
"
echo ""
echo ""

echo "【演示 4】提交前检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN presubmit . /tmp/demo_plan.json 2>/dev/null | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('  评分：'+d.score+'%');
console.log('  状态：'+(d.ready?'✅ 可以提交':'❌ 材料不全'));
if(d.missing_files.length>0){
  console.log('  缺失：');
  d.missing_files.forEach(f=>console.log('    ✗ '+f));
}
"
echo ""
echo ""

echo "【演示 5】进度趋势"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$BIN trend . 2>/dev/null | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('  当前进度：'+d.trend.current_percent+'%');
console.log('  趋势：'+d.trend.trend_direction);
console.log('  快照数：'+d.trend.snapshots_count);
"
echo ""
echo ""

echo "═══════════════════════════════════════════"
echo "  演示完成！"
echo "═══════════════════════════════════════════"
echo ""
echo "核心亮点："
echo "  1. 从任务通知自动生成计划"
echo "  2. 从交付物反向拆解微任务"
echo "  3. 靠真实文件证据检查进度"
