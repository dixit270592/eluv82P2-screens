import { useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { X, Eye, ChevronDown, Calendar } from "lucide-react";
import type { PunchoutVendor } from "../data/punchoutVendors";
import { UI_FONT_STACK as F } from "../tokens/typography";

/** Punchout PR modal — ~30% narrower than previous 784px */
const MODAL_WIDTH = "549px";
/** Cap height — 5% below 90vh */
const MODAL_MAX_HEIGHT = "85.5vh";

const PR_TYPES = [
  "Standard Purchase Request",
  "Purchase Order",
  "Service Order",
  "Capital Expenditure",
  "Professional Services",
  "Subscription",
  "Maintenance Contract",
] as const;

const DEPARTMENTS = [
  "IT",
  "Finance",
  "Engineering",
  "HR",
  "Marketing",
  "Operations",
  "Procurement",
  "R&D",
  "Sales",
] as const;

const DELIVERY_LOCS = [
  "NY Office, Loading Lock 3",
  "HQ — Floor 3",
  "Chicago Office",
  "LA Office",
  "Address 1",
  "Warehouse A",
  "Remote",
] as const;

const SHIPPING_METHODS = ["UPS", "FedEx", "USPS", "DHL", "Ground"] as const;

function ReqAsterisk() {
  return (
    <span style={{ color: "#F04438", marginLeft: 2 }} aria-hidden>
      *
    </span>
  );
}

const eyeBtnSt: CSSProperties = {
  width: 36,
  height: 36,
  flexShrink: 0,
  border: "1px solid #D0D5DD",
  borderRadius: "5px",
  background: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export interface PunchoutShopPayload {
  vendor: PunchoutVendor;
  description: string;
  recurring: boolean;
  type: string;
  department: string;
  deliveryLocation: string;
  shippingMethod: string;
  requiredBy: string;
}

export interface PunchoutVendorModalProps {
  vendor: PunchoutVendor;
  onClose: () => void;
  /** Primary action — e.g. launch punchout with captured context */
  onShop?: (payload: PunchoutShopPayload) => void;
}

export function PunchoutVendorModal({ vendor, onClose, onShop }: PunchoutVendorModalProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [type, setType] = useState("Standard Purchase Request");
  const [department, setDepartment] = useState("Marketing");
  const [deliveryLocation, setDeliveryLocation] = useState("Address 1");
  const [shippingMethod, setShippingMethod] = useState("UPS");
  const [requiredBy, setRequiredBy] = useState("2026-04-20");

  const vendorDisplay = vendor.cardLabel ?? vendor.name;

  const inp = (id: string): CSSProperties => ({
    width: "100%",
    height: 40,
    border: `1px solid ${focused === id ? "#1FA97A" : "#D0D5DD"}`,
    borderRadius: "5px",
    padding: "0 10px",
    fontSize: "13px",
    color: "#101828",
    fontFamily: F,
    outline: "none",
    background: "#FFFFFF",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  const sel = (id: string): CSSProperties => ({
    ...inp(id),
    appearance: "none",
    paddingRight: 28,
    cursor: "pointer",
  });

  /** Top-aligned labels — same left edge as inputs (avoids floating-label offset vs flex rows). */
  const fieldLabel: CSSProperties = {
    display: "block",
    margin: 0,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#344054",
    fontFamily: F,
    lineHeight: 1.3,
  };

  const handleShop = () => {
    onShop?.({
      vendor,
      description,
      recurring,
      type,
      department,
      deliveryLocation,
      shippingMethod,
      requiredBy,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16,24,40,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 210,
        padding: "20px",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="punchout-pr-modal-title"
        style={{
          width: MODAL_WIDTH,
          maxWidth: "96vw",
          maxHeight: MODAL_MAX_HEIGHT,
          background: "#FFFFFF",
          borderRadius: "8px",
          boxShadow: "0 10px 40px rgba(16,24,40,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px 14px",
            borderBottom: "1px solid #EEF1F5",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2
                id="punchout-pr-modal-title"
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#101828",
                  fontFamily: F,
                }}
              >
                Add Purchase Request
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: "#667085",
                  fontFamily: F,
                }}
              >
                Punchout — vendor is set from your selection.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 28,
                height: 28,
                border: "1px solid #E4E7EC",
                borderRadius: "5px",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={13} color="#667085" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 22px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Description */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-desc" style={fieldLabel}>
              Description
              <ReqAsterisk />
            </label>
            <textarea
              id="punchout-pr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description for this purchase request"
              aria-required
              onFocus={() => setFocused("desc")}
              onBlur={() => setFocused(null)}
              style={{
                width: "100%",
                minHeight: 88,
                border: `1px solid ${focused === "desc" ? "#1FA97A" : "#D0D5DD"}`,
                borderRadius: "5px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "#101828",
                fontFamily: F,
                outline: "none",
                resize: "none",
                lineHeight: 1.5,
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Recurring */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: "13px",
              color: "#344054",
              fontFamily: F,
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#1FA97A", cursor: "pointer" }}
            />
            Recurring
          </label>

          {/* Type */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-type" style={fieldLabel}>
              Type
              <ReqAsterisk />
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="punchout-pr-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                onFocus={() => setFocused("type")}
                onBlur={() => setFocused(null)}
                aria-required
                style={{ ...sel("type"), height: 40 }}
              >
                {PR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="#98A2B3"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Select Vendor — locked to punchout vendor */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-vendor" style={fieldLabel}>
              Select Vendor
              <ReqAsterisk />
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <select
                  id="punchout-pr-vendor"
                  value={vendorDisplay}
                  disabled
                  aria-readonly
                  style={{
                    ...sel("vendor"),
                    height: 40,
                    color: "#98A2B3",
                    background: "#F9FAFB",
                    cursor: "not-allowed",
                    opacity: 1,
                  }}
                >
                  <option value={vendorDisplay}>{vendorDisplay}</option>
                </select>
                <ChevronDown
                  size={12}
                  color="#98A2B3"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <button type="button" style={eyeBtnSt} aria-label="View vendor details">
                <Eye size={13} color="#98A2B3" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Department */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-dept" style={fieldLabel}>
              Department/Location
              <ReqAsterisk />
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="punchout-pr-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                onFocus={() => setFocused("dept")}
                onBlur={() => setFocused(null)}
                aria-required
                style={{ ...sel("dept"), height: 40 }}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="#98A2B3"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Delivery Location */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-dloc" style={fieldLabel}>
              Delivery Location
              <ReqAsterisk />
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <select
                  id="punchout-pr-dloc"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  onFocus={() => setFocused("dloc")}
                  onBlur={() => setFocused(null)}
                  aria-required
                  style={{ ...sel("dloc"), height: 40 }}
                >
                  {DELIVERY_LOCS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  color="#98A2B3"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <button type="button" style={eyeBtnSt} aria-label="View delivery location details">
                <Eye size={13} color="#98A2B3" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Shipping Method */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-ship" style={fieldLabel}>
              Shipping Method
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="punchout-pr-ship"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                onFocus={() => setFocused("ship")}
                onBlur={() => setFocused(null)}
                style={{ ...sel("ship"), height: 40 }}
              >
                {SHIPPING_METHODS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="#98A2B3"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Required By */}
          <div style={{ width: "100%" }}>
            <label htmlFor="punchout-pr-reqby" style={fieldLabel}>
              Required By
              <ReqAsterisk />
            </label>
            <div style={{ position: "relative" }}>
              <Calendar
                size={14}
                color="#98A2B3"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
                aria-hidden
              />
              <input
                id="punchout-pr-reqby"
                type="date"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                onFocus={() => setFocused("reqby")}
                onBlur={() => setFocused(null)}
                aria-required
                style={{
                  ...inp("reqby"),
                  height: 40,
                  paddingRight: 36,
                  colorScheme: "light",
                }}
              />
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#667085",
              fontFamily: F,
              lineHeight: 1.5,
            }}
          >
            You will be redirected to the vendor&apos;s site to shop. Your cart can return here to
            complete the purchase request when you are done.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 22px",
            borderTop: "1px solid #EEF1F5",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            background: "#FAFAFA",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 16px",
              borderRadius: "6px",
              border: "1px solid #D0D5DD",
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "#344054",
              fontFamily: F,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShop}
            style={{
              padding: "9px 18px",
              borderRadius: "6px",
              border: "none",
              background: "#1FA97A",
              fontSize: "13px",
              fontWeight: 600,
              color: "#FFFFFF",
              fontFamily: F,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.06)",
            }}
          >
            Shop
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
