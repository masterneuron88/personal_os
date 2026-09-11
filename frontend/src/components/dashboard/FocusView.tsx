import { useApp } from "@/context/AppContext";
import { RoutineSection } from "./RoutineSection";
import { motion } from "framer-motion";
import { Zap, BookOpen, Target, PartyPopper } from "lucide-react";
import type { Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { DomainIcon } from "@/components/DomainIcon";

interface Props {
  activeDomain?: Domain;
}

export function FocusView({ activeDomain }: Props) {
  const { state, getFilteredState } = useApp();

  const source = activeDomain ? getFilteredState(activeDomain) : state;

  const focusTasks = source.tasks
    .filter(t => t.status === "pending" && (t.priority === "high" || t.priority === "medium"))
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

  const currentTask = focusTasks[0];
  const activeLearnings = source.learnings.filter(l => l.status === "in-progress");
  const activePlans = source.plans.filter(p => p.status === "in-progress");
  const overallScore = Math.round(state.scores.reduce((a, s) => a + s.score, 0) / state.scores.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          Focus Mode
        </div>
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          {activeDomain && <DomainIcon domain={activeDomain} className="w-6 h-6" />}
          {activeDomain ? `${DOMAIN_LABELS[activeDomain]} Focus` : "What to focus on right now"}
        </h2>
        <p className="text-sm text-muted-foreground">Only your most important items. Nothing else.</p>
      </div>

      {currentTask && (
        <div className="glass-card p-6 text-center space-y-3 border-primary/30">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Right Now</span>
          <h3 className="text-xl font-bold text-foreground">{currentTask.title}</h3>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            {currentTask.time && <span className="font-mono">{currentTask.time}</span>}
            <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium">{currentTask.priority}</span>
            {currentTask.tags.map(t => (
              <span key={t} className="text-xs flex items-center gap-1">
                <DomainIcon domain={t} className="w-3 h-3" />
                {DOMAIN_LABELS[t]}
              </span>
            ))}
          </div>
        </div>
      )}

      {focusTasks.length > 1 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Up Next</h3>
          <div className="space-y-2">
            {focusTasks.slice(1).map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/30"
              >
                <span className="text-xs font-mono text-muted-foreground w-8">{task.time || "—"}</span>
                <span className="text-sm text-foreground flex-1">{task.title}</span>
                <div className="flex gap-1">
                  {task.tags.map(t => (
                    <DomainIcon key={t} domain={t} className="w-3.5 h-3.5 text-muted-foreground" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(activeLearnings.length > 0 || activePlans.length > 0) && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Currently In Progress</h3>
          <div className="space-y-2">
            {activeLearnings.map(l => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/30">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1">{l.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">learning</span>
              </div>
            ))}
            {activePlans.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/30">
                <Target className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1">{p.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">plan</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {focusTasks.length === 0 && !activeLearnings.length && !activePlans.length && (
        <div className="glass-card p-8 text-center">
          <PartyPopper className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">All clear!</h3>
          <p className="text-sm text-muted-foreground mt-1">No pending priorities. Enjoy the moment or plan ahead.</p>
        </div>
      )}
    </motion.div>
  );
}
