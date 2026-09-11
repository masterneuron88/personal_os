import { motion } from "framer-motion";
import type { AnalysisItem } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { Brain, Plus } from "lucide-react";
import { useState } from "react";
import { AddItemDialog } from "./AddItemDialog";

const domainBadgeColor: Record<string, string> = {
  work: "bg-domain-work/15 text-domain-work",
  health: "bg-domain-health/15 text-domain-health",
  family: "bg-domain-family/15 text-domain-family",
  wealth: "bg-domain-wealth/15 text-domain-wealth",
  me: "bg-domain-me/15 text-domain-me",
};

interface Props {
  items: AnalysisItem[];
  showAdd?: boolean;
}

export function AnalysisSection({ items, showAdd = true }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Brain className="w-4 h-4" /> Analysis & Reflections
        </h3>
        {showAdd && (
          <button onClick={() => setAddOpen(true)} className="p-1 rounded-md hover:bg-accent transition-colors">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
              <span className="text-[10px] text-muted-foreground">{item.date}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.notes}</p>
            <div className="flex gap-1 mt-2">
              {item.tags.map(tag => (
                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${domainBadgeColor[tag]}`}>
                  {DOMAIN_LABELS[tag]}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No reflections yet</p>}
      </div>
      <AddItemDialog type="analysis" open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
