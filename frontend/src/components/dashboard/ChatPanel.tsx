import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Mic, MicOff, Target } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { useApp } from "@/context/AppContext";
import type { Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { DomainIcon } from "@/components/DomainIcon";

type SubModule = "routine" | "learnings" | "planning" | "analysis" | "career" | "scores" | "stakeholders" | "skills" | "daily-dosage";

const SUB_MODULE_LABELS: Record<SubModule, string> = {
  routine: "Routine",
  learnings: "Learnings",
  planning: "Planning",
  analysis: "Analysis",
  career: "Career Progression",
  scores: "Scores",
  stakeholders: "Stakeholders",
  skills: "Skills Dev",
  "daily-dosage": "Daily Dosage",
};

interface ImpactTags {
  domains: Domain[];
  subModules: SubModule[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  impactTags?: ImpactTags;
}

function detectImpactTags(input: string, ctx: ReturnType<typeof useApp>): ImpactTags {
  const lower = input.toLowerCase().trim();
  const domains: Domain[] = [];
  const subModules: SubModule[] = [];

  // Detect domains
  const allDomains: Domain[] = ["work", "health", "family", "wealth", "me"];
  for (const d of allDomains) {
    if (lower.includes(d)) domains.push(d);
  }

  // Detect sub-modules
  if (lower.includes("task") || lower.includes("routine") || lower.includes("focus") || lower.includes("priority") || lower.includes("complete") || lower.includes("done") || lower.includes("missed") || lower.includes("skip")) {
    subModules.push("routine");
  }
  if (lower.includes("learn") || lower.includes("study") || lower.includes("course")) {
    subModules.push("learnings");
  }
  if (lower.includes("plan") || lower.includes("goal") || lower.includes("target")) {
    subModules.push("planning");
  }
  if (lower.includes("analy") || lower.includes("review") || lower.includes("reflect")) {
    subModules.push("analysis");
  }
  if (lower.includes("career") || lower.includes("role") || lower.includes("job") || lower.includes("promotion")) {
    subModules.push("career");
  }
  if (lower.includes("skill") || lower.includes("develop") || lower.includes("upskill")) {
    subModules.push("skills");
  }
  if (lower.includes("stakeholder") || lower.includes("manager") || lower.includes("relationship") || lower.includes("influence")) {
    subModules.push("stakeholders");
  }
  if (lower.includes("news") || lower.includes("update") || lower.includes("dosage") || lower.includes("nugget") || lower.includes("trend")) {
    subModules.push("daily-dosage");
  }
  if (lower.includes("score") || lower.includes("how am i")) {
    subModules.push("scores");
  }

  // For broad queries, infer from context
  if (lower.includes("today") || lower.includes("summary")) {
    if (subModules.length === 0) subModules.push("routine", "learnings", "planning");
    if (domains.length === 0) {
      // All domains impacted
      domains.push(...allDomains);
    }
  }

  // If "add task" was used, check which domain the task got tagged to
  if (lower.startsWith("add task") || lower.startsWith("new task")) {
    if (!subModules.includes("routine")) subModules.push("routine");
    if (domains.length === 0) domains.push("me"); // default tag
  }

  // If we detected domain-specific queries but no sub-module
  if (domains.length > 0 && subModules.length === 0) {
    subModules.push("routine", "planning");
  }

  // If sub-modules detected but no domain, mark all
  if (subModules.length > 0 && domains.length === 0) {
    domains.push(...allDomains);
  }

  return { domains, subModules };
}

function processCommand(input: string, ctx: ReturnType<typeof useApp>): string {
  const lower = input.toLowerCase().trim();

  if (lower.includes("focus") || lower.includes("what should i") || lower.includes("priority")) {
    const pending = ctx.state.tasks.filter(t => t.status === "pending");
    const high = pending.filter(t => t.priority === "high");
    if (high.length === 0 && pending.length === 0) return "All tasks done for today! Great job.";
    if (high.length > 0) {
      return `**Focus on these high-priority items:**\n${high.map(t => `• ${t.title}${t.time ? ` (${t.time})` : ""}`).join("\n")}`;
    }
    return `You have ${pending.length} pending task(s):\n${pending.slice(0, 5).map(t => `• ${t.title}`).join("\n")}`;
  }

  if (lower.includes("score") || lower.includes("how am i")) {
    const overall = Math.round(ctx.state.scores.reduce((a, s) => a + s.score, 0) / ctx.state.scores.length);
    return `**Your scores:**\n${ctx.state.scores.map(s => `• ${DOMAIN_LABELS[s.domain]}: **${s.score}** (${s.trend})`).join("\n")}\n\n**Overall: ${overall}**`;
  }

  if (lower.includes("missed") || lower.includes("skip")) {
    const skipped = ctx.state.tasks.filter(t => t.status === "skipped");
    if (skipped.length === 0) return "No missed or skipped tasks!";
    return `Skipped tasks:\n${skipped.map(t => `• ${t.title}`).join("\n")}`;
  }

  const domains: Domain[] = ["work", "health", "family", "wealth", "me"];
  for (const d of domains) {
    if (lower.includes(d)) {
      const tasks = ctx.state.tasks.filter(t => t.tags.includes(d) && t.status === "pending");
      const plans = ctx.state.plans.filter(p => p.tags.includes(d) && p.status !== "completed");
      const score = ctx.state.scores.find(s => s.domain === d);
      return `**${DOMAIN_LABELS[d]}** (Score: ${score?.score ?? "N/A"})\n\nPending tasks: ${tasks.length}\n${tasks.map(t => `• ${t.title}`).join("\n") || "None"}\n\nActive plans: ${plans.length}\n${plans.map(p => `• ${p.title}`).join("\n") || "None"}`;
    }
  }

  if (lower.startsWith("add task") || lower.startsWith("new task")) {
    const title = input.replace(/^(add|new)\s+task:?\s*/i, "").trim();
    if (title) {
      ctx.addTask({
        title,
        status: "pending",
        priority: "medium",
        tags: ["me"],
        date: new Date().toISOString().slice(0, 10),
      });
      return `Added task: **${title}**\nTagged as "Me" with medium priority.`;
    }
    return "Please provide a task title. Example: `add task Morning stretching`";
  }

  if (lower.includes("complete") || lower.includes("done with")) {
    const taskName = input.replace(/^(complete|done with|mark done):?\s*/i, "").trim().toLowerCase();
    const task = ctx.state.tasks.find(t => t.title.toLowerCase().includes(taskName) && t.status === "pending");
    if (task) {
      ctx.updateTask(task.id, { status: "completed" });
      return `Marked **${task.title}** as completed!`;
    }
    return `Couldn't find a pending task matching "${taskName}".`;
  }

  if (lower.includes("today") || lower.includes("summary")) {
    const pending = ctx.state.tasks.filter(t => t.status === "pending").length;
    const completed = ctx.state.tasks.filter(t => t.status === "completed").length;
    const total = ctx.state.tasks.length;
    const inProgressLearnings = ctx.state.learnings.filter(l => l.status === "in-progress").length;
    const activePlans = ctx.state.plans.filter(p => p.status === "in-progress").length;
    return `**Today's Summary**\n\nTasks: ${completed}/${total} completed, ${pending} pending\nActive learnings: ${inProgressLearnings}\nActive plans: ${activePlans}`;
  }

  return `I can help you with:\n• **"What should I focus on?"** — top priorities\n• **"Show my scores"** — domain scores\n• **"Today's summary"** — overview\n• **"Add task [title]"** — create a task\n• **"Complete [task name]"** — mark done\n• **"Show [domain]"** — domain details\n• **"What did I miss?"** — skipped tasks`;
}

const DOMAIN_COLORS: Record<Domain, string> = {
  work: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  health: "bg-green-500/15 text-green-400 border-green-500/30",
  family: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  wealth: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  me: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const SUB_MODULE_COLORS = "bg-muted text-muted-foreground border-border";

function ImpactTagsDisplay({
  tags,
  messageId,
  onUpdate,
}: {
  tags: ImpactTags;
  messageId: string;
  onUpdate: (id: string, tags: ImpactTags) => void;
}) {
  const [editing, setEditing] = useState(false);

  const toggleDomain = (d: Domain) => {
    const newDomains = tags.domains.includes(d)
      ? tags.domains.filter(x => x !== d)
      : [...tags.domains, d];
    onUpdate(messageId, { ...tags, domains: newDomains });
  };

  const toggleSubModule = (s: SubModule) => {
    const newSubs = tags.subModules.includes(s)
      ? tags.subModules.filter(x => x !== s)
      : [...tags.subModules, s];
    onUpdate(messageId, { ...tags, subModules: newSubs });
  };

  if (tags.domains.length === 0 && tags.subModules.length === 0) return null;

  return (
    <div className="mt-1.5">
      {/* Display tags */}
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-[9px] text-muted-foreground mr-0.5">Impacts:</span>
        {tags.domains.map(d => (
          <span
            key={d}
            className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${DOMAIN_COLORS[d]} ${editing ? "cursor-pointer hover:opacity-70" : ""}`}
            onClick={editing ? () => toggleDomain(d) : undefined}
          >
            {DOMAIN_LABELS[d]}
            {editing && <X className="inline w-2.5 h-2.5 ml-0.5 -mt-px" />}
          </span>
        ))}
        {tags.subModules.map(s => (
          <span
            key={s}
            className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${SUB_MODULE_COLORS} ${editing ? "cursor-pointer hover:opacity-70" : ""}`}
            onClick={editing ? () => toggleSubModule(s) : undefined}
          >
            {SUB_MODULE_LABELS[s]}
            {editing && <X className="inline w-2.5 h-2.5 ml-0.5 -mt-px" />}
          </span>
        ))}
        <button
          onClick={() => setEditing(!editing)}
          className="text-[9px] text-muted-foreground hover:text-foreground ml-0.5 underline underline-offset-2"
        >
          {editing ? "done" : "edit"}
        </button>
      </div>

      {/* Edit mode: show all options to add */}
      {editing && (
        <div className="mt-1.5 space-y-1">
          <div className="flex flex-wrap gap-1">
            {(Object.keys(DOMAIN_LABELS) as Domain[])
              .filter(d => !tags.domains.includes(d))
              .map(d => (
                <button
                  key={d}
                  onClick={() => toggleDomain(d)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border border-dashed opacity-50 hover:opacity-100 ${DOMAIN_COLORS[d]}`}
                >
                  + {DOMAIN_LABELS[d]}
                </button>
              ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(SUB_MODULE_LABELS) as SubModule[])
              .filter(s => !tags.subModules.includes(s))
              .map(s => (
                <button
                  key={s}
                  onClick={() => toggleSubModule(s)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border border-dashed opacity-50 hover:opacity-100 ${SUB_MODULE_COLORS}`}
                >
                  + {SUB_MODULE_LABELS[s]}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatPanelProps {
  activeTab?: "overall" | Domain;
  workSubTab?: "overview" | "stakeholders" | "career" | "skills" | "daily-dosage";
  focusMode?: boolean;
  analysisMode?: boolean;
}

export function ChatPanel({ activeTab = "overall", workSubTab, focusMode, analysisMode }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule | null>(null);
  const recognitionRef = useRef<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Personal OS assistant. Ask me anything about your day, tasks, or scores.\n\nTry **\"What should I focus on?\"** or tap the mic to speak.\n\nUse the scope button to target a specific module.",
      timestamp: new Date(),
    },
  ]);
  const ctx = useApp();
  const bottomRef = useRef<HTMLDivElement>(null);

  const speechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      impactTags: selectedDomain || selectedSubModule ? {
        domains: selectedDomain ? [selectedDomain] : [],
        subModules: selectedSubModule ? [selectedSubModule] : [],
      } : undefined,
    };

    const response = processCommand(input, ctx);
    // Determine context: manual scope > active view > auto-detect
    const hasManualScope = selectedDomain || selectedSubModule;
    const manualTags: ImpactTags = {
      domains: selectedDomain ? [selectedDomain] : [],
      subModules: selectedSubModule ? [selectedSubModule] : [],
    };

    // Derive from active view context
    const viewDomains: Domain[] = activeTab !== "overall" ? [activeTab] : [];
    const viewSubModules: SubModule[] = [];
    if (focusMode) viewSubModules.push("routine");
    if (analysisMode) viewSubModules.push("analysis");
    if (activeTab === "work" && workSubTab && workSubTab !== "overview") {
      const subMap: Record<string, SubModule> = {
        stakeholders: "stakeholders",
        career: "career",
        skills: "skills",
        "daily-dosage": "daily-dosage",
      };
      if (subMap[workSubTab]) viewSubModules.push(subMap[workSubTab]);
    }
    const viewTags: ImpactTags = { domains: viewDomains, subModules: viewSubModules };

    const impactTags: ImpactTags = hasManualScope
      ? manualTags
      : viewDomains.length > 0 || viewSubModules.length > 0
        ? viewTags
        : detectImpactTags(input, ctx);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
      impactTags,
    };

    // Also tag the user message with context
    userMsg.impactTags = hasManualScope ? manualTags : viewDomains.length > 0 || viewSubModules.length > 0 ? viewTags : userMsg.impactTags;

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  const handleUpdateTags = (messageId: string, newTags: ImpactTags) => {
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, impactTags: newTags } : m)
    );
  };

  // Derive context-aware quick actions based on active tab/sub-module
  const getQuickActions = (): string[] => {
    if (focusMode) {
      return ["What should I focus on?", "Show high-priority tasks", "What did I miss?"];
    }
    if (analysisMode) {
      const domain = activeTab !== "overall" ? DOMAIN_LABELS[activeTab] : "";
      return [
        domain ? `Show ${domain} summary` : "Today's summary",
        "What did I miss?",
        "Show my scores",
      ];
    }
    if (activeTab === "work" && workSubTab === "stakeholders") {
      return ["Prep me for my next meeting", "Who should I align with?", "Show stakeholder notes"];
    }
    if (activeTab === "work" && workSubTab === "career") {
      return ["What skills should I develop?", "Show career progress", "Plan next career move"];
    }
    if (activeTab === "work" && workSubTab === "skills") {
      return ["What skills am I developing?", "Suggest upskilling areas", "Show skill gaps"];
    }
    if (activeTab === "work" && workSubTab === "daily-dosage") {
      return ["Show today's updates", "Any trending news?", "What should I read today?"];
    }
    if (activeTab !== "overall") {
      const label = DOMAIN_LABELS[activeTab];
      return [
        `What should I focus on in ${label}?`,
        `Show ${label} summary`,
        `Show ${label} score`,
      ];
    }
    return ["What should I focus on?", "Today's summary", "Show my scores"];
  };

  const quickActions = getQuickActions();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Chat</span>
        <span className="text-[10px] text-muted-foreground ml-auto">Always here to help</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[90%]">
              <div
                className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-accent text-accent-foreground rounded-bl-sm"
                }`}
              >
                {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
              {/* Show impact tags on user messages too (scoped context) */}
              {msg.role === "user" && msg.impactTags && (msg.impactTags.domains.length > 0 || msg.impactTags.subModules.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-1 justify-end">
                  {msg.impactTags.domains.map(d => (
                    <span key={d} className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${DOMAIN_COLORS[d]}`}>
                      {DOMAIN_LABELS[d]}
                    </span>
                  ))}
                  {msg.impactTags.subModules.map(s => (
                    <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${SUB_MODULE_COLORS}`}>
                      {SUB_MODULE_LABELS[s]}
                    </span>
                  ))}
                </div>
              )}
              {msg.role === "assistant" && msg.impactTags && (
                <ImpactTagsDisplay
                  tags={msg.impactTags}
                  messageId={msg.id}
                  onUpdate={handleUpdateTags}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => { setInput(action); }}
              className="text-[10px] px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-border/50 shrink-0 space-y-2">
        {/* Context selector */}
        {(selectedDomain || selectedSubModule) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Target className="w-3 h-3 text-primary shrink-0" />
            <span className="text-[10px] text-muted-foreground">Scoped to:</span>
            {selectedDomain && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${DOMAIN_COLORS[selectedDomain]} flex items-center gap-1`}>
                <DomainIcon domain={selectedDomain} className="w-3 h-3" /> {DOMAIN_LABELS[selectedDomain]}
                <X className="w-2.5 h-2.5 cursor-pointer hover:opacity-70" onClick={() => { setSelectedDomain(null); setSelectedSubModule(null); }} />
              </span>
            )}
            {selectedSubModule && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${SUB_MODULE_COLORS} flex items-center gap-1`}>
                {SUB_MODULE_LABELS[selectedSubModule]}
                <X className="w-2.5 h-2.5 cursor-pointer hover:opacity-70" onClick={() => setSelectedSubModule(null)} />
              </span>
            )}
          </div>
        )}

        {/* Context picker dropdown */}
        {contextOpen && (
          <div className="bg-accent/80 border border-border rounded-lg p-2 space-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 font-medium">Domain</p>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(DOMAIN_LABELS) as Domain[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(selectedDomain === d ? null : d)}
                    className={`text-[10px] px-2 py-1 rounded border font-medium transition-all ${
                      selectedDomain === d
                        ? DOMAIN_COLORS[d]
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <DomainIcon domain={d} className="w-3 h-3" /> {DOMAIN_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 font-medium">Sub-module</p>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(SUB_MODULE_LABELS) as SubModule[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubModule(selectedSubModule === s ? null : s)}
                    className={`text-[10px] px-2 py-1 rounded border font-medium transition-all ${
                      selectedSubModule === s
                        ? "bg-primary/15 text-primary border-primary/40"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {SUB_MODULE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isListening && (
          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
            </span>
            <span className="text-[11px] text-muted-foreground">Listening... speak now</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className={`p-2.5 rounded-lg border transition-all shrink-0 ${
              contextOpen || selectedDomain || selectedSubModule
                ? "bg-primary/15 border-primary/40 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
            title="Scope message to a module"
          >
            <Target className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : selectedDomain ? `Message about ${DOMAIN_LABELS[selectedDomain]}...` : "Ask me anything..."}
            className="flex-1 bg-accent/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {speechSupported && (
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-lg border transition-all ${
                isListening
                  ? "bg-destructive/15 border-destructive/50 text-destructive animate-pulse"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
