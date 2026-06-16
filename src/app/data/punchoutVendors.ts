/**
 * Punchout vendor catalog — replace with API response shape when backend is ready.
 * Example: const res = await fetch('/api/punchout/vendors'); return res.json();
 */

import { PUNCHOUT_VENDOR_LOGOS } from "../../assets/punchout";

export interface PunchoutVendor {
  id: string;
  /** Display name in modal header and card */
  name: string;
  /** Shown under logo on card; falls back to `name` */
  cardLabel?: string;
  /** Bundled logo image URL */
  logoUrl?: string | null;
  /** Used for accessible text and initials fallback */
  initials?: string;
  /** Brand accent for avatar ring / initials */
  accent?: string;
  /** How the logo fills the avatar circle */
  logoFit?: "contain" | "cover";
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
    logoUrl: PUNCHOUT_VENDOR_LOGOS.amazon,
    initials: "AB",
    accent: "#FF9900",
    logoFit: "contain",
    summary:
      "Shop your approved Amazon Business catalog. Items and pricing follow your organization's punchout agreement.",
    punchoutUrl: "#punchout-amazon",
  },
  {
    id: "grainger",
    name: "Grainger",
    logoUrl: PUNCHOUT_VENDOR_LOGOS.grainger,
    initials: "G",
    accent: "#C8102E",
    logoFit: "cover",
    summary:
      "Browse Grainger industrial supply through punchout. Your cart will return to this application for approval.",
    punchoutUrl: "#punchout-grainger",
  },
  {
    id: "staples-advantage",
    name: "Staples Advantage",
    cardLabel: "Staples",
    logoUrl: PUNCHOUT_VENDOR_LOGOS.staples,
    initials: "SA",
    accent: "#CC0000",
    logoFit: "cover",
    summary:
      "Order office supplies via Staples Advantage punchout with contracted pricing.",
    punchoutUrl: "#punchout-staples",
  },
  {
    id: "cdw",
    name: "CDW",
    logoUrl: PUNCHOUT_VENDOR_LOGOS.cdw,
    initials: "CDW",
    accent: "#CC0000",
    logoFit: "cover",
    summary:
      "IT products and services through CDW punchout; session returns for requisition completion.",
    punchoutUrl: "#punchout-cdw",
  },
  {
    id: "office-depot",
    name: "Office Depot",
    cardLabel: "Office Depot",
    logoUrl: PUNCHOUT_VENDOR_LOGOS["office-depot"],
    initials: "OD",
    accent: "#E31837",
    logoFit: "contain",
    summary:
      "Office supplies and furniture via Office Depot Business punchout.",
    punchoutUrl: "#punchout-office-depot",
  },
];

export async function fetchPunchoutVendors(): Promise<PunchoutVendor[]> {
  // Swap for: return (await fetch('/api/punchout/vendors')).json()
  return Promise.resolve([...PUNCHOUT_VENDORS]);
}
