import { Briefcase, Activity, Users, Wallet, UserCircle } from "lucide-react";
import type { Domain } from "@/types";
import { cn } from "@/lib/utils";

const iconMap: Record<Domain, React.FC<{ className?: string }>> = {
  work: Briefcase,
  health: Activity,
  family: Users,
  wealth: Wallet,
  me: UserCircle,
};

interface Props {
  domain: Domain;
  className?: string;
}

export function DomainIcon({ domain, className }: Props) {
  const Icon = iconMap[domain];
  return <Icon className={cn("w-4 h-4", className)} />;
}
