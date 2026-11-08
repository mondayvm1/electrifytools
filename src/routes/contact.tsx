import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { TOPICS, type TopicId } from "@/config/contact";

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): { topic: TopicId } => ({
    topic: TOPICS.some((t) => t.id === s.topic) ? (s.topic as TopicId) : "general",
  }),
  head: () => ({
    meta: [
      { title: "Contact | Electrify Tools" },
      { name: "description", content: "Become an affiliate, ask about fleet pricing, join the team, or send us a message." },
    ],
  }),
  component: Contact,
});

const field =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none";

function Contact() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const topic = TOPICS.find((t) => t.id === search.topic)!;
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, topic: topic.id }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't send right now.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send right now.");
      setState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Electrify.Tools
        </Link>

        {state === "sent" ? (
          <div className="glass mt-10 rounded-3xl p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-6 text-3xl font-bold">Got it. We'll be in touch.</h1>
            <p className="mt-3 text-muted-foreground">We usually reply within a day.</p>
            <Link to="/" className="bg-ember mt-8 inline-block rounded-full px-8 py-3 font-bold text-primary-foreground">
              Back to Electrify
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-10 text-4xl font-bold md:text-5xl">{topic.title}</h1>
            <p className="mt-4 text-muted-foreground">{topic.blurb}</p>

            <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Topic">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === topic.id}
                  onClick={() => navigate({ search: { topic: t.id }, replace: true })}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${t.id === topic.id ? "bg-ember text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="glass mt-6 space-y-4 rounded-3xl p-6 md:p-8">
              <input name="name" required autoComplete="name" placeholder="Your name" className={field} />
              <input name="contact" required placeholder="Email or phone" className={field} />
              <input key={topic.id} name="extra" placeholder={`${topic.extraLabel} — ${topic.extraPlaceholder}`} className={field} />
              <textarea name="message" rows={5} placeholder="Anything else?" className={field} />
              {/* Honeypot: hidden from people, filled by bots. */}
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button
                type="submit"
                disabled={state === "sending"}
                className="bg-ember w-full rounded-full px-8 py-4 font-bold text-primary-foreground disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : "Send"}
              </button>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
