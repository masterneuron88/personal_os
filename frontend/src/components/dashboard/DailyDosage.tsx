import { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Lightbulb, TrendingUp, ExternalLink, RefreshCw, Plus, Trash2, BookmarkPlus } from "lucide-react";

interface Nugget {
  id: string;
  type: "news" | "tip" | "trend" | "quote";
  title: string;
  summary: string;
  source?: string;
  url?: string;
  saved: boolean;
  date: string;
}

const TYPE_ICONS = {
  news: <Newspaper className="w-3.5 h-3.5" />,
  tip: <Lightbulb className="w-3.5 h-3.5" />,
  trend: <TrendingUp className="w-3.5 h-3.5" />,
  quote: <span className="text-sm leading-none">"</span>,
};

const TYPE_COLORS = {
  news: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  tip: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  trend: "bg-green-500/15 text-green-400 border-green-500/30",
  quote: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const STORAGE_KEY = "personal-os-daily-dosage";

function getDefaultNuggets(): Nugget[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: "1", type: "trend", title: "AI Agents in Software Development",
      summary: "Major tech companies are shifting from copilots to fully autonomous AI agents that can handle entire development workflows end-to-end.",
      source: "TechCrunch", saved: false, date: today,
    },
    {
      id: "2", type: "tip", title: "The 2-Minute Rule for Meetings",
      summary: "Start every meeting with a 2-minute silent review of the agenda. Research shows this increases meeting productivity by 34%.",
      source: "HBR", saved: false, date: today,
    },
    {
      id: "3", type: "news", title: "Remote Work Policies Evolving",
      summary: "Companies are moving towards outcome-based work models rather than rigid hybrid schedules, focusing on deliverables over presence.",
      source: "Forbes", saved: false, date: today,
    },
    {
      id: "4", type: "quote", title: "On Leadership",
      summary: "\"The task of leadership is not to put greatness into people, but to elicit it, for the greatness is there already.\" — John Buchan",
      saved: false, date: today,
    },
    {
      id: "5", type: "trend", title: "Platform Engineering Rising",
      summary: "Internal Developer Platforms (IDPs) are becoming standard. 78% of orgs plan to adopt platform engineering by 2027.",
      source: "Gartner", saved: true, date: today,
    },
  ];
}

function loadNuggets(): Nugget[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultNuggets();
}

export function DailyDosage() {
  const [nuggets, setNuggets] = useState<Nugget[]>(loadNuggets);
  const [filter, setFilter] = useState<"all" | Nugget["type"]>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", type: "tip" as Nugget["type"], source: "" });

  const save = (list: Nugget[]) => {
    setNuggets(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const toggleSave = (id: string) => {
    save(nuggets.map(n => n.id === id ? { ...n, saved: !n.saved } : n));
  };

  const deleteNugget = (id: string) => save(nuggets.filter(n => n.id !== id));

  const addNugget = () => {
    if (!form.title.trim()) return;
    save([{ id: crypto.randomUUID(), ...form, saved: false, date: new Date().toISOString().slice(0, 10) }, ...nuggets]);
    setForm({ title: "", summary: "", type: "tip", source: "" });
    setShowAdd(false);
  };

  const filtered = filter === "all" ? nuggets : nuggets.filter(n => n.type === filter);
  const savedCount = nuggets.filter(n => n.saved).length;

  const filters: { key: "all" | Nugget["type"]; label: string }[] = [
    { key: "all", label: "All" },
    { key: "news", label: "News" },
    { key: "tip", label: "Tips" },
    { key: "trend", label: "Trends" },
    { key: "quote", label: "Quotes" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center gap-3">
        <div className="glass-card px-3 py-2 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{nuggets.length}</span>
          <span className="text-[10px] text-muted-foreground">nuggets</span>
        </div>
        <div className="glass-card px-3 py-2 flex items-center gap-2">
          <BookmarkPlus className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-foreground">{savedCount}</span>
          <span className="text-[10px] text-muted-foreground">saved</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[11px] px-2.5 py-1 rounded-md border whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-primary/15 text-primary border-primary/50 font-medium"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Nugget cards */}
      <div className="space-y-2">
        {filtered.map(n => (
          <div key={n.id} className="glass-card p-3 space-y-1.5">
            <div className="flex items-start gap-2">
              <div className={`p-1 rounded ${TYPE_COLORS[n.type]} shrink-0 mt-0.5`}>
                {TYPE_ICONS[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{n.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{n.summary}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {n.source && <span className="text-[10px] text-muted-foreground">{n.source}</span>}
                  <span className="text-[10px] text-muted-foreground/60">{n.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleSave(n.id)} className={`p-1 rounded hover:bg-accent/50 ${n.saved ? "text-yellow-400" : "text-muted-foreground"}`}>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteNugget(n.id)} className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add nugget */}
      {showAdd ? (
        <div className="glass-card p-3 space-y-2">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Summary..." rows={2} className="w-full text-xs bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="text-xs bg-accent/50 border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none">
              <option value="news">News</option>
              <option value="tip">Tip</option>
              <option value="trend">Trend</option>
              <option value="quote">Quote</option>
            </select>
            <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Source (optional)" className="flex-1 text-xs bg-accent/50 border border-border rounded-md px-2 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={addNugget} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 border border-dashed border-border rounded-lg hover:bg-accent/30 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Nugget
        </button>
      )}
    </motion.div>
  );
}
