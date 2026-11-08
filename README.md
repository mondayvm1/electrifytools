# Electrify Tools

Marketing + storefront site for the Electrify Dial 2.0 (Tesla CAN-bus diagnostics).

Stack: TanStack Start (React 19, Vite, Tailwind 4), Stripe Checkout, deployed on Vercel.

## Local

```sh
npx -y bun@1.3.5 install
cp .env.example .env.local   # add your Stripe secret key
npx -y bun@1.3.5 run dev
```

## Payments

- Products and prices live in `src/config/products.ts` — the server reads prices from there, never from the browser.
- `POST /api/checkout` creates a Stripe Checkout Session (shipping address + phone collected, promo codes allowed).
- `/order/success` confirms the order after Stripe redirects back.
- Orders, receipts and refunds are handled in the Stripe dashboard.

Env vars: `STRIPE_SECRET_KEY` (required), `PUBLIC_ORIGIN` (optional; the site's public URL when it sits behind a proxy).
