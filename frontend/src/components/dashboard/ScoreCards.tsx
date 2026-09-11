import { motion } from "framer-motion";
import type { DomainScore } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { DomainIcon } from "@/components/DomainIcon";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const trendIcon = (trend: DomainScore["trend"]) => {
  switch (trend) {
    case "improving": return <TrendingUp className="w-3.5 h-3.5 text-domain-health" />;
    case "declining": return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
    case "stable": return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

const domainColorClass: Record<string, string> = {
  work: "from-domain-work/20 to-domain-work/5 domain-glow-work",
  health: "from-domain-health/20 to-domain-health/5 domain-glow-health",
  family: "from-domain-family/20 to-domain-family/5 domain-glow-family",
  wealth: "from-domain-wealth/20 to-domain-wealth/5 domain-glow-wealth",
  me: "from-domain-me/20 to-domain-me/5 domain-glow-me",
};

const domainTextColor: Record<string, string> = {
  work: "text-domain-work",
  health: "text-domain-health",
  family: "text-domain-family",
  wealth: "text-domain-wealth",
  me: "text-domain-me",
};

interface ScoreCardProps {
  score: DomainScore;
  index: number;
}

export function ScoreCard({ score, index }: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`glass-card bg-gradient-to-br ${domainColorClass[score.domain]} p-4 flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
          <DomainIcon domain={score.domain} className="w-3.5 h-3.5" />
          {DOMAIN_LABELS[score.domain]}
        </span>
        {trendIcon(score.trend)}
      </div>
      <div className={`text-3xl font-bold tracking-tight ${domainTextColor[score.domain]}`}>
        {score.score}
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score.score}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          className={`h-full rounded-full bg-domain-${score.domain}`}
          style={{ backgroundColor: `hsl(var(--domain-${score.domain}))` }}
        />
      </div>
    </motion.div>
  );
}

interface OverallScoreProps {
  scores: DomainScore[];
}

export function OverallScoreCard({ scores }: OverallScoreProps) {
  const overall = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary/15 to-primary/5"
    >
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Life Score</span>
      <span className="text-5xl font-bold tracking-tight text-primary">{overall}</span>
      <span className="text-xs text-muted-foreground">across {scores.length} domains</span>
    </motion.div>
  );
}
