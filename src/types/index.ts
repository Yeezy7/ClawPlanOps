// ============================================================
// ClawPlanOps – Core Type Definitions
// ============================================================

// ---- parse_task_requirements ---------------------------------

export interface TaskRequirements {
  task_name: string;
  deadline: string; // ISO datetime string e.g. "2026-06-22T12:00:00"
  deliverables: string[];
  constraints: string[];
  submission_rules: string[];
  raw_input: string;
}

// ---- build_deliverable_plan ----------------------------------

export interface Phase {
  phase_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  goal: string;
  deliverables: string[];
}

export interface MicroTask {
  id: string;
  name: string;
  estimated_minutes: number; // 30–90
  deliverable_id: string; // which deliverable this belongs to
  phase_name: string;
  completion_criteria: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DeliverablePlan {
  task_name: string;
  deadline: string;
  start_date: string;
  total_days: number;
  daily_hours: number;
  phases: Phase[];
  deliverables: DeliverableItem[];
  micro_tasks: MicroTask[];
}

export interface DeliverableItem {
  id: string;
  name: string;
  description: string;
  sub_tasks: string[];
  evidence_files: string[]; // files that prove this deliverable is done
  priority: 'high' | 'medium' | 'low';
}

// ---- generate_calendar_schedule ------------------------------

export interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  start: string; // ISO datetime
  end: string;
  completion_criteria: string;
  deliverable_id: string;
  risk_note: string;
}

export interface CalendarResult {
  ics_file_path: string;
  ics_content: string;
  event_count: number;
  events: CalendarEvent[];
}

// ---- check_progress_evidence ---------------------------------

export interface EvidenceRule {
  id: string;
  description: string;
  file_patterns: string[]; // glob-like patterns e.g. "README.md", "src/**/*.ts"
  check_type: 'file_exists' | 'file_modified_recently' | 'file_not_empty' | 'directory_exists' | 'recent_commits' | 'commit_count' | 'specific_file_committed';
  weight: number; // 0–100, sum of all weights = 100
  deliverable_id: string;
}

export interface EvidenceResult {
  rule_id: string;
  description: string;
  passed: boolean;
  detail: string; // e.g. "README.md found" or "openclaw.plugin.json missing"
  weight: number;
}

export interface ProgressReport {
  progress_percent: number;
  completed: EvidenceResult[];
  missing: EvidenceResult[];
  risks: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  scanned_path: string;
  scanned_at: string; // ISO datetime
}

// ---- generate_daily_progress_report --------------------------

export interface DailyReport {
  report_date: string;
  planned_today: MicroTask[];
  actual_evidence: EvidenceResult[];
  missing_evidence: EvidenceResult[];
  progress_delta: number; // change since last check
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  next_actions: string[];
}

// ---- reschedule_plan ------------------------------------------

export interface RescheduleResult {
  delay_days: number;
  is_on_track: boolean;
  priority_tasks: MicroTask[];
  removed_tasks: MicroTask[];
  compressed_tasks: MicroTask[]; // tasks with shortened estimated time
  recommended_next_plan: Phase[];
  advice: string[];
}

// ---- shared / helpers ----------------------------------------

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type InputType = 'text' | 'url';
