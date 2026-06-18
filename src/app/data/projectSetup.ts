import type { SegmentSymbol } from './accountSetup';

export type ProjectTypeFormat = 'project' | 'project-subproject' | 'custom';

export type ProjectSegment = {
  id: string;
  order: number;
  name: string;
  length: number;
  active: boolean;
};

export type ProjectSegmentDataRow = {
  id: string;
  segmentType: string;
  segmentData: string;
  description: string;
};

export type ProjectDataRow = {
  id: string;
  project: string;
  description: string;
  active: boolean;
  fullAccountName: string;
  accountDescription: string;
};

export const PROJECT_TYPE_OPTIONS: { value: ProjectTypeFormat; label: string }[] = [
  { value: 'project', label: 'Project' },
  { value: 'project-subproject', label: 'Project-SubProject' },
  { value: 'custom', label: 'Make your own format' },
];

export { SEGMENT_SYMBOL_OPTIONS } from './accountSetup';
export type { SegmentSymbol };

const defaultSegmentsByType: Record<ProjectTypeFormat, Omit<ProjectSegment, 'id'>[]> = {
  project: [{ order: 1, name: 'Project', length: 10, active: true }],
  'project-subproject': [
    { order: 1, name: 'Project', length: 10, active: true },
    { order: 2, name: 'SubProject', length: 10, active: true },
  ],
  custom: [
    { order: 1, name: 'Segment 1', length: 10, active: true },
    { order: 2, name: 'Segment 2', length: 10, active: true },
  ],
};

export function createProjectSegmentsForType(type: ProjectTypeFormat): ProjectSegment[] {
  return defaultSegmentsByType[type].map((segment, index) => ({
    ...segment,
    id: `pseg-${type}-${index + 1}`,
  }));
}

export function getProjectSegmentTypeOptions(segments: ProjectSegment[]): string[] {
  return [...new Set(segments.filter((s) => s.active).map((s) => s.name))];
}

export function getProjectOptions(segmentData: ProjectSegmentDataRow[]): string[] {
  return [...new Set(segmentData.map((row) => row.segmentData))];
}

export function createSeedProjectSegmentData(): ProjectSegmentDataRow[] {
  return [
    { id: 'psd-1', segmentType: 'Project', segmentData: 'E2M', description: '' },
    { id: 'psd-2', segmentType: 'Project', segmentData: 'Segment 1', description: '' },
    { id: 'psd-3', segmentType: 'Project', segmentData: 'iPhone', description: 'iPhone3' },
    { id: 'psd-4', segmentType: 'Project', segmentData: 'Google', description: 'Google' },
  ];
}

export function createSeedProjectData(): ProjectDataRow[] {
  return [
    {
      id: 'pd-1',
      project: 'E2M',
      description: 'Test',
      active: true,
      fullAccountName: 'E2M',
      accountDescription: 'Test',
    },
    {
      id: 'pd-2',
      project: 'Google',
      description: 'Google',
      active: true,
      fullAccountName: 'Google',
      accountDescription: 'Google',
    },
    {
      id: 'pd-3',
      project: 'iPhone',
      description: 'iPhone',
      active: true,
      fullAccountName: 'iPhone',
      accountDescription: 'iPhone',
    },
    {
      id: 'pd-4',
      project: 'Segment 1',
      description: 'Segment 1',
      active: true,
      fullAccountName: 'Segment 1',
      accountDescription: 'Segment 1',
    },
  ];
}
