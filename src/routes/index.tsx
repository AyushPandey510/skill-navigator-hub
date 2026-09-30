import { createFileRoute, Link } from "@tanstack/react-router";
import { computeStats, TARGETS, useAppState, useTracker, setState } from "@/lib/store";
import { Pill } from "@/components/ui-kit";
import { ArrowRight, NotebookPen } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "90-Day Tracker · Home" },
      { name: "description", content: "A private 90-day career, skills, and project dashboard." },
    ],
  }),
  component: Home,
});

function externalUrl(url: string) {
  const clean = url.trim();
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}


const DAILY_TIPS = [
  "Set up your profile and goal today. A tracker works only when the target is visible.",
  "Log even a small session. The habit matters more than the size of the first win.",
  "Name the pattern for every DSA problem you solve. Pattern memory beats problem memory.",
  "Write one sentence after studying: what changed in your understanding today?",
  "Push one small improvement. A tiny shipped change is better than a perfect plan.",
  "Review yesterday before starting today. Five minutes of recall saves an hour later.",
  "Keep your daily log honest. Missing data makes the dashboard less useful.",
  "When stuck, reduce the task until it can be finished in 25 minutes.",
  "After each DSA solution, explain the brute force approach before the optimized one.",
  "Do one cleanup pass on notes, commits, or project README before adding new work.",
  "Track blockers clearly. A named blocker is easier to remove than vague stress.",
  "Choose one main task for the day. Everything else is bonus XP.",
  "Re-solve one older DSA problem without looking. Retention is the real score.",
  "Make your project easy to run locally. Recruiters and reviewers reward clarity.",
  "Batch similar tasks: applications together, DSA together, project work together.",
  "Write down the edge case that broke your first solution today.",
  "If you skip a day, restart with one small logged action. No drama, just resume.",
  "Spend ten minutes reading your own code as if you inherited it from someone else.",
  "Keep a short wins list. Motivation is easier when evidence is visible.",
  "Turn one vague goal into a concrete checkbox before you start.",
  "Practice talking through your solution out loud. Interviews test communication too.",
  "Add one screenshot, curl command, or demo note to a project README.",
  "Do not open five learning resources. Pick one and finish the section.",
  "Use failure notes. Record why a solution failed, not just the final answer.",
  "Check your job pipeline. A stale application list creates false confidence.",
  "Refactor only after something works. First make it correct, then make it clean.",
  "Write the time complexity before submitting a DSA problem.",
  "Protect one deep-work block today from messages and tab switching.",
  "Make one project decision explicit: database choice, API shape, or deployment target.",
  "End the day by choosing tomorrow's first task. Remove startup friction.",
  "Start phase two by tightening fundamentals instead of chasing advanced topics.",
  "Compare two similar DSA patterns today and write the difference in one line.",
  "Apply to roles in batches, then log them immediately so follow-ups are not lost.",
  "Add validation and error handling to one project flow. Reliable beats flashy.",
  "Review callbacks, rejections, and silence. The pipeline is data, not judgment.",
  "Practice one behavioral story with the STAR format.",
  "Replace a tutorial step with your own variation. Ownership starts there.",
  "Use your notes to create one interview answer from real project work.",
  "If DSA feels slow, solve fewer problems but write better explanations.",
  "Ship a small vertical slice: input, processing, output, and README proof.",
  "Check for repeated blockers. A repeated blocker needs a system change, not willpower.",
  "Spend one session on tests or manual verification. Confidence comes from checks.",
  "Update quick links with the sites you actually use. Reduce daily search friction.",
  "Convert one project feature into a resume bullet with action and impact.",
  "Practice explaining tradeoffs: speed, cost, complexity, and reliability.",
  "Do one timed DSA problem. Time pressure is a skill, not a personality trait.",
  "Clean your job notes. Follow-up dates and contacts should be easy to find.",
  "Add one metric to a project README: latency, accuracy, records, users, or scope.",
  "Revisit a weak topic before learning a new one. Gaps compound quietly.",
  "Make the dashboard boringly accurate. Useful tools are allowed to be boring.",
  "Start interview blitz by choosing three stories you can tell clearly.",
  "Practice one system design prompt with a simple structure: requirements, APIs, data, scale.",
  "Review your strongest project and remove anything that is hard to explain.",
  "Do a mock explanation of a DSA solution without code on screen.",
  "Apply selectively today. A tailored application beats ten careless ones.",
  "Write down the first question you would ask before building a system.",
  "Turn one note into a reusable checklist.",
  "Check your live links. Broken links cost trust immediately.",
  "Practice debugging out loud: observation, hypothesis, test, result.",
  "Keep a short brag document. Future interviews need specific examples.",
  "Compress one project explanation into 60 seconds.",
  "Look for missing proof: demo, deployment, screenshots, tests, or docs.",
  "Schedule follow-ups for applications that have gone quiet.",
  "Do one medium problem slowly and correctly. Depth still matters.",
  "Review your progress numbers without self-attack. Data is for steering.",
  "Patch one small UX issue in your portfolio or project.",
  "Practice answering: why this role, why this company, why you?",
  "Write one architecture diagram in plain text before touching tools.",
  "Use constraints in practice: time limit, no hints, explain aloud.",
  "Remove one outdated item from your resume or project list.",
  "Check if your top project has a clear problem statement.",
  "Rehearse a failure story and what you changed afterward.",
  "Do a final pass on naming: files, routes, functions, README sections.",
  "Prioritize visible polish now. Reviewers notice friction before cleverness.",
  "Practice a full interview loop: intro, coding, project explanation, questions.",
  "Create a shortlist of companies and roles that actually match your profile.",
  "Prepare questions to ask interviewers. Curiosity is part of signal.",
  "Review every active application and decide the next action.",
  "Make one project demo runnable in under five minutes.",
  "Re-solve your most missed DSA pattern today.",
  "Tighten your LinkedIn/GitHub/profile links so they tell the same story.",
  "Practice explaining impact without exaggeration. Specific beats inflated.",
  "Do one rest-and-review block. Burnout ruins consistency faster than difficulty.",
  "Prepare a concise offer/negotiation notes page before you need it.",
  "Review your dashboard for stale data and clean it up.",
  "Pick the strongest three artifacts to show someone this week.",
  "Simulate the first 10 minutes of an interview. Start calm, clear, structured.",
  "Close loops: follow-ups, unfinished notes, half-updated project links.",
  "Write your Day 90 summary: what you built, learned, shipped, and proved.",
  "Use today to make the system sustainable beyond 90 days. Keep the habits that worked."
];

function getTrackerDay(startDate: string | undefined, daysLogged: number) {
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (!Number.isNaN(start.getTime())) {
      const today = new Date();
      const current = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
      return Math.max(1, Math.min(90, current));
    }
  }
  return Math.max(1, Math.min(90, daysLogged || 1));
}

function getSmartNudge({
  day,
  hasTodayLog,
  dsaDone,
  jobsApplied,
  projectCount,
}: {
  day: number;
  hasTodayLog: boolean;
  dsaDone: number;
  jobsApplied: number;
  projectCount: number;
}) {
  const expectedDsa = Math.ceil((day / 90) * TARGETS.leetcode);
  const expectedJobs = Math.ceil((day / 90) * TARGETS.jobs);

  if (!hasTodayLog) return "Smart nudge: today's log is empty. Add even a small entry so your stats stay useful.";
  if (projectCount === 0) return "Smart nudge: no projects are listed yet. Add one project so your portfolio work becomes trackable.";
  if (dsaDone < expectedDsa) return `Smart nudge: DSA is behind pace (${dsaDone}/${expectedDsa}). Solve or revisit one problem today.`;
  if (jobsApplied < expectedJobs) return `Smart nudge: applications are behind pace (${jobsApplied}/${expectedJobs}). Add a small batch or update your pipeline.`;
  return "Smart nudge: your main trackers are active. Keep the day simple and finish one meaningful task.";
}
function Home() {
  const s = useAppState();
  const tracker = useTracker();
  const stats = computeStats(s);
  const quickLinks = s.profile.quickLinks ?? [];
  const activityData = tracker.days.slice(0, 30).map((d: any) => ({
    day: `D${d.day}`,
    hours: s.dayLogs[d.day]?.studyHours ?? 0,
    lc: s.dayLogs[d.day]?.lcCount ?? 0,
  }));
  const displayDay = getTrackerDay(s.profile.startDate, stats.daysLogged);
  const dailyTip = DAILY_TIPS[displayDay - 1] ?? DAILY_TIPS[0];
  const smartNudge = getSmartNudge({
    day: displayDay,
    hasTodayLog: Boolean(s.dayLogs[displayDay]),
    dsaDone: stats.lcDone,
    jobsApplied: stats.jobsApplied,
    projectCount: s.projects.length,
  });
  const completion = Math.min(100, Math.round((displayDay / 90) * 100));
  const updateProfile = (patch: Partial<typeof s.profile>) =>
    setState((st) => ({ ...st, profile: { ...st.profile, ...patch } }));
  const roadmapDay = tracker.days.find((d: any) => d.day === displayDay);
  const todayLog = s.dayLogs[displayDay] ?? {};
  const projectsLive = s.projects.filter((project) => ["live", "shipped"].includes((project.status ?? "").toLowerCase())).length;
  const activeJobs = s.jobs.filter((job) => !["Rejected", "Offer"].includes(job.status)).length;
  const consistency = Math.min(100, Math.round((stats.daysLogged / 7) * 100));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="retro-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Pill tone="primary">Day {displayDay} of 90</Pill>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">90-Day Progress Dashboard</h1>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                Track your skills, projects, job applications, notes, and daily practice. Everything is saved privately on this device.
              </p>
            </div>
            <div className="hidden border-2 border-border bg-input px-2 py-1 text-[10px] font-bold shadow-[var(--bevel-sunken)] md:block">
              ID: #DEV-2025
            </div>
          </div>

          {!s.profile.name?.trim() ? (
            <div className="mt-5 grid max-w-3xl gap-3 border-2 border-border bg-input p-3 shadow-[var(--bevel-sunken)] sm:grid-cols-2">
              <label className="block">
                <div className="mb-1 text-[10px] font-bold uppercase text-foreground">Your name</div>
                <input
                  value={s.profile.name ?? ""}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-[10px] font-bold uppercase text-foreground">Focus</div>
                <input
                  value={s.profile.role ?? ""}
                  onChange={(e) => updateProfile({ role: e.target.value })}
                  placeholder="Backend Engineer, Data Analyst, Designer..."
                  className="w-full px-3 py-2 text-sm"
                />
              </label>
            </div>
          ) : (
            <div className="mt-5 border-2 border-border bg-input p-3 text-sm shadow-[var(--bevel-sunken)]">
              <div><b>User:</b> {s.profile.name}</div>
              <div><b>Focus:</b> {s.profile.role || "Career & Skill Tracker"}</div>
              {s.profile.goal && <div><b>Goal:</b> {s.profile.goal}</div>}
              {s.profile.deadline && <div><b>Deadline:</b> {s.profile.deadline}</div>}
              <div className="mt-2 text-xs italic text-muted-foreground">Use Edit menu or settings tab to modify profile and planning details.</div>
            </div>
          )}
        </section>

        <section className="retro-panel p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-black uppercase">Overall Trajectory:</h2>
            <div className="font-mono text-sm font-bold" style={{ color: "#000080" }}>{displayDay} / 90 Days Completed ({completion}%)</div>
          </div>
          <div className="border-2 border-border bg-input p-2 shadow-[var(--bevel-sunken)]" aria-label={`${completion}% complete`}>
            <div className="mb-1 grid grid-cols-3 gap-2 text-[9px] uppercase text-muted-foreground">
              <span>Phase 1: Foundation</span>
              <span>Phase 2: Advanced</span>
              <span>Phase 3: Interview Blitz</span>
            </div>
            <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
              {Array.from({ length: 30 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-5 border border-[#b8b8b8] ${index < Math.ceil(displayDay / 3) ? (index % 2 ? "bg-primary" : "bg-info") : "bg-secondary"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/daily" className="inline-flex items-center gap-2 bg-primary px-5 py-2 font-bold text-primary-foreground shadow-[var(--bevel-raised)]">
              Log today <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/notes" className="inline-flex items-center gap-2 border-2 border-border bg-secondary px-5 py-2 font-bold shadow-[var(--bevel-raised)]">
              <NotebookPen className="h-4 w-4" /> Add a note
            </Link>
            <button className="border-2 border-border bg-secondary px-5 py-2 font-bold shadow-[var(--bevel-raised)]" type="button">Backup Data</button>
            <button className="border-2 border-border bg-secondary px-5 py-2 font-bold shadow-[var(--bevel-raised)]" type="button">DSA Pomodoro</button>
          </div>
        </section>

        <section className="retro-panel">
          <div className="title-blue flex items-center justify-between px-3 py-1 text-xs font-bold uppercase">
            <span>Local Snapshot</span>
            <span>Stored On This Device</span>
          </div>
          <div className="p-3">
            <div className="overflow-auto border-2 border-border bg-input shadow-[var(--bevel-sunken)]">
              <table className="w-full min-w-[720px] text-xs">
                <thead className="bg-secondary text-left uppercase">
                  <tr>
                    <th className="border-b border-border p-2">Area</th>
                    <th className="border-b border-border p-2">Source</th>
                    <th className="border-b border-border p-2">Current Value</th>
                    <th className="border-b border-border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <SnapshotRow area="Roadmap focus" source={`Day ${displayDay}`} value={roadmapDay?.focus ?? "No roadmap focus"} status="Roadmap" />
                  <SnapshotRow area="Today log" source="Daily Log" value={`${todayLog.studyHours ?? 0}h study, ${todayLog.lcCount ?? 0} DSA`} status={s.dayLogs[displayDay] ? "Logged" : "Empty"} />
                  <SnapshotRow area="Projects" source="Projects" value={`${s.projects.length} total, ${projectsLive} live/shipped`} status={s.projects.length ? "Active" : "Empty"} />
                  <SnapshotRow area="Jobs" source="Jobs" value={`${s.jobs.length} applications, ${activeJobs} active`} status={s.jobs.length ? "Tracked" : "Empty"} />
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] italic text-muted-foreground">No generated targets, times, or fake statuses. This panel only reflects roadmap data and local user-entered data.</div>
          </div>
        </section>

        <section className="retro-panel">
          <div className="title-blue flex items-center justify-between px-3 py-1 text-xs font-bold uppercase">
            <span>Activity Graph</span>
            <span>Last 30 Days</span>
          </div>
          <div className="h-64 border-2 border-border bg-input p-3 shadow-[var(--bevel-sunken)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#808080" />
                <XAxis dataKey="day" stroke="#000000" fontSize={11} tickLine={false} />
                <YAxis stroke="#000000" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: "#008080", strokeWidth: 1 }}
                  contentStyle={{
                    background: "#f0f0f0",
                    border: "2px solid #808080",
                    borderRadius: 0,
                    boxShadow: "inset -1px -1px #808080, inset 1px 1px #ffffff",
                    color: "#000000",
                    fontFamily: "MS Sans Serif, Tahoma, Geneva, Verdana, sans-serif",
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "#000000" }}
                  labelStyle={{ color: "#000000", fontWeight: 700 }}
                />
                <Area type="stepAfter" dataKey="hours" name="hours" stroke="#008080" fill="#d7d7d7" strokeWidth={2} />
                <Area type="stepAfter" dataKey="lc" name="lc" stroke="#008000" fill="#e6e6e6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="retro-panel" aria-labelledby="quick-links-title">
          <div className="bg-primary px-3 py-1 text-primary-foreground">
            <div className="flex items-center justify-between text-xs font-bold">
              <h2 id="quick-links-title">Quick Links</h2>
              <span>v1.0</span>
            </div>
          </div>
          <div className="space-y-3 p-3">
            {quickLinks.length === 0 ? (
              <div className="border-2 border-border bg-input p-3 text-xs text-muted-foreground shadow-[var(--bevel-sunken)]">
                Add LinkedIn, GitHub, portfolio, resume, or job-board links from File.
              </div>
            ) : (
              quickLinks.map((link) => (
                <a
                  key={link.id}
                  href={externalUrl(link.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-2 border-border bg-secondary px-3 py-2 text-xs font-bold text-foreground shadow-[var(--bevel-raised)] hover:bg-muted"
                >
                  <span className="truncate">{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))
            )}
            <div className="text-[10px] italic text-muted-foreground">Manage these from File &gt; Preferences.</div>
          </div>
        </section>

        <section className="retro-panel">
          <div className="title-blue flex items-center justify-between px-3 py-1 text-xs font-bold uppercase text-white">
            <span>Daily Streak & Metrics</span>
            <span>Live Stats</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniMetric label="Days Active" value={stats.daysLogged} />
              <MiniMetric label="Problems" value={stats.lcDone} tone="text-success" />
              <MiniMetric label="Study Time" value={`${stats.studyHours}h`} tone="text-[#000080]" />
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold">
              <span>Week 1 Consistency:</span>
              <span>{Math.min(stats.daysLogged, 7)} / 7 Days</span>
            </div>
            <div className="mt-1 h-3 border-2 border-border bg-input shadow-[var(--bevel-sunken)]">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, consistency)}%` }} />
            </div>
          </div>
        </section>

        <section className="retro-panel p-3">
          <h2 className="mb-2 text-xs font-bold">Tip of the Day (Win95 Assistant):</h2>
          <div className="border-2 border-warning bg-[#fff8d0] p-3 text-xs leading-relaxed shadow-[var(--bevel-sunken)]">
            <div><b>Day {displayDay}:</b> {dailyTip}</div>
            <div className="mt-2 border-t border-warning pt-2"><b>{smartNudge}</b></div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function SnapshotRow({ area, source, value, status }: { area: string; source: string; value: string; status: string }) {
  return (
    <tr>
      <th className="border-b border-border p-2 text-left font-bold">{area}</th>
      <td className="border-b border-border p-2 text-muted-foreground">{source}</td>
      <td className="border-b border-border p-2 font-mono">{value}</td>
      <td className="border-b border-border p-2"><span className="border border-border bg-secondary px-2 py-0.5">{status}</span></td>
    </tr>
  );
}

function MiniMetric({ label, value, tone = "text-foreground" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="border-2 border-border bg-secondary p-3 shadow-[var(--bevel-raised)]">
      <div className="text-[9px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className={`mt-2 text-xl font-black ${tone}`}>{value}</div>
    </div>
  );
}
