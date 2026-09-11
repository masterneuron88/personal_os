export type Domain = "work" | "health" | "family" | "wealth" | "me";

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed" | "skipped";
export type ItemStatus = "planned" | "in-progress" | "completed";
export type TrendDirection = "improving" | "declining" | "stable";

export interface RoutineTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  tags: Domain[];
  time?: string;
  notes?: string;
  recurrence?: string;
  date: string;
}

export interface LearningItem {
  id: string;
  title: string;
  description: string;
  tags: Domain[];
  status: ItemStatus;
}

export interface PlanningItem {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  tags: Domain[];
  status: ItemStatus;
}

export interface AnalysisItem {
  id: string;
  title: string;
  notes: string;
  tags: Domain[];
  date: string;
}

export interface DomainScore {
  domain: Domain;
  score: number;
  trend: TrendDirection;
}

export interface SkillRequirement {
  name: string;
  requiredLevel: number; // 1-10
  currentLevel: number;  // 1-10
}

export interface TargetRole {
  id: string;
  title: string;
  company?: string;
  description?: string;
  skills: SkillRequirement[];
  notes?: string;
  createdAt: string;
}

export interface AppState {
  scores: DomainScore[];
  tasks: RoutineTask[];
  learnings: LearningItem[];
  plans: PlanningItem[];
  analyses: AnalysisItem[];
  careerGoals: TargetRole[];
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  work: "Work",
  health: "Health",
  family: "Family",
  wealth: "Wealth",
  me: "Me",
};

// Icon names mapped to Lucide icon names for reference
export const DOMAIN_ICON_NAMES: Record<Domain, string> = {
  work: "Briefcase",
  health: "Activity",
  family: "Users",
  wealth: "Wallet",
  me: "UserCircle",
};
