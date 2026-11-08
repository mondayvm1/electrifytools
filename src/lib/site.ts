// Absolute URLs for share previews (iMessage, WhatsApp, X, Facebook need full URLs).
// __PUBLIC_ORIGIN__ comes from the PUBLIC_ORIGIN env var at build time (empty locally).
declare const __PUBLIC_ORIGIN__: string;

const base = import.meta.env.BASE_URL; // "/electrify-tools/" in production, "/" locally
export const SITE_URL = `${__PUBLIC_ORIGIN__}${base}`;
export const asset = (file: string) => `${base}${file}`;
export const absoluteAsset = (file: string) => `${SITE_URL}${file}`;

export const SHARE_IMAGE = {
  url: absoluteAsset("electrify-share.png"),
  width: "1200",
  height: "630",
  alt: "The Electrify Dial 2.0 showing an Electrify Score of 87, with pack voltage, bricks mapped and 20+ performance indicators.",
};
