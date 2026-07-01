import { Check } from 'lucide-react';
import { P2P_BRAND } from '../../../tokens/brand';
import { importWizardFont } from './importWizardStyles';

type ImportProgressRailProps = {
  hasFile: boolean;
  mappingComplete: boolean;
  mappingNeedsAttention: boolean;
  validationReady: boolean;
  hasValidationErrors: boolean;
};

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'map', label: 'Map fields' },
  { key: 'review', label: 'Review' },
] as const;

export function ImportProgressRail({
  hasFile,
  mappingComplete,
  mappingNeedsAttention,
  validationReady,
  hasValidationErrors,
}: ImportProgressRailProps) {
  const stepStates = [
    hasFile,
    hasFile && mappingComplete && !mappingNeedsAttention,
    validationReady,
  ];

  return (
    <div
      aria-label="Import progress"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        padding: '12px 24px 16px',
        borderBottom: '1px solid #EEF1F5',
        fontFamily: importWizardFont,
        flexShrink: 0,
      }}
    >
      {STEPS.map((step, index) => {
        const complete = stepStates[index];
        const isActive =
          index === 0
            ? !hasFile
            : index === 1
              ? hasFile && (!mappingComplete || mappingNeedsAttention)
              : hasFile && mappingComplete && !validationReady;

        const showAttention = index === 1 && mappingNeedsAttention;
        const showError = index === 2 && hasValidationErrors;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: index < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span
                aria-hidden
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: complete
                    ? P2P_BRAND.primary
                    : showAttention || showError
                      ? '#FEF3F2'
                      : isActive
                        ? P2P_BRAND.surface
                        : '#F2F4F7',
                  color: complete ? '#FFFFFF' : showAttention || showError ? '#B42318' : isActive ? P2P_BRAND.primaryStrong : '#98A2B3',
                  border: isActive && !complete ? `1.5px solid ${P2P_BRAND.primary}` : '1.5px solid transparent',
                }}
              >
                {complete ? <Check size={12} strokeWidth={2.5} /> : index + 1}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive || complete ? 600 : 500,
                  color: complete || isActive ? '#344054' : '#98A2B3',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                aria-hidden
                style={{
                  flex: 1,
                  height: '2px',
                  margin: '0 12px',
                  borderRadius: 999,
                  background: stepStates[index] ? P2P_BRAND.primary : '#E4E7EC',
                  opacity: stepStates[index] ? 1 : 0.7,
                  minWidth: '24px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
