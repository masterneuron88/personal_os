import { useApp } from "@/context/AppContext";
import { ScoreCard, OverallScoreCard } from "./ScoreCards";
import { RoutineSection } from "./RoutineSection";
import { LearningsSection } from "./LearningsSection";
import { PlanningSection } from "./PlanningSection";
import { AnalysisSection } from "./AnalysisSection";

export function OverallTab() {
  const { state } = useApp();
  const completed = state.tasks.filter(t => t.status === "completed").length;
  const total = state.tasks.length;

  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <OverallScoreCard scores={state.scores} />
        {state.scores.map((s, i) => (
          <ScoreCard key={s.domain} score={s} index={i} />
        ))}
      </div>

      {/* Progress summary */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Today's Progress</span>
            <span className="text-sm font-semibold text-foreground">{completed}/{total}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <RoutineSection tasks={state.tasks} />
          <AnalysisSection items={state.analyses} />
        </div>
        <div className="space-y-4">
          <LearningsSection items={state.learnings} />
          <PlanningSection items={state.plans} />
        </div>
      </div>
    </div>
  );
}
