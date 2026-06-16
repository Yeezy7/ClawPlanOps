import { execSync } from 'child_process';
import type { MicroTask, GitCommit } from '../types';

export interface TaskGitLink {
  task: MicroTask;
  commits: GitCommit[];
  linked_files: string[];
  last_commit_date: string;
}

export interface GitTaskReport {
  project_path: string;
  total_commits: number;
  task_links: TaskGitLink[];
  unlinked_commits: GitCommit[];
  coverage_percent: number;
}

export function getRecentCommits(projectPath: string, days: number = 30): GitCommit[] {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const output = execSync(
      `git log --since="${sinceStr}" --format="%H|%aI|%s" --name-only`,
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

export function linkCommitsToTasks(
  commits: GitCommit[],
  tasks: MicroTask[]
): GitTaskReport {
  const taskLinks: TaskGitLink[] = [];
  const linkedCommitHashes = new Set<string>();

  for (const task of tasks) {
    const linkedCommits = commits.filter((c) => isCommitRelatedToTask(c, task));
    if (linkedCommits.length > 0) {
      linkedCommits.forEach((c) => linkedCommitHashes.add(c.hash));
      const allFiles = [...new Set(linkedCommits.flatMap((c) => c.files_changed))];
      taskLinks.push({
        task,
        commits: linkedCommits,
        linked_files: allFiles,
        last_commit_date: linkedCommits[0]?.date || '',
      });
    }
  }

  const unlinkedCommits = commits.filter((c) => !linkedCommitHashes.has(c.hash));
  const coverage = tasks.length > 0
    ? Math.round((taskLinks.filter((l) => l.commits.length > 0).length / tasks.length) * 100)
    : 0;

  return {
    project_path: '',
    total_commits: commits.length,
    task_links: taskLinks,
    unlinked_commits: unlinkedCommits,
    coverage_percent: coverage,
  };
}

export function generateGitTaskMarkdown(report: GitTaskReport): string {
  const lines: string[] = [
    `# 🔗 Git 提交与任务关联报告`,
    '',
    `> 总提交数：${report.total_commits}`,
    `> 关联覆盖率：**${report.coverage_percent}%**`,
    '',
    '---',
    '',
  ];

  if (report.task_links.length > 0) {
    lines.push('## ✅ 已关联任务');
    lines.push('');
    for (const link of report.task_links) {
      const prio = { high: '🔴', medium: '🟡', low: '🟢' }[link.task.priority];
      lines.push(`### ${prio} ${link.task.name}`);
      lines.push('');
      lines.push(`- 提交数: ${link.commits.length}`);
      lines.push(`- 关联文件: ${link.linked_files.slice(0, 5).join(', ')}`);
      lines.push(`- 最后提交: ${link.last_commit_date.slice(0, 10)}`);
      lines.push('');
      lines.push('关联的提交:');
      for (const c of link.commits.slice(0, 5)) {
        lines.push(`- \`${c.hash}\` ${c.message} (${c.date.slice(0, 10)})`);
      }
      lines.push('');
    }
  }

  if (report.unlinked_commits.length > 0) {
    lines.push('## ❓ 未关联的提交');
    lines.push('');
    for (const c of report.unlinked_commits.slice(0, 10)) {
      lines.push(`- \`${c.hash}\` ${c.message} (${c.date.slice(0, 10)})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function isCommitRelatedToTask(commit: GitCommit, task: MicroTask): boolean {
  const taskNameLower = task.name.toLowerCase();
  const taskCriteria = task.completion_criteria.toLowerCase();
  const commitMsg = commit.message.toLowerCase();
  const commitFiles = commit.files_changed.join(' ').toLowerCase();

  const keywords = extractKeywords(taskNameLower);
  for (const kw of keywords) {
    if (commitMsg.includes(kw) || commitFiles.includes(kw)) return true;
  }

  const criteriaKeywords = extractKeywords(taskCriteria);
  for (const kw of criteriaKeywords) {
    if (commitMsg.includes(kw) || commitFiles.includes(kw)) return true;
  }

  return false;
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const patterns = [
    /readme/gi, /plugin/gi, /test/gi, /spec/gi,
    /calendar/gi, /ics/gi, /plan/gi, /task/gi,
    /parser/gi, /scanner/gi, /evidence/gi, /report/gi,
    /ppt/gi, /video/gi, /doc/gi, /index/gi, /cli/gi,
    /config/gi, /util/gi, /type/gi, /export/gi,
  ];

  for (const pat of patterns) {
    const matches = text.match(pat);
    if (matches) {
      keywords.push(...matches.map((m) => m.toLowerCase()));
    }
  }

  const words = text.split(/[\s_\-/]+/).filter((w) => w.length > 2);
  keywords.push(...words);

  return [...new Set(keywords)];
}
