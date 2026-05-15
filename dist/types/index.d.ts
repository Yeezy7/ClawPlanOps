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
//# sourceMappingURL=index.d.ts.map