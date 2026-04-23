import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { PunchoutVendorCard } from "./PunchoutVendorCard";
import {
  PunchoutVendorModal,
  type PunchoutShopPayload,
} from "./PunchoutVendorModal";
import {
  fetchPunchoutVendors,
  type PunchoutVendor,
} from "../data/punchoutVendors";

import { UI_FONT_STACK as F } from "../tokens/typography";

const headerTitle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  color: "#101828",
  fontFamily: F,
  letterSpacing: "-0.01em",
  lineHeight: 1.35,
};

/** Horizontal inset for header, search, and rows — single grid */
const GRID_X = 14;

export function PunchoutVendorPanel() {
  const [vendors, setVendors] = useState<PunchoutVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PunchoutVendor | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPunchoutVendors()
      .then((list) => {
        if (!cancelled) setVendors(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.cardLabel?.toLowerCase().includes(q) ?? false) ||
        v.id.toLowerCase().includes(q),
    );
  }, [vendors, search]);

  const handleShop = useCallback((payload: PunchoutShopPayload) => {
    const url = payload.vendor.punchoutUrl?.trim();
    if (url && /^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <>
      <style>
        {`
          .punchout-vendor-search::placeholder {
            color: #98A2B3;
            opacity: 1;
          }
        `}
      </style>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          background: "#FFFFFF",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: `10px ${GRID_X}px 0`,
            flexShrink: 0,
          }}
        >
          <h3 style={headerTitle}>Punchout Vendors</h3>
        </div>

        {/* Search */}
        <div
          style={{
            padding: `8px ${GRID_X}px 10px`,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color="#98A2B3"
              strokeWidth={2}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              className="punchout-vendor-search"
              type="search"
              placeholder="Search vendors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search vendors"
              style={{
                width: "100%",
                padding: "7px 10px 7px 34px",
                border: "1px solid #E4E7EC",
                borderRadius: 6,
                fontSize: 13,
                fontFamily: F,
                color: "#101828",
                outline: "none",
                boxSizing: "border-box",
                background: "#FFFFFF",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#1FA97A";
                (e.target as HTMLInputElement).style.boxShadow =
                  "0 0 0 3px rgba(31, 169, 122, 0.12)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#E4E7EC";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Vendor list */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {loading && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#667085",
                fontFamily: F,
                textAlign: "center",
                padding: `12px ${GRID_X}px`,
              }}
            >
              Loading vendors…
            </p>
          )}

          {!loading && vendors.length === 0 && (
            <div
              style={{
                padding: `14px ${GRID_X}px`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#667085",
                  fontFamily: F,
                  lineHeight: 1.5,
                }}
              >
                No vendors available
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 12,
                  color: "#98A2B3",
                  fontFamily: F,
                }}
              >
                Check back later or contact your administrator.
              </p>
            </div>
          )}

          {!loading && vendors.length > 0 && filtered.length === 0 && (
            <div
              style={{
                padding: `12px ${GRID_X}px`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#667085",
                  fontFamily: F,
                }}
              >
                No vendors match &quot;{search.trim()}&quot;
              </p>
            </div>
          )}

          {!loading &&
            filtered.map((v, i) => (
              <PunchoutVendorCard
                key={v.id}
                name={v.name}
                cardLabel={v.cardLabel}
                logoUrl={v.logoUrl}
                initials={v.initials}
                active={selected?.id === v.id}
                isLast={i === filtered.length - 1}
                onClick={() => setSelected(v)}
              />
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <PunchoutVendorModal
            key={selected.id}
            vendor={selected}
            onClose={() => setSelected(null)}
            onShop={handleShop}
          />
        )}
      </AnimatePresence>
    </>
  );
}
