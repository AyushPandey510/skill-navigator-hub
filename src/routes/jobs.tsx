import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState, setState, type JobApp } from "@/lib/store";
import { PageHeader, Pill, Section, StatCard } from "@/components/ui-kit";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs · 90-Day Tracker" }, { name: "description", content: "Job application pipeline." }] }),
  component: JobsPage,
});

const STATUS: JobApp["status"][] = ["Applied", "Pending", "Callback", "Interview", "Offer", "Rejected"];
const TONE: Record<string, any> = { Applied: "default", Pending: "info", Callback: "warning", Interview: "primary", Offer: "success", Rejected: "danger" };

function JobsPage() {
  const s = useAppState();
  const [showNew, setShowNew] = useState(false);
  const counts = STATUS.reduce<Record<string, number>>((a, st) => { a[st] = s.jobs.filter(j => j.status === st).length; return a; }, {});
  const total = s.jobs.length;
  const conv = total ? ((counts.Callback + counts.Interview + counts.Offer) / total) * 100 : 0;

  const addJob = (j: Omit<JobApp, "id">) => {
    setState(st => ({ ...st, jobs: [{ ...j, id: crypto.randomUUID() }, ...st.jobs] }));
    toast.success("Job added");
  };
  const updateJob = (id: string, patch: Partial<JobApp>) => setState(st => ({ ...st, jobs: st.jobs.map(j => j.id === id ? { ...j, ...patch } : j) }));
  const removeJob = (id: string) => setState(st => ({ ...st, jobs: st.jobs.filter(j => j.id !== id) }));

  return (
    <div className="space-y-6">
      <PageHeader title="Job Applications" subtitle="Apply 5–8 daily · Pipeline = survival" icon={<Briefcase className="w-7 h-7" />} actions={
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow"><Plus className="w-4 h-4" /> Add</button>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={total} total={500} accent="primary" />
        {STATUS.map(st => <StatCard key={st} label={st} value={counts[st]} accent={st === "Offer" ? "success" : st === "Rejected" ? "warning" : "accent"} />)}
      </div>

      <Section title={`Pipeline · ${conv.toFixed(1)}% conversion`}>
        {s.jobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No applications yet. Click <b>Add</b> to start your pipeline.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground"><tr>
                <th className="p-2">Date</th><th className="p-2">Company</th><th className="p-2">Role</th><th className="p-2">Source</th><th className="p-2">Salary</th><th className="p-2">Status</th><th className="p-2">Notes</th><th></th>
              </tr></thead>
              <tbody>
                {s.jobs.map(j => (
                  <tr key={j.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="p-2 text-xs text-muted-foreground">{j.date}</td>
                    <td className="p-2 font-medium">{j.company}</td>
                    <td className="p-2">{j.role}</td>
                    <td className="p-2 text-xs">{j.source}</td>
                    <td className="p-2 text-xs">{j.salary}</td>
                    <td className="p-2">
                      <select value={j.status} onChange={(e) => updateJob(j.id, { status: e.target.value as any })} className="bg-input rounded px-2 py-1 text-xs">
                        {STATUS.map(st => <option key={st}>{st}</option>)}
                      </select>
                      <div className="mt-1"><Pill tone={TONE[j.status]}>{j.status}</Pill></div>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground max-w-[200px] truncate">{j.notes}</td>
                    <td className="p-2"><button onClick={() => removeJob(j.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {showNew && <NewJob onClose={() => setShowNew(false)} onAdd={(j) => { addJob(j); setShowNew(false); }} />}
    </div>
  );
}

function NewJob({ onClose, onAdd }: any) {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), company: "", role: "", source: "LinkedIn", salary: "", status: "Applied" as JobApp["status"], notes: "" });
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 max-w-md w-full shadow-glow" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">New Application</h3>
        <div className="space-y-3 text-sm">
          {(["date", "company", "role", "source", "salary"] as const).map(k => (
            <label key={k} className="block"><div className="text-[10px] uppercase text-muted-foreground mb-1">{k}</div><input value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full bg-input rounded-lg px-3 py-2" /></label>
          ))}
          <label className="block"><div className="text-[10px] uppercase text-muted-foreground mb-1">Status</div>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as any })} className="w-full bg-input rounded-lg px-3 py-2">{STATUS.map(s => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="block"><div className="text-[10px] uppercase text-muted-foreground mb-1">Notes</div><textarea rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className="w-full bg-input rounded-lg px-3 py-2" /></label>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancel</button>
          <button onClick={() => f.company && onAdd(f as any)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow">Add</button>
        </div>
      </div>
    </div>
  );
}
