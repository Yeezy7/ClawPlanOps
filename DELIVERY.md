# ClawPlanOps Delivery Checklist

## Engineering Readiness

- One-command delivery check: `npm run delivery:check`
- TypeScript check: `npm run typecheck`
- Unit tests: `npm test` (116 tests)
- Build: `npm run build`
- OpenClaw export check: all 6 tools in `openclaw.plugin.json` are exported from `dist/index.js`
- CLI end-to-end demo: `node dist/cli.js full examples/zzu_four_creation_notice.txt .`
- Demo script: `bash examples/demo.sh`
- Package dry-run: `npm pack --dry-run --cache /private/tmp/claw-planops-npm-cache`

## Package Contents

The dry-run package includes:

- `dist/`
- `scripts/delivery-check.js`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `openclaw.plugin.json`
- `skills/claw-planops/`
- `package.json`

The package excludes:

- `src/`
- `tests/`
- `examples/`
- `output/`
- `node_modules/`
- local editor/system files

## Demo Flow

1. Parse the contest notice in `examples/zzu_four_creation_notice.txt`.
2. Generate deliverable phases and micro tasks.
3. Export an ICS schedule with reminders.
4. Scan file and Git evidence.
5. Generate a daily progress report.
6. Produce reschedule advice.

## Competition Materials Still Needed

- Project application form or proposal document.
- Defense PPT.
- 1-2 minute demo video.
- A short live-demo script using `bash examples/demo.sh`.
- Optional screenshots or excerpts of `output/project_plan.md`, `output/schedule.ics`, and `output/progress_report.md`.

## Known Delivery Notes

- `output/` is runtime output and should not be committed.
- `node_modules/` should not be part of the source or package delivery.
- The evidence scanner intentionally reports missing competition artifacts until the application form, PPT, and demo video are added.
- Evidence scanning respects configured `exclude_patterns`, so build output such as `dist/` does not count as recent project work.
- Apple Calendar import uses direct `osascript` arguments and escaped script strings to reduce shell quoting risk.
