// Monthly affiliate payout report: paid orders grouped by referral (?ref=) with commission owed.
// Usage: node --env-file=.env.local scripts/affiliate-report.mjs [YYYY-MM] [rate]
//   e.g. node --env-file=.env.local scripts/affiliate-report.mjs 2026-11 0.20
const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

const month = process.argv[2] ?? new Date().toISOString().slice(0, 7);
const rate = Number(process.argv[3] ?? 0.2);
const [y, m] = month.split("-").map(Number);
const from = Date.UTC(y, m - 1, 1) / 1000;
const to = Date.UTC(y, m, 1) / 1000;

const sessions = [];
let after;
do {
  const qs = new URLSearchParams({ limit: "100", "created[gte]": from, "created[lt]": to, status: "complete" });
  if (after) qs.set("starting_after", after);
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions?${qs}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const page = await res.json();
  if (!res.ok) throw new Error(page.error?.message ?? res.status);
  sessions.push(...page.data);
  after = page.has_more ? page.data.at(-1).id : undefined;
} while (after);

const byRef = new Map();
for (const s of sessions) {
  if (s.payment_status !== "paid") continue;
  const ref = s.metadata?.ref ?? "(no affiliate)";
  const row = byRef.get(ref) ?? { orders: 0, cents: 0 };
  row.orders += 1;
  row.cents += s.amount_total ?? 0;
  byRef.set(ref, row);
}

const usd = (c) => `$${(c / 100).toFixed(2)}`;
console.log(`Affiliate report ${month} (${key.startsWith("sk_live") ? "LIVE" : "TEST"} mode, ${rate * 100}% commission)\n`);
console.log("affiliate".padEnd(20), "orders".padStart(6), "sales".padStart(12), "owed".padStart(12));
for (const [ref, r] of [...byRef].sort((a, b) => b[1].cents - a[1].cents)) {
  const owed = ref === "(no affiliate)" ? "" : usd(Math.round(r.cents * rate));
  console.log(ref.padEnd(20), String(r.orders).padStart(6), usd(r.cents).padStart(12), owed.padStart(12));
}
if (!byRef.size) console.log("No paid orders this month.");
console.log("\nRefunds aren't subtracted; check the Stripe dashboard before paying out.");
