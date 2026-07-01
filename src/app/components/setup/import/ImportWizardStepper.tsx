import { Check } from 'lucide-react';
import { P2P_BRAND } from '../../../tokens/brand';
import { importWizardFont } from './importWizardStyles';

const STEPS = [
  { id: 0, label: 'Import Data' },
  { id: 1, label: 'Field Mapping' },
  { id: 2, label: 'Preview & Validation' },
] as const;

type ImportWizardStepperProps = {
  currentStep: number;
  maxReachedStep: number;
  onStepClick?: (step: number) => void;
};

export function ImportWizardStepper({ currentStep, maxReachedStep, onStepClick }: ImportWizardStepperProps) {
  return (
    <div
      role="tablist"
      aria-label="Import wizard steps"
      style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid #E4E7EC',
        padding: '0 24px',
        flexShrink: 0,
        fontFamily: importWizardFont,
      }}
    >
      {STEPS.map((step) => {
        const isActive = currentStep === step.id;
        const isComplete = step.id < currentStep;
        const isClickable = step.id <= maxReachedStep && onStepClick;

        return (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'step' : undefined}
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick?.(step.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 12px',
              border: 'none',
              borderBottom: isActive ? `2px solid ${P2P_BRAND.primary}` : '2px solid transparent',
              background: 'transparent',
              color: isActive ? P2P_BRAND.primaryStrong : isComplete ? '#475467' : '#98A2B3',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              fontFamily: importWizardFont,
              cursor: isClickable ? 'pointer' : 'default',
              marginBottom: '-1px',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            <span
              aria-hidden
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive || isComplete ? P2P_BRAND.primary : '#E4E7EC',
                color: isActive || isComplete ? '#FFFFFF' : '#98A2B3',
                flexShrink: 0,
              }}
            >
              {isComplete ? <Check size={12} strokeWidth={2.5} /> : step.id + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
