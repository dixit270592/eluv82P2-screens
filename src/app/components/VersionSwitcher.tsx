import { motion, AnimatePresence } from 'motion/react';
import { useVersion, Version } from '../context/VersionContext';

import { UI_FONT_STACK as F } from '../tokens/typography';

export function VersionSwitcher() {
  const { version, setVersion } = useVersion();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {/* Label */}
      

      {/* Toggle pill */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          background: '#FFFFFF',
          borderRadius: '9px',
          padding: '3px',
          gap: '2px',
          boxShadow: '0 1px 6px rgba(16,24,40,0.10), 0 0 0 1px #E4E7EC',
          border: '1px solid #E4E7EC',
          pointerEvents: 'all',
        }}
      >
        {(['v1', 'v2'] as Version[]).map((v) => {
          const active = version === v;
          return (
            <button
              key={v}
              onClick={() => setVersion(v)}
              style={{
                position: 'relative',
                width: '48px',
                height: '30px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'transparent',
                padding: 0,
                zIndex: 1,
                outline: 'none',
              }}
              title={v === 'v1' ? 'Version 1 — Classic UI' : 'Version 2 — Redesigned UI'}
            >
              {/* Active pill bg */}
              {active && (
                <motion.div
                  layoutId="activeVersionPill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '6px',
                    background: '#F0FDF9',
                    boxShadow: '0 1px 3px rgba(31,169,122,0.15)',
                    border: '1px solid #BBF7E0',
                  }}
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                />
              )}

              <span
                style={{
                  position: 'relative',
                  fontSize: '12px',
                  fontWeight: active ? 700 : 500,
                  fontFamily: F,
                  color: active ? '#1FA97A' : '#98A2B3',
                  letterSpacing: '0.02px',
                  transition: 'color 0.2s',
                  textTransform: 'uppercase',
                }}
              >
                {v}
              </span>
            </button>
          );
        })}
      </div>

      {/* Version label badge */}
      <AnimatePresence mode="wait">
        
      </AnimatePresence>
    </div>
  );
}