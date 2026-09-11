import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Target, TrendingUp, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: "technical" | "leadership" | "soft" | "domain";
  currentLevel: number;
  targetLevel: number;
  resources: string[];
  milestones: { text: string; done: boolean }[];
}

const CATEGORY_COLORS = {
  technical: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  leadership: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  soft: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  domain: "bg-green-500/15 text-green-400 border-green-500/30",
};

const STORAGE_KEY = "personal-os-skills-dev";

function loadSkills(): Skill[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    {
      id: "1", name: "System Design", category: "technical", currentLevel: 7, targetLevel: 9,
      resources: ["Designing Data-Intensive Applications", "System Design Interview book"],
      milestones: [{ text: "Complete distributed systems course", done: true }, { text: "Design review for 3 major systems", done: false }],
    },
    {
      id: "2", name: "Executive Communication", category: "leadership", currentLevel: 5, targetLevel: 8,
      resources: ["Pyramid Principle", "Toastmasters"],
      milestones: [{ text: "Present at leadership forum", done: false }, { text: "Write 5 exec summaries", done: false }],
    },
    {
      id: "3", name: "Conflict Resolution", category: "soft", currentLevel: 6, targetLevel: 8,
      resources: ["Crucial Conversations book"],
      milestones: [{ text: "Mediate one team conflict", done: true }],
    },
  ];
}

export function SkillsDevelopment() {
  const [skills, setSkills] = useState<Skill[]>(loadSkills);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "technical" as Skill["category"], currentLevel: 5, targetLevel: 8 });

  const save = (list: Skill[]) => {
    setSkills(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addSkill = () => {
    if (!form.name.trim()) return;
    save([...skills, { id: crypto.randomUUID(), name: form.name, category: form.category, currentLevel: form.currentLevel, targetLevel: form.targetLevel, resources: [], milestones: [] }]);
    setForm({ name: "", category: "technical", currentLevel: 5, targetLevel: 8 });
    setShowAdd(false);
  };

  const toggleMilestone = (skillId: string, mIdx: number) => {
    save(skills.map(s => s.id === skillId ? { ...s, milestones: s.milestones.map((m, i) => i === mIdx ? { ...m, done: !m.done } : m) } : s));
  };

  const deleteSkill = (id: string) => save(skills.filter(s => s.id !== id));

  const avgProgress = skills.length > 0
    ? Math.round(skills.reduce((a, s) => a + ((s.currentLevel / s.targetLevel) * 100), 0) / skills.length)
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <BookOpen className="w-4 h-4 mx-auto text-primary mb-1" />
          <div className="text-xl font-bold text-foreground">{skills.length}</div>
          <div className="text-[10px] text-muted-foreground">Skills Tracked</div>
        </div>
        <div className="glass-card p-3 text-center">
          <Target className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
          <div className="text-xl font-bold text-foreground">{avgProgress}%</div>
          <div className="text-[10px] text-muted-foreground">Avg Progress</div>
        </div>
        <div className="glass-card p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto text-green-400 mb-1" />
          <div className="text-xl font-bold text-foreground">{skills.filter(s => s.currentLevel >= s.targetLevel).length}</div>
          <div className="text-[10px] text-muted-foreground">Mastered</div>
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-2">
        {skills.map(s => {
          const pct = Math.round((s.currentLevel / s.targetLevel) * 100);
          return (
            <div key={s.id} className="glass-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="w-full flex items-center gap-3 p-3 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{s.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[s.category]}`}>{s.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{s.currentLevel}/{s.targetLevel}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${pct >= 100 ? "text-green-400" : pct >= 70 ? "text-yellow-400" : "text-muted-foreground"}`}>{pct}%</span>
                {expanded === s.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>

              {expanded === s.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                  {s.resources.length > 0 && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Resources</span>
                      {s.resources.map((r, i) => (
                        <div key={i} className="text-xs text-foreground flex items-center gap-1.5 mt-0.5">
                          <BookOpen className="w-3 h-3 text-muted-foreground" /> {r}
                        </div>
                      ))}
                    </div>
                  )}
                  {s.milestones.length > 0 && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Milestones</span>
                      {s.milestones.map((m, i) => (
                        <button key={i} onClick={() => toggleMilestone(s.id, i)} className="flex items-center gap-2 text-xs w-full text-left mt-0.5">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${m.done ? "bg-primary border-primary" : "border-border"}`}>
                            {m.done && <span className="text-primary-foreground text-[8px]">✓</span>}
                          </div>
                          <span className={m.done ? "line-through text-muted-foreground" : "text-foreground"}>{m.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-[10px] text-muted-foreground">Level:</label>
                    <input type="range" min={1} max={10} value={s.currentLevel} onChange={e => save(skills.map(sk => sk.id === s.id ? { ...sk, currentLevel: Number(e.target.value) } : sk))} className="flex-1 h-1 accent-primary" />
                    <span className="text-[10px] font-mono text-foreground">{s.currentLevel}</span>
                  </div>
                  <button onClick={() => deleteSkill(s.id)} className="text-[10px] text-destructive hover:underline flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="glass-card p-3 space-y-2">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Skill name" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))} className="text-xs bg-accent/50 border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="technical">Technical</option>
            <option value="leadership">Leadership</option>
            <option value="soft">Soft Skills</option>
            <option value="domain">Domain</option>
          </select>
          <div className="flex gap-2">
            <button onClick={addSkill} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 border border-dashed border-border rounded-lg hover:bg-accent/30 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Skill
        </button>
      )}
    </motion.div>
  );
}
