import { useApp } from "@/context/AppContext";
import type { Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { DomainIcon } from "@/components/DomainIcon";
import { ScoreCard } from "./ScoreCards";
import { RoutineSection } from "./RoutineSection";
import { LearningsSection } from "./LearningsSection";
import { PlanningSection } from "./PlanningSection";
import { AnalysisSection } from "./AnalysisSection";
import { CareerProgression } from "./CareerProgression";
import { StakeholderManagement } from "./StakeholderManagement";
import { SkillsDevelopment } from "./SkillsDevelopment";
import { DailyDosage } from "./DailyDosage";
import { motion } from "framer-motion";
import { Users, Rocket, BookOpen, Newspaper, LayoutGrid } from "lucide-react";
import type { WorkSubTab } from "@/pages/Index";

const WORK_SUB_TABS: { key: WorkSubTab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { key: "stakeholders", label: "Stakeholders", icon: <Users className="w-3.5 h-3.5" /> },
  { key: "career", label: "Career", icon: <Rocket className="w-3.5 h-3.5" /> },
  { key: "skills", label: "Skills", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "daily-dosage", label: "Dosage", icon: <Newspaper className="w-3.5 h-3.5" /> },
];

interface Props {
  domain: Domain;
  workSubTab?: WorkSubTab;
  onWorkSubTabChange?: (tab: WorkSubTab) => void;
}

export function DomainTab({ domain, workSubTab = "overview", onWorkSubTabChange }: Props) {
  const { getFilteredState } = useApp();
  const filtered = getFilteredState(domain);
  const score = filtered.scores[0];

  const isSubTabFocus = domain === "work" && workSubTab !== "overview";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Domain header - hidden in sub-tab focus */}
      {!isSubTabFocus && (
        <>
          <div className="flex items-center gap-3">
            <DomainIcon domain={domain} className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{DOMAIN_LABELS[domain]}</h2>
              <p className="text-sm text-muted-foreground">Everything related to your {DOMAIN_LABELS[domain].toLowerCase()} domain</p>
            </div>
          </div>

          {score && (
            <div className="max-w-xs">
              <ScoreCard score={score} index={0} />
            </div>
          )}
        </>
      )}

      {/* Work sub-tabs - only show on overview */}
      {domain === "work" && !isSubTabFocus && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-border/30">
          {WORK_SUB_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => onWorkSubTabChange?.(tab.key)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                workSubTab === tab.key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {domain === "work" ? (
        <motion.div key={workSubTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          {workSubTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <RoutineSection tasks={filtered.tasks} />
                <AnalysisSection items={filtered.analyses} />
              </div>
              <div className="space-y-4">
                <LearningsSection items={filtered.learnings} />
                <PlanningSection items={filtered.plans} />
              </div>
            </div>
          )}
          {workSubTab === "stakeholders" && <StakeholderManagement />}
          {workSubTab === "career" && <CareerProgression />}
          {workSubTab === "skills" && <SkillsDevelopment />}
          {workSubTab === "daily-dosage" && <DailyDosage />}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <RoutineSection tasks={filtered.tasks} />
            <AnalysisSection items={filtered.analyses} />
          </div>
          <div className="space-y-4">
            <LearningsSection items={filtered.learnings} />
            <PlanningSection items={filtered.plans} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
