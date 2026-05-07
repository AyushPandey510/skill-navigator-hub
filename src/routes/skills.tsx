import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppState, useTracker, setState } from "@/lib/store";
import { PageHeader, Pill, Section, StatCard } from "@/components/ui-kit";
import { Map, Search } from "lucide-react";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skill Roadmap · 90-Day Tracker" }, { name: "description", content: "Beginner → Expert skill roadmap." }] }),
  component: SkillsPage,
});

const STATUS = ["todo", "doing", "done"] as const;
const LABEL: any = { todo: "☐ Todo", doing: "🔄 Doing", done: "✅ Done" };

function SkillsPage() {
  const t = useTracker();
  const s = useAppState();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const cats = useMemo(() => Array.from(new Set(t.skills.map((sk: any) => sk.category).filter(Boolean))), [t]);
  const levels = ["All", ...Array.from(new Set(t.skills.map((sk: any) => sk.level).filter(Boolean)))];

  const setSt = (i: number, st: any) => setState(prev => ({ ...prev, skillStatus: { ...prev.skillStatus, [i]: st } }));
  const done = Object.values(s.skillStatus).filter(v => v === "done").length;
  const doing = Object.values(s.skillStatus).filter(v => v === "doing").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Skill Roadmap" subtitle="Every topic to get hired · Beginner → Expert" icon={<Map className="w-7 h-7" />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total skills" value={t.skills.length} accent="primary" />
        <StatCard label="✅ Done" value={done} total={t.skills.length} accent="success" />
        <StatCard label="🔄 Doing" value={doing} accent="warning" />
        <StatCard label="% complete" value={`${Math.round((done / t.skills.length) * 100)}%`} accent="accent" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skill..." className="w-full bg-input rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-input rounded-lg px-3 py-2 text-sm">{levels.map(l => <option key={l}>{l}</option>)}</select>
      </div>

      <div className="grid gap-4">
        {cats.map((cat) => {
          const items = t.skills
            .map((sk: any, i: number) => ({ ...sk, _i: i }))
            .filter((sk: any) => sk.category === cat)
            .filter((sk: any) => (level === "All" || sk.level === level) && (!q || sk.name.toLowerCase().includes(q.toLowerCase())));
          if (!items.length) return null;
          return (
            <Section key={cat as string} title={cat as string}>
              <div className="grid md:grid-cols-2 gap-2">
                {items.map((sk: any) => {
                  const st = s.skillStatus[sk._i] ?? "todo";
                  return (
                    <div key={sk._i} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-secondary/40">
                      <div className="min-w-0">
                        <div className="text-sm truncate">{sk.name}</div>
                        <div className="text-[10px] text-muted-foreground flex gap-2">
                          <Pill tone={sk.level === "Beginner" ? "success" : sk.level === "Expert" ? "danger" : "info"}>{sk.level}</Pill>
                          {sk.phase && <span>{sk.phase} · {sk.week}</span>}
                          {sk.resource && <span>· {sk.resource}</span>}
                        </div>
                      </div>
                      <select value={st} onChange={(e) => setSt(sk._i, e.target.value)} className="bg-input rounded px-2 py-1 text-xs">
                        {STATUS.map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </Section>
          );
        })}
      </div>
    </div>
  );
}
