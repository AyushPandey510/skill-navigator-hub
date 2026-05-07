import { createFileRoute, Link } from "@tanstack/react-router";
import { computeStats, TARGETS, useAppState, useTracker } from "@/lib/store";
import { StatCard, PageHeader, Section, Pill } from "@/components/ui-kit";
import { Calendar, Code2, Briefcase, BarChart3, Map, Rocket, NotebookPen, Flame, Target, Trophy, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "90-Day Tracker · Home" },
      { name: "description", content: "Ayush's 90-day Python Backend & ML Engineer job hunt dashboard." },
    ],
  }),
  component: Home,
});

const navCards = [
  { to: "/daily", label: "Daily Log", desc: "90-day grind log", icon: Calendar, accent: "from-primary to-accent" },
  { to: "/dsa", label: "DSA / LeetCode", desc: "TUF+ problem set", icon: Code2, accent: "from-accent to-info" },
  { to: "/jobs", label: "Job Applications", desc: "Pipeline tracker", icon: Briefcase, accent: "from-chart-5 to-primary" },
  { to: "/weekly", label: "Weekly Review", desc: "Sunday reflection", icon: BarChart3, accent: "from-success to-accent" },
  { to: "/skills", label: "Skill Roadmap", desc: "Beginner → Expert", icon: Map, accent: "from-warning to-chart-5" },
  { to: "/projects", label: "Projects", desc: "Ship to recruiters", icon: Rocket, accent: "from-info to-success" },
  { to: "/notes", label: "Daily Notes", desc: "Thoughts & ideas", icon: NotebookPen, accent: "from-primary to-chart-5" },
] as const;

function Home() {
  const s = useAppState();
  const tracker = useTracker();
  const stats = computeStats(s);

  // last 14 days study chart
  const last14 = tracker.days.slice(0, 30).map((d: any) => ({
    day: `D${d.day}`,
    hours: s.dayLogs[d.day]?.studyHours ?? 0,
    lc: s.dayLogs[d.day]?.lcCount ?? 0,
  }));

  // streak — consecutive logged days from today backwards
  const today = new Date();
  const start = new Date(2025, 4, 8);
  const dayNum = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl glass p-8 md:p-12 shadow-soft">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 gradient-accent opacity-20 blur-3xl rounded-full" />
        <div className="relative">
          <Pill tone="primary">Day {Math.max(1, Math.min(90, dayNum))} of 90</Pill>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
            <span className="text-gradient">90-Day Job Hunt</span>
            <br />
            <span className="text-foreground">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Python Backend & ML Engineer · Start 08 May → Offer before 06 Aug. No excuses, just reps.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/daily" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-105 transition-transform">
              Log today <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/notes" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass font-medium hover:bg-secondary transition-colors">
              <NotebookPen className="w-4 h-4" /> Add a note
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Days logged" value={stats.daysLogged} total={90} icon={<Flame className="w-4 h-4" />} accent="warning" />
        <StatCard label="LeetCode" value={stats.lcDone} total={TARGETS.leetcode} icon={<Code2 className="w-4 h-4" />} accent="primary" />
        <StatCard label="Study hours" value={stats.studyHours} total={TARGETS.studyHours} icon={<Target className="w-4 h-4" />} accent="accent" />
        <StatCard label="Jobs applied" value={stats.jobsApplied} total={TARGETS.jobs} icon={<Briefcase className="w-4 h-4" />} accent="success" />
        <StatCard label="Callbacks" value={stats.callbacks} icon={<Trophy className="w-4 h-4" />} accent="warning" />
        <StatCard label="Commits" value={stats.commits} total={TARGETS.commits} icon={<Rocket className="w-4 h-4" />} accent="accent" />
      </div>

      <Section title="Study & LeetCode — last 30 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last14}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.18 280)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.72 0.18 280)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 265)" />
              <XAxis dataKey="day" stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.035 265)", border: "1px solid oklch(0.3 0.04 265)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="oklch(0.72 0.18 280)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="lc" stroke="oklch(0.78 0.16 200)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div>
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Jump to</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {navCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className="group relative overflow-hidden rounded-2xl glass p-5 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${c.accent} opacity-30 blur-2xl rounded-full group-hover:opacity-60 transition-opacity`} />
                <Icon className="w-7 h-7 text-primary mb-3 relative" />
                <div className="font-semibold relative">{c.label}</div>
                <div className="text-xs text-muted-foreground relative">{c.desc}</div>
                <ArrowRight className="w-4 h-4 absolute bottom-4 right-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
