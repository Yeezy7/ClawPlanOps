# Changelog

## [0.2.0] - 2026-05-25

### Added
- 完整 6 步流水线: 解析 → 计划 → 日历 → 检查 → 报告 → 重排
- CLI 工具（7 个命令，含 `full` 端到端流程）
- OpenClaw 插件清单与 `clawplanops_*` 工具导出（6 个工具）
- 正则解析器 + AI 解析器双模式
- RFC 5545 标准 ICS 日历生成（含 VALARM 提醒）
- macOS Calendar.app 直连导入（`--apple-cal`）
- 文件系统 + Git 证据检查（12 条规则，权重总和 100）
- Markdown 报告导出（计划、进度、重排）
- 项目配置文件支持（`.planopsrc.json`）
- 自定义交付物模板（`custom_templates` 参数）
- 输入校验工具
- 单元测试: 116 个测试用例覆盖所有核心模块（vitest）
- 发布入口改为 `dist/index.js`，并提供类型声明 `dist/index.d.ts`
- MIT LICENSE
- .npmignore 排除开发文件
- CHANGELOG.md 版本记录

### Changed
- `README.md` 与当前 CLI、OpenClaw 工具名、测试数量和输出目录策略对齐。
- URL 抓取测试改为 HTTP mock，避免受限环境下本地端口监听失败。
- 重排测试改为相对日期，避免固定历史日期导致测试随时间失效。
- 日历排期不再因截止时间不足而静默丢弃任务，会保留所有事件并标记超期风险。
- 证据扫描会读取并应用 `exclude_patterns`，避免将 `dist/` 等构建输出计入最近修改证据。
- Apple Calendar 导入改为直接调用 `osascript -e` 参数并集中转义脚本文本，降低 shell 拼接风险。
- 新增 `npm run delivery:check`，一键执行类型检查、测试、构建、工具导出校验和发布包 dry-run。
