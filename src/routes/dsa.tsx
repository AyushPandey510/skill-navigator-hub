import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppState, useTracker, setState, computeStats, TARGETS } from "@/lib/store";
import { PageHeader, Pill, Section, StatCard } from "@/components/ui-kit";
import { Code2, Search, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dsa")({
  head: () => ({ meta: [{ title: "DSA Tracker · 90-Day Tracker" }, { name: "description", content: "TUF+ DSA problem tracker." }] }),
  component: DSAPage,
});

const STATUS = ["todo", "doing", "done", "revisit"] as const;
const STATUS_LABEL: Record<string, string> = { todo: "☐ Todo", doing: "🔄 Doing", done: "✅ Done", revisit: "🔁 Revisit" };
const STATUS_TONE: Record<string, any> = { todo: "default", doing: "info", done: "success", revisit: "warning" };

function practiceSearchUrl(problem: { name: string; topic?: string; category?: string; difficulty?: string }) {
  const keywords = [problem.name, problem.topic, problem.category, problem.difficulty, "DSA practice problem", "coding interview"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(keywords)}`;
}

function DSAPage() {
  const tracker = useTracker();
  const s = useAppState();
  const stats = computeStats(s);
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("All");
  const [topic, setTopic] = useState("All");
  const [statusF, setStatusF] = useState("All");

  const topics = useMemo(() => ["All", ...Array.from(new Set(tracker.dsa.map((p: any) => p.topic).filter(Boolean)))], [tracker]);
  const diffs = ["All", "Easy", "Medium", "Hard"];

  const filtered = tracker.dsa.filter((p: any) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (diff !== "All" && p.difficulty !== diff) return false;
    if (topic !== "All" && p.topic !== topic) return false;
    const ps = s.dsaStatus[p.id] ?? "todo";
    if (statusF !== "All" && ps !== statusF) return false;
    return true;
  });

  const setStatus = (id: number, status: any) => setState((st) => ({ ...st, dsaStatus: { ...st.dsaStatus, [id]: status } }));

  const easy = tracker.dsa.filter((p: any) => p.difficulty === "Easy" && s.dsaStatus[p.id] === "done").length;
  const med = tracker.dsa.filter((p: any) => p.difficulty === "Medium" && s.dsaStatus[p.id] === "done").length;
  const hard = tracker.dsa.filter((p: any) => p.difficulty === "Hard" && s.dsaStatus[p.id] === "done").length;

  return (
    <div className="space-y-6">
      <PageHeader title="DSA Tracker" subtitle="2 problems minimum every morning · Python only" icon={<Code2 className="w-7 h-7" />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total done" value={stats.lcDone} total={TARGETS.leetcode} accent="primary" />
        <StatCard label="Easy" value={easy} accent="success" />
        <StatCard label="Medium" value={med} accent="warning" />
        <StatCard label="Hard" value={hard} accent="accent" />
      </div>

      <Section title={`Problems (${filtered.length})`}>
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problem..." className="w-full bg-input rounded-lg pl-9 pr-3 py-2 text-sm" />
          </div>
          <select value={diff} onChange={(e) => setDiff(e.target.value)} className="bg-input rounded-lg px-3 py-2 text-sm">{diffs.map(d => <option key={d}>{d}</option>)}</select>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-input rounded-lg px-3 py-2 text-sm max-w-[160px]">{topics.map(t => <option key={t}>{t}</option>)}</select>
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="bg-input rounded-lg px-3 py-2 text-sm">
            <option>All</option>{STATUS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>

        <div className="overflow-auto -mx-2 max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/90 backdrop-blur">
              <tr><th className="p-2">#</th><th className="p-2">Problem</th><th className="p-2">Topic</th><th className="p-2">Diff</th><th className="p-2">Category</th><th className="p-2">Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const st = s.dsaStatus[p.id] ?? "todo";
                const url = practiceSearchUrl(p);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="p-2 text-muted-foreground">{p.id}</td>
                    <td className="p-2 font-medium"><a href={url} target="_blank" rel="noreferrer" title={`Search practice options for ${p.name}`} className="hover:text-primary inline-flex items-center gap-1">{p.name}<ExternalLink className="w-3 h-3 opacity-50" /></a></td>
                    <td className="p-2 text-xs text-muted-foreground">{p.topic}</td>
                    <td className="p-2"><Pill tone={p.difficulty === "Easy" ? "success" : p.difficulty === "Hard" ? "danger" : "warning"}>{p.difficulty}</Pill></td>
                    <td className="p-2 text-xs text-muted-foreground">{p.category}</td>
                    <td className="p-2">
                      <select value={st} onChange={(e) => setStatus(p.id, e.target.value)} className="bg-input rounded px-2 py-1 text-xs">
                        {STATUS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
