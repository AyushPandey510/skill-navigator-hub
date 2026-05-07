import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppState, useTracker, setState as setAppState, computeStats, TARGETS } from "@/lib/store";
import { PageHeader, Pill, Section, StatCard } from "@/components/ui-kit";
import { Calendar, Search, Flame, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/daily")({
  head: () => ({ meta: [{ title: "Daily Log · 90-Day Tracker" }, { name: "description", content: "Daily grind log for 90 days." }] }),
  component: DailyPage,
});

function DailyPage() {
  const tracker = useTracker();
  const s = useAppState();
  const stats = computeStats(s);
  const [filter, setFilter] = useState("");
  const [phase, setPhase] = useState<string>("All");
  const [openDay, setOpenDay] = useState<number | null>(null);

  const phases = useMemo(() => ["All", ...Array.from(new Set(tracker.days.map((d: any) => d.phase)))], [tracker]);
  const days = tracker.days.filter((d: any) => {
    if (phase !== "All" && d.phase !== phase) return false;
    if (filter && !`${d.date} ${d.focus}`.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const update = (day: number, patch: any) => {
    setAppState((st) => ({
      ...st,
      dayLogs: { ...st.dayLogs, [day]: { ...st.dayLogs[day], ...patch } },
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Log" subtitle="Fill every single day. No excuses." icon={<Calendar className="w-7 h-7" />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Days logged" value={stats.daysLogged} total={90} icon={<Flame className="w-4 h-4" />} accent="warning" />
        <StatCard label="Study hrs" value={stats.studyHours} total={TARGETS.studyHours} accent="primary" />
        <StatCard label="LC done" value={stats.lcDone} total={TARGETS.leetcode} accent="accent" />
        <StatCard label="Commits" value={stats.commits} total={TARGETS.commits} accent="success" />
      </div>

      <Section title="90-Day grind">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search date or focus..." className="w-full bg-input rounded-lg pl-9 pr-3 py-2 text-sm" />
          </div>
          <select value={phase} onChange={(e) => setPhase(e.target.value)} className="bg-input rounded-lg px-3 py-2 text-sm">
            {phases.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {days.map((d: any) => {
            const log = s.dayLogs[d.day];
            const done = !!log && ((log.studyHours ?? 0) > 0 || (log.lcCount ?? 0) > 0 || log.wins);
            return (
              <button
                key={d.day}
                onClick={() => setOpenDay(d.day)}
                className={`relative group p-3 rounded-xl text-left text-xs glass hover:shadow-glow transition-all ${done ? "border-success/40" : ""}`}
              >
                {done && <CheckCircle2 className="w-3.5 h-3.5 absolute top-2 right-2 text-success" />}
                <div className="text-[10px] text-muted-foreground">{d.phase}</div>
                <div className="font-semibold">Day {d.day}</div>
                <div className="text-[10px] text-muted-foreground">{d.date}</div>
                <div className="mt-1 text-[10px]">{d.focus}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {openDay !== null && (
        <DayModal day={openDay} entry={tracker.days.find((d: any) => d.day === openDay)} log={s.dayLogs[openDay] || {}} onClose={() => setOpenDay(null)} onSave={(patch) => { update(openDay, patch); toast.success(`Day ${openDay} saved`); setOpenDay(null); }} />
      )}
    </div>
  );
}

function DayModal({ day, entry, log, onClose, onSave }: any) {
  const [form, setForm] = useState({
    studyHours: log.studyHours ?? "",
    lcCount: log.lcCount ?? "",
    jobsApplied: log.jobsApplied ?? "",
    callbacks: log.callbacks ?? "",
    commit: log.commit ?? false,
    mock: log.mock ?? false,
    energy: log.energy ?? 3,
    status: log.status ?? "",
    wins: log.wins ?? "",
    blockers: log.blockers ?? "",
  });
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 max-w-lg w-full shadow-glow" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Pill tone="primary">{entry.phase}</Pill>
            <h3 className="text-xl font-bold mt-1">Day {day} · {entry.date}</h3>
            <p className="text-xs text-muted-foreground">{entry.focus}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Study hrs"><input type="number" step="0.5" value={form.studyHours} onChange={(e) => setForm({ ...form, studyHours: e.target.value })} className="input" /></Field>
          <Field label="LeetCode #"><input type="number" value={form.lcCount} onChange={(e) => setForm({ ...form, lcCount: e.target.value })} className="input" /></Field>
          <Field label="Jobs applied"><input type="number" value={form.jobsApplied} onChange={(e) => setForm({ ...form, jobsApplied: e.target.value })} className="input" /></Field>
          <Field label="Callbacks"><input type="number" value={form.callbacks} onChange={(e) => setForm({ ...form, callbacks: e.target.value })} className="input" /></Field>
          <Field label="Energy (1–5)"><input type="number" min={1} max={5} value={form.energy} onChange={(e) => setForm({ ...form, energy: +e.target.value })} className="input" /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value="">—</option><option>✅ Crushed</option><option>🔥 On fire</option><option>😴 Low</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 col-span-1"><input type="checkbox" checked={form.commit} onChange={(e) => setForm({ ...form, commit: e.target.checked })} /> GitHub commit</label>
          <label className="flex items-center gap-2 col-span-1"><input type="checkbox" checked={form.mock} onChange={(e) => setForm({ ...form, mock: e.target.checked })} /> Mock interview</label>
          <Field label="Wins / notes" full><textarea rows={2} value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} className="input" /></Field>
          <Field label="Blockers" full><textarea rows={2} value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} className="input" /></Field>
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancel</button>
          <button onClick={() => onSave({
            studyHours: +form.studyHours || 0,
            lcCount: +form.lcCount || 0,
            jobsApplied: +form.jobsApplied || 0,
            callbacks: +form.callbacks || 0,
            commit: form.commit, mock: form.mock, energy: form.energy,
            status: form.status, wins: form.wins, blockers: form.blockers,
          })} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow">Save</button>
        </div>
        <style>{`.input{ background:var(--input); border-radius:.5rem; padding:.45rem .6rem; width:100%; font-size:.8rem; outline:none; border:1px solid transparent; } .input:focus{ border-color:var(--ring); }`}</style>
      </div>
    </div>
  );
}
function Field({ label, full, children }: any) {
  return <label className={`block ${full ? "col-span-2" : ""}`}><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>{children}</label>;
}
