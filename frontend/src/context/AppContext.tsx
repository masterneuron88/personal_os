import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AppState, RoutineTask, LearningItem, PlanningItem, AnalysisItem, DomainScore, Domain, TargetRole } from "@/types";

const DEFAULT_SCORES: DomainScore[] = [
  { domain: "work", score: 72, trend: "improving" },
  { domain: "health", score: 65, trend: "stable" },
  { domain: "family", score: 80, trend: "improving" },
  { domain: "wealth", score: 58, trend: "declining" },
  { domain: "me", score: 70, trend: "stable" },
];

const DEFAULT_STATE: AppState = {
  scores: DEFAULT_SCORES,
  tasks: [
    { id: "1", title: "Morning meditation", status: "pending", priority: "high", tags: ["me", "health"], time: "06:30", date: new Date().toISOString().slice(0, 10), recurrence: "daily" },
    { id: "2", title: "Review quarterly goals", status: "pending", priority: "high", tags: ["work"], time: "09:00", date: new Date().toISOString().slice(0, 10) },
    { id: "3", title: "30 min workout", status: "pending", priority: "medium", tags: ["health"], time: "07:00", date: new Date().toISOString().slice(0, 10), recurrence: "daily" },
    { id: "4", title: "Family dinner", status: "pending", priority: "high", tags: ["family"], time: "19:00", date: new Date().toISOString().slice(0, 10) },
    { id: "5", title: "Review investment portfolio", status: "pending", priority: "medium", tags: ["wealth"], date: new Date().toISOString().slice(0, 10) },
    { id: "6", title: "Read 30 pages", status: "pending", priority: "low", tags: ["me"], time: "21:00", date: new Date().toISOString().slice(0, 10), recurrence: "daily" },
  ],
  learnings: [
    { id: "1", title: "TypeScript Advanced Patterns", description: "Deep dive into conditional types and mapped types", tags: ["work", "me"], status: "in-progress" },
    { id: "2", title: "Nutrition fundamentals", description: "Macro tracking and meal planning basics", tags: ["health"], status: "planned" },
  ],
  plans: [
    { id: "1", title: "Launch side project MVP", description: "Complete and ship the first version", targetDate: "2026-03-15", tags: ["work", "wealth"], status: "in-progress" },
    { id: "2", title: "Family vacation planning", description: "Research and book spring break trip", targetDate: "2026-04-01", tags: ["family"], status: "planned" },
  ],
  analyses: [
    { id: "1", title: "Weekly energy review", notes: "Energy levels highest on Mon-Wed, declining Thu-Fri. Need better sleep schedule.", tags: ["health", "me"], date: new Date().toISOString().slice(0, 10) },
  ],
  careerGoals: [
    {
      id: "1",
      title: "Senior Engineering Manager",
      company: "Top Tech Company",
      description: "Lead a team of 15+ engineers, drive architecture decisions, and own product delivery.",
      skills: [
        { name: "Team Leadership", requiredLevel: 9, currentLevel: 6 },
        { name: "System Design", requiredLevel: 9, currentLevel: 7 },
        { name: "Stakeholder Mgmt", requiredLevel: 8, currentLevel: 5 },
        { name: "Technical Strategy", requiredLevel: 8, currentLevel: 6 },
        { name: "Hiring & Mentoring", requiredLevel: 8, currentLevel: 4 },
        { name: "Cross-team Collaboration", requiredLevel: 7, currentLevel: 6 },
      ],
      notes: "Target timeline: 12-18 months",
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ],
};

const STORAGE_KEY = "personal-ai-os-state";

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure careerGoals exists for older stored states
      if (!parsed.careerGoals) parsed.careerGoals = DEFAULT_STATE.careerGoals;
      return parsed;
    }
  } catch {}
  return DEFAULT_STATE;
}

interface AppContextType {
  state: AppState;
  addTask: (task: Omit<RoutineTask, "id">) => void;
  updateTask: (id: string, updates: Partial<RoutineTask>) => void;
  deleteTask: (id: string) => void;
  addLearning: (item: Omit<LearningItem, "id">) => void;
  updateLearning: (id: string, updates: Partial<LearningItem>) => void;
  deleteLearning: (id: string) => void;
  addPlan: (item: Omit<PlanningItem, "id">) => void;
  updatePlan: (id: string, updates: Partial<PlanningItem>) => void;
  deletePlan: (id: string) => void;
  addAnalysis: (item: Omit<AnalysisItem, "id">) => void;
  updateAnalysis: (id: string, updates: Partial<AnalysisItem>) => void;
  deleteAnalysis: (id: string) => void;
  updateScore: (domain: Domain, score: number) => void;
  getFilteredState: (domain: Domain) => AppState;
  addCareerGoal: (goal: Omit<TargetRole, "id">) => void;
  updateCareerGoal: (id: string, updates: Partial<TargetRole>) => void;
  deleteCareerGoal: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const genId = () => crypto.randomUUID();

  const addTask = useCallback((task: Omit<RoutineTask, "id">) => {
    setState(s => ({ ...s, tasks: [...s.tasks, { ...task, id: genId() }] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<RoutineTask>) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, []);

  const addLearning = useCallback((item: Omit<LearningItem, "id">) => {
    setState(s => ({ ...s, learnings: [...s.learnings, { ...item, id: genId() }] }));
  }, []);

  const updateLearning = useCallback((id: string, updates: Partial<LearningItem>) => {
    setState(s => ({ ...s, learnings: s.learnings.map(l => l.id === id ? { ...l, ...updates } : l) }));
  }, []);

  const deleteLearning = useCallback((id: string) => {
    setState(s => ({ ...s, learnings: s.learnings.filter(l => l.id !== id) }));
  }, []);

  const addPlan = useCallback((item: Omit<PlanningItem, "id">) => {
    setState(s => ({ ...s, plans: [...s.plans, { ...item, id: genId() }] }));
  }, []);

  const updatePlan = useCallback((id: string, updates: Partial<PlanningItem>) => {
    setState(s => ({ ...s, plans: s.plans.map(p => p.id === id ? { ...p, ...updates } : p) }));
  }, []);

  const deletePlan = useCallback((id: string) => {
    setState(s => ({ ...s, plans: s.plans.filter(p => p.id !== id) }));
  }, []);

  const addAnalysis = useCallback((item: Omit<AnalysisItem, "id">) => {
    setState(s => ({ ...s, analyses: [...s.analyses, { ...item, id: genId() }] }));
  }, []);

  const updateAnalysis = useCallback((id: string, updates: Partial<AnalysisItem>) => {
    setState(s => ({ ...s, analyses: s.analyses.map(a => a.id === id ? { ...a, ...updates } : a) }));
  }, []);

  const deleteAnalysis = useCallback((id: string) => {
    setState(s => ({ ...s, analyses: s.analyses.filter(a => a.id !== id) }));
  }, []);

  const updateScore = useCallback((domain: Domain, score: number) => {
    setState(s => ({
      ...s,
      scores: s.scores.map(sc => sc.domain === domain ? { ...sc, score } : sc),
    }));
  }, []);

  const getFilteredState = useCallback((domain: Domain): AppState => ({
    scores: state.scores.filter(s => s.domain === domain),
    tasks: state.tasks.filter(t => t.tags.includes(domain)),
    learnings: state.learnings.filter(l => l.tags.includes(domain)),
    plans: state.plans.filter(p => p.tags.includes(domain)),
    analyses: state.analyses.filter(a => a.tags.includes(domain)),
    careerGoals: state.careerGoals,
  }), [state]);

  const addCareerGoal = useCallback((goal: Omit<TargetRole, "id">) => {
    setState(s => ({ ...s, careerGoals: [...s.careerGoals, { ...goal, id: genId() }] }));
  }, []);

  const updateCareerGoal = useCallback((id: string, updates: Partial<TargetRole>) => {
    setState(s => ({ ...s, careerGoals: s.careerGoals.map(g => g.id === id ? { ...g, ...updates } : g) }));
  }, []);

  const deleteCareerGoal = useCallback((id: string) => {
    setState(s => ({ ...s, careerGoals: s.careerGoals.filter(g => g.id !== id) }));
  }, []);

  return (
    <AppContext.Provider value={{
      state, addTask, updateTask, deleteTask,
      addLearning, updateLearning, deleteLearning,
      addPlan, updatePlan, deletePlan,
      addAnalysis, updateAnalysis, deleteAnalysis,
      updateScore, getFilteredState,
      addCareerGoal, updateCareerGoal, deleteCareerGoal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
