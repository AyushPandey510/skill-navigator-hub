import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState, setState, type Note } from "@/lib/store";
import { PageHeader, Pill, Section } from "@/components/ui-kit";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Daily Notes · 90-Day Tracker" }, { name: "description", content: "Daily notes, thoughts, learnings." }] }),
  component: NotesPage,
});

const MOODS = ["🔥", "💪", "✅", "😐", "😴", "😤"];

function NotesPage() {
  const s = useAppState();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState({ title: "", body: "", mood: "💪" });

  const add = () => {
    if (!draft.title.trim() && !draft.body.trim()) return;
    const n: Note = { id: crypto.randomUUID(), date: new Date().toISOString(), ...draft };
    setState(st => ({ ...st, notes: [n, ...st.notes] }));
    setDraft({ title: "", body: "", mood: "💪" });
    toast.success("Note saved");
  };
  const remove = (id: string) => setState(st => ({ ...st, notes: st.notes.filter(n => n.id !== id) }));

  const filtered = s.notes.filter(n => !q || `${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase()));
  const grouped = filtered.reduce<Record<string, Note[]>>((acc, n) => {
    const d = new Date(n.date).toDateString();
    (acc[d] = acc[d] || []).push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Notes" subtitle="Capture wins, lessons, ideas, blockers" icon={<NotebookPen className="w-7 h-7" />} />

      <Section title="New note" action={<div className="flex gap-1">{MOODS.map(m => (
        <button key={m} onClick={() => setDraft({ ...draft, mood: m })} className={`w-8 h-8 rounded-lg ${draft.mood === m ? "gradient-primary shadow-glow" : "bg-secondary"}`}>{m}</button>
      ))}</div>}>
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title (e.g., 'Cracked sliding window')" className="w-full bg-input rounded-lg px-3 py-2 text-sm mb-2" />
        <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={4} placeholder="What happened today? What did you learn?" className="w-full bg-input rounded-lg px-3 py-2 text-sm" />
        <div className="mt-3 flex justify-end">
          <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow"><Plus className="w-4 h-4" /> Save note</button>
        </div>
      </Section>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes..." className="w-full bg-input rounded-lg px-3 py-2 text-sm" />

      <div className="space-y-4">
        {Object.entries(grouped).map(([date, ns]) => (
          <Section key={date} title={date}>
            <div className="space-y-3">
              {ns.map(n => (
                <div key={n.id} className="rounded-xl bg-secondary/40 p-4 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1"><span className="text-lg">{n.mood}</span><h4 className="font-semibold">{n.title || "(untitled)"}</h4><Pill>{new Date(n.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Pill></div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{n.body}</p>
                    </div>
                    <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ))}
        {!filtered.length && <div className="text-center text-muted-foreground text-sm py-12">No notes yet. Capture your first thought above.</div>}
      </div>
    </div>
  );
}
