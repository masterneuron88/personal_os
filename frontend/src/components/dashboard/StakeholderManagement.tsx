import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ChevronDown, ChevronUp, Trash2, Check, X,
  UserCircle, Shield, Eye, Heart, Sparkles, Crown,
  MessageSquare, Target, Lightbulb, Send, Brain,
  HelpCircle, Crosshair, Compass, Users, Mic, FileText,
  Upload, Play, Pause, Volume2, Briefcase, Activity,
  Wallet, Star, ArrowRight, RotateCcw, Zap, BookOpen,
} from "lucide-react";

// ──────────── Types ────────────

type PersonaRole = "mentor" | "manager" | "critic" | "supporter" | "future-self";

interface PersonaLearning {
  id: string;
  type: "transcript" | "reaction" | "note";
  content: string;
  createdAt: string;
}

interface Persona {
  id: string;
  name: string;
  title: string;
  seniority: "junior" | "peer" | "senior" | "executive";
  role: PersonaRole;
  traits: string[];
  notes?: string;
  learnings: PersonaLearning[];
}

type EngagementType =
  | "one-on-one"
  | "inspiration"
  | "group-call"
  | "incoming-presentation"
  | "final-council";

type OneOnOnePurpose = "presentation" | "doubt" | "brainstorm" | "incident" | "advice";
type MyRoleInPresentation = "peer" | "senior" | "junior" | "skip-level";
type CouncilDomain = "health" | "wealth" | "work" | "personal" | "combined";

interface EngagementSession {
  id: string;
  type: EngagementType;
  topic: string;
  context: string;
  personaIds: string[];
  // Type-specific
  oneOnOnePurpose?: OneOnOnePurpose;
  myRole?: MyRoleInPresentation;
  councilDomain?: CouncilDomain;
  // State
  responses: Record<string, string>; // personaId -> AI response
  userNotes: Record<string, string>; // personaId -> user notes
  createdAt: string;
}

interface MentorGoal {
  id: string;
  title: string;
  description?: string;
  status: "active" | "achieved" | "paused";
  createdAt: string;
}

interface MentorReflection {
  id: string;
  variantId: string;
  question: string;
  answer: string;
  createdAt: string;
}

// ──────────── Constants ────────────

const ROLE_CONFIG: Record<PersonaRole, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  mentor: { label: "Mentor", icon: <Lightbulb className="w-3.5 h-3.5" />, color: "bg-amber-500/15 text-amber-400 border-amber-500/30", description: "Guides with wisdom and experience" },
  manager: { label: "Manager", icon: <Crown className="w-3.5 h-3.5" />, color: "bg-blue-500/15 text-blue-400 border-blue-500/30", description: "Evaluates from leadership lens" },
  critic: { label: "Critic", icon: <Eye className="w-3.5 h-3.5" />, color: "bg-red-500/15 text-red-400 border-red-500/30", description: "Challenges and stress-tests ideas" },
  supporter: { label: "Supporter", icon: <Heart className="w-3.5 h-3.5" />, color: "bg-green-500/15 text-green-400 border-green-500/30", description: "Encourages and finds strengths" },
  "future-self": { label: "Future Self", icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-purple-500/15 text-purple-400 border-purple-500/30", description: "Perspective from your ideal future" },
};

const SENIORITY_LABELS: Record<Persona["seniority"], string> = {
  junior: "Junior",
  peer: "Peer",
  senior: "Senior",
  executive: "Executive",
};

const ENGAGEMENT_TYPES: { key: EngagementType; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "one-on-one", label: "1:1 Engagement", icon: <UserCircle className="w-4 h-4" />, description: "Prepare for a direct conversation — presentation, brainstorm, doubt, incident, or advice" },
  { key: "inspiration", label: "What Would They Do?", icon: <Lightbulb className="w-4 h-4" />, description: "See how this person would handle the situation — take inspiration from their approach" },
  { key: "group-call", label: "Group Call Prep", icon: <Users className="w-4 h-4" />, description: "Understand how each person plays a role in a group setting and what to prepare" },
  { key: "incoming-presentation", label: "Incoming Presentation", icon: <BookOpen className="w-4 h-4" />, description: "Someone is presenting to you — prepare questions from your position (peer, senior, junior)" },
  { key: "final-council", label: "The Final Council", icon: <Star className="w-4 h-4" />, description: "Get multi-angle advice: Health, Wealth, Work, Personal, or a combined orchestrated view" },
];

const ONE_ON_ONE_PURPOSES: { key: OneOnOnePurpose; label: string; icon: React.ReactNode }[] = [
  { key: "presentation", label: "Presenting to them", icon: <Play className="w-3.5 h-3.5" /> },
  { key: "doubt", label: "Clearing a doubt", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { key: "brainstorm", label: "Brainstorming", icon: <Brain className="w-3.5 h-3.5" /> },
  { key: "incident", label: "Sharing an incident", icon: <Zap className="w-3.5 h-3.5" /> },
  { key: "advice", label: "Seeking advice", icon: <Compass className="w-3.5 h-3.5" /> },
];

const MY_ROLES: { key: MyRoleInPresentation; label: string }[] = [
  { key: "junior", label: "As a Junior" },
  { key: "peer", label: "As a Peer" },
  { key: "senior", label: "As a Senior" },
  { key: "skip-level", label: "Skip-level" },
];

const COUNCIL_DOMAINS: { key: CouncilDomain; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "health", label: "Health", icon: <Activity className="w-3.5 h-3.5" />, color: "text-green-400" },
  { key: "wealth", label: "Wealth", icon: <Wallet className="w-3.5 h-3.5" />, color: "text-amber-400" },
  { key: "work", label: "Work", icon: <Briefcase className="w-3.5 h-3.5" />, color: "text-blue-400" },
  { key: "personal", label: "Personal", icon: <Heart className="w-3.5 h-3.5" />, color: "text-pink-400" },
  { key: "combined", label: "Combined Orchestrator", icon: <Star className="w-3.5 h-3.5" />, color: "text-purple-400" },
];

// Thinking variant lenses for mentor mode
type ThinkingVariant = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  questions: string[];
};

const THINKING_VARIANTS: ThinkingVariant[] = [
  { id: "growth-pm", label: "Growth PM", icon: <Crosshair className="w-3.5 h-3.5" />, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", description: "Think in terms of metrics, experiments, and user acquisition funnels", questions: ["What's the north-star metric here?", "How does this move the growth needle?", "What's the cheapest experiment to validate this?", "Where's the biggest drop-off in the funnel?"] },
  { id: "solution-architect", label: "Solution Architect", icon: <Compass className="w-3.5 h-3.5" />, color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30", description: "Think about systems, scalability, trade-offs, and technical debt", questions: ["What are the integration points?", "Where will this break at 10x scale?", "What's the simplest architecture that could work?", "What technical debt am I accepting?"] },
  { id: "vp-products", label: "VP of Products", icon: <Crown className="w-3.5 h-3.5" />, color: "bg-violet-500/15 text-violet-400 border-violet-500/30", description: "Think strategically about product-market fit, roadmap, and vision", questions: ["Does this align with the company's strategic bets?", "What's the 6-month vision for this?", "How does this impact our competitive moat?", "Am I solving the right problem?"] },
  { id: "technical-pm", label: "Technical PM", icon: <Shield className="w-3.5 h-3.5" />, color: "bg-blue-500/15 text-blue-400 border-blue-500/30", description: "Balance feasibility, effort estimation, and engineering alignment", questions: ["What's the effort vs. impact trade-off?", "Are there hidden dependencies?", "Have I aligned with engineering on scope?", "What can we cut without losing value?"] },
  { id: "ux-pm", label: "UX PM", icon: <Heart className="w-3.5 h-3.5" />, color: "bg-pink-500/15 text-pink-400 border-pink-500/30", description: "Think about user journeys, friction points, and emotional design", questions: ["What's the user's emotional state at this point?", "Where is the friction?", "Is this intuitive without a tutorial?", "What does delight look like here?"] },
  { id: "data-analyst", label: "Data Analyst", icon: <Eye className="w-3.5 h-3.5" />, color: "bg-amber-500/15 text-amber-400 border-amber-500/30", description: "Think about what the data says, biases, and evidence-based decisions", questions: ["What does the data actually say?", "Am I cherry-picking evidence?", "What would change my mind?", "What's the confidence level on this?"] },
  { id: "design-thinker", label: "Design Thinker", icon: <Lightbulb className="w-3.5 h-3.5" />, color: "bg-orange-500/15 text-orange-400 border-orange-500/30", description: "Think about empathy, ideation, prototyping, and iteration", questions: ["Have I truly understood the user's pain?", "What are 3 wildly different solutions?", "What's the quickest way to prototype this?", "What assumptions am I making?"] },
  { id: "cto-lens", label: "CTO Lens", icon: <Brain className="w-3.5 h-3.5" />, color: "bg-red-500/15 text-red-400 border-red-500/30", description: "Think about technology bets, team capability, and long-term platform", questions: ["Is this a build, buy, or partner decision?", "Does our team have the skills for this?", "What's the platform play here?", "How does this age in 2 years?"] },
];

// ──────────── Storage ────────────

const STORAGE_KEY_PERSONAS = "personal-os-council-personas";
const STORAGE_KEY_SESSIONS = "personal-os-council-sessions-v2";
const STORAGE_KEY_MENTOR_GOALS = "personal-os-mentor-goals";
const STORAGE_KEY_MENTOR_REFLECTIONS = "personal-os-mentor-reflections";

function loadPersonas(): Persona[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PERSONAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: any) => ({ ...p, learnings: p.learnings || [] }));
    }
  } catch {}
  return [
    { id: "1", name: "Sarah Chen", title: "VP Engineering", seniority: "executive", role: "manager", traits: ["Data-driven", "Direct", "Values metrics"], notes: "Key decision maker. Appreciates structured proposals with clear ROI.", learnings: [] },
    { id: "2", name: "Mike Rodriguez", title: "Product Director", seniority: "senior", role: "mentor", traits: ["Strategic thinker", "Cross-functional", "Empathetic"], notes: "Great at helping frame problems from multiple angles.", learnings: [] },
    { id: "3", name: "Priya Patel", title: "Staff Engineer", seniority: "peer", role: "critic", traits: ["Detail-oriented", "High standards", "Technical depth"], notes: "Will find the gaps in any proposal. Invaluable for stress-testing ideas.", learnings: [] },
    { id: "4", name: "Future Me", title: "Senior Engineering Manager", seniority: "executive", role: "future-self", traits: ["Confident", "Visionary", "Decisive"], notes: "The version of me 2 years from now who has achieved my career goals.", learnings: [] },
  ];
}

function loadSessions(): EngagementSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadMentorGoals(): MentorGoal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MENTOR_GOALS);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadMentorReflections(): MentorReflection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MENTOR_REFLECTIONS);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

// ──────────── Smart Response Generator ────────────

function generateSmartResponse(
  persona: Persona,
  session: EngagementSession,
): string {
  const { name, title, role, seniority, traits, notes, learnings } = persona;
  const { type, topic, context, oneOnOnePurpose, myRole, councilDomain } = session;

  // Extract learned patterns
  const learnedPatterns = learnings
    .filter(l => l.type === "reaction" || l.type === "transcript")
    .slice(0, 3)
    .map(l => l.content.slice(0, 200));

  const traitStr = traits.join(", ");
  const learnedContext = learnedPatterns.length > 0
    ? `\n\nBased on past interactions, ${name} tends to: ${learnedPatterns.map(p => `"${p.slice(0, 80)}..."`).join("; ")}`
    : "";

  // Role-based personality modifiers
  const personalityPrefix: Record<PersonaRole, string> = {
    mentor: `As a mentor figure, ${name} would guide with warmth but challenge thinking:`,
    manager: `As a manager, ${name} would evaluate through a leadership and outcomes lens:`,
    critic: `As a critic, ${name} would probe for weaknesses and gaps:`,
    supporter: `As a supporter, ${name} would encourage while noting strengths:`,
    "future-self": `Speaking as your future self who has already achieved this:`,
  };

  const seniorityModifier: Record<Persona["seniority"], string> = {
    junior: "They'd ask clarifying questions and seek to understand before forming opinions.",
    peer: "They'd engage as an equal, sharing honest perspectives and collaborative ideas.",
    senior: "They'd bring experience and pattern recognition, connecting this to bigger picture themes.",
    executive: "They'd focus on strategic impact, resource allocation, and organizational alignment.",
  };

  if (type === "one-on-one") {
    const purposeResponses: Record<OneOnOnePurpose, string> = {
      presentation: `${personalityPrefix[role]}\n\n"Regarding '${topic}' — ${name} (${title}) would likely focus on these areas:"\n\n**Questions they'll probably ask:**\n• What's the measurable impact of this?\n• How does this fit into the broader strategy?\n• What alternatives did you consider?\n• What's the timeline and key milestones?\n\n**What would impress them:**\n• Come with data, not just opinions (${traitStr} mindset)\n• Show you've thought about risks and mitigations\n• Have a clear ask — what do you need from them?\n\n**Potential concerns:**\n• Resource implications and trade-offs\n• Whether this aligns with current priorities\n• Execution complexity vs. value delivered\n\n${seniorityModifier[seniority]}${learnedContext}`,

      doubt: `${personalityPrefix[role]}\n\n"You're coming to ${name} with a doubt about '${topic}'. Here's how they'd likely approach it:"\n\n**Their likely response style:**\n• ${role === "mentor" ? "Would ask you what YOU think first, then build on it" : role === "critic" ? "Would break down the doubt into specific sub-questions" : role === "supporter" ? "Would reassure first, then work through it systematically" : "Would reframe the doubt as a decision to be made"}\n\n**Questions they'd ask to help you:**\n• What specifically is making you uncertain?\n• What would you need to see to feel confident?\n• What's the worst case if you're wrong?\n• Have you talked to anyone else about this?\n\n**What ${name} values (${traitStr}):**\n• Intellectual honesty about what you don't know\n• Having done preliminary thinking before asking\n• Being open to uncomfortable answers\n\n${seniorityModifier[seniority]}${learnedContext}`,

      brainstorm: `${personalityPrefix[role]}\n\n"Brainstorming '${topic}' with ${name} (${traitStr}):"\n\n**How they'd open:**\n• ${role === "mentor" ? "\"Let me help you see this from angles you haven't considered...\"" : role === "critic" ? "\"Before we brainstorm solutions, let's make sure we have the right problem...\"" : "\"What's the boldest version of this idea?\"" }\n\n**Divergent thinking they'd push:**\n• What if we had 10x the resources?\n• What if we had to solve this in 1 week?\n• What would our competitors do?\n• What would a completely different industry do?\n\n**Convergent filters they'd apply:**\n• Impact vs. effort matrix\n• Alignment with ${seniority === "executive" ? "company strategy" : "team goals"}\n• Technical feasibility reality check\n• User/customer desirability\n\n${seniorityModifier[seniority]}${learnedContext}`,

      incident: `${personalityPrefix[role]}\n\n"${name} reacting to the incident about '${topic}':"\n\n**Immediate response:**\n• ${role === "manager" ? "\"What's the impact? Who's affected? What's the mitigation plan?\"" : role === "supporter" ? "\"First, are you okay? Let's think through this calmly.\"" : role === "critic" ? "\"What went wrong in the process that allowed this to happen?\"" : "\"What can we learn from this? Every failure is data.\""}\n\n**Questions they'd ask:**\n• What was the sequence of events?\n• Was this preventable? How?\n• Who else needs to know about this?\n• What's the recovery plan?\n\n**How they'd help you process:**\n• Separate the emotional from the factual\n• Identify systemic vs. individual factors\n• Frame the narrative constructively for stakeholders\n• Build a prevention plan\n\n${seniorityModifier[seniority]}${learnedContext}`,

      advice: `${personalityPrefix[role]}\n\n"${name}'s advice on '${topic}' (informed by their ${traitStr} nature):"\n\n**Their opening perspective:**\n• ${seniority === "executive" ? "They'd zoom out first — \"How does this fit in the bigger picture?\"" : seniority === "senior" ? "They'd draw from experience — \"I've seen this pattern before...\"" : "They'd be direct — \"Here's what I'd do in your shoes...\""}\n\n**Key considerations they'd raise:**\n• What are the second-order effects?\n• Who are the stakeholders you haven't consulted?\n• What would you advise someone else in this situation?\n• What does success look like in 6 months?\n\n**Their likely recommendation framework:**\n• Start with the end state you want\n• Work backwards to identify key milestones\n• Identify the one thing that would make the biggest difference\n• Take the smallest possible action today\n\n${seniorityModifier[seniority]}${learnedContext}`,
    };
    return purposeResponses[oneOnOnePurpose || "advice"];
  }

  if (type === "inspiration") {
    return `**What would ${name} (${title}) do about "${topic}"?**\n\nGiven their ${traitStr} nature and ${seniority}-level perspective:\n\n**Their approach:**\n${role === "mentor" ? "• Would start by understanding the deeper 'why' behind the situation\n• Frame it as a learning opportunity, not just a problem to solve" : role === "manager" ? "• Would assess organizational impact first\n• Rally the right people and create accountability" : role === "critic" ? "• Would challenge every assumption before acting\n• Stress-test the approach with 'what ifs'" : role === "supporter" ? "• Would build on existing strengths and momentum\n• Find the encouraging angle while addressing reality" : "• Would think about this from the 2-year-out perspective\n• Ask 'will this matter in a year?'"}\n\n**Specific actions they'd take:**\n1. ${seniority === "executive" ? "Align this with strategic priorities before diving in" : "Gather data and talk to key stakeholders"}\n2. Identify the 80/20 — what 20% of effort drives 80% of results?\n3. Set a clear decision timeline to avoid analysis paralysis\n4. ${role === "mentor" ? "Document lessons for future reference" : "Create accountability structures"}\n\n**What you can learn from their style:**\n• Their decision-making speed: ${seniority === "executive" ? "Fast, intuition-backed" : seniority === "senior" ? "Deliberate but decisive" : "Thoughtful, data-informed"}\n• Their communication style: ${traits[0] || "Direct"}\n• Their risk tolerance: ${role === "critic" ? "Low — they'd want more evidence" : role === "supporter" ? "Moderate — they'd be optimistic" : "Balanced"}\n\n${notes ? `**Context note:** ${notes}` : ""}${learnedContext}`;
  }

  if (type === "group-call") {
    return `**${name}'s role in the group call about "${topic}":**\n\n**Their natural position in group dynamics:**\n• ${role === "manager" ? "Will likely take or expect a leadership role in the discussion" : role === "critic" ? "Will play devil's advocate — expect pushback on weak points" : role === "supporter" ? "Will build bridges between differing opinions" : role === "mentor" ? "Will ask the tough questions others won't" : "Will bring a future-oriented perspective"}\n• As a ${SENIORITY_LABELS[seniority].toLowerCase()}, they'll ${seniority === "executive" ? "expect concise, well-prepared inputs and make final calls" : seniority === "senior" ? "share experience-based insights and guide direction" : "contribute detailed analysis and implementation perspectives"}\n\n**What to prepare for them specifically:**\n• ${traits.map(t => `Their "${t}" nature means: prepare ${t.toLowerCase().includes("data") || t.toLowerCase().includes("detail") ? "specific numbers and evidence" : t.toLowerCase().includes("strategic") ? "big-picture framing" : "thoughtful, honest positioning"}`).join("\n• ")}\n\n**How they'll interact with others:**\n• May ${role === "critic" ? "challenge other viewpoints — have rebuttals ready" : role === "supporter" ? "align with whoever makes the strongest case" : "guide conversation toward actionable outcomes"}\n• Watch for: ${role === "manager" ? "them steering toward their priorities" : role === "critic" ? "them derailing with edge cases" : "them building consensus"}\n\n**Your preparation checklist for ${name}:**\n□ Have your key message for them in one sentence\n□ Anticipate their top 2 questions\n□ Know what you need from them specifically\n□ Prepare how to handle their ${role === "critic" ? "challenges" : "questions"}\n\n${learnedContext}`;
  }

  if (type === "incoming-presentation") {
    const roleContext: Record<MyRoleInPresentation, string> = {
      peer: `**As a peer reviewing this presentation on "${topic}":**\n\nYou're equals — they expect honest, collaborative feedback.\n\n**Questions to ask:**\n• "How did you arrive at this approach vs. alternatives?"\n• "What's the biggest risk you see?"\n• "How does this interact with what my team is working on?"\n• "What help do you need from us?"\n\n**What to watch for:**\n• Are they solving the right problem?\n• Do their assumptions hold up?\n• Are there cross-team impacts they're missing?\n• Is the timeline realistic based on your experience?`,

      senior: `**As a senior reviewing this presentation on "${topic}":**\n\nThey'll be looking for your endorsement and guidance.\n\n**Strategic questions:**\n• "How does this ladder up to our quarterly/annual goals?"\n• "What would you cut if you had half the timeline?"\n• "Who else needs to buy into this?"\n• "What's the success criteria and how will we measure it?"\n\n**Leadership moves:**\n• Acknowledge what's strong before diving into gaps\n• Ask about what they considered and rejected\n• Push for clarity on ownership and accountability\n• Connect it to patterns you've seen in similar initiatives`,

      junior: `**As a junior in this presentation on "${topic}":**\n\nThis is a learning opportunity and a chance to show critical thinking.\n\n**Smart questions to ask:**\n• "Could you help me understand why this approach vs. [alternative]?"\n• "What would you recommend I read/study to better understand this space?"\n• "How does this connect to [broader initiative]?"\n• "What are the key assumptions here?"\n\n**How to add value:**\n• Bring the user/ground-level perspective they might be missing\n• Ask clarifying questions — it shows engagement\n• Note things that seem unclear — others probably think the same\n• Offer to help with specific aspects you can contribute to`,

      "skip-level": `**As a skip-level in this presentation on "${topic}":**\n\nThis is unusual — there's likely a specific reason you're in the room.\n\n**Questions that show strategic awareness:**\n• "How does this fit into the broader organizational direction?"\n• "What support do you need that your direct manager can't provide?"\n• "What would you do differently if there were no constraints?"\n• "Is there anything you'd tell me that you wouldn't tell your direct reports?"\n\n**Navigation tips:**\n• Be aware of the political dynamics — don't undermine the middle layer\n• Focus on removing blockers rather than directing work\n• Listen more than you speak — your presence already signals importance\n• Follow up with the manager layer to maintain alignment`,
    };
    return roleContext[myRole || "peer"];
  }

  if (type === "final-council") {
    const domainAdvice: Record<CouncilDomain, string> = {
      health: `🏥 **Health Council on "${topic}":**\n\n**Physical Impact Assessment:**\n• How does this affect your sleep, exercise routine, or energy levels?\n• Is stress from this manageable, or are there warning signs?\n• What's the health cost of NOT acting vs. acting?\n\n**Recommended Health-First Actions:**\n1. Before any decision, ensure you're well-rested and not deciding under stress\n2. Set boundaries around this — define "off hours" from this topic\n3. Build in physical activity or decompression around high-stress touchpoints\n4. Consider: will you look back and wish you'd prioritized your health more?\n\n**Warning Signs to Watch:**\n• Sleep disruption related to this situation\n• Skipping meals or exercise because of it\n• Increased screen time / decreased outdoor time\n• Physical tension (jaw clenching, shoulder tension, headaches)`,

      wealth: `💰 **Wealth Council on "${topic}":**\n\n**Financial Lens:**\n• What's the monetary cost/opportunity of this decision?\n• How does this affect your short-term vs. long-term financial position?\n• Is there an investment angle — time invested now for future returns?\n\n**Strategic Wealth Thinking:**\n1. Apply the "10-10-10" rule: How will this affect finances in 10 days, 10 months, 10 years?\n2. What's the ROI on your time spent here vs. alternatives?\n3. Are there ways to monetize or leverage what you'll learn?\n4. Consider opportunity cost — what are you NOT doing while focused on this?\n\n**Action Items:**\n• Quantify the financial impact where possible\n• Set a budget (time and money) for this initiative\n• Identify potential revenue or savings opportunities\n• Build a financial safety net before taking risks`,

      work: `💼 **Work Council on "${topic}":**\n\n**Career Impact Assessment:**\n• How does this position you for your next role?\n• Does this build skills on your development plan?\n• What visibility does this give you with key stakeholders?\n\n**Strategic Career Moves:**\n1. Align this with your stated career goals — does it advance them?\n2. Who will notice your work on this? Make it visible to the right people\n3. Document outcomes and learnings — build your personal case study library\n4. Find a mentor angle — can someone guide you through this?\n\n**Watch Out For:**\n• Scope creep that dilutes your impact\n• Taking on work that's below your skill level (unless politically necessary)\n• Burning bridges vs. building bridges\n• Missing the forest for the trees — stay strategic`,

      personal: `🌟 **Personal Council on "${topic}":**\n\n**Values Alignment Check:**\n• Does this align with who you want to be?\n• Would your best self be proud of how you're handling this?\n• Are you making this decision from a place of fear or growth?\n\n**Personal Growth Lens:**\n1. What does this teach you about yourself?\n2. Are you repeating an old pattern or creating a new one?\n3. How does this affect your relationships and personal life?\n4. What would you tell your best friend in this situation?\n\n**Self-Care Checkpoint:**\n• Are you being too hard on yourself about this?\n• Have you asked for help from people who care about you?\n• Is there joy or energy in this, or is it all obligation?\n• What would "enough" look like — not perfect, just enough?`,

      combined: `⭐ **Combined Orchestrator Council on "${topic}":**\n\nLooking across all dimensions of your life:\n\n**🏥 Health Impact:** How does this affect your physical/mental well-being? Set boundaries.\n\n**💰 Wealth Impact:** What's the financial angle? Quantify the cost and opportunity.\n\n**💼 Work Impact:** How does this serve your career trajectory? Make it count.\n\n**🌟 Personal Impact:** Does this align with your values and who you want to be?\n\n**Orchestrated Recommendation:**\n\n1. **Prioritize:** Which dimension is most affected? Lead your decision-making from there.\n2. **Protect:** Which dimension is most at risk? Set up guardrails.\n3. **Leverage:** Where can one action serve multiple dimensions?\n4. **Sequence:** What needs to happen first, second, third? Don't try to solve everything at once.\n\n**The One Thing:**\nIf you could only do ONE thing about "${topic}" across all these dimensions, what would create the most positive ripple effect? Start there.\n\n**30-Day Check-in Questions:**\n• Has my health suffered or improved?\n• Am I financially better or worse positioned?\n• Has my career moved forward?\n• Am I more or less aligned with my values?`,
    };
    return domainAdvice[councilDomain || "combined"];
  }

  return `${name} (${title}) is considering "${topic}" from their ${role} perspective with ${traitStr} tendencies. ${seniorityModifier[seniority]}`;
}

// ──────────── Main Component ────────────

export function StakeholderManagement() {
  const [personas, setPersonas] = useState<Persona[]>(loadPersonas);
  const [sessions, setSessions] = useState<EngagementSession[]>(loadSessions);
  const [mentorGoals, setMentorGoals] = useState<MentorGoal[]>(loadMentorGoals);
  const [mentorReflections, setMentorReflections] = useState<MentorReflection[]>(loadMentorReflections);
  const [view, setView] = useState<"mentor" | "council" | "engage">("mentor");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [showLearnInput, setShowLearnInput] = useState<string | null>(null);

  const [personaForm, setPersonaForm] = useState({
    name: "", title: "", seniority: "peer" as Persona["seniority"],
    role: "mentor" as PersonaRole, traits: "", notes: "",
  });

  const savePersonas = (list: Persona[]) => {
    setPersonas(list);
    localStorage.setItem(STORAGE_KEY_PERSONAS, JSON.stringify(list));
  };
  const saveSessions = (list: EngagementSession[]) => {
    setSessions(list);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(list));
  };
  const saveMentorGoals = (list: MentorGoal[]) => {
    setMentorGoals(list);
    localStorage.setItem(STORAGE_KEY_MENTOR_GOALS, JSON.stringify(list));
  };
  const saveMentorReflections = (list: MentorReflection[]) => {
    setMentorReflections(list);
    localStorage.setItem(STORAGE_KEY_MENTOR_REFLECTIONS, JSON.stringify(list));
  };

  const addPersona = () => {
    if (!personaForm.name.trim()) return;
    const p: Persona = {
      id: crypto.randomUUID(),
      name: personaForm.name,
      title: personaForm.title,
      seniority: personaForm.seniority,
      role: personaForm.role,
      traits: personaForm.traits.split(",").map(t => t.trim()).filter(Boolean),
      notes: personaForm.notes || undefined,
      learnings: [],
    };
    savePersonas([...personas, p]);
    setPersonaForm({ name: "", title: "", seniority: "peer", role: "mentor", traits: "", notes: "" });
    setShowAddPersona(false);
  };

  const deletePersona = (id: string) => savePersonas(personas.filter(p => p.id !== id));

  const addLearningToPersona = (personaId: string, learning: Omit<PersonaLearning, "id" | "createdAt">) => {
    savePersonas(personas.map(p =>
      p.id === personaId
        ? { ...p, learnings: [{ ...learning, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...p.learnings] }
        : p
    ));
  };

  const deleteLearningFromPersona = (personaId: string, learningId: string) => {
    savePersonas(personas.map(p =>
      p.id === personaId ? { ...p, learnings: p.learnings.filter(l => l.id !== learningId) } : p
    ));
  };

  const deleteSession = (id: string) => {
    saveSessions(sessions.filter(s => s.id !== id));
    if (activeSession === id) setActiveSession(null);
  };

  const currentSession = sessions.find(s => s.id === activeSession);
  const roleGroups = personas.reduce((acc, p) => {
    if (!acc[p.role]) acc[p.role] = [];
    acc[p.role].push(p);
    return acc;
  }, {} as Record<string, Persona[]>);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        {([
          { key: "mentor" as const, icon: <Brain className="w-3.5 h-3.5" />, label: "Mentor" },
          { key: "council" as const, icon: <UserCircle className="w-3.5 h-3.5" />, label: "Council" },
          { key: "engage" as const, icon: <Zap className="w-3.5 h-3.5" />, label: "Engage" },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              view === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        {sessions.length > 0 && (
          <span className="text-[9px] bg-accent px-1.5 py-0.5 rounded-full text-muted-foreground ml-auto">{sessions.length} sessions</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === "mentor" ? (
          <MentorModeView key="mentor" goals={mentorGoals} reflections={mentorReflections} onSaveGoals={saveMentorGoals} onSaveReflections={saveMentorReflections} />
        ) : view === "council" ? (
          <motion.div key="council" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(ROLE_CONFIG) as PersonaRole[]).map(role => {
                const cfg = ROLE_CONFIG[role];
                const count = (roleGroups[role] || []).length;
                return (
                  <div key={role} className="glass-card p-2 text-center">
                    <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1 ${cfg.color}`}>{cfg.icon}</div>
                    <div className="text-sm font-bold text-foreground">{count}</div>
                    <div className="text-[9px] text-muted-foreground">{cfg.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Personas list */}
            <div className="space-y-2">
              {personas.map(p => {
                const cfg = ROLE_CONFIG[p.role];
                return (
                  <div key={p.id} className="glass-card overflow-hidden">
                    <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="w-full flex items-center gap-3 p-3 text-left">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cfg.color}`}>
                        {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${cfg.color}`}>{cfg.label}</span>
                          {p.learnings.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{p.learnings.length} learned</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">{p.title}</span>
                          <span className="text-[9px] text-muted-foreground/50">|</span>
                          <span className="text-[10px] text-muted-foreground">{SENIORITY_LABELS[p.seniority]}</span>
                        </div>
                      </div>
                      {expanded === p.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>

                    {expanded === p.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                        <p className="text-[10px] text-muted-foreground italic">{cfg.description}</p>
                        {p.traits.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.traits.map((t, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/50 text-muted-foreground border border-border/30">{t}</span>
                            ))}
                          </div>
                        )}
                        {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}

                        {/* Persona Learning Section */}
                        <div className="border-t border-border/20 pt-2 mt-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Brain className="w-3 h-3" /> Teach this persona
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/70 mb-2">Add transcripts, reactions, or notes so the system learns how {p.name} thinks and responds.</p>

                          {showLearnInput === p.id ? (
                            <PersonaLearningInput
                              personaName={p.name}
                              onAdd={(learning) => { addLearningToPersona(p.id, learning); setShowLearnInput(null); }}
                              onCancel={() => setShowLearnInput(null)}
                            />
                          ) : (
                            <button onClick={() => setShowLearnInput(p.id)} className="w-full text-[10px] text-primary hover:text-primary/80 flex items-center justify-center gap-1 py-1.5 border border-dashed border-primary/30 rounded-md hover:bg-primary/5 transition-colors">
                              <Upload className="w-3 h-3" /> Add transcript, reaction, or note
                            </button>
                          )}

                          {/* Existing learnings */}
                          {p.learnings.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {p.learnings.slice(0, 3).map(l => (
                                <div key={l.id} className="flex items-start gap-2 p-1.5 rounded bg-accent/20">
                                  <span className={`text-[9px] px-1 py-0.5 rounded shrink-0 mt-0.5 ${l.type === "transcript" ? "bg-blue-500/15 text-blue-400" : l.type === "reaction" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}>{l.type}</span>
                                  <span className="text-[10px] text-muted-foreground flex-1 line-clamp-2">{l.content}</span>
                                  <button onClick={() => deleteLearningFromPersona(p.id, l.id)} className="text-muted-foreground/50 hover:text-destructive shrink-0"><Trash2 className="w-2.5 h-2.5" /></button>
                                </div>
                              ))}
                              {p.learnings.length > 3 && <span className="text-[9px] text-muted-foreground">+{p.learnings.length - 3} more</span>}
                            </div>
                          )}
                        </div>

                        <button onClick={() => deletePersona(p.id)} className="text-[10px] text-destructive hover:underline flex items-center gap-1 mt-1">
                          <Trash2 className="w-3 h-3" /> Remove from council
                        </button>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add persona */}
            {showAddPersona ? (
              <div className="glass-card p-3 space-y-2">
                <div className="text-xs font-semibold text-foreground mb-1">Add Council Member</div>
                <input value={personaForm.name} onChange={e => setPersonaForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <input value={personaForm.title} onChange={e => setPersonaForm(f => ({ ...f, title: e.target.value }))} placeholder="Title / Role at company" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <div className="flex gap-2">
                  <select value={personaForm.role} onChange={e => setPersonaForm(f => ({ ...f, role: e.target.value as PersonaRole }))} className="flex-1 text-xs bg-accent/50 border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    {(Object.keys(ROLE_CONFIG) as PersonaRole[]).map(r => (<option key={r} value={r}>{ROLE_CONFIG[r].label}</option>))}
                  </select>
                  <select value={personaForm.seniority} onChange={e => setPersonaForm(f => ({ ...f, seniority: e.target.value as Persona["seniority"] }))} className="flex-1 text-xs bg-accent/50 border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    {(Object.keys(SENIORITY_LABELS) as Persona["seniority"][]).map(s => (<option key={s} value={s}>{SENIORITY_LABELS[s]}</option>))}
                  </select>
                </div>
                <input value={personaForm.traits} onChange={e => setPersonaForm(f => ({ ...f, traits: e.target.value }))} placeholder="Traits (comma separated)" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                <textarea value={personaForm.notes} onChange={e => setPersonaForm(f => ({ ...f, notes: e.target.value }))} placeholder="How this person thinks, what they value..." rows={2} className="w-full text-xs bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                <div className="flex gap-2">
                  <button onClick={addPersona} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">Add</button>
                  <button onClick={() => setShowAddPersona(false)} className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddPersona(true)} className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 border border-dashed border-border rounded-lg hover:bg-accent/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Council Member
              </button>
            )}
          </motion.div>
        ) : (
          /* ─── Engage View ─── */
          <motion.div key="engage" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            {activeSession && currentSession ? (
              <EngagementSessionView
                session={currentSession}
                personas={personas}
                onUpdate={(updated) => saveSessions(sessions.map(s => s.id === updated.id ? updated : s))}
                onClose={() => setActiveSession(null)}
                onDelete={() => deleteSession(currentSession.id)}
              />
            ) : showNewSession ? (
              <NewEngagementForm
                personas={personas}
                onStart={(session) => {
                  // Generate responses
                  const responses: Record<string, string> = {};
                  session.personaIds.forEach(pid => {
                    const persona = personas.find(p => p.id === pid);
                    if (persona) responses[pid] = generateSmartResponse(persona, session);
                  });
                  // For final council without specific personas, generate domain advice
                  if (session.type === "final-council") {
                    responses["__council__"] = generateSmartResponse(
                      { id: "__council__", name: "The Council", title: "Life Advisor", seniority: "executive", role: "mentor", traits: ["Holistic", "Balanced"], learnings: [] },
                      session
                    );
                  }
                  const fullSession = { ...session, responses };
                  saveSessions([fullSession, ...sessions]);
                  setActiveSession(fullSession.id);
                  setShowNewSession(false);
                }}
                onCancel={() => setShowNewSession(false)}
              />
            ) : (
              <>
                {/* Engagement type cards */}
                <div className="space-y-2">
                  {ENGAGEMENT_TYPES.map(et => (
                    <button
                      key={et.key}
                      onClick={() => setShowNewSession(true)}
                      className="w-full glass-card p-3 text-left hover:bg-accent/20 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                          {et.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground">{et.label}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">{et.description}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Past sessions */}
                {sessions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Past Sessions</div>
                    {sessions.slice(0, 10).map(s => {
                      const etCfg = ENGAGEMENT_TYPES.find(e => e.key === s.type);
                      return (
                        <button key={s.id} onClick={() => setActiveSession(s.id)} className="w-full glass-card p-2.5 text-left hover:bg-accent/20 transition-colors">
                          <div className="flex items-center gap-2 mb-0.5">
                            {etCfg?.icon && <span className="text-muted-foreground">{etCfg.icon}</span>}
                            <span className="text-xs font-medium text-foreground truncate">{s.topic}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                            <span>{etCfg?.label}</span>
                            <span className="opacity-30">|</span>
                            <span>{s.personaIds.length} perspectives</span>
                            <span className="opacity-30">|</span>
                            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ──────────── Persona Learning Input ────────────

function PersonaLearningInput({
  personaName, onAdd, onCancel,
}: {
  personaName: string;
  onAdd: (learning: Omit<PersonaLearning, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<PersonaLearning["type"]>("transcript");
  const [content, setContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Handle text files (transcripts)
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".srt")) {
      const text = await file.text();
      setContent(text);
      setType("transcript");
    }
    // Handle audio files — store name as reference (no actual processing without backend)
    else if (file.type.startsWith("audio/")) {
      setContent(`[Audio recording: ${file.name}, ${(file.size / 1024).toFixed(1)}KB] — Paste the transcript or key quotes from this recording below to help the system learn how ${personaName} communicates.`);
      setType("transcript");
    }
  };

  return (
    <div className="space-y-2 p-2 rounded-md bg-accent/20 border border-border/30">
      <div className="flex gap-1.5">
        {(["transcript", "reaction", "note"] as const).map(t => (
          <button key={t} onClick={() => setType(t)} className={`text-[10px] px-2 py-1 rounded-md border transition-all capitalize ${type === t ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground"}`}>
            {t === "transcript" ? <><FileText className="w-2.5 h-2.5 inline mr-1" />{t}</> : t === "reaction" ? <><Zap className="w-2.5 h-2.5 inline mr-1" />{t}</> : <><MessageSquare className="w-2.5 h-2.5 inline mr-1" />{t}</>}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={
          type === "transcript" ? `Paste a transcript of ${personaName} speaking, writing, or their meeting notes...`
          : type === "reaction" ? `How did ${personaName} react in a specific situation? Describe their response pattern...`
          : `Note about how ${personaName} thinks, decides, or communicates...`
        }
        rows={4}
        className="w-full text-[11px] bg-background/50 border border-border/50 rounded-md px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />

      <div className="flex items-center justify-between">
        <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <Upload className="w-3 h-3" /> Upload file (.txt, .md, .srt, audio)
        </button>
        <input ref={fileInputRef} type="file" accept=".txt,.md,.srt,audio/*" onChange={handleFileUpload} className="hidden" />
        <div className="flex gap-1.5">
          <button onClick={onCancel} className="text-[10px] px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={() => { if (content.trim()) onAdd({ type, content: content.trim() }); }} disabled={!content.trim()} className="text-[10px] px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  );
}

// ──────────── New Engagement Form ────────────

function NewEngagementForm({
  personas, onStart, onCancel,
}: {
  personas: Persona[];
  onStart: (session: EngagementSession) => void;
  onCancel: () => void;
}) {
  const [engagementType, setEngagementType] = useState<EngagementType>("one-on-one");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [oneOnOnePurpose, setOneOnOnePurpose] = useState<OneOnOnePurpose>("presentation");
  const [myRole, setMyRole] = useState<MyRoleInPresentation>("peer");
  const [councilDomain, setCouncilDomain] = useState<CouncilDomain>("combined");

  const togglePersona = (id: string) => {
    if (engagementType === "one-on-one" || engagementType === "inspiration") {
      setSelectedPersonas([id]);
    } else {
      setSelectedPersonas(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    }
  };

  const needsPersonas = engagementType !== "final-council";
  const canStart = topic.trim() && (needsPersonas ? selectedPersonas.length > 0 : true);

  return (
    <div className="glass-card p-4 space-y-3 border-primary/20">
      <div className="text-xs font-semibold text-foreground">New Engagement Session</div>

      {/* Engagement type */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">How are you engaging?</span>
        <div className="space-y-1">
          {ENGAGEMENT_TYPES.map(et => (
            <button
              key={et.key}
              onClick={() => { setEngagementType(et.key); setSelectedPersonas([]); }}
              className={`w-full flex items-center gap-2.5 p-2 rounded-md border transition-all text-left ${
                engagementType === et.key ? "border-primary bg-primary/5" : "border-border/50 hover:bg-accent/30"
              }`}
            >
              <span className={engagementType === et.key ? "text-primary" : "text-muted-foreground"}>{et.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-foreground">{et.label}</div>
                <div className="text-[9px] text-muted-foreground line-clamp-1">{et.description}</div>
              </div>
              {engagementType === et.key && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What's the topic or situation?" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
      <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Add context... background, constraints, goals" rows={2} className="w-full text-xs bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />

      {/* Type-specific options */}
      {engagementType === "one-on-one" && (
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Purpose</span>
          <div className="flex flex-wrap gap-1.5">
            {ONE_ON_ONE_PURPOSES.map(p => (
              <button key={p.key} onClick={() => setOneOnOnePurpose(p.key)} className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border transition-all ${oneOnOnePurpose === p.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {engagementType === "incoming-presentation" && (
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Your role</span>
          <div className="flex flex-wrap gap-1.5">
            {MY_ROLES.map(r => (
              <button key={r.key} onClick={() => setMyRole(r.key)} className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-all ${myRole === r.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {engagementType === "final-council" && (
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Domain lens</span>
          <div className="flex flex-wrap gap-1.5">
            {COUNCIL_DOMAINS.map(d => (
              <button key={d.key} onClick={() => setCouncilDomain(d.key)} className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border transition-all ${councilDomain === d.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                <span className={d.color}>{d.icon}</span> {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Select personas (not needed for final council) */}
      {needsPersonas && (
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {engagementType === "one-on-one" || engagementType === "inspiration" ? "Who?" : `Who's involved? (${selectedPersonas.length} selected)`}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {personas.map(p => {
              const cfg = ROLE_CONFIG[p.role];
              const selected = selectedPersonas.includes(p.id);
              return (
                <button key={p.id} onClick={() => togglePersona(p.id)} className={`flex items-center gap-2 text-left p-2 rounded-md border transition-all ${selected ? "border-primary bg-primary/5" : "border-border/50 hover:bg-accent/30"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${cfg.color}`}>
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-[9px] text-muted-foreground">{cfg.label}</div>
                  </div>
                  {selected && <Check className="w-3 h-3 text-primary ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onStart({
            id: crypto.randomUUID(),
            type: engagementType,
            topic, context,
            personaIds: selectedPersonas,
            oneOnOnePurpose: engagementType === "one-on-one" ? oneOnOnePurpose : undefined,
            myRole: engagementType === "incoming-presentation" ? myRole : undefined,
            councilDomain: engagementType === "final-council" ? councilDomain : undefined,
            responses: {},
            userNotes: {},
            createdAt: new Date().toISOString(),
          })}
          disabled={!canStart}
          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          Generate Insights
        </button>
        <button onClick={onCancel} className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}

// ──────────── Engagement Session View ────────────

function EngagementSessionView({
  session, personas, onUpdate, onClose, onDelete,
}: {
  session: EngagementSession;
  personas: Persona[];
  onUpdate: (session: EngagementSession) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const etCfg = ENGAGEMENT_TYPES.find(e => e.key === session.type);
  const sessionPersonas = personas.filter(p => session.personaIds.includes(p.id));
  const [activeTab, setActiveTab] = useState<string>(
    session.type === "final-council" ? "__council__" : sessionPersonas[0]?.id || ""
  );

  const updateNote = (key: string, note: string) => {
    onUpdate({ ...session, userNotes: { ...session.userNotes, [key]: note } });
  };

  const regenerate = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;
    const newResponse = generateSmartResponse(persona, session);
    onUpdate({ ...session, responses: { ...session.responses, [personaId]: newResponse } });
  };

  // Build tabs
  const tabs: { key: string; label: string; icon: React.ReactNode; color: string }[] = [];
  if (session.type === "final-council") {
    const domainCfg = COUNCIL_DOMAINS.find(d => d.key === session.councilDomain);
    tabs.push({ key: "__council__", label: domainCfg?.label || "Council", icon: <Star className="w-3 h-3" />, color: "text-primary" });
  }
  sessionPersonas.forEach(p => {
    const cfg = ROLE_CONFIG[p.role];
    tabs.push({ key: p.id, label: p.name.split(" ")[0], icon: cfg.icon, color: cfg.color.split(" ")[1] || "text-muted-foreground" });
  });

  const activeResponse = session.responses[activeTab] || "";
  const activeNote = session.userNotes[activeTab] || "";
  const activePersona = personas.find(p => p.id === activeTab);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {etCfg?.icon}
            <h3 className="text-sm font-bold text-foreground">{session.topic}</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{etCfg?.label}</span>
            {session.oneOnOnePurpose && <><span className="opacity-30">|</span><span className="capitalize">{session.oneOnOnePurpose}</span></>}
            {session.myRole && <><span className="opacity-30">|</span><span className="capitalize">{session.myRole}</span></>}
            {session.councilDomain && <><span className="opacity-30">|</span><span className="capitalize">{session.councilDomain}</span></>}
          </div>
          {session.context && <p className="text-[11px] text-muted-foreground/70 mt-1">{session.context}</p>}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === t.key ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Response */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> AI Insight
          </div>
          {activePersona && (
            <button onClick={() => regenerate(activeTab)} className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Regenerate
            </button>
          )}
        </div>
        <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
          {activeResponse || "No response generated."}
        </div>
      </div>

      {/* User notes */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <Send className="w-3 h-3" /> Your notes & takeaways
        </div>
        <textarea
          value={activeNote}
          onChange={e => updateNote(activeTab, e.target.value)}
          placeholder="Capture your thoughts, action items, or key takeaways..."
          rows={4}
          className="w-full text-xs bg-accent/30 border border-border/50 rounded-md px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button onClick={onDelete} className="text-[10px] text-destructive hover:underline flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
        <div className="text-[10px] text-muted-foreground">
          {Object.keys(session.userNotes).filter(k => session.userNotes[k]?.trim()).length} notes captured
        </div>
      </div>
    </div>
  );
}

// ──────────── Mentor Mode View (preserved) ────────────

function MentorModeView({
  goals, reflections, onSaveGoals, onSaveReflections,
}: {
  goals: MentorGoal[];
  reflections: MentorReflection[];
  onSaveGoals: (g: MentorGoal[]) => void;
  onSaveReflections: (r: MentorReflection[]) => void;
}) {
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", description: "" });
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  const currentVariant = THINKING_VARIANTS.find(v => v.id === activeVariant);

  const addGoal = () => {
    if (!goalForm.title.trim()) return;
    onSaveGoals([{ id: crypto.randomUUID(), title: goalForm.title, description: goalForm.description || undefined, status: "active", createdAt: new Date().toISOString() }, ...goals]);
    setGoalForm({ title: "", description: "" });
    setShowAddGoal(false);
  };

  const toggleGoalStatus = (id: string) => {
    onSaveGoals(goals.map(g => g.id === id ? { ...g, status: g.status === "active" ? "achieved" : g.status === "achieved" ? "paused" : "active" } : g));
  };

  const deleteGoal = (id: string) => onSaveGoals(goals.filter(g => g.id !== id));

  const saveReflection = () => {
    if (!reflectionText.trim() || !activeVariant || !activeQuestion) return;
    onSaveReflections([{ id: crypto.randomUUID(), variantId: activeVariant, question: activeQuestion, answer: reflectionText, createdAt: new Date().toISOString() }, ...reflections]);
    setReflectionText("");
    setActiveQuestion(null);
  };

  const variantReflections = reflections.filter(r => r.variantId === activeVariant);

  return (
    <motion.div key="mentor" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
      {/* Mentor intro */}
      <div className="glass-card p-4 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Mentor Mode</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Am I doing the right thing? What am I missing? Choose a thinking lens below to challenge your perspective.
            </p>
          </div>
        </div>
      </div>

      {/* Core questions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { q: "Am I doing the right thing?", icon: <HelpCircle className="w-4 h-4" />, color: "text-amber-400" },
          { q: "What am I missing?", icon: <Eye className="w-4 h-4" />, color: "text-cyan-400" },
          { q: "What should I stop doing?", icon: <X className="w-4 h-4" />, color: "text-red-400" },
          { q: "What's my blind spot?", icon: <Crosshair className="w-4 h-4" />, color: "text-purple-400" },
        ].map(item => (
          <button key={item.q} onClick={() => { setActiveVariant(null); setActiveQuestion(item.q); setReflectionText(""); }}
            className={`glass-card p-3 text-left hover:bg-accent/20 transition-colors ${activeQuestion === item.q && !activeVariant ? "ring-1 ring-primary" : ""}`}>
            <div className={`mb-1.5 ${item.color}`}>{item.icon}</div>
            <div className="text-[11px] font-medium text-foreground">{item.q}</div>
          </button>
        ))}
      </div>

      {/* Reflection area for core questions */}
      {activeQuestion && !activeVariant && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 space-y-2">
          <div className="text-xs font-semibold text-foreground">{activeQuestion}</div>
          <textarea value={reflectionText} onChange={e => setReflectionText(e.target.value)} placeholder="Think it through... write your reflection here" rows={4}
            className="w-full text-xs bg-accent/30 border border-border/50 rounded-md px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          <div className="flex justify-end">
            <button onClick={() => { if (reflectionText.trim()) { onSaveReflections([{ id: crypto.randomUUID(), variantId: "core", question: activeQuestion, answer: reflectionText, createdAt: new Date().toISOString() }, ...reflections]); setReflectionText(""); setActiveQuestion(null); } }}
              className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40" disabled={!reflectionText.trim()}>Save Reflection</button>
          </div>
        </motion.div>
      )}

      {/* Thinking Variants */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Compass className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Think from different angles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {THINKING_VARIANTS.map(v => (
            <button key={v.id} onClick={() => { setActiveVariant(activeVariant === v.id ? null : v.id); setActiveQuestion(null); setReflectionText(""); }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all text-center ${activeVariant === v.id ? `${v.color} border` : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/30"}`}>
              {v.icon}
              <span className="text-[10px] font-medium leading-tight">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active variant detail */}
      {currentVariant && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={`glass-card p-3 ${currentVariant.color} border`}>
            <div className="flex items-center gap-2 mb-1.5">{currentVariant.icon}<span className="text-xs font-bold">{currentVariant.label}</span></div>
            <p className="text-[11px] opacity-80">{currentVariant.description}</p>
          </div>
          <div className="space-y-1.5">
            {currentVariant.questions.map(q => {
              const hasReflection = variantReflections.some(r => r.question === q);
              return (
                <button key={q} onClick={() => { setActiveQuestion(activeQuestion === q ? null : q); setReflectionText(""); }}
                  className={`w-full text-left glass-card p-2.5 text-xs transition-all flex items-start gap-2 ${activeQuestion === q ? "ring-1 ring-primary bg-primary/5" : "hover:bg-accent/20"}`}>
                  <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground flex-1">{q}</span>
                  {hasReflection && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
          {activeQuestion && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 space-y-2">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Your reflection</div>
              <textarea value={reflectionText} onChange={e => setReflectionText(e.target.value)} placeholder={`Thinking as a ${currentVariant.label}... what comes to mind?`} rows={4}
                className="w-full text-xs bg-accent/30 border border-border/50 rounded-md px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              <div className="flex justify-end">
                <button onClick={saveReflection} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40" disabled={!reflectionText.trim()}>Save Reflection</button>
              </div>
            </motion.div>
          )}
          {variantReflections.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Past reflections</div>
              {variantReflections.slice(0, 5).map(r => (
                <div key={r.id} className="glass-card p-2.5">
                  <div className="text-[10px] text-primary font-medium mb-0.5">{r.question}</div>
                  <p className="text-xs text-foreground/80">{r.answer}</p>
                  <div className="text-[9px] text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Goals section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">My Goals</span></div>
          <span className="text-[9px] text-muted-foreground">{goals.filter(g => g.status === "active").length} active</span>
        </div>
        <div className="space-y-1.5">
          {goals.map(g => (
            <div key={g.id} className={`glass-card p-2.5 flex items-start gap-2.5 ${g.status === "achieved" ? "opacity-60" : ""}`}>
              <button onClick={() => toggleGoalStatus(g.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${g.status === "achieved" ? "border-primary bg-primary/20" : g.status === "paused" ? "border-muted-foreground/30" : "border-primary/50 hover:border-primary"}`}>
                {g.status === "achieved" && <Check className="w-3 h-3 text-primary" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${g.status === "achieved" ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.title}</div>
                {g.description && <p className="text-[10px] text-muted-foreground mt-0.5">{g.description}</p>}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium mt-1 inline-block ${g.status === "active" ? "bg-primary/15 text-primary border-primary/30" : g.status === "achieved" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground border-border"}`}>{g.status}</span>
              </div>
              <button onClick={() => deleteGoal(g.id)} className="text-muted-foreground hover:text-destructive p-0.5"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        {showAddGoal ? (
          <div className="glass-card p-3 space-y-2 mt-2">
            <input value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))} placeholder="Goal title" className="w-full text-sm bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <textarea value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} placeholder="Why this matters..." rows={2} className="w-full text-xs bg-accent/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
            <div className="flex gap-2">
              <button onClick={addGoal} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40" disabled={!goalForm.title.trim()}>Add Goal</button>
              <button onClick={() => setShowAddGoal(false)} className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddGoal(true)} className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 mt-2 border border-dashed border-border rounded-lg hover:bg-accent/30 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Goal
          </button>
        )}
      </div>
    </motion.div>
  );
}
