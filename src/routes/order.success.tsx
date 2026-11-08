import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/config/products";
import { getCheckoutSession } from "@/server/stripe";

const loadOrder = createServerFn({ method: "GET" })
  .inputValidator((id: string) => {
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) throw new Error("Bad session id");
    return id;
  })
  .handler(async ({ data: id }) => {
    const s = await getCheckoutSession(id);
    return {
      paid: s.payment_status === "paid",
      email: s.customer_details?.email ?? null,
      name: s.customer_details?.name ?? null,
      total: s.amount_total,
      items: s.line_items?.data.map((l) => ({ description: l.description, quantity: l.quantity })) ?? [],
      ref: s.id.slice(-8).toUpperCase(),
    };
  });

export const Route = createFileRoute("/order/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : "",
  }),
  loaderDeps: ({ search }) => ({ id: search.session_id }),
  loader: async ({ deps }) => (deps.id ? loadOrder({ data: deps.id }).catch(() => null) : null),
  head: () => ({ meta: [{ title: "Order confirmed | Electrify Tools" }, { name: "robots", content: "noindex" }] }),
  component: Success,
});

function Success() {
  const order = Route.useLoaderData();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="glass w-full max-w-lg rounded-3xl p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        {order?.paid ? (
          <>
            <h1 className="mt-6 text-4xl font-bold">You're in the next batch.</h1>
            <p className="mt-4 text-muted-foreground">
              Thanks{order.name ? `, ${order.name.split(" ")[0]}` : ""}. A receipt is on its way to{" "}
              <span className="text-foreground">{order.email}</span>. We'll email tracking when your Dial ships.
            </p>
            <ul className="mt-8 space-y-2 font-mono text-sm">
              {order.items.map((i) => (
                <li key={i.description}>
                  {i.quantity} × {i.description}
                </li>
              ))}
            </ul>
            {order.total != null && <p className="mt-4 font-display text-3xl font-bold">{formatPrice(order.total)}</p>}
            <p className="mt-2 font-mono text-xs text-muted-foreground">Order ref {order.ref}</p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-3xl font-bold">We couldn't find that order.</h1>
            <p className="mt-4 text-muted-foreground">If you were charged, your Stripe receipt email has the details.</p>
          </>
        )}
        <Link to="/" className="bg-ember mt-10 inline-block rounded-full px-8 py-3 font-bold text-primary-foreground">
          Back to Electrify
        </Link>
      </div>
    </div>
  );
}
