import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Briefcase, Calendar, Code2, Download, Home, Map, NotebookPen, Rocket } from "lucide-react";
import { computeStats, setState, TARGETS, useAppState, type QuickLink, type UserProfile } from "@/lib/store";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/daily", label: "Daily Log", icon: Calendar },
  { to: "/dsa", label: "DSA / LeetCode", icon: Code2 },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/weekly", label: "Weekly Review", icon: BarChart3 },
  { to: "/skills", label: "Skill Roadmap", icon: Map },
  { to: "/projects", label: "Projects", icon: Rocket },
  { to: "/notes", label: "Daily Notes", icon: NotebookPen },
] as const;

type MenuName = "File" | "Edit" | "View" | "Tools" | "Help" | "Privacy" | "Developer" | "Install";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function externalUrl(url: string) {
  const clean = url.trim();
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
}

export function AppNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const appState = useAppState();
  const { profile } = appState;
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const name = profile.name?.trim() || "Your";
  const role = profile.role?.trim() || "Career & Skill Tracker";

  useEffect(() => {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(standalone));

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setOpenMenu("Install");
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-card shadow-[var(--bevel-raised)]">
      <div className="title-blue px-2 py-1">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-normal">
          <Link to="/" className="flex min-w-0 items-center gap-2 focus-visible:outline-white">
            <span className="grid h-4 w-4 place-items-center border border-primary bg-card text-[10px] text-primary" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">Skill Navigator Hub - {name} ({role})</span>
          </Link>
          <span className="hidden text-[10px] font-normal text-white/80 sm:inline">v2.4 - 90 Days Sprint</span>
        </div>
      </div>

      <div className="border-b-2 border-border bg-secondary px-2 py-1 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap sm:gap-4">
          {(["File", "Edit", "View", "Tools", "Help", "Privacy", "Developer"] as MenuName[]).map((menu) => (
            <button
              key={menu}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={openMenu === menu}
              onClick={() => setOpenMenu(menu)}
              className="px-2 py-0.5 text-left font-bold hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground"
            >
              {menu}
            </button>
          ))}
          <span className="hidden text-[10px] font-bold text-muted-foreground md:inline">Workstation Session: DESKTOP-90D-USER</span>
        </div>
      </div>

      <nav aria-label="Primary" className="grid grid-cols-2 gap-1 bg-card px-2 py-2 sm:flex sm:flex-wrap sm:items-center sm:px-3">
        {navItems.map((it) => {
          const Active = path === it.to;
          const Icon = it.icon;

          return (
            <Link
              key={it.to}
              to={it.to}
              aria-current={Active ? "page" : undefined}
              className={`flex min-w-0 items-center gap-1.5 border-2 px-2 py-1.5 text-[11px] font-bold shadow-[var(--bevel-raised)] focus-visible:outline-2 sm:px-3 sm:py-1 ${
                Active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleInstall}
          className="flex min-w-0 items-center justify-center gap-1.5 border-2 border-border bg-secondary px-2 py-1.5 text-[11px] font-bold shadow-[var(--bevel-raised)] hover:bg-muted sm:px-3 sm:py-1"
        >
          <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{isStandalone ? "Installed" : "Install App"}</span>
        </button>
        <div className="ml-auto hidden border-2 border-border bg-input px-3 py-1 text-[11px] font-bold shadow-[var(--bevel-sunken)] lg:block">
          <span className="mr-2 inline-block h-2 w-2 bg-success" aria-hidden="true" />{name} - {role}
        </div>
      </nav>

      {openMenu === "File" && <FileDialog profile={profile} onClose={() => setOpenMenu(null)} />}
      {openMenu === "Edit" && <EditDialog profile={profile} onClose={() => setOpenMenu(null)} />}
      {openMenu === "View" && <ViewDialog appState={appState} onClose={() => setOpenMenu(null)} />}
      {openMenu === "Tools" && <ToolsDialog onClose={() => setOpenMenu(null)} />}
      {openMenu === "Help" && <HelpDialog onClose={() => setOpenMenu(null)} />}
      {openMenu === "Privacy" && <PrivacyDialog onClose={() => setOpenMenu(null)} />}
      {openMenu === "Developer" && <DeveloperDialog onClose={() => setOpenMenu(null)} />}
      {openMenu === "Install" && <InstallDialog onClose={() => setOpenMenu(null)} />}
    </header>
  );
}

function DialogShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-3" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-dialog-title"
        className="w-full max-w-[calc(100vw-1rem)] border-2 border-border bg-card shadow-[var(--bevel-raised)] sm:max-w-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-primary px-2 py-1 text-primary-foreground">
          <h2 id="menu-dialog-title" className="text-sm font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="border border-white bg-card px-2 text-xs font-bold text-foreground" aria-label={`Close ${title}`}>X</button>
        </div>
        <div className="max-h-[75vh] overflow-auto p-2 text-sm sm:p-3">{children}</div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase text-foreground">{label}</span>
      {children}
    </label>
  );
}

function DialogSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-2 border-border bg-input p-3 shadow-[var(--bevel-sunken)]">
      <h3 className="mb-2 bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">{title}</h3>
      {children}
    </section>
  );
}

function FileDialog({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [draft, setDraft] = useState({ label: "", url: "" });
  const quickLinks = profile.quickLinks ?? [];
  const addLink = () => {
    if (!draft.label.trim() || !draft.url.trim()) return;
    const link: QuickLink = { id: newId(), label: draft.label.trim(), url: draft.url.trim() };
    setState((st) => ({ ...st, profile: { ...st.profile, quickLinks: [...(st.profile.quickLinks ?? []), link] } }));
    setDraft({ label: "", url: "" });
  };
  const removeLink = (id: string) => {
    setState((st) => ({ ...st, profile: { ...st.profile, quickLinks: (st.profile.quickLinks ?? []).filter((link) => link.id !== id) } }));
  };

  return (
    <DialogShell title="File - Quick Links" onClose={onClose}>
      <div className="space-y-4 leading-relaxed">
        <DialogSection title="Add Quick Link">
          <p className="mb-3 text-muted-foreground">Add LinkedIn, GitHub, portfolio, resume, or any website you open often. Links are saved only on this device.</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Name">
              <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="w-full px-2 py-1" placeholder="GitHub" />
            </Field>
            <Field label="Website">
              <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className="w-full px-2 py-1" placeholder="github.com/you" />
            </Field>
            <button type="button" onClick={addLink} className="self-end border-2 border-border bg-secondary px-3 py-1 font-bold shadow-[var(--bevel-raised)]">Add</button>
          </div>
        </DialogSection>

        <DialogSection title="Saved Links">
          <div className="border-2 border-border bg-input shadow-[var(--bevel-sunken)]">
            {quickLinks.length === 0 ? (
              <div className="p-3 text-muted-foreground">No quick links yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {quickLinks.map((link) => (
                  <li key={link.id} className="flex flex-wrap items-center justify-between gap-2 p-2">
                    <a href={externalUrl(link.url)} target="_blank" rel="noreferrer" className="font-bold text-primary underline">{link.label}</a>
                    <button type="button" onClick={() => removeLink(link.id)} className="border border-border bg-secondary px-2 py-0.5">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogSection>
      </div>
    </DialogShell>
  );
}

function EditDialog({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const updateProfile = (patch: Partial<UserProfile>) => setState((st) => ({ ...st, profile: { ...st.profile, ...patch } }));

  return (
    <DialogShell title="Edit - Profile & Plan" onClose={onClose}>
      <div className="space-y-4 leading-relaxed">
        <DialogSection title="Identity">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input value={profile.name ?? ""} onChange={(e) => updateProfile({ name: e.target.value })} className="w-full px-2 py-1" /></Field>
            <Field label="Focus"><input value={profile.role ?? ""} onChange={(e) => updateProfile({ role: e.target.value })} className="w-full px-2 py-1" placeholder="Backend Engineer" /></Field>
          </div>
        </DialogSection>

        <DialogSection title="Plan Details">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start date"><input type="date" value={profile.startDate ?? ""} onChange={(e) => updateProfile({ startDate: e.target.value })} className="w-full px-2 py-1" /></Field>
            <Field label="End date"><input type="date" value={profile.endDate ?? ""} onChange={(e) => updateProfile({ endDate: e.target.value })} className="w-full px-2 py-1" /></Field>
            <Field label="Goal"><input value={profile.goal ?? ""} onChange={(e) => updateProfile({ goal: e.target.value })} className="w-full px-2 py-1" placeholder="Get interview-ready" /></Field>
            <Field label="Deadline"><input type="date" value={profile.deadline ?? ""} onChange={(e) => updateProfile({ deadline: e.target.value })} className="w-full px-2 py-1" /></Field>
          </div>
        </DialogSection>

        <DialogSection title="Other Notes">
          <Field label="Notes">
            <textarea value={profile.notes ?? ""} onChange={(e) => updateProfile({ notes: e.target.value })} className="min-h-24 w-full px-2 py-1" placeholder="Target companies, daily rules, reminders..." />
          </Field>
          <div className="mt-3 text-xs text-muted-foreground">Changes save instantly to this device.</div>
        </DialogSection>
      </div>
    </DialogShell>
  );
}

function ViewDialog({ appState, onClose }: { appState: ReturnType<typeof useAppState>; onClose: () => void }) {
  const stats = computeStats(appState);
  const projectsLive = appState.projects.filter((project) => ["live", "shipped"].includes((project.status ?? "").toLowerCase())).length;
  const rows = [
    ["Days logged", `${stats.daysLogged} / 90`],
    ["DSA done", `${stats.lcDone} / ${TARGETS.leetcode}`],
    ["Skills done", `${stats.skillsDone}`],
    ["Study hours", `${stats.studyHours} / ${TARGETS.studyHours}`],
    ["Jobs applied", `${stats.jobsApplied} / ${TARGETS.jobs}`],
    ["Callbacks", `${stats.callbacks}`],
    ["Commits", `${stats.commits} / ${TARGETS.commits}`],
    ["Projects", `${appState.projects.length} total, ${projectsLive} live/shipped`],
    ["Notes", `${appState.notes.length}`],
  ];
  const jobStatuses = ["Applied", "Pending", "Callback", "Interview", "Offer", "Rejected"];

  return (
    <DialogShell title="View - Status Snapshot" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <DialogSection title="Stats">
          <table className="w-full border-2 border-border bg-input text-sm shadow-[var(--bevel-sunken)]">
            <tbody>{rows.map(([label, value]) => <tr key={label} className="border-b border-border"><th className="p-2 text-left font-bold">{label}</th><td className="p-2">{value}</td></tr>)}</tbody>
          </table>
        </DialogSection>
        <DialogSection title="Application Status">
          <table className="w-full border-2 border-border bg-input text-sm shadow-[var(--bevel-sunken)]">
            <tbody>{jobStatuses.map((status) => <tr key={status} className="border-b border-border"><th className="p-2 text-left font-bold">{status}</th><td className="p-2">{stats.jobsByStatus[status] ?? 0}</td></tr>)}</tbody>
          </table>
        </DialogSection>
      </div>
    </DialogShell>
  );
}

function ToolsDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell title="Tools - Feature List" onClose={onClose}>
      <div className="space-y-4 leading-relaxed">
        <DialogSection title="Tracking Tools">
          <ul className="list-disc space-y-2 pl-5">
            <li>Daily Log tracks study hours, LeetCode count, jobs applied, commits, mocks, wins, and blockers.</li>
            <li>DSA Tracker filters problems by topic, difficulty, and status. Problem links search the web for practice options.</li>
            <li>Skills Roadmap tracks broader learning topics from beginner to expert.</li>
            <li>Weekly Review stores reflection notes for each week.</li>
          </ul>
        </DialogSection>
        <DialogSection title="Career & Shipping Tools">
          <ul className="list-disc space-y-2 pl-5">
            <li>Jobs stores a local application pipeline with statuses and notes.</li>
            <li>Projects lets users add their own projects, URLs, stack, status, priority, and next action.</li>
            <li>Daily Notes saves ideas, thoughts, and learning notes locally.</li>
            <li>File Quick Links stores shortcuts to LinkedIn, GitHub, portfolio, resume, or any website.</li>
          </ul>
        </DialogSection>
      </div>
    </DialogShell>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell title="Help - How To Use" onClose={onClose}>
      <div className="space-y-4 leading-relaxed">
        <DialogSection title="Getting Started">
          <p><b>First setup:</b> add your name on the dashboard once. After that, edit your name, role, dates, goals, deadline, and notes from Edit.</p>
          <p className="mt-2"><b>Quick links:</b> open File and save the websites you use often, like LinkedIn, GitHub, portfolio, resume, or job boards.</p>
        </DialogSection>
        <DialogSection title="Daily Workflow">
          <p><b>Daily Log:</b> open Daily Log, pick the day, enter hours, problems solved, applications, wins, and blockers.</p>
          <p className="mt-2"><b>DSA:</b> use search and filters, click a problem name to search practice sites, then mark it Todo, Doing, Done, or Revisit.</p>
        </DialogSection>
        <DialogSection title="Career Workflow">
          <p><b>Jobs:</b> add each application, keep status updated, and use View to check application status counts.</p>
          <p className="mt-2"><b>Projects:</b> add your own projects instead of using someone else’s list. Keep live URLs, GitHub links, stack, and next action updated.</p>
          <p className="mt-2"><b>Privacy:</b> all tracker data stays in this browser on this device through local storage. No account or backend is used.</p>
        </DialogSection>
      </div>
    </DialogShell>
  );
}


function PrivacyDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell title="Privacy - Local Data Policy" onClose={onClose}>
      <div className="space-y-4 leading-relaxed">
        <section className="border-2 border-border bg-input p-3 shadow-[var(--bevel-sunken)]">
          <h3 className="mb-2 bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">Privacy Policy</h3>
          <p>
            <b>Effective summary:</b> Skill Navigator Hub is designed as a local-first tracker. The information you enter is stored in this browser on this device using local storage. The app does not require an account, does not send your tracker data to a server, and does not sell personal information.
          </p>
          <p className="mt-2">
            <b>Data you may enter:</b> your name, focus area, start and end dates, goals, deadline, notes, daily logs, DSA status, skill progress, projects, job applications, weekly reviews, and quick links such as LinkedIn, GitHub, portfolio, resume, or other websites.
          </p>
          <p className="mt-2">
            <b>Where data is stored:</b> your entries are saved in your browser's local storage under this app's local storage key. Local storage belongs to the browser profile on the device you are using.
          </p>
          <p className="mt-2">
            <b>Data sharing:</b> the app itself does not transmit your saved tracker data to the developer or to a backend service. If you open an external quick link, that external website may process information under its own privacy policy.
          </p>
          <p className="mt-2">
            <b>Your control:</b> you can edit your entries inside the app. You can also clear the browser's site data/local storage to remove the locally stored tracker information from that browser profile.
          </p>
          <p className="mt-2">
            <b>Important caution:</b> because this is local browser storage, clearing browser data, using a different device, or using a different browser profile may remove or hide your data. Keep separate backups if the information matters to you.
          </p>
          <p className="mt-2 text-xs italic text-muted-foreground">
            This policy is written to explain the app's intended behavior in plain language. It is not a substitute for legal advice for deployments that add accounts, analytics, payments, servers, or third-party data collection.
          </p>
        </section>
      </div>
    </DialogShell>
  );
}

function DeveloperDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell title="Developer - About & Honest Progress" onClose={onClose}>
      <section className="border-2 border-border bg-input p-3 leading-relaxed shadow-[var(--bevel-sunken)]">
        <h3 className="mb-2 bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">Developer Note</h3>
        <p>
          <b>About the developer:</b> this tracker was built by Ayush to help learners, builders, and job seekers keep a brutally honest 90-day record of effort, progress, and proof.
        </p>
        <p className="mt-2">
          The point of this app is not to make the dashboard look good. The point is to make reality visible. If you skip a day, log it. If a project is not live, mark it honestly. If job applications are low, let the number say that clearly. Honest data is not there to shame you; it is there to show the next move.
        </p>
        <p className="mt-2">
          Use this app like a private workstation: add your real links, track your real projects, write real blockers, and update statuses when they actually change. The more truthful the input, the more useful the tracker becomes.
        </p>
        <p className="mt-2 font-bold">
          Small daily proof beats imaginary progress. Keep showing up, keep logging clearly, and let the dashboard become evidence of the person you are building into.
        </p>
      </section>
    </DialogShell>
  );
}

function InstallDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell title="Install - Download App" onClose={onClose}>
      <div className="space-y-4 leading-relaxed">
        <DialogSection title="Install On This Device">
          <p>Use the Install App button when your browser shows the install prompt. After installing, Skill Navigator Hub opens like a normal app and keeps using this device's local data.</p>
        </DialogSection>
        <DialogSection title="If No Prompt Appears">
          <p><b>Chrome or Edge:</b> open the browser menu and choose Install app or Add to home screen.</p>
          <p className="mt-2"><b>iPhone Safari:</b> open Share, then choose Add to Home Screen.</p>
          <p className="mt-2"><b>Android:</b> open the browser menu, then choose Install app or Add to Home screen.</p>
        </DialogSection>
        <DialogSection title="Offline Note">
          <p>The app shell is cached for faster repeat visits. Your tracker entries remain private in this browser profile on this device.</p>
        </DialogSection>
      </div>
    </DialogShell>
  );
}
