import { Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { formatAddress, getAddressById } from '../../data/departmentLocationSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type AddressPreviewPopoverProps = {
  addressId: string | null;
  disabled?: boolean;
  compact?: boolean;
};

export function AddressPreviewPopover({ addressId, disabled, compact }: AddressPreviewPopoverProps) {
  const address = getAddressById(addressId);
  const size = compact ? 30 : 36;
  const iconSize = compact ? 14 : 16;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || !address}
          aria-label={address ? `Preview ${address.label}` : 'Preview address'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${size}px`,
            height: `${size}px`,
            flexShrink: 0,
            border: `1px solid ${disabled || !address ? '#E4E7EC' : P2P_BRAND.surfaceBorder}`,
            borderRadius: '8px',
            background: '#FFFFFF',
            color: disabled || !address ? '#CBD5E1' : P2P_BRAND.primaryStrong,
            cursor: disabled || !address ? 'not-allowed' : 'pointer',
          }}
        >
          <Eye size={iconSize} aria-hidden />
        </button>
      </PopoverTrigger>
      {address && (
        <PopoverContent
          align="end"
          side="top"
          style={{ fontFamily: F, width: '280px', padding: '14px 16px' }}
        >
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Address details</p>
          <p style={{ margin: '4px 0 10px', fontSize: '12px', color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
            {address.label}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.55,
              whiteSpace: 'pre-line',
            }}
          >
            {formatAddress(address)}
          </p>
        </PopoverContent>
      )}
    </Popover>
  );
}
