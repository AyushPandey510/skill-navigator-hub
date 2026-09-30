import { createFileRoute, Link } from "@tanstack/react-router";
import { computeStats, TARGETS, useAppState, useTracker, setState } from "@/lib/store";
import { StatCard, PageHeader, Section, Pill } from "@/components/ui-kit";
import { Calendar, Code2, Briefcase, BarChart3, Map, Rocket, NotebookPen, Flame, Target, Trophy, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "90-Day Tracker · Home" },
      { name: "description", content: "A private 90-day career, skills, and project dashboard." },
    ],
  }),
  component: Home,
});

const navCards = [
  { to: "/daily", label: "Daily Log", desc: "90-day grind log", icon: Calendar, accent: "bg-primary" },
  { to: "/dsa", label: "DSA / LeetCode", desc: "TUF+ problem set", icon: Code2, accent: "bg-accent" },
  { to: "/jobs", label: "Job Applications", desc: "Pipeline tracker", icon: Briefcase, accent: "bg-chart-5" },
  { to: "/weekly", label: "Weekly Review", desc: "Sunday reflection", icon: BarChart3, accent: "bg-success" },
  { to: "/skills", label: "Skill Roadmap", desc: "Beginner → Expert", icon: Map, accent: "bg-warning" },
  { to: "/projects", label: "Projects", desc: "Ship to recruiters", icon: Rocket, accent: "bg-info" },
  { to: "/notes", label: "Daily Notes", desc: "Thoughts & ideas", icon: NotebookPen, accent: "bg-primary" },
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

  const displayDay = Math.max(1, Math.min(90, stats.daysLogged || 1));
  const updateProfile = (patch: Partial<typeof s.profile>) =>
    setState((st) => ({ ...st, profile: { ...st.profile, ...patch } }));

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl glass p-8 md:p-12 shadow-soft">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="relative">
          <Pill tone="primary">Day {displayDay} of 90</Pill>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
            <span className="text-gradient">90-Day Progress</span>
            <br />
            <span className="text-foreground">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Track your skills, projects, job applications, notes, and daily practice. Everything is saved privately on this device.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 gap-3 max-w-2xl">
            <label className="block">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Your name</div>
              <input
                value={s.profile.name ?? ""}
                onChange={(e) => updateProfile({ name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-input rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Focus</div>
              <input
                value={s.profile.role ?? ""}
                onChange={(e) => updateProfile({ role: e.target.value })}
                placeholder="Backend Engineer, Data Analyst, Designer..."
                className="w-full bg-input rounded-lg px-3 py-2 text-sm"
              />
            </label>
          </div>
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
                <div className={`absolute top-0 right-0 h-1 w-full ${c.accent} opacity-70 transition-opacity group-hover:opacity-100`} />
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
