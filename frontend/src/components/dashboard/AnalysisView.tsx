import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  SkipForward,
  BookOpen,
  Target,
  Link2,
  Image,
  Plus,
  X,
  ChevronRight,
  Calendar,
  ListChecks,
} from "lucide-react";
import type { Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { DomainIcon } from "@/components/DomainIcon";

interface SavedLink {
  id: string;
  url: string;
  title: string;
  note?: string;
  addedAt: string;
}

interface SavedScreenshot {
  id: string;
  dataUrl: string;
  note?: string;
  addedAt: string;
}

interface Props {
  activeDomain?: Domain;
}

export function AnalysisView({ activeDomain }: Props) {
  const { state, getFilteredState } = useApp();
  const source = activeDomain ? getFilteredState(activeDomain) : state;

  const [links, setLinks] = useState<SavedLink[]>([]);
  const [screenshots, setScreenshots] = useState<SavedScreenshot[]>([]);
  const [newLink, setNewLink] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState("");

  const completedTasks = source.tasks.filter(t => t.status === "completed");
  const pendingTasks = source.tasks.filter(t => t.status === "pending");
  const skippedTasks = source.tasks.filter(t => t.status === "skipped");
  const activeLearnings = source.learnings.filter(l => l.status === "in-progress");
  const completedLearnings = source.learnings.filter(l => l.status === "completed");
  const activePlans = source.plans.filter(p => p.status === "in-progress");

  const totalTasks = source.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    setLinks(prev => [...prev, {
      id: crypto.randomUUID(),
      url: newLink.trim(),
      title: newLinkTitle.trim() || newLink.trim(),
      addedAt: new Date().toISOString(),
    }]);
    setNewLink("");
    setNewLinkTitle("");
    setShowAddLink(false);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshots(prev => [...prev, {
        id: crypto.randomUUID(),
        dataUrl: ev.target?.result as string,
        addedAt: new Date().toISOString(),
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5" />
          Analysis Mode
        </div>
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          {activeDomain && <DomainIcon domain={activeDomain} className="w-6 h-6" />}
          {activeDomain ? `${DOMAIN_LABELS[activeDomain]} Analysis` : "Day Analysis"}
        </h2>
        <p className="text-sm text-muted-foreground">Review your progress, capture insights, and plan ahead.</p>
      </div>

      {/* Completion Summary */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Task Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-accent/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-domain-health" />
              <span className="text-[10px] text-muted-foreground">Completed</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{completedTasks.length}</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Circle className="w-3.5 h-3.5 text-domain-work" />
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{pendingTasks.length}</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <SkipForward className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[10px] text-muted-foreground">Skipped</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{skippedTasks.length}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Completion rate</span>
            <span className="font-semibold text-foreground">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: `hsl(var(--domain-health))` }}
            />
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completed */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-domain-health" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Done</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground ml-auto">{completedTasks.length}</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {completedTasks.length === 0 && <p className="text-xs text-muted-foreground">No completed tasks yet.</p>}
            {completedTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent/20">
                <CheckCircle2 className="w-3 h-3 text-domain-health shrink-0" />
                <span className="text-xs text-foreground">{t.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending / Undone */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Circle className="w-4 h-4 text-domain-work" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Still Pending</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground ml-auto">{pendingTasks.length}</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {pendingTasks.length === 0 && <p className="text-xs text-muted-foreground">All clear!</p>}
            {pendingTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent/20">
                <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground flex-1">{t.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  t.priority === "high" ? "bg-destructive/15 text-destructive" : "bg-accent text-muted-foreground"
                }`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learnings & Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learnings</h3>
          </div>
          <div className="space-y-1.5">
            {source.learnings.length === 0 && <p className="text-xs text-muted-foreground">No learnings tracked.</p>}
            {source.learnings.map(l => (
              <div key={l.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent/20">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  l.status === "completed" ? "bg-domain-health/15 text-domain-health"
                  : l.status === "in-progress" ? "bg-primary/15 text-primary"
                  : "bg-accent text-muted-foreground"
                }`}>{l.status}</span>
                <span className="text-xs text-foreground">{l.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Plans</h3>
          </div>
          <div className="space-y-1.5">
            {activePlans.length === 0 && <p className="text-xs text-muted-foreground">No active plans.</p>}
            {activePlans.map(p => (
              <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent/20">
                <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                <span className="text-xs text-foreground flex-1">{p.title}</span>
                {p.targetDate && (
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {p.targetDate}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Uploads: Screenshots & Links */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Uploads & References</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Screenshots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Screenshots</span>
              <label className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer transition-colors">
                <Plus className="w-3 h-3" />
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
              </label>
            </div>
            <div className="space-y-2">
              {screenshots.length === 0 && (
                <div className="border border-dashed border-border rounded-lg p-4 text-center">
                  <Image className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">No screenshots yet</p>
                </div>
              )}
              {screenshots.map(s => (
                <div key={s.id} className="relative group rounded-lg overflow-hidden border border-border">
                  <img src={s.dataUrl} alt="Screenshot" className="w-full h-24 object-cover" />
                  <button
                    onClick={() => setScreenshots(prev => prev.filter(x => x.id !== s.id))}
                    className="absolute top-1 right-1 p-1 rounded-md bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Saved Links</span>
              <button
                onClick={() => setShowAddLink(!showAddLink)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Link
              </button>
            </div>
            {showAddLink && (
              <div className="space-y-1.5 mb-2 p-2 rounded-lg bg-accent/30">
                <input
                  value={newLinkTitle}
                  onChange={e => setNewLinkTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex gap-1.5">
                  <input
                    value={newLink}
                    onChange={e => setNewLink(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddLink()}
                    placeholder="https://..."
                    className="flex-1 bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={handleAddLink}
                    disabled={!newLink.trim()}
                    className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              {links.length === 0 && !showAddLink && (
                <div className="border border-dashed border-border rounded-lg p-4 text-center">
                  <Link2 className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">No saved links yet</p>
                </div>
              )}
              {links.map(l => (
                <div key={l.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent/20 group">
                  <Link2 className="w-3 h-3 text-primary shrink-0" />
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground hover:text-primary truncate flex-1">
                    {l.title}
                  </a>
                  <button
                    onClick={() => setLinks(prev => prev.filter(x => x.id !== l.id))}
                    className="p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Notes */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Analysis Notes</h3>
        </div>
        <textarea
          value={analysisNotes}
          onChange={e => setAnalysisNotes(e.target.value)}
          placeholder="Write your reflections, observations, and plans for tomorrow..."
          rows={4}
          className="w-full bg-accent/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>
    </motion.div>
  );
}
