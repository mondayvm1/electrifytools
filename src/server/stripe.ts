// Minimal Stripe REST client (fetch only — runs on Node, Vercel or Workers).
const API = "https://api.stripe.com/v1";

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

// Stripe wants form encoding with bracketed keys: line_items[0][price_data][currency]=usd
function encode(params: Record<string, unknown>, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") encode(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe<T>(method: "GET" | "POST", path: string, params?: Record<string, unknown>): Promise<T> {
  const body = params && method === "POST" ? encode(params) : undefined;
  const qs = params && method === "GET" ? `?${encode(params)}` : "";
  const res = await fetch(`${API}${path}${qs}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `Stripe ${res.status}`);
  return json;
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  customer_details: { email: string | null; name: string | null } | null;
  line_items?: { data: { description: string; quantity: number }[] };
};

export const createCheckoutSession = (params: Record<string, unknown>) =>
  stripe<CheckoutSession>("POST", "/checkout/sessions", params);

export const getCheckoutSession = (id: string) =>
  stripe<CheckoutSession>("GET", `/checkout/sessions/${encodeURIComponent(id)}`, {
    expand: { 0: "line_items" },
  });
