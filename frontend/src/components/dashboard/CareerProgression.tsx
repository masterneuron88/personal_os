import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import type { TargetRole, SkillRequirement } from "@/types";
import { Rocket, Plus, X, ChevronDown, ChevronUp, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

function getReadiness(skills: SkillRequirement[]): number {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, s) => sum + Math.min(s.currentLevel / s.requiredLevel, 1), 0);
  return Math.round((total / skills.length) * 100);
}

function getGapLabel(readiness: number): { label: string; color: string } {
  if (readiness >= 85) return { label: "Almost Ready", color: "text-domain-health" };
  if (readiness >= 65) return { label: "On Track", color: "text-primary" };
  if (readiness >= 40) return { label: "Growing", color: "text-domain-wealth" };
  return { label: "Early Stage", color: "text-domain-family" };
}

function SkillBar({ skill }: { skill: SkillRequirement }) {
  const pct = Math.min((skill.currentLevel / skill.requiredLevel) * 100, 100);
  const gap = skill.requiredLevel - skill.currentLevel;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{skill.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {skill.currentLevel}/{skill.requiredLevel}
          {gap > 0 && <span className="text-destructive ml-1">(-{gap})</span>}
          {gap <= 0 && <span className="text-domain-health ml-1">✓</span>}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full transition-colors ${pct >= 100 ? "bg-domain-health" : pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-domain-wealth" : "bg-destructive/70"}`}
        />
      </div>
    </div>
  );
}

function RoleCard({ role, onEdit, onDelete }: { role: TargetRole; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const readiness = getReadiness(role.skills);
  const gap = getGapLabel(readiness);

  const radarData = role.skills.map(s => ({
    skill: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    current: s.currentLevel,
    required: s.requiredLevel,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div
        className="p-5 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">{role.title}</h4>
            {role.company && <p className="text-xs text-muted-foreground mt-0.5">{role.company}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className={`text-lg font-bold ${gap.color}`}>{readiness}%</div>
              <div className={`text-[10px] font-medium ${gap.color}`}>{gap.label}</div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${readiness >= 85 ? "bg-domain-health" : readiness >= 65 ? "bg-primary" : readiness >= 40 ? "bg-domain-wealth" : "bg-destructive/70"}`}
            style={{ width: `${readiness}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
              {role.description && (
                <p className="text-xs text-muted-foreground">{role.description}</p>
              )}

              {/* Radar chart */}
              {role.skills.length >= 3 && (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                      <Radar name="Required" dataKey="required" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} strokeWidth={1.5} />
                      <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Skill bars */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skill Breakdown</span>
                {role.skills.map((s, i) => (
                  <SkillBar key={i} skill={s} />
                ))}
              </div>

              {/* Top gaps */}
              {role.skills.filter(s => s.requiredLevel > s.currentLevel).length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">Biggest Gaps</span>
                  <div className="mt-1.5 space-y-1">
                    {role.skills
                      .filter(s => s.requiredLevel > s.currentLevel)
                      .sort((a, b) => (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel))
                      .slice(0, 3)
                      .map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-destructive font-medium">Need +{s.requiredLevel - s.currentLevel} levels</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {role.notes && (
                <p className="text-xs text-muted-foreground italic">📝 {role.notes}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={onEdit} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={onDelete} className="flex items-center gap-1 text-xs text-destructive hover:underline">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Add/Edit Role Dialog
function AddRoleDialog({ open, onOpenChange, editRole }: { open: boolean; onOpenChange: (o: boolean) => void; editRole?: TargetRole }) {
  const { addCareerGoal, updateCareerGoal } = useApp();
  const [title, setTitle] = useState(editRole?.title || "");
  const [company, setCompany] = useState(editRole?.company || "");
  const [description, setDescription] = useState(editRole?.description || "");
  const [notes, setNotes] = useState(editRole?.notes || "");
  const [skills, setSkills] = useState<SkillRequirement[]>(editRole?.skills || [
    { name: "", requiredLevel: 7, currentLevel: 3 },
  ]);
  const [jdText, setJdText] = useState("");
  const [showJdPaste, setShowJdPaste] = useState(false);

  const addSkill = () => setSkills(prev => [...prev, { name: "", requiredLevel: 7, currentLevel: 3 }]);
  const removeSkill = (i: number) => setSkills(prev => prev.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, updates: Partial<SkillRequirement>) => {
    setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, ...updates } : s));
  };

  // Simple JD text parser — extracts skill-like keywords
  const parseJdText = () => {
    if (!jdText.trim()) return;
    const lines = jdText.split(/[\n,;•·\-]/).map(l => l.trim()).filter(l => l.length > 2 && l.length < 60);
    const extracted = lines.slice(0, 10).map(line => ({
      name: line.replace(/^\d+\.\s*/, "").slice(0, 40),
      requiredLevel: 7,
      currentLevel: 3,
    }));
    if (extracted.length > 0) {
      setSkills(prev => [...prev.filter(s => s.name.trim()), ...extracted]);
      setShowJdPaste(false);
      setJdText("");
    }
  };

  const handleSubmit = () => {
    const validSkills = skills.filter(s => s.name.trim());
    if (!title.trim() || validSkills.length === 0) return;

    const data = {
      title: title.trim(),
      company: company.trim() || undefined,
      description: description.trim() || undefined,
      skills: validSkills,
      notes: notes.trim() || undefined,
      createdAt: editRole?.createdAt || new Date().toISOString().slice(0, 10),
    };

    if (editRole) {
      updateCareerGoal(editRole.id, data);
    } else {
      addCareerGoal(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editRole ? "Edit Target Role" : "Add Target Role"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Role title *" value={title} onChange={e => setTitle(e.target.value)} className="bg-accent/50 border-border" />
            <Input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} className="bg-accent/50 border-border" />
          </div>
          <Textarea placeholder="Role description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-accent/50 border-border resize-none" rows={2} />

          {/* JD paste section */}
          <div>
            <button
              onClick={() => setShowJdPaste(!showJdPaste)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              📋 Paste JD requirements to auto-extract skills
            </button>
            <AnimatePresence>
              {showJdPaste && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-2 space-y-2">
                    <Textarea
                      placeholder="Paste job description requirements here (one per line or bullet point)..."
                      value={jdText}
                      onChange={e => setJdText(e.target.value)}
                      className="bg-accent/50 border-border resize-none text-xs"
                      rows={5}
                    />
                    <Button size="sm" onClick={parseJdText} disabled={!jdText.trim()} className="text-xs">
                      Extract Skills
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills *</span>
              <button onClick={addSkill} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Skill
              </button>
            </div>
            <div className="space-y-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent/30">
                  <Input
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={e => updateSkill(i, { name: e.target.value })}
                    className="bg-transparent border-none h-8 text-xs flex-1 p-1"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    <span>Now:</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={skill.currentLevel}
                      onChange={e => updateSkill(i, { currentLevel: +e.target.value })}
                      className="w-16 h-1 accent-primary"
                    />
                    <span className="w-3 text-foreground font-medium">{skill.currentLevel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    <span>Need:</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={skill.requiredLevel}
                      onChange={e => updateSkill(i, { requiredLevel: +e.target.value })}
                      className="w-16 h-1 accent-destructive"
                    />
                    <span className="w-3 text-foreground font-medium">{skill.requiredLevel}</span>
                  </div>
                  <button onClick={() => removeSkill(i)} className="p-0.5 hover:bg-accent rounded">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="bg-accent/50 border-border resize-none" rows={2} />

          <Button onClick={handleSubmit} className="w-full" disabled={!title.trim() || skills.filter(s => s.name.trim()).length === 0}>
            {editRole ? "Update Role" : "Add Target Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CareerProgression() {
  const { state, deleteCareerGoal } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [editRole, setEditRole] = useState<TargetRole | undefined>();

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Rocket className="w-4 h-4" /> Career Progression
        </h3>
        <button onClick={() => { setEditRole(undefined); setAddOpen(true); }} className="p-1 rounded-md hover:bg-accent transition-colors">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {state.careerGoals.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={() => { setEditRole(role); setAddOpen(true); }}
            onDelete={() => deleteCareerGoal(role.id)}
          />
        ))}
        {state.careerGoals.length === 0 && (
          <div className="text-center py-6">
            <Rocket className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No target roles yet</p>
            <button onClick={() => setAddOpen(true)} className="text-xs text-primary hover:underline mt-1">
              Add your first target role
            </button>
          </div>
        )}
      </div>

      <AddRoleDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        editRole={editRole}
      />
    </div>
  );
}
