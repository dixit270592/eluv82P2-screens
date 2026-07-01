import type { CSSProperties, ReactNode } from 'react';

import { P2P_BRAND } from '../../../tokens/brand';

import { importWizardFont } from './importWizardStyles';



type ImportSectionProps = {

  id: string;

  title: string;

  subtitle?: string;

  status?: 'idle' | 'active' | 'complete' | 'attention';

  children: ReactNode;

  showDivider?: boolean;

  dense?: boolean;

};



const statusDot: Record<NonNullable<ImportSectionProps['status']>, CSSProperties> = {

  idle: { background: '#E4E7EC' },

  active: { background: P2P_BRAND.primary, boxShadow: `0 0 0 3px ${P2P_BRAND.surface}` },

  complete: { background: P2P_BRAND.primary },

  attention: { background: '#F79009', boxShadow: '0 0 0 3px #FFFAF5' },

};



export function ImportSection({

  id,

  title,

  subtitle,

  status = 'idle',

  children,

  showDivider = false,

  dense = false,

}: ImportSectionProps) {

  const headerId = `${id}-header`;



  return (

    <section

      aria-labelledby={headerId}

      style={{

        fontFamily: importWizardFont,

        paddingTop: showDivider ? (dense ? '16px' : '32px') : 0,

        borderTop: showDivider ? '1px solid #EEF1F5' : 'none',

      }}

    >

      <div

        style={{

          display: 'flex',

          alignItems: 'flex-start',

          gap: '10px',

          marginBottom: dense ? '8px' : '12px',

        }}

      >

        <span

          aria-hidden

          style={{

            width: '8px',

            height: '8px',

            borderRadius: '50%',

            flexShrink: 0,

            marginTop: '4px',

            ...statusDot[status],

          }}

        />

        <div style={{ flex: 1, minWidth: 0 }}>

          <h3

            id={headerId}

            style={{

              margin: 0,

              fontSize: '13px',

              fontWeight: 600,

              color: '#0F172A',

              letterSpacing: '-0.01em',

            }}

          >

            {title}

          </h3>

          {subtitle && (

            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#667085', lineHeight: 1.4 }}>

              {subtitle}

            </p>

          )}

        </div>

      </div>



      {children}

    </section>

  );

}

