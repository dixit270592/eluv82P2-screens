/**
 * Punchout vendor catalog — replace with API response shape when backend is ready.
 * Example: const res = await fetch('/api/punchout/vendors'); return res.json();
 */

export interface PunchoutVendor {
  id: string;
  /** Display name in modal header and card */
  name: string;
  /** Shown under logo on card; falls back to `name` */
  cardLabel?: string;
  /** Optional logo image URL from your CDN or vendor */
  logoUrl?: string | null;
  /** Used for accessible text and initials fallback */
  initials?: string;
  /** Short body copy for the punchout modal */
  summary?: string;
  /** Optional deep link or punchout launch URL (wired when integration exists) */
  punchoutUrl?: string;
}

export const PUNCHOUT_VENDORS: PunchoutVendor[] = [
  {
    id: "amazon-business",
    name: "Amazon Business",
    cardLabel: "Amazon",
    logoUrl: "https://logo.clearbit.com/amazon.com",
    initials: "AB",
    summary:
      "Shop your approved Amazon Business catalog. Items and pricing follow your organization's punchout agreement.",
    punchoutUrl: "#punchout-amazon",
  },
  {
    id: "grainger",
    name: "Grainger",
    logoUrl: "https://logo.clearbit.com/grainger.com",
    initials: "G",
    summary:
      "Browse Grainger industrial supply through punchout. Your cart will return to this application for approval.",
    punchoutUrl: "#punchout-grainger",
  },
  {
    id: "staples-advantage",
    name: "Staples Advantage",
    cardLabel: "Staples",
    logoUrl: "https://logo.clearbit.com/staples.com",
    initials: "SA",
    summary:
      "Order office supplies via Staples Advantage punchout with contracted pricing.",
    punchoutUrl: "#punchout-staples",
  },
  {
    id: "cdw",
    name: "CDW",
    logoUrl: "https://logo.clearbit.com/cdw.com",
    initials: "CDW",
    summary:
      "IT products and services through CDW punchout; session returns for requisition completion.",
    punchoutUrl: "#punchout-cdw",
  },
  {
    id: "office-depot",
    name: "Office Depot",
    cardLabel: "Office Depot",
    logoUrl: "https://logo.clearbit.com/officedepot.com",
    initials: "OD",
    summary:
      "Office supplies and furniture via Office Depot Business punchout.",
    punchoutUrl: "#punchout-office-depot",
  },
];

export async function fetchPunchoutVendors(): Promise<PunchoutVendor[]> {
  // Swap for: return (await fetch('/api/punchout/vendors')).json()
  return Promise.resolve([...PUNCHOUT_VENDORS]);
}
