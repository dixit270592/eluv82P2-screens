export type UnitOfMeasure = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

export function createSeedUnitsOfMeasure(): UnitOfMeasure[] {
  return [
    { id: 'uom-ac', code: 'AC', name: 'Acre (ac)', active: true },
    { id: 'uom-cm', code: 'CM', name: 'Centi Meter (cm)', active: true },
    { id: 'uom-kg', code: 'KG', name: 'Kilo Gram (Kg)', active: true },
    { id: 'uom-ea', code: 'EA', name: 'Each (ea)', active: true },
    { id: 'uom-lb', code: 'LB', name: 'Pound (lb)', active: true },
    { id: 'uom-ft', code: 'FT', name: 'Foot (ft)', active: true },
    { id: 'uom-hr', code: 'HR', name: 'Hour (hr)', active: true },
    { id: 'uom-f', code: 'F', name: 'Fahrenheit (°F)', active: false },
    { id: 'uom-l', code: 'L', name: 'Liter (L)', active: true },
    { id: 'uom-m', code: 'M', name: 'Meter (m)', active: true },
    { id: 'uom-box', code: 'BOX', name: 'Box (box)', active: true },
    { id: 'uom-pk', code: 'PK', name: 'Pack (pk)', active: true },
    { id: 'uom-dz', code: 'DZ', name: 'Dozen (dz)', active: true },
    { id: 'uom-gal', code: 'GAL', name: 'Gallon (gal)', active: true },
  ];
}

export function cloneUnitOfMeasure(unit: UnitOfMeasure): UnitOfMeasure {
  return { ...unit };
}
