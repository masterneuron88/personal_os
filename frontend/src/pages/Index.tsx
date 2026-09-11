import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { DomainIcon } from "@/components/DomainIcon";
import { OverallTab } from "@/components/dashboard/OverallTab";
import { DomainTab } from "@/components/dashboard/DomainTab";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { FocusView } from "@/components/dashboard/FocusView";
import { MobileQRDialog } from "@/components/dashboard/MobileQRDialog";
import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { LayoutDashboard, Zap, ChevronLeft, ChevronRight, Settings, QrCode, User, LogOut, BarChart3 } from "lucide-react";

type Tab = "overall" | Domain;
export type WorkSubTab = "overview" | "stakeholders" | "career" | "skills" | "daily-dosage";

const TABS: { key: Tab; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "work", label: "Work" },
  { key: "health", label: "Health" },
  { key: "family", label: "Family" },
  { key: "wealth", label: "Wealth" },
  { key: "me", label: "Me" },
];

const tabColorActive: Record<string, string> = {
  overall: "bg-primary/15 text-primary border-primary/50",
  work: "bg-domain-work/15 text-domain-work border-domain-work/50",
  health: "bg-domain-health/15 text-domain-health border-domain-health/50",
  family: "bg-domain-family/15 text-domain-family border-domain-family/50",
  wealth: "bg-domain-wealth/15 text-domain-wealth border-domain-wealth/50",
  me: "bg-domain-me/15 text-domain-me border-domain-me/50",
};

const SUB_TAB_LABELS: Record<WorkSubTab, string> = {
  overview: "Overview",
  stakeholders: "Stakeholder Management",
  career: "Career Progression",
  skills: "Skills Development",
  "daily-dosage": "Daily Dosage",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overall");
  const [focusMode, setFocusMode] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [workSubTab, setWorkSubTab] = useState<WorkSubTab>("overview");
  const [profileOpen, setProfileOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSubTabFocus = activeTab === "work" && workSubTab !== "overview" && !focusMode && !analysisMode;

  const handleBackToOverview = () => setWorkSubTab("overview");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== "work") setWorkSubTab("overview");
  };

  const profileMenu = [
    { icon: <User className="w-3.5 h-3.5" />, label: "Profile", action: () => {} },
    { icon: <Settings className="w-3.5 h-3.5" />, label: "Settings", action: () => {} },
    { icon: <QrCode className="w-3.5 h-3.5" />, label: "Scan for Mobile", action: () => setQrOpen(true) },
    { icon: <LogOut className="w-3.5 h-3.5" />, label: "Logout", destructive: true, action: () => {} },
  ];

  const ProfileAvatar = () => (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setProfileOpen(prev => !prev)}
        className="w-8 h-8 rounded-full bg-primary/20 border border-border hover:border-primary/50 flex items-center justify-center transition-all overflow-hidden"
      >
        <span className="text-xs font-semibold text-primary">JD</span>
      </button>
      {profileOpen && (
        <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-[11px] text-muted-foreground">john@example.com</p>
          </div>
          {profileMenu.map(item => (
            <button
              key={item.label}
              onClick={() => { setProfileOpen(false); item.action(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                (item as any).destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header - compact when in sub-tab focus */}
      <header className="border-b border-border/50 bg-card/40 backdrop-blur-xl z-50 shrink-0">
        {isSubTabFocus ? (
          /* Compact breadcrumb header for sub-tab focus */
          <div className="px-4 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToOverview}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <DomainIcon domain="work" className="w-3.5 h-3.5" />
                <span>Work</span>
              </button>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-sm font-semibold text-foreground">{SUB_TAB_LABELS[workSubTab]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
              <ProfileAvatar />
            </div>
          </div>
        ) : (
          /* Full header */
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground tracking-tight">Personal OS</h1>
                  <p className="text-[11px] text-muted-foreground">Your life command center</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setFocusMode(prev => !prev); if (!focusMode) setAnalysisMode(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    focusMode
                      ? "bg-primary/15 text-primary border-primary/50"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${focusMode ? "text-primary" : ""}`} />
                  Focus
                </button>
                <button
                  onClick={() => { setAnalysisMode(prev => !prev); if (!analysisMode) setFocusMode(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    analysisMode
                      ? "bg-accent text-accent-foreground border-border"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <BarChart3 className={`w-3.5 h-3.5 ${analysisMode ? "text-foreground" : ""}`} />
                  Analysis
                </button>
                <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
                <ProfileAvatar />
              </div>
            </div>

            {!focusMode && !analysisMode && (
              <nav className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? tabColorActive[tab.key]
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {tab.key !== "overall" && (
                      <DomainIcon domain={tab.key as Domain} className="w-3.5 h-3.5 mr-1 inline-block" />
                    )}
                    {tab.key === "overall" && <Zap className="w-3.5 h-3.5 mr-1 inline-block" />}
                    {tab.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}
      </header>

      {/* Main body: dashboard + chat side-by-side */}
      <div className="flex-1 flex min-h-0">
        {/* Dashboard content - scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {focusMode ? (
              <FocusView
                key="focus"
                activeDomain={activeTab !== "overall" ? activeTab : undefined}
              />
            ) : analysisMode ? (
              <AnalysisView
                key="analysis"
                activeDomain={activeTab !== "overall" ? activeTab : undefined}
              />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overall" ? (
                  <OverallTab />
                ) : (
                  <DomainTab
                    domain={activeTab}
                    workSubTab={workSubTab}
                    onWorkSubTabChange={setWorkSubTab}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Chat panel - persistent right sidebar */}
        <aside className="w-[360px] border-l border-border/50 bg-card/30 backdrop-blur-sm hidden lg:flex flex-col shrink-0">
          <ChatPanel
            activeTab={activeTab}
            workSubTab={activeTab === "work" ? workSubTab : undefined}
            focusMode={focusMode}
            analysisMode={analysisMode}
          />
        </aside>
      </div>

      <MobileQRDialog open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
};

export default Index;
