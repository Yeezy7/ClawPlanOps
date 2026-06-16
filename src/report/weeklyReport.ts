import type { MicroTask, EvidenceResult, ProgressReport, GitCommit } from '../types';
import { execSync } from 'child_process';

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  total_tasks: number;
  completed_tasks: number;
  completed_details: CompletedTask[];
  git_commits: GitCommit[];
  progress_delta: number;
  next_week_focus: string[];
  blockers: string[];
}

export interface CompletedTask {
  task: MicroTask;
  completed_at: string;
  evidence: string[];
}

interface WeeklyReportParams {
  project_path: string;
  micro_tasks: MicroTask[];
  progress_report: ProgressReport;
  week_start?: string;
  week_end?: string;
}

export function generateWeeklyReport(params: WeeklyReportParams): WeeklyReport {
  const { project_path, micro_tasks, progress_report } = params;
  const weekEnd = params.week_end || getWeekEnd();
  const weekStart = params.week_start || getWeekStart(weekEnd);

  const gitCommits = getGitCommitsForWeek(project_path, weekStart, weekEnd);
  const completedTasks = findCompletedTasks(micro_tasks, gitCommits, project_path);
  const nextWeekFocus = suggestNextWeekFocus(micro_tasks, progress_report);
  const blockers = identifyBlockers(progress_report);

  return {
    week_start: weekStart,
    week_end: weekEnd,
    total_tasks: micro_tasks.length,
    completed_tasks: completedTasks.length,
    completed_details: completedTasks,
    git_commits: gitCommits,
    progress_delta: progress_report.progress_percent,
    next_week_focus: nextWeekFocus,
    blockers,
  };
}

export function exportWeeklyReportMarkdown(report: WeeklyReport): string {
  const lines: string[] = [
    `# 📊 周报 ${report.week_start} ~ ${report.week_end}`,
    '',
    `> 生成时间：${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
    `> 完成任务：${report.completed_tasks} / ${report.total_tasks}`,
    `> 本周进度：${report.progress_delta}%`,
    '',
    '---',
    '',
    '## ✅ 本周完成的任务',
    '',
  ];

  if (report.completed_details.length === 0) {
    lines.push('*本周暂无完成的任务*');
  } else {
    for (const item of report.completed_details) {
      const prio = { high: '🔴', medium: '🟡', low: '🟢' }[item.task.priority];
      lines.push(`- ${prio} **${item.task.name}** (${item.task.estimated_minutes}min)`);
      if (item.evidence.length > 0) {
        lines.push(`  - 证据: ${item.evidence.join(', ')}`);
      }
    }
  }
  lines.push('');

  lines.push('## 📝 Git 提交记录');
  lines.push('');
  if (report.git_commits.length === 0) {
    lines.push('*本周无提交*');
  } else {
    lines.push(`共 ${report.git_commits.length} 次提交：`);
    lines.push('');
    for (const c of report.git_commits) {
      lines.push(`- \`${c.hash}\` ${c.message} (${c.date.slice(0, 10)})`);
    }
  }
  lines.push('');

  if (report.next_week_focus.length > 0) {
    lines.push('## 🎯 下周重点');
    lines.push('');
    for (const item of report.next_week_focus) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  if (report.blockers.length > 0) {
    lines.push('## ⚠️ 阻塞项');
    lines.push('');
    for (const item of report.blockers) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getWeekEnd(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getWeekStart(weekEnd: string): string {
  const d = new Date(weekEnd);
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

function getGitCommitsForWeek(
  projectPath: string,
  weekStart: string,
  weekEnd: string
): GitCommit[] {
  try {
    const output = execSync(
      `git log --since="${weekStart}" --until="${weekEnd}T23:59:59" --format="%H|%aI|%s" --name-only`,
      { cwd: projectPath, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 10000 }
    );

    const commits: GitCommit[] = [];
    const blocks = output.trim().split(/\n(?=[a-f0-9]{40}\|)/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length === 0 || !lines[0]) continue;
      const [hash, date, ...rest] = lines[0].split('|');
      const files = lines.slice(1).map((l) => l.trim()).filter(Boolean);
      commits.push({ hash: hash.slice(0, 8), date, message: rest.join('|'), files_changed: files });
    }
    return commits;
  } catch {
    return [];
  }
}

function findCompletedTasks(
  tasks: MicroTask[],
  commits: GitCommit[],
  projectPath: string
): CompletedTask[] {
  const completed: CompletedTask[] = [];
  const allChangedFiles = new Set(commits.flatMap((c) => c.files_changed));

  for (const task of tasks) {
    const isCompleted = isTaskCompleted(task, allChangedFiles, projectPath);
    if (isCompleted) {
      completed.push({
        task,
        completed_at: new Date().toISOString(),
        evidence: findTaskEvidence(task, allChangedFiles),
      });
    }
  }
  return completed;
}

function isTaskCompleted(task: MicroTask, changedFiles: Set<string>, projectPath: string): boolean {
  const evidenceKeywords = task.completion_criteria.toLowerCase();
  for (const file of changedFiles) {
    const lower = file.toLowerCase();
    if (
      evidenceKeywords.includes('readme') && lower.includes('readme')
    ) return true;
    if (
      evidenceKeywords.includes('plugin') && lower.includes('openclaw.plugin')
    ) return true;
    if (
      evidenceKeywords.includes('测试') && (lower.includes('test') || lower.includes('spec'))
    ) return true;
    if (
      evidenceKeywords.includes('文档') && (lower.includes('.md') || lower.includes('doc'))
    ) return true;
  }
  return false;
}

function findTaskEvidence(task: MicroTask, changedFiles: Set<string>): string[] {
  const evidence: string[] = [];
  const keywords = task.name.toLowerCase();
  for (const file of changedFiles) {
    const lower = file.toLowerCase();
    if (
      (keywords.includes('index') && lower.includes('index')) ||
      (keywords.includes('cli') && lower.includes('cli')) ||
      (keywords.includes('parser') && lower.includes('parser')) ||
      (keywords.includes('calendar') && lower.includes('calendar'))
    ) {
      evidence.push(file);
    }
  }
  return evidence.slice(0, 5);
}

function suggestNextWeekFocus(tasks: MicroTask[], progress: ProgressReport): string[] {
  const suggestions: string[] = [];
  const highPrio = tasks.filter((t) => t.priority === 'high');

  if (progress.missing.length > 0) {
    suggestions.push(`补全缺失项: ${progress.missing.slice(0, 3).map((m) => m.description).join('、')}`);
  }
  if (highPrio.length > 0) {
    suggestions.push(`优先完成高优任务: ${highPrio.slice(0, 3).map((t) => t.name).join('、')}`);
  }
  if (progress.risk_level === 'high' || progress.risk_level === 'critical') {
    suggestions.push('进度风险较高，建议增加每日投入时间');
  }
  return suggestions.slice(0, 5);
}

function identifyBlockers(progress: ProgressReport): string[] {
  const blockers: string[] = [];
  for (const missing of progress.missing) {
    if (missing.weight >= 10) {
      blockers.push(missing.description);
    }
  }
  return blockers;
}
