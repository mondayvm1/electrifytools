import { createFileRoute } from "@tanstack/react-router";
import { getProduct } from "@/config/products";
import { createCheckoutSession } from "@/server/stripe";
import { REF_PATTERN } from "@/lib/referral";

// Public site root, including the path prefix when served under the main domain.
function publicOrigin(request: Request) {
  const origin = (process.env.PUBLIC_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  return origin + import.meta.env.BASE_URL.replace(/\/$/, "");
}

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let productId: unknown;
        let rawRef: unknown;
        try {
          ({ productId, ref: rawRef } = (await request.json()) as { productId?: unknown; ref?: unknown });
        } catch {
          return Response.json({ error: "Bad request" }, { status: 400 });
        }
        const product = typeof productId === "string" ? getProduct(productId) : undefined;
        if (!product) return Response.json({ error: "Unknown product" }, { status: 400 });

        // Affiliate who referred this buyer (?ref= link). Tags the order; never changes the price.
        const ref = typeof rawRef === "string" && REF_PATTERN.test(rawRef) ? rawRef : undefined;
        const metadata = { product_id: product.id, ...(ref ? { ref } : {}) };

        const origin = publicOrigin(request);
        try {
          const session = await createCheckoutSession({
            mode: "payment",
            line_items: {
              0: {
                quantity: 1,
                adjustable_quantity: { enabled: true, minimum: 1, maximum: product.maxQuantity },
                price_data: {
                  currency: "usd",
                  unit_amount: product.priceCents,
                  product_data: { name: product.name, description: product.description },
                },
              },
            },
            shipping_address_collection: { allowed_countries: { 0: "US", 1: "CA" } },
            phone_number_collection: { enabled: true },
            allow_promotion_codes: true,
            // Checkout shows the brand, not the Stripe account's name.
            branding_settings: { display_name: "Electrify Tools", button_color: "#ff7a1a" },
            metadata,
            payment_intent_data: { metadata },
            ...(ref ? { client_reference_id: ref } : {}),
            success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/#shop`,
          });
          return Response.json({ url: session.url });
        } catch (err) {
          console.error("checkout failed", err);
          return Response.json({ error: "Checkout is unavailable right now." }, { status: 503 });
        }
      },
    },
  },
});
