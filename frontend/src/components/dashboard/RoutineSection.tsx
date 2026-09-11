import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import type { RoutineTask, Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { Check, Clock, SkipForward, Plus } from "lucide-react";
import { useState } from "react";
import { AddItemDialog } from "./AddItemDialog";

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-domain-wealth",
  low: "bg-muted-foreground",
};

const domainBadgeColor: Record<string, string> = {
  work: "bg-domain-work/15 text-domain-work",
  health: "bg-domain-health/15 text-domain-health",
  family: "bg-domain-family/15 text-domain-family",
  wealth: "bg-domain-wealth/15 text-domain-wealth",
  me: "bg-domain-me/15 text-domain-me",
};

interface Props {
  tasks: RoutineTask[];
  showAdd?: boolean;
}

export function RoutineSection({ tasks, showAdd = true }: Props) {
  const { updateTask } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  const toggleStatus = (task: RoutineTask) => {
    const next = task.status === "completed" ? "pending" : "completed";
    updateTask(task.id, { status: next });
  };

  const sorted = [...tasks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    return order[a.priority] - order[b.priority];
  });

  const displayed = hideCompleted ? sorted.filter(t => t.status !== "completed") : sorted;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Daily Routine</h3>
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={() => setHideCompleted(h => !h)}
              className={`text-[10px] px-2 py-1 rounded-md border transition-all ${hideCompleted ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {hideCompleted ? `Show ${completedCount} done` : "Hide done"}
            </button>
          )}
          {showAdd && (
            <button onClick={() => setAddOpen(true)} className="p-1 rounded-md hover:bg-accent transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1">
        {displayed.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer ${task.status === "completed" ? "opacity-50" : ""}`}
            onClick={() => toggleStatus(task)}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${task.status === "completed" ? "bg-domain-health border-domain-health" : "border-border"}`}>
              {task.status === "completed" && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} />
            {task.time && <span className="text-xs text-muted-foreground font-mono w-11">{task.time}</span>}
            <span className={`flex-1 text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </span>
            <div className="flex gap-1">
              {task.tags.map(tag => (
                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${domainBadgeColor[tag]}`}>
                  {DOMAIN_LABELS[tag]}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
        {displayed.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks for today</p>
        )}
      </div>
      <AddItemDialog type="task" open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
