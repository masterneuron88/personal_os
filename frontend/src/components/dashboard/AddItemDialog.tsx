import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import type { Domain, Priority, ItemStatus, TaskStatus } from "@/types";
import { DOMAIN_LABELS } from "@/types";

type ItemType = "task" | "learning" | "plan" | "analysis";

const ALL_DOMAINS: Domain[] = ["work", "health", "family", "wealth", "me"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];
const ITEM_STATUSES: ItemStatus[] = ["planned", "in-progress", "completed"];

const domainToggleColor: Record<string, string> = {
  work: "data-[active=true]:bg-domain-work/20 data-[active=true]:text-domain-work data-[active=true]:border-domain-work/50",
  health: "data-[active=true]:bg-domain-health/20 data-[active=true]:text-domain-health data-[active=true]:border-domain-health/50",
  family: "data-[active=true]:bg-domain-family/20 data-[active=true]:text-domain-family data-[active=true]:border-domain-family/50",
  wealth: "data-[active=true]:bg-domain-wealth/20 data-[active=true]:text-domain-wealth data-[active=true]:border-domain-wealth/50",
  me: "data-[active=true]:bg-domain-me/20 data-[active=true]:text-domain-me data-[active=true]:border-domain-me/50",
};

interface Props {
  type: ItemType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemDialog({ type, open, onOpenChange }: Props) {
  const { addTask, addLearning, addPlan, addAnalysis } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Domain[]>([]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<ItemStatus>("planned");
  const [time, setTime] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const toggleTag = (d: Domain) => {
    setTags(prev => prev.includes(d) ? prev.filter(t => t !== d) : [...prev, d]);
  };

  const reset = () => {
    setTitle(""); setDescription(""); setTags([]); setPriority("medium"); setStatus("planned"); setTime(""); setTargetDate("");
  };

  const handleSubmit = () => {
    if (!title.trim() || tags.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);

    switch (type) {
      case "task":
        addTask({ title, status: "pending" as TaskStatus, priority, tags, time: time || undefined, date: today });
        break;
      case "learning":
        addLearning({ title, description, tags, status });
        break;
      case "plan":
        addPlan({ title, description, tags, status, targetDate: targetDate || undefined });
        break;
      case "analysis":
        addAnalysis({ title, notes: description, tags, date: today });
        break;
    }
    reset();
    onOpenChange(false);
  };

  const titles: Record<ItemType, string> = {
    task: "Add Routine Task",
    learning: "Add Learning",
    plan: "Add Plan",
    analysis: "Add Reflection",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{titles[type]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-accent/50 border-border"
          />

          {type !== "task" && (
            <Textarea
              placeholder={type === "analysis" ? "Your notes and reflections..." : "Description"}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-accent/50 border-border resize-none"
              rows={3}
            />
          )}

          {type === "task" && (
            <div className="flex gap-3">
              <Input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="bg-accent/50 border-border w-32"
              />
              <div className="flex gap-1.5 items-center">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${priority === p ? "bg-primary/15 text-primary border-primary/50" : "border-border text-muted-foreground hover:bg-accent"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(type === "learning" || type === "plan") && (
            <div className="flex gap-1.5">
              {ITEM_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${status === s ? "bg-primary/15 text-primary border-primary/50" : "border-border text-muted-foreground hover:bg-accent"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {type === "plan" && (
            <Input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="bg-accent/50 border-border w-44"
            />
          )}

          <div>
            <span className="text-xs text-muted-foreground mb-2 block">Domain Tags</span>
            <div className="flex gap-1.5 flex-wrap">
              {ALL_DOMAINS.map(d => (
                <button
                  key={d}
                  data-active={tags.includes(d)}
                  onClick={() => toggleTag(d)}
                  className={`text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:bg-accent transition-colors ${domainToggleColor[d]}`}
                >
                  {DOMAIN_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!title.trim() || tags.length === 0}>
            Add {type}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
