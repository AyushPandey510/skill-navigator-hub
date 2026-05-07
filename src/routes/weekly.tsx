import { createFileRoute } from "@tanstack/react-router";
import { useAppState, setState, useTracker } from "@/lib/store";
import { PageHeader, Section } from "@/components/ui-kit";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/weekly")({
  head: () => ({ meta: [{ title: "Weekly Review · 90-Day Tracker" }, { name: "description", content: "Sunday weekly reflection." }] }),
  component: WeeklyPage,
});

function WeeklyPage() {
  const s = useAppState();
  const tracker = useTracker();
  const update = (i: number, patch: any) =>
    setState(st => ({ ...st, weekReviews: { ...st.weekReviews, [i]: { ...st.weekReviews[i], ...patch } } }));

  return (
    <div className="space-y-6">
      <PageHeader title="Weekly Review" subtitle="Every Sunday · 30 minutes · Non-negotiable" icon={<BarChart3 className="w-7 h-7" />} />

      <div className="grid gap-4">
        {tracker.weeks.map((w: any, i: number) => {
          const r = s.weekReviews[i] || {};
          return (
            <Section key={i} title={`${w.week} · ${w.dates}`}>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                {(["biggestWin", "toFix", "mood"] as const).map(k => (
                  <label key={k} className="block"><div className="text-[10px] uppercase text-muted-foreground mb-1">{k === "biggestWin" ? "Biggest win" : k === "toFix" ? "What to fix" : "Mood / notes"}</div>
                    <textarea rows={3} value={(r as any)[k] || ""} onChange={(e) => update(i, { [k]: e.target.value })} onBlur={() => toast.success(`${w.week} saved`, { duration: 1000 })} className="w-full bg-input rounded-lg px-3 py-2 text-sm" /></label>
                ))}
              </div>
            </Section>
          );
        })}
      </div>
    </div>
  );
}
