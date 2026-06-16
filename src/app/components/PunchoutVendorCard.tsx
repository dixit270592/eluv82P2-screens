import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { UI_FONT_STACK as F } from "../tokens/typography";

export interface PunchoutVendorCardProps {
  name: string;
  cardLabel?: string;
  logoUrl?: string | null;
  initials?: string;
  accent?: string;
  /** How the logo fills the avatar circle */
  logoFit?: "contain" | "cover";
  /** When true, row reflects open modal / current selection */
  active?: boolean;
  /** Omit bottom divider on the last row */
  isLast?: boolean;
  onClick: () => void;
}

function initialsFromName(name: string, explicit?: string): string {
  if (explicit?.trim()) return explicit.trim().slice(0, 3).toUpperCase();
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function PunchoutVendorCard({
  name,
  cardLabel,
  logoUrl,
  initials,
  accent = "#1FA97A",
  logoFit = "cover",
  active = false,
  isLast = false,
  onClick,
}: PunchoutVendorCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [hover, setHover] = useState(false);
  const label = cardLabel ?? name;
  const showImg = Boolean(logoUrl) && !imgErr;

  const bg = active
    ? hover
      ? "#E8F7F1"
      : "#ECFDF5"
    : hover
      ? "#F8FAFC"
      : "#FFFFFF";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open punchout for ${name}`}
      aria-current={active ? "true" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        width: "100%",
        margin: 0,
        padding: "7px 14px",
        minHeight: 40,
        boxSizing: "border-box",
        border: "none",
        borderBottom: isLast ? "none" : "1px solid #EEF0F4",
        borderRadius: 0,
        background: bg,
        cursor: "pointer",
        fontFamily: F,
        textAlign: "left",
        transition: "background 0.12s ease",
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = "2px solid #1FA97A";
        e.currentTarget.style.outlineOffset = "-2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
    >
      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: showImg && logoFit === "cover" ? "none" : `1px solid ${accent}33`,
          background: showImg && logoFit === "cover" ? "transparent" : "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {showImg ? (
          <img
            src={logoUrl!}
            alt=""
            style={{
              width: logoFit === "cover" ? "100%" : "78%",
              height: logoFit === "cover" ? "100%" : "78%",
              objectFit: logoFit,
              display: "block",
            }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: accent,
              letterSpacing: "-0.02em",
            }}
          >
            {initialsFromName(name, initials)}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#344054",
          lineHeight: 1.3,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <ChevronRight
        size={16}
        color="#98A2B3"
        strokeWidth={2}
        aria-hidden
        style={{ flexShrink: 0 }}
      />
    </button>
  );
}
