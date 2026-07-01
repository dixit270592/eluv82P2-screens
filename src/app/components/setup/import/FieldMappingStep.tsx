import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import type { MappingFieldDefinition } from '../../../types/globalImport';
import {
  inlineErrorStyle,
  mappedBadgeStyle,
  progressFillStyle,
  progressTrackStyle,
  tableTdStyle,
  tableThStyle,
} from './importWizardStyles';
import { P2P_BRAND } from '../../../tokens/brand';

type FieldMappingStepProps = {
  sourceFields: string[];
  destinationFields: MappingFieldDefinition[];
  mapping: Record<string, string>;
  duplicateDestinations: string[];
  unmappedRequired: MappingFieldDefinition[];
  onMappingChange: (sourceField: string, destinationField: string) => void;
  embedded?: boolean;
};

function formatDataType(field: MappingFieldDefinition): string {
  return `${field.dataType} (${field.maxLength})`;
}

export function FieldMappingStep({
  sourceFields,
  destinationFields,
  mapping,
  duplicateDestinations,
  unmappedRequired,
  onMappingChange,
  embedded = false,
}: FieldMappingStepProps) {
  const mappedCount = sourceFields.filter((source) => Boolean(mapping[source])).length;
  const progressPct = sourceFields.length ? Math.round((mappedCount / sourceFields.length) * 100) : 0;

  const getDestinationMeta = (fieldName: string) =>
    destinationFields.find((field) => field.fieldName === fieldName);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: embedded ? '10px' : '16px' }}>
      {!embedded && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#344054' }}>
              Mapping progress
            </span>
            <span style={{ fontSize: '12px', color: '#667085' }}>
              {mappedCount} of {sourceFields.length} source fields mapped
            </span>
          </div>
          <div style={progressTrackStyle}>
            <div style={progressFillStyle(progressPct)} />
          </div>
        </div>
      )}

      {(duplicateDestinations.length > 0 || unmappedRequired.length > 0) && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid #FEE4E2',
            background: '#FEF3F2',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {unmappedRequired.length > 0 && (
            <p style={{ margin: 0, fontSize: '12px', color: '#B42318', display: 'flex', gap: '6px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden />
              Required destination fields not mapped: {unmappedRequired.map((field) => field.displayName).join(', ')}
            </p>
          )}
          {duplicateDestinations.length > 0 && (
            <p style={{ margin: 0, fontSize: '12px', color: '#B42318', display: 'flex', gap: '6px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden />
              Duplicate mappings detected: {duplicateDestinations.join(', ')}
            </p>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto', paddingBottom: embedded ? '20px' : '12px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '640px',
            borderTop: '1px solid #E4E7EC',
          }}
        >
          <thead>
            <tr>
              <th style={tableThStyle}>Source field</th>
              <th style={tableThStyle}>Data type</th>
              <th style={tableThStyle}>Destination field</th>
            </tr>
          </thead>
          <tbody>
            {sourceFields.map((sourceField) => {
              const selected = mapping[sourceField] ?? '';
              const destination = getDestinationMeta(selected);
              const isRequiredSource = sourceField.endsWith('*');
              const isMapped = Boolean(selected);
              const isDuplicate = selected ? duplicateDestinations.includes(selected) : false;
              const isAutoMatched =
                isMapped &&
                sourceField.replace(/\*$/, '').toLowerCase() === selected.toLowerCase();

              const inferredType =
                destination ??
                destinationFields.find(
                  (field) =>
                    field.fieldName.toLowerCase() === sourceField.replace(/\*$/, '').toLowerCase(),
                );

              return (
                <tr
                  key={sourceField}
                  style={{
                    background: isDuplicate
                      ? '#FEF3F2'
                      : !isMapped && isRequiredSource
                        ? '#FFFAF5'
                        : isMapped
                          ? '#FAFFFD'
                          : '#FFFFFF',
                  }}
                >
                  <td style={tableTdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500 }}>
                        {sourceField.replace(/\*$/, '')}
                        {isRequiredSource && <span style={{ color: '#F04438' }}> *</span>}
                      </span>
                      {isAutoMatched && (
                        <span style={mappedBadgeStyle}>
                          <CheckCircle2 size={11} aria-hidden />
                          Auto-mapped
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tableTdStyle, color: '#667085', fontSize: '12px' }}>
                    {inferredType ? formatDataType(inferredType) : '—'}
                  </td>
                  <td style={tableTdStyle}>
                    <Select
                      value={selected || '__none__'}
                      onValueChange={(value) =>
                        onMappingChange(sourceField, value === '__none__' ? '' : value)
                      }
                    >
                      <SelectTrigger
                        aria-label={`Map ${sourceField} to destination`}
                        style={{
                          height: '38px',
                          borderColor: isDuplicate ? '#FDA29B' : isMapped ? P2P_BRAND.surfaceBorder : '#E4E7EC',
                          background: '#FFFFFF',
                        }}
                      >
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent className="z-[1100]" position="popper" sideOffset={4}>
                        <SelectItem value="__none__">— Not mapped —</SelectItem>
                        {destinationFields.map((field) => (
                          <SelectItem key={field.fieldName} value={field.fieldName}>
                            {field.displayName}
                            {field.isRequired ? ' *' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isDuplicate && (
                      <p style={inlineErrorStyle}>This destination is mapped more than once.</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
