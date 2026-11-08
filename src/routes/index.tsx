import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import DialScene from "@/components/dial/DialScene";
import { captureReferral, currentReferral } from "@/lib/referral";
import { SITE_URL } from "@/lib/site";
import { PRODUCTS, formatPrice, type Product } from "@/config/products";
import { Battery, Bluetooth, Gauge, Zap, ShieldCheck, Trophy, Thermometer, Cpu, Plug, Smartphone, FileCheck2, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    links: [{ rel: "canonical", href: SITE_URL }],
    meta: [
      { title: "Electrify Dial 2.0 — Tesla Diagnostics | Electrify Tools" },
      { name: "description", content: "Plug-in dial that reads your Tesla's CAN bus: pack health, 12V, brick voltages, range, faults and your Electrify Score — live on the dial and your phone." },
      { property: "og:title", content: "The Electrify Dial 2.0 — know your Tesla's real health" },
      { property: "og:description", content: "Plugs into your Tesla and reads what the dealer reads: pack health, brick voltages, 12V, range and faults. 20+ performance indicators. $350." },
      { property: "og:type", content: "product" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:title", content: "The Electrify Dial 2.0 — know your Tesla's real health" },
      { name: "twitter:description", content: "Pack health, brick voltages, 12V, range and faults, live on the dial and your phone. $350." },
    ],
  }),
  component: Index,
});

const SCREENS = [
  ["Pack Health", Battery], ["12 Volt", Zap], ["Brick Maps", Cpu], ["Charge Cycles", Activity],
  ["Trip Range", Gauge], ["Speed", Gauge], ["Lifetime", Trophy], ["Faults", ShieldCheck],
  ["Motors", Cpu], ["Thermal", Thermometer], ["Tires", Activity], ["Charge Port", Plug],
  ["Autopilot", Cpu], ["Climate", Thermometer], ["Performance", Zap], ["Charging", Battery],
  ["Inspection", FileCheck2], ["Data Logs", Activity], ["Software", Cpu], ["Mechanic Mode", ShieldCheck],
] as const;

const BADGES = [
  { name: "Speed Demon", desc: "Top 10% average speed. We see you.", tone: "text-primary" },
  { name: "Parking Lot Slug", desc: "Gentle on the pedal, gentle on the pack.", tone: "text-accent" },
  { name: "Supercharger Regular", desc: "Five+ Supercharger stops logged.", tone: "text-primary" },
  { name: "FSD 5K", desc: "5,000 miles on Full Self-Driving.", tone: "text-accent" },
  { name: "Pack Guardian", desc: "Health above 90% after 50K miles.", tone: "text-accent" },
  { name: "Cold Start Hero", desc: "Survived a winter with zero thermal faults.", tone: "text-primary" },
];

const COMPARE = [
  ["Live battery brick map (96 cells)", "✓", "Limited", "—"],
  ["Pack health & degradation report", "✓", "Some models", "—"],
  ["Always-on display in the car", "✓", "—", "—"],
  ["Phone app over Bluetooth", "✓", "Varies", "—"],
  ["Electrify Score & badges", "✓", "—", "—"],
  ["Pre-purchase inspection PDF", "✓", "—", "—"],
  ["Price", "$350", "$1,000+", "~$60"],
] as const;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function BuyButton({ product }: { product: Product }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, ref: currentReferral() }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Checkout is unavailable right now.");
      window.location.assign(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout is unavailable right now.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        className={`mt-10 rounded-full px-8 py-4 text-center font-bold transition-opacity disabled:opacity-60 ${product.highlight ? "bg-ember text-primary-foreground" : "glass"}`}
      >
        {busy ? "Opening secure checkout…" : product.cta}
      </button>
      {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{children}</p>;
}

function Index() {
  useReveal();
  useEffect(captureReferral, []);
  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      <div className="grid-lines pointer-events-none fixed inset-0 z-0 opacity-60" />
      <DialScene />

      <header className="fixed inset-x-0 top-0 z-30">
        <nav className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-6 py-3">
          <span className="font-display text-lg font-bold">Electrify<span className="text-primary">.</span>Tools</span>
          <div className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#screens" className="hover:text-foreground">Screens</a>
            <a href="#score" className="hover:text-foreground">Score</a>
            <a href="#compare" className="hover:text-foreground">Compare</a>
            <a href="#shop" className="hover:text-foreground">Shop</a>
            <a href="#service" className="hover:text-foreground">Service</a>
          </div>
          <a href="#shop" className="bg-ember rounded-full px-5 py-2 text-sm font-bold text-primary-foreground">Buy now</a>
        </nav>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section className="mx-auto flex max-w-6xl px-6 pb-16 md:min-h-screen md:items-center md:pb-0">
          <div className="max-w-xl pt-[50svh] md:pt-24">
            <Eyebrow>Electrify Dial · for Model S / 3 / X / Y</Eyebrow>
            <h1 className="mt-6 text-6xl font-bold leading-[0.95] md:text-8xl">
              The Dial <span className="text-ember">2.0</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A dial that plugs into your Tesla and reads what the dealer reads. Pack health, brick voltages, 12V, range, faults — live, on the dial and on your phone.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href="#shop" className="bg-ember glow-primary rounded-full px-8 py-4 text-center font-bold text-primary-foreground">Get your Dial</a>
              <a href="#screens" className="glass rounded-full px-8 py-4 text-center font-bold">See 20+ performance indicators</a>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 font-mono">
              {[["402.1V", "pack voltage"], ["96", "bricks mapped"], ["20+", "performance indicators"]].map(([v, l]) => (
                <div key={l}><p className="text-teal text-2xl font-bold">{v}</p><p className="text-xs uppercase text-muted-foreground">{l}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="glass overflow-hidden border-x-0 py-5">
          <div className="animate-marquee flex w-max gap-12 whitespace-nowrap font-mono text-sm uppercase tracking-widest text-muted-foreground">
            {[...Array(2)].flatMap((_, k) => SCREENS.map(([n]) => <span key={n + k}>◆ {n}</span>))}
          </div>
        </div>

        {/* WHY */}
        <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-end px-6 py-32">
          <div className="reveal glass max-w-lg rounded-3xl p-10">
            <Eyebrow>Why it's different</Eyebrow>
            <h2 className="mt-4 text-5xl font-bold">One signal sold millions. <span className="text-ember">We read them all.</span></h2>
            <p className="mt-6 text-muted-foreground">
              The other guys intercepted one CAN message and cleared one code. The Dial taps the whole bus — battery management, motors, thermal, charging — and turns it into answers you can actually read.
            </p>
            <ul className="mt-8 space-y-3 font-mono text-sm">
              <li className="flex gap-3"><span className="text-accent">✓</span> Read-only. Never writes to your car.</li>
              <li className="flex gap-3"><span className="text-accent">✓</span> Bluetooth stream to your phone.</li>
              <li className="flex gap-3"><span className="text-accent">✓</span> Logs every frame for later.</li>
            </ul>
          </div>
        </section>

        {/* SCREENS */}
        <section id="screens" className="mx-auto max-w-6xl px-6 py-32">
          <div className="reveal max-w-xl">
            <Eyebrow>The whole scroll</Eyebrow>
            <h2 className="mt-4 text-5xl font-bold md:text-6xl">Most important <span className="text-teal">first.</span></h2>
            <p className="mt-4 text-muted-foreground">Pack health right off the top. Then low voltage, brick maps, charge cycles, range. Then everything else.</p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {SCREENS.map(([name, Icon], i) => (
              <div key={name} className="reveal glass group rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 hover:glow-accent" style={{ animationDelay: `${(i % 4) * 80}ms` }}>
                <Icon className="h-6 w-6 text-accent" />
                <p className="mt-6 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <p className="font-display text-lg font-bold">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BRICK MAP */}
        <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-32">
          <div className="reveal glass max-w-xl rounded-3xl p-10">
            <Eyebrow>Brick map</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold">96 bricks. 16 groups. <span className="text-ember">Spot the weak one.</span></h2>
            <div className="mt-8 grid grid-cols-8 gap-1.5">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className={`h-6 rounded-sm ${i === 42 ? "bg-primary glow-primary" : i % 7 === 0 ? "bg-accent/60" : "bg-accent/25"}`} />
              ))}
            </div>
            <p className="mt-6 font-mono text-sm text-muted-foreground">Min 3.998V · Max 4.021V · Spread 23 mV — group 6 flagged</p>
          </div>
        </section>

        {/* SCORE */}
        <section id="score" className="mx-auto max-w-6xl px-6 py-32">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div className="reveal">
              <Eyebrow>Electrify Score</Eyebrow>
              <h2 className="mt-4 text-5xl font-bold md:text-6xl">"What's your <span className="text-ember">score</span>?"</h2>
              <p className="mt-6 text-muted-foreground">
                Five things the Dial already reads off the CAN bus, rolled into one number from 0 to 100. Teal is great, orange needs a look, red needs a mechanic. Compare with friends. Brag a little.
              </p>
              <div className="mt-8 flex gap-3 font-mono text-xs">
                <span className="rounded-full bg-accent/15 px-4 py-2 text-accent">80–100 · Teal</span>
                <span className="rounded-full bg-primary/15 px-4 py-2 text-primary">50–79 · Orange</span>
                <span className="rounded-full bg-destructive/15 px-4 py-2 text-destructive">0–49 · Red</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {BADGES.map((b) => (
                <div key={b.name} className="reveal glass rounded-2xl p-5">
                  <Trophy className={`h-5 w-5 ${b.tone}`} />
                  <p className="mt-3 font-display font-bold">{b.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="mx-auto max-w-6xl px-6 py-32">
          <div className="reveal text-center"><Eyebrow>Three steps</Eyebrow><h2 className="mt-4 text-5xl font-bold">Plug. Pair. <span className="text-teal">Know.</span></h2></div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[[Plug, "Plug in", "Snaps into the diagnostic harness. No tools, no dealer."], [Bluetooth, "Pair", "Your phone finds “Electrify Dial” and streams read-only."], [Smartphone, "Know", "Every screen big on your phone. Share a PDF in a tap."]].map(([I, t, d], i) => {
              const Icon = I as typeof Plug;
              return (
                <div key={t as string} className="reveal glass rounded-3xl p-8">
                  <p className="text-ember font-mono text-5xl font-bold">0{i + 1}</p>
                  <Icon className="mt-6 h-7 w-7 text-accent" />
                  <h3 className="mt-4 text-2xl font-bold">{t as string}</h3>
                  <p className="mt-2 text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SERVICE */}
        <section id="service" className="mx-auto flex min-h-screen max-w-6xl items-center justify-end px-6 py-32">
          <div className="reveal glass max-w-lg rounded-3xl p-10">
            <Eyebrow>Electrify Pro</Eyebrow>
            <h2 className="mt-4 text-5xl font-bold">Your car, <span className="text-ember">explained.</span></h2>
            <p className="mt-6 text-muted-foreground">
              Send us your data log, or subscribe and let our techs watch your alerts. We tell you exactly what's going on — without being upsold at the service center.
            </p>
            <ul className="mt-8 space-y-4">
              {["Pre-purchase battery inspection report", "Fault alerts decoded in plain English", "Remote check-ins from real mechanics"].map((x) => (
                <li key={x} className="flex items-center gap-3"><FileCheck2 className="h-5 w-5 text-accent" />{x}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* COMPARE */}
        <section id="compare" className="mx-auto max-w-5xl px-6 py-32">
          <div className="reveal text-center">
            <Eyebrow>Head to head</Eyebrow>
            <h2 className="mt-4 text-5xl font-bold md:text-6xl">Built for Tesla. <span className="text-teal">Not bolted on.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Generic shop scanners like Autel were made for gas cars. The Dial speaks Tesla natively.</p>
          </div>
          {/* Phones: one card per feature instead of a 4-column table. */}
          <div className="mt-14 space-y-3 md:hidden">
            {COMPARE.map(([f, a, b, c]) => (
              <div key={f} className="reveal glass rounded-2xl p-5">
                <p className="font-medium">{f}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
                  <div><dt className="uppercase text-primary">Dial</dt><dd className="mt-1 text-base font-bold text-accent">{a}</dd></div>
                  <div><dt className="uppercase text-muted-foreground">Autel-style</dt><dd className="mt-1 text-base text-muted-foreground">{b}</dd></div>
                  <div><dt className="uppercase text-muted-foreground">Code clearer</dt><dd className="mt-1 text-base text-muted-foreground">{c}</dd></div>
                </dl>
              </div>
            ))}
          </div>
          <div className="reveal glass mt-14 hidden overflow-x-auto rounded-3xl md:block">
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border"><th className="p-5">Feature</th><th className="p-5 text-primary">Electrify Dial</th><th className="p-5">Autel-style scanner</th><th className="p-5">OBD code clearer</th></tr>
              </thead>
              <tbody>
                {COMPARE.map(([f, a, b, c]) => (
                  <tr key={f} className="border-b border-border last:border-0">
                    <td className="p-5 font-medium">{f}</td>
                    <td className="p-5 font-mono font-bold text-accent">{a}</td>
                    <td className="p-5 font-mono text-muted-foreground">{b}</td>
                    <td className="p-5 font-mono text-muted-foreground">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="reveal mt-6 text-center font-mono text-xs text-muted-foreground">Gets smarter over time — new screens arrive through free software updates.</p>
        </section>

        {/* SHOP */}
        <section id="shop" className="mx-auto max-w-6xl px-6 py-32">
          <div className="reveal text-center">
            <Eyebrow>Order now · ships as built</Eyebrow>
            <h2 className="mt-4 text-6xl font-bold md:text-7xl">In every <span className="text-ember">Tesla.</span></h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Every Dial is assembled and tested by hand. Order today and you're in the next batch.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {PRODUCTS.map((p) => (
              <div key={p.id} className={`reveal glass flex flex-col rounded-3xl p-10 ${p.highlight ? "glow-primary border-primary/50" : ""}`}>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{p.tag}</p>
                <h3 className="mt-3 text-3xl font-bold">{p.name}</h3>
                <p className="mt-6 font-display text-6xl font-bold">{formatPrice(p.priceCents)}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.items.map((i) => <li key={i} className="flex gap-3"><span className="text-accent">✓</span>{i}</li>)}
                </ul>
                <BuyButton product={p} />
                {p.highlight && <p className="mt-3 text-center text-xs text-muted-foreground">Running a fleet or multiple bays? <Link to="/contact" search={{ topic: "fleet" }} className="underline hover:text-foreground">Ask us about pricing.</Link></p>}
              </div>
            ))}
          </div>
        </section>

        {/* AFFILIATE + HIRING */}
        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-2">
          <div className="reveal glass rounded-3xl p-10">
            <Eyebrow>Affiliate program</Eyebrow>
            <h3 className="mt-3 text-3xl font-bold">Got a Tesla audience? <span className="text-ember">Get paid.</span></h3>
            <p className="mt-4 text-muted-foreground">Creators, clubs and shops earn on every Dial sold through their link.</p>
            <Link to="/contact" search={{ topic: "affiliate" }} className="glass mt-8 inline-block rounded-full px-6 py-3 font-bold">Become an affiliate</Link>
          </div>
          <div className="reveal glass rounded-3xl p-10">
            <Eyebrow>We're hiring</Eyebrow>
            <h3 className="mt-3 text-3xl font-bold">EV techs, firmware, <span className="text-teal">hustlers.</span></h3>
            <p className="mt-4 text-muted-foreground">Know Teslas inside out? Tell us what you'd build. We're always looking.</p>
            <Link to="/contact" search={{ topic: "hiring" }} className="glass mt-8 inline-block rounded-full px-6 py-3 font-bold">Send us a message</Link>
          </div>
        </section>

        <footer className="border-t border-border py-10 text-center font-mono text-xs text-muted-foreground">
          © 2026 Electrify Tools · Not affiliated with Tesla, Inc.
        </footer>
      </main>
    </div>
  );
}
