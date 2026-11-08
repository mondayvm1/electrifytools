// Single source of truth for what the shop sells. The checkout API reads prices
// from here, so a tampered browser request can't change what a customer pays.
export type Product = {
  id: string;
  name: string;
  tag: string;
  priceCents: number;
  description: string;
  items: string[];
  cta: string;
  highlight: boolean;
  maxQuantity: number;
};

export const PRODUCTS: Product[] = [
  {
    id: "dial",
    name: "Electrify Dial",
    tag: "For owners",
    priceCents: 35000,
    description: "The Dial + harness for your model, phone app, 20+ performance indicators and free updates.",
    items: ["The Dial + harness for your model", "Phone app & 20+ performance indicators", "Electrify Score & badges", "Free software updates"],
    cta: "Buy the Dial",
    highlight: false,
    maxQuantity: 5,
  },
  {
    id: "trade",
    name: "Electrify Dial Trade",
    tag: "For shops & techs",
    priceCents: 200000,
    description: "Full plug kit for Model S, 3, X, Y with unlimited vehicles and inspection PDFs.",
    items: ["Everything in Dial", "Full plug kit — Model S, 3, X, Y", "Unlimited vehicles & inspection PDFs", "Priority support · volume deals"],
    cta: "Buy Trade kit",
    highlight: true,
    maxQuantity: 10,
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const formatPrice = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: cents % 100 ? 2 : 0 })}`;
