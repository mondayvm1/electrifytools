// Affiliate referral links: ?ref=<name> on any page. The last link clicked wins and is
// remembered for REF_DAYS, then sent with checkout so the Stripe order is tagged with it.
const KEY = "electrify_ref";
const REF_DAYS = 60;
export const REF_PATTERN = /^[a-z0-9_-]{1,32}$/;

export function captureReferral() {
  try {
    const ref = new URLSearchParams(window.location.search).get("ref")?.trim().toLowerCase();
    if (ref && REF_PATTERN.test(ref)) {
      localStorage.setItem(KEY, JSON.stringify({ ref, at: Date.now() }));
    }
  } catch {
    // Storage blocked (private mode etc.): the sale just won't be attributed.
  }
}

export function currentReferral(): string | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as { ref?: string; at?: number } | null;
    if (!saved?.ref || !saved.at) return undefined;
    if (Date.now() - saved.at > REF_DAYS * 86_400_000) {
      localStorage.removeItem(KEY);
      return undefined;
    }
    return REF_PATTERN.test(saved.ref) ? saved.ref : undefined;
  } catch {
    return undefined;
  }
}
