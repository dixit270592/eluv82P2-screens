import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, Package } from 'lucide-react';
import {
  INVENTORY_CATALOG,
  filterInventoryCatalog,
  type InventoryCatalogItem,
} from '../../data/inventoryCatalog';
import { P2P_BRAND } from '../../tokens/brand';
import { formatLineItemCurrency } from './lineItemCurrency';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type SelectItemModalProps = {
  open: boolean;
  openedAt?: number;
  onClose: () => void;
  onConfirm: (item: InventoryCatalogItem) => void;
};

const BACKDROP_CLOSE_GUARD_MS = 350;

function CatalogItemThumbnail({ item }: { item: InventoryCatalogItem }) {
  const [failed, setFailed] = useState(false);
  const src = item.imageUrl;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 3',
        background: 'linear-gradient(180deg, #EEF4FF 0%, #F9FAFB 100%)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Package size={36} color="#98A2B3" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

export function SelectItemModal({ open, openedAt, onClose, onConfirm }: SelectItemModalProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <SelectItemModalContent openedAt={openedAt} onClose={onClose} onConfirm={onConfirm} />,
    document.body,
  );
}

function SelectItemModalContent({ openedAt, onClose, onConfirm }: Omit<SelectItemModalProps, 'open'>) {
  const [keyword, setKeyword] = useState('');
  const [vendor, setVendor] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedVendor, setAppliedVendor] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(openedAt ?? Date.now());

  const filtered = useMemo(
    () => filterInventoryCatalog(INVENTORY_CATALOG, appliedKeyword, appliedVendor),
    [appliedKeyword, appliedVendor],
  );

  const selectedItem = filtered.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    openedAtRef.current = openedAt ?? Date.now();
  }, [openedAt]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Enter' && selectedItem && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        onConfirm(selectedItem);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onConfirm, selectedItem]);

  const runSearch = () => {
    setAppliedKeyword(keyword);
    setAppliedVendor(vendor);
    setSelectedId((prev) => {
      if (!prev) return null;
      const stillVisible = filterInventoryCatalog(INVENTORY_CATALOG, keyword, vendor).some(
        (i) => i.id === prev,
      );
      return stillVisible ? prev : null;
    });
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    onConfirm(selectedItem);
  };

  const handleCardClick = (item: InventoryCatalogItem) => {
    setSelectedId(item.id);
  };

  const handleCardDoubleClick = (item: InventoryCatalogItem) => {
    setSelectedId(item.id);
    onConfirm(item);
  };

  const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (Date.now() - openedAtRef.current < BACKDROP_CLOSE_GUARD_MS) return;
    onClose();
  };

  return (
    <div
      data-inventory-select-modal
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(16, 24, 40, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onPointerDown={handleBackdropPointerDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-item-title"
        style={{
          width: 'min(960px, calc(100vw - 48px))',
          maxHeight: 'min(88vh, 820px)',
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E4E7EC',
          boxShadow: '0 20px 48px rgba(16, 24, 40, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid #EEF1F5',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <h2
            id="select-item-title"
            style={{
              margin: 0,
              flex: 1,
              fontSize: '17px',
              fontWeight: 700,
              color: '#101828',
              fontFamily: F,
              letterSpacing: '-0.02em',
            }}
          >
            Select Item
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '8px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#F2F4F7';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <X size={18} color="#667085" strokeWidth={2} />
          </button>
        </div>

        {/* Search bar */}
        <div
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid #EEF1F5',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            flexShrink: 0,
            background: '#FAFBFC',
          }}
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="ID, Name or Keyword"
            aria-label="Search by ID, name or keyword"
            style={searchInputStyle}
          />
          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Vendor Name"
            aria-label="Search by vendor name"
            style={{ ...searchInputStyle, flex: '1 1 180px', maxWidth: '240px' }}
          />
          <button type="button" onClick={runSearch} style={searchBtnStyle} aria-label="Search items">
            <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
          </button>
        </div>

        {/* Grid */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#98A2B3',
                fontFamily: F,
                fontSize: '14px',
              }}
            >
              No items match your search. Try different keywords or clear filters.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '14px',
              }}
            >
              {filtered.map((item) => {
                const isSelected = selectedId === item.id;
                const isHovered = hoveredId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    onDoubleClick={() => handleCardDoubleClick(item)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-pressed={isSelected}
                    aria-label={`${item.name}, vendor ${item.vendor}, price ${formatLineItemCurrency(item.vendorPrice)}${isSelected ? ', selected' : ''}`}
                    style={{
                      position: 'relative',
                      textAlign: 'left',
                      padding: 0,
                      border: `2px solid ${
                        isSelected ? P2P_BRAND.primary : isHovered ? '#98A2B3' : '#E4E7EC'
                      }`,
                      borderRadius: '10px',
                      background: isSelected ? P2P_BRAND.surface : '#FFFFFF',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: isSelected
                        ? `0 0 0 3px ${P2P_BRAND.surfaceBorder}50`
                        : isHovered
                          ? '0 4px 12px rgba(16,24,40,0.08)'
                          : '0 1px 2px rgba(16,24,40,0.04)',
                      transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '999px',
                          background: P2P_BRAND.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          boxShadow: '0 2px 6px rgba(16,24,40,0.12)',
                        }}
                      >
                        <Check size={14} color="#FFFFFF" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                    <CatalogItemThumbnail item={item} />
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#101828',
                          fontFamily: F,
                          marginBottom: '6px',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={metaRowStyle}>
                        <span style={metaLabelStyle}>Item Id</span>
                        <span style={metaValueStyle}>{item.itemId}</span>
                      </div>
                      <div style={metaRowStyle}>
                        <span style={metaLabelStyle}>Vendor</span>
                        <span style={metaValueStyle}>{item.vendor}</span>
                      </div>
                      <div style={metaRowStyle}>
                        <span style={metaLabelStyle}>Part #</span>
                        <span style={metaValueStyle}>{item.partNumber}</span>
                      </div>
                      <div style={metaRowStyle}>
                        <span style={metaLabelStyle}>Vendor Price</span>
                        <span
                          style={{
                            ...metaValueStyle,
                            color: P2P_BRAND.primaryStrong,
                            fontWeight: 700,
                          }}
                        >
                          {formatLineItemCurrency(item.vendorPrice)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#667085',
                          fontFamily: F,
                          marginTop: '6px',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #EEF1F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
            background: '#FAFBFC',
          }}
        >
          <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
            {selectedItem
              ? `Selected: ${selectedItem.name}`
              : 'Click an item to select, then confirm — or double-click to add immediately'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedItem}
              style={{
                ...confirmBtnStyle,
                opacity: selectedItem ? 1 : 0.5,
                cursor: selectedItem ? 'pointer' : 'not-allowed',
              }}
            >
              Confirm selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const searchInputStyle: React.CSSProperties = {
  flex: '2 1 220px',
  height: '38px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '13px',
  color: '#101828',
  fontFamily: F,
  background: '#FFFFFF',
  outline: 'none',
  minWidth: 0,
};

const searchBtnStyle: React.CSSProperties = {
  width: '42px',
  height: '38px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  fontSize: '11px',
  fontFamily: F,
  marginBottom: '2px',
};

const metaLabelStyle: React.CSSProperties = {
  color: '#98A2B3',
  flexShrink: 0,
};

const metaValueStyle: React.CSSProperties = {
  color: '#344054',
  textAlign: 'right',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const cancelBtnStyle: React.CSSProperties = {
  height: '36px',
  padding: '0 14px',
  background: '#FFFFFF',
  border: '1.5px solid #D0D5DD',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#344054',
  fontFamily: F,
  cursor: 'pointer',
};

const confirmBtnStyle: React.CSSProperties = {
  height: '36px',
  padding: '0 16px',
  background: P2P_BRAND.primary,
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#FFFFFF',
  fontFamily: F,
};
