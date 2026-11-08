import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, type TopicId } from "@/config/contact";

// Contact form submissions go to the Magnet Funnels lead inbox (stored + emailed). Forwarding
// server-side keeps it working when the site moves to its own domain.
const LEAD_ENDPOINT = process.env.LEAD_ENDPOINT || "https://magnetfunnels.com/api/lead";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!body) return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
        if (str(body.website, 200)) return Response.json({ ok: true }); // honeypot

        const topicId = str(body.topic, 20) as TopicId;
        const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[TOPICS.length - 1]!;
        const name = str(body.name, 120);
        const contact = str(body.contact, 160);
        if (!name || !contact) {
          return Response.json({ ok: false, error: "Add your name and a way to reach you." }, { status: 400 });
        }
        const extra = str(body.extra, 300);
        const message = str(body.message, 3500);
        const details = [extra && `${topic.extraLabel}: ${extra}`, message].filter(Boolean).join("\n\n");

        try {
          const res = await fetch(LEAD_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              contact,
              project: `Electrify · ${topic.label}`,
              details,
              page: "Electrify Tools contact form",
            }),
          });
          const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
          if (!res.ok || !json.ok) throw new Error(json.error ?? `lead ${res.status}`);
          return Response.json({ ok: true });
        } catch (err) {
          console.error("contact failed", err);
          return Response.json({ ok: false, error: "Couldn't send right now. Try again in a minute." }, { status: 503 });
        }
      },
    },
  },
});
