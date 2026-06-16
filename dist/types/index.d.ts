export interface TaskRequirements {
    task_name: string;
    deadline: string;
    deliverables: string[];
    constraints: string[];
    submission_rules: string[];
    raw_input: string;
}
export interface Phase {
    phase_name: string;
    start_date: string;
    end_date: string;
    goal: string;
    deliverables: string[];
}
export interface MicroTask {
    id: string;
    name: string;
    estimated_minutes: number;
    deliverable_id: string;
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
    evidence_files: string[];
    priority: 'high' | 'medium' | 'low';
}
export interface CalendarEvent {
    uid: string;
    summary: string;
    description: string;
    start: string;
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
export interface EvidenceRule {
    id: string;
    description: string;
    file_patterns: string[];
    check_type: 'file_exists' | 'file_modified_recently' | 'file_not_empty' | 'directory_exists' | 'recent_commits' | 'commit_count' | 'specific_file_committed';
    weight: number;
    deliverable_id: string;
}
export interface EvidenceResult {
    rule_id: string;
    description: string;
    passed: boolean;
    detail: string;
    weight: number;
}
export interface ProgressReport {
    progress_percent: number;
    completed: EvidenceResult[];
    missing: EvidenceResult[];
    risks: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    scanned_path: string;
    scanned_at: string;
}
export interface DailyReport {
    report_date: string;
    planned_today: MicroTask[];
    actual_evidence: EvidenceResult[];
    missing_evidence: EvidenceResult[];
    progress_delta: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    next_actions: string[];
}
export interface RescheduleResult {
    delay_days: number;
    is_on_track: boolean;
    priority_tasks: MicroTask[];
    removed_tasks: MicroTask[];
    compressed_tasks: MicroTask[];
    recommended_next_plan: Phase[];
    advice: string[];
}
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type InputType = 'text' | 'url';
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
export interface GitCommit {
    hash: string;
    date: string;
    message: string;
    files_changed: string[];
}
export interface PreSubmissionCheck {
    project_name: string;
    deadline: string;
    ready: boolean;
    score: number;
    checks: SubmissionCheckItem[];
    missing_files: string[];
    warnings: string[];
    summary: string;
}
export interface SubmissionCheckItem {
    category: string;
    name: string;
    required: boolean;
    status: 'pass' | 'fail' | 'warn';
    detail: string;
}
export interface ProjectEntry {
    id: string;
    name: string;
    project_path: string;
    task_requirements: TaskRequirements;
    plan: DeliverablePlan;
    calendar?: CalendarResult;
    progress?: ProgressReport;
    created_at: string;
    updated_at: string;
}
export interface MultiProjectState {
    projects: ProjectEntry[];
    active_project_id?: string;
}
export interface ProgressSnapshot {
    timestamp: string;
    progress_percent: number;
    risk_level: string;
    completed_count: number;
    missing_count: number;
    completed_ids: string[];
    missing_ids: string[];
}
export interface ProgressTrend {
    current_percent: number;
    previous_percent: number;
    delta_percent: number;
    trend_direction: 'improving' | 'stable' | 'declining';
    snapshots_count: number;
    avg_daily_progress: number;
    estimated_completion_date: string | null;
    risk_trend: string[];
}
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
export interface NotificationConfig {
    enabled: boolean;
    method: 'system' | 'email' | 'webhook' | 'all';
    email?: {
        smtp_host: string;
        smtp_port: number;
        username: string;
        password: string;
        from: string;
        to: string;
    };
    webhook_url?: string;
    reminder_minutes_before: number[];
}
export interface NotificationResult {
    success: boolean;
    method: string;
    sent_count: number;
    errors: string[];
}
export interface CrossPlatformResult {
    success: boolean;
    platform: string;
    method: string;
    imported_count: number;
    errors: string[];
}
//# sourceMappingURL=index.d.ts.map