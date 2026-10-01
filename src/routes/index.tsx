import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { computeStats, exportData, importData, TARGETS, useAppState, useTracker, setState } from "@/lib/store";
import { Pill } from "@/components/ui-kit";
import { ArrowRight, Download, NotebookPen, Pause, Play, RotateCcw, Upload } from "lucide-react";
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
  const [backupOpen, setBackupOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
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
  const snapshotRows = [
    { area: "Roadmap focus", source: `Day ${displayDay}`, value: roadmapDay?.focus ?? "No roadmap focus", status: "Roadmap" },
    { area: "Today log", source: "Daily Log", value: `${todayLog.studyHours ?? 0}h study, ${todayLog.lcCount ?? 0} DSA`, status: s.dayLogs[displayDay] ? "Logged" : "Empty" },
    { area: "Projects", source: "Projects", value: `${s.projects.length} total, ${projectsLive} live/shipped`, status: s.projects.length ? "Active" : "Empty" },
    { area: "Jobs", source: "Jobs", value: `${s.jobs.length} applications, ${activeJobs} active`, status: s.jobs.length ? "Tracked" : "Empty" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="retro-panel p-3 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Pill tone="primary">Day {displayDay} of 90</Pill>
              <h1 className="mt-4 max-w-full break-words text-2xl font-black leading-tight [overflow-wrap:anywhere] sm:text-4xl md:text-5xl">90-Day Progress Dashboard</h1>
              <p className="mt-3 max-w-3xl break-words text-sm text-muted-foreground">
                Track your skills, projects, job applications, notes, and daily practice. Everything is saved privately on this device.
              </p>
            </div>
            <div className="w-fit border-2 border-border bg-input px-2 py-1 text-[10px] font-bold shadow-[var(--bevel-sunken)] sm:ml-auto md:block">
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
              <div className="mt-2 break-words text-xs italic text-muted-foreground">Use Edit menu or settings tab to modify profile and planning details.</div>
            </div>
          )}
        </section>

        <section className="retro-panel p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2 className="text-sm font-black uppercase">Overall Trajectory:</h2>
            <div className="max-w-full break-words font-mono text-xs font-bold sm:text-sm" style={{ color: "#000080" }}>{displayDay} / 90 Days Completed ({completion}%)</div>
          </div>
          <div className="border-2 border-border bg-input p-2 shadow-[var(--bevel-sunken)]" aria-label={`${completion}% complete`}>
            <div className="mb-1 grid gap-1 text-[9px] uppercase text-muted-foreground sm:grid-cols-3 sm:gap-2">
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
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link to="/daily" className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-2 font-bold text-primary-foreground shadow-[var(--bevel-raised)] sm:px-5">
              Log today <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/notes" className="inline-flex items-center justify-center gap-2 border-2 border-border bg-secondary px-4 py-2 font-bold shadow-[var(--bevel-raised)] sm:px-5">
              <NotebookPen className="h-4 w-4" /> Add a note
            </Link>
            <button onClick={() => setBackupOpen(true)} className="border-2 border-border bg-secondary px-4 py-2 font-bold shadow-[var(--bevel-raised)] sm:px-5" type="button">Backup Data</button>
            <button onClick={() => setPomodoroOpen(true)} className="border-2 border-border bg-secondary px-4 py-2 font-bold shadow-[var(--bevel-raised)] sm:px-5" type="button">DSA Pomodoro</button>
          </div>
        </section>

        <section className="retro-panel">
          <div className="title-blue flex items-center justify-between px-3 py-1 text-xs font-bold uppercase">
            <span>Local Snapshot</span>
            <span>Stored On This Device</span>
          </div>
          <div className="p-2 sm:p-3">
            <div className="grid gap-2 sm:hidden">
              {snapshotRows.map((row) => (
                <SnapshotCard key={row.area} {...row} />
              ))}
            </div>
            <div className="hidden overflow-auto border-2 border-border bg-input shadow-[var(--bevel-sunken)] sm:block">
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
                  {snapshotRows.map((row) => (
                    <SnapshotRow key={row.area} {...row} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 break-words text-[10px] italic text-muted-foreground">No generated targets, times, or fake statuses. This panel only reflects roadmap data and local user-entered data.</div>
          </div>
        </section>

        <section className="retro-panel">
          <div className="title-blue flex items-center justify-between px-3 py-1 text-xs font-bold uppercase">
            <span>Activity Graph</span>
            <span>Last 30 Days</span>
          </div>
          <div className="h-56 border-2 border-border bg-input p-2 shadow-[var(--bevel-sunken)] sm:h-64 sm:p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#808080" />
                <XAxis dataKey="day" stroke="#000000" fontSize={10} tickLine={false} interval={3} minTickGap={8} />
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
                  className="flex min-w-0 items-center justify-between gap-2 border-2 border-border bg-secondary px-3 py-2 text-xs font-bold text-foreground shadow-[var(--bevel-raised)] hover:bg-muted"
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
            <div className="grid gap-2 text-center sm:grid-cols-3 lg:grid-cols-3">
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
          <div className="break-words border-2 border-warning bg-[#fff8d0] p-3 text-xs leading-relaxed shadow-[var(--bevel-sunken)] [overflow-wrap:anywhere]">
            <div><b>Day {displayDay}:</b> {dailyTip}</div>
            <div className="mt-2 border-t border-warning pt-2"><b>{smartNudge}</b></div>
          </div>
        </section>
      </aside>

      {backupOpen && <BackupDialog onClose={() => setBackupOpen(false)} />}
      {pomodoroOpen && <PomodoroDialog onClose={() => setPomodoroOpen(false)} />}
    </div>
  );
}

function SnapshotCard({ area, source, value, status }: { area: string; source: string; value: string; status: string }) {
  return (
    <article className="border-2 border-border bg-input p-3 text-xs shadow-[var(--bevel-sunken)]">
      <div className="mb-2 flex items-start justify-between gap-2 border-b border-border pb-2">
        <h3 className="font-black">{area}</h3>
        <span className="shrink-0 border border-border bg-secondary px-2 py-0.5 font-bold">{status}</span>
      </div>
      <dl className="grid gap-1">
        <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-2">
          <dt className="font-bold text-muted-foreground">Source</dt>
          <dd className="break-words">{source}</dd>
        </div>
        <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-2">
          <dt className="font-bold text-muted-foreground">Value</dt>
          <dd className="break-words font-mono [overflow-wrap:anywhere]">{value}</dd>
        </div>
      </dl>
    </article>
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
    <div className="border-2 border-border bg-secondary p-2 shadow-[var(--bevel-raised)] sm:p-3">
      <div className="text-[9px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className={`mt-2 text-xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function DialogWindow({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-2" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-dialog-title"
        className="w-full max-w-[calc(100vw-1rem)] border-2 border-border bg-card shadow-[var(--bevel-raised)] sm:max-w-4xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="title-blue flex items-center justify-between px-2 py-1 text-primary-foreground">
          <h2 id="dashboard-dialog-title" className="text-sm font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="border border-white bg-card px-2 text-xs font-bold text-foreground" aria-label={`Close ${title}`}>X</button>
        </div>
        <div className="max-h-[82vh] overflow-auto p-3">{children}</div>
      </section>
    </div>
  );
}

function BackupDialog({ onClose }: { onClose: () => void }) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("Download a backup here, then upload it on another phone or desktop to continue with the same local data.");

  const downloadBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skill-navigator-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded. Move that JSON file to the other device and upload it here.");
  };

  const uploadBackup = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const ok = importData(text);
    setMessage(ok ? "Backup restored. Your dashboard now uses the imported local data." : "That file could not be imported. Please choose a Skill Navigator backup JSON file.");
    if (ok) window.setTimeout(onClose, 900);
  };

  return (
    <DialogWindow title="Backup Data - Move Devices" onClose={onClose}>
      <div className="space-y-4 text-sm leading-relaxed">
        <section className="border-2 border-border bg-input p-3 shadow-[var(--bevel-sunken)]">
          <h3 className="mb-2 bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">Continue On Another Device</h3>
          <p className="break-words text-muted-foreground">{message}</p>
        </section>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={downloadBackup} className="inline-flex items-center justify-center gap-2 border-2 border-border bg-secondary px-4 py-3 font-bold shadow-[var(--bevel-raised)]">
            <Download className="h-4 w-4" aria-hidden="true" /> Download all local data
          </button>
          <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center justify-center gap-2 border-2 border-border bg-secondary px-4 py-3 font-bold shadow-[var(--bevel-raised)]">
            <Upload className="h-4 w-4" aria-hidden="true" /> Upload backup file
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => uploadBackup(event.target.files?.[0])}
        />
        <section className="border-2 border-border bg-input p-3 text-xs shadow-[var(--bevel-sunken)]">
          <b>Included:</b> profile, quick links, daily logs, DSA statuses, skills, projects, jobs, weekly reviews, and notes. The file stays in your control; the app does not upload it to a server.
        </section>
      </div>
    </DialogWindow>
  );
}

function PomodoroDialog({ onClose }: { onClose: () => void }) {
  const [duration, setDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [phase, setPhase] = useState<"away" | "entering" | "sitting" | "leaving">("away");
  const running = phase === "entering" || phase === "sitting";

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setPhase("leaving");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (phase !== "entering") return;
    const id = window.setTimeout(() => setPhase("sitting"), 900);
    return () => window.clearTimeout(id);
  }, [phase]);

  const start = () => {
    if (secondsLeft === 0 || phase === "leaving") setSecondsLeft(duration);
    setPhase("entering");
  };
  const pause = () => setPhase("away");
  const reset = () => {
    setSecondsLeft(duration);
    setPhase("away");
  };
  const updateDuration = (value: number) => {
    setDuration(value);
    setSecondsLeft(value);
    setPhase("away");
  };
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const catTransform =
    phase === "away"
      ? "translateX(95%) translateY(82px) scale(0.78)"
      : phase === "leaving"
        ? "translateX(230%) translateY(82px) scale(0.78)"
        : "translateX(-50%) translateY(0) scale(1)";

  return (
    <DialogWindow title="DSA Pomodoro" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-[minmax(360px,1fr)_240px]">
        <section className="border-2 border-border bg-input p-3 shadow-[var(--bevel-sunken)]">
          <div
            aria-label={running ? "Pomodoro running with cat on table" : "Pomodoro paused"}
            style={{ position: "relative", minHeight: 300, overflow: "hidden", border: "2px solid #808080", backgroundColor: "#d8d8d8", backgroundImage: "linear-gradient(#ececec 15px, transparent 16px), linear-gradient(90deg, #ececec 15px, transparent 16px)", backgroundSize: "16px 16px", boxShadow: "inset -1px -1px #ffffff, inset 1px 1px #808080" }}
          >
            <div style={{ position: "absolute", left: 18, top: 18, width: 92, height: 64, border: "3px solid #000", background: "#000080", boxShadow: "inset 0 0 0 7px #c9c9c9, inset 0 0 0 10px #fff" }} />
            <div style={{ position: "absolute", left: 46, right: 42, bottom: 86, height: 22, border: "3px solid #000", background: "#8b5a2b", boxShadow: "0 20px 0 -8px #5a3719" }}>
              <span style={{ position: "absolute", left: 32, top: 20, width: 12, height: 56, border: "3px solid #000", background: "#5a3719" }} />
              <span style={{ position: "absolute", right: 32, top: 20, width: 12, height: 56, border: "3px solid #000", background: "#5a3719" }} />
            </div>
            <div style={{ position: "absolute", right: 52, bottom: 28, width: 58, height: 72, border: "3px solid #000", background: "#008080", boxShadow: "inset -7px -7px 0 #006666" }}>
              <span style={{ position: "absolute", left: 8, right: 8, bottom: -22, height: 14, border: "3px solid #000", background: "#006666" }} />
            </div>
            <div style={{ position: "absolute", left: "50%", bottom: 108, width: 92, height: 82, zIndex: 3, imageRendering: "pixelated", transform: catTransform, transition: "transform 700ms steps(5, end), opacity 250ms linear" }}>
              <span style={{ position: "absolute", left: 19, top: 1, width: 18, height: 18, border: "3px solid #000", background: "#303030", transform: "rotate(45deg)", zIndex: 2 }} />
              <span style={{ position: "absolute", right: 19, top: 1, width: 18, height: 18, border: "3px solid #000", background: "#303030", transform: "rotate(45deg)", zIndex: 2 }} />
              <span style={{ position: "absolute", left: 18, top: 9, width: 54, height: 42, border: "3px solid #000", background: "#303030", boxShadow: "inset -7px -7px 0 #111" }}>
                <i style={{ position: "absolute", left: 11, top: 16, width: 7, height: 7, background: "#00ffff", boxShadow: "0 9px 0 -2px #fff" }} />
                <b style={{ position: "absolute", right: 11, top: 16, width: 7, height: 7, background: "#00ffff", boxShadow: "0 9px 0 -2px #fff" }} />
              </span>
              <span style={{ position: "absolute", left: 22, top: 38, width: 48, height: 38, border: "3px solid #000", background: "#303030", boxShadow: "inset -7px -7px 0 #111" }} />
              <span style={{ position: "absolute", right: 8, top: 47, width: 30, height: 11, border: "3px solid #000", borderLeft: 0, background: "#303030", transform: "rotate(-18deg)", transformOrigin: "left center" }} />
            </div>
            {phase === "away" && <div style={{ position: "absolute", right: 42, bottom: 10, border: "2px solid #808080", background: "#fff8d0", padding: "3px 6px", fontSize: 10, fontWeight: 700, boxShadow: "inset -1px -1px #808080, inset 1px 1px #ffffff" }}>press start</div>}
          </div>
        </section>
        <section className="space-y-3">
          <div className="border-2 border-border bg-input p-4 text-center shadow-[var(--bevel-sunken)]">
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Focus Timer</div>
            <div className="mt-2 font-mono text-4xl font-black">{minutes}:{seconds}</div>
            <div className="mt-2 text-xs text-muted-foreground">{phase === "leaving" ? "Session complete. The cat left the desk." : running ? "Cat is guarding your DSA focus." : "Start when you are ready."}</div>
          </div>
          <label className="block text-xs font-bold uppercase">
            Duration
            <select value={duration} onChange={(event) => updateDuration(Number(event.target.value))} className="mt-1 w-full px-2 py-2">
              <option value={25 * 60}>25 minutes</option>
              <option value={15 * 60}>15 minutes</option>
              <option value={5 * 60}>5 minutes</option>
            </select>
          </label>
          <div className="grid gap-2">
            <button type="button" onClick={running ? pause : start} className="inline-flex items-center justify-center gap-2 border-2 border-border bg-primary px-4 py-2 font-bold text-primary-foreground shadow-[var(--bevel-raised)]">
              {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {running ? "Pause" : "Start"}
            </button>
            <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 border-2 border-border bg-secondary px-4 py-2 font-bold shadow-[var(--bevel-raised)]">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </button>
          </div>
        </section>
      </div>
    </DialogWindow>
  );
}
