/** Catalog items available for PR line-item selection (inventory lookup). */
import { INVENTORY_CATALOG_IMAGES } from './inventoryCatalogImages';

export type InventoryCatalogItem = {
  id: string;
  itemId: string;
  name: string;
  description: string;
  vendor: string;
  partNumber: string;
  vendorPrice: number;
  unitOfMeasure: string;
  taxGroup: string;
  projectAccount: string;
  glAccount: string;
  type: string;
  vendorTerms?: string;
  imageUrl?: string | null;
};

export const INVENTORY_CATALOG: InventoryCatalogItem[] = [
  {
    id: 'cat-widget',
    itemId: '22345',
    name: 'Widget',
    description: 'Green widget @#$%123',
    vendor: '84 Lumber',
    partNumber: '889097',
    vendorPrice: 2.99,
    vendorTerms: 'Net 15',
    unitOfMeasure: 'Each',
    taxGroup: 'Standard Tax',
    projectAccount: '',
    glAccount: '6100 - Office Supplies',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-widget'],
  },
  {
    id: 'cat-gadget',
    itemId: '22346',
    name: 'Gadget',
    description: 'Great gadget to have on hand',
    vendor: 'Abbey Carpet',
    partNumber: '5532231',
    vendorPrice: 13.09,
    vendorTerms: 'Net 30',
    unitOfMeasure: 'Each',
    taxGroup: 'Standard Tax',
    projectAccount: 'Project A - Operations',
    glAccount: '6300 - Office Supplies',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-gadget'],
  },
  {
    id: 'cat-screws',
    itemId: '33401',
    name: '20mm Sheet Metal Box Screws',
    description: '20mm x 8mm',
    vendor: 'Alro Steel Corporation',
    partNumber: 'SMB-20-8',
    vendorPrice: 8.49,
    vendorTerms: 'Net 15',
    unitOfMeasure: 'Box',
    taxGroup: 'Standard Tax',
    projectAccount: '',
    glAccount: '6300 - Office Supplies',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-screws'],
  },
  {
    id: 'cat-laptop',
    itemId: '18402',
    name: 'Dell Latitude 5540',
    description: 'Business laptop — 16GB RAM, 512GB SSD',
    vendor: 'Dell Technologies',
    partNumber: 'LAT5540-16',
    vendorPrice: 1249,
    vendorTerms: 'Net 30',
    unitOfMeasure: 'Each',
    taxGroup: 'Standard Tax',
    projectAccount: 'Project C - Development',
    glAccount: '6100 - Computer Equipment',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-laptop'],
  },
  {
    id: 'cat-monitor',
    itemId: '19201',
    name: 'Samsung 27" 4K Monitor',
    description: 'Samsung U28R55 4K UHD monitor',
    vendor: 'Amazon Web Services',
    partNumber: 'U28R55',
    vendorPrice: 329.99,
    vendorTerms: 'Net 15',
    unitOfMeasure: 'Each',
    taxGroup: 'Standard Tax',
    projectAccount: '',
    glAccount: '6100 - Computer Equipment',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-monitor'],
  },
  {
    id: 'cat-paper',
    itemId: '30112',
    name: 'Copy Paper — Letter (Case)',
    description: '20 lb white copy paper, 10 reams per case',
    vendor: 'Vendor 1',
    partNumber: 'STP-20LB-10',
    vendorPrice: 44.99,
    vendorTerms: 'Net 15',
    unitOfMeasure: 'Case',
    taxGroup: 'Zero Rated',
    projectAccount: 'General - Admin',
    glAccount: '6300 - Office Supplies',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-paper'],
  },
  {
    id: 'cat-chair',
    itemId: '41005',
    name: 'Ergonomic Task Chair',
    description: 'Adjustable lumbar support, mesh back',
    vendor: '84 Lumber',
    partNumber: 'ERG-2024',
    vendorPrice: 289,
    vendorTerms: 'Net 15',
    unitOfMeasure: 'Each',
    taxGroup: 'Standard Tax',
    projectAccount: '',
    glAccount: '6300 - Office Supplies',
    type: 'Goods',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-chair'],
  },
  {
    id: 'cat-services',
    itemId: '90001',
    name: 'IT Support — Monthly Retainer',
    description: 'Managed services block — 40 hours',
    vendor: 'Microsoft Corporation',
    partNumber: 'MS-SVC-40',
    vendorPrice: 4500,
    vendorTerms: 'Net 60',
    unitOfMeasure: 'Each',
    taxGroup: 'Exempt',
    projectAccount: 'Project B - Marketing',
    glAccount: '6400 - Professional Services',
    type: 'Services',
    imageUrl: INVENTORY_CATALOG_IMAGES['cat-services'],
  },
];

export function filterInventoryCatalog(
  items: InventoryCatalogItem[],
  keyword: string,
  vendor: string,
): InventoryCatalogItem[] {
  const kw = keyword.trim().toLowerCase();
  const ven = vendor.trim().toLowerCase();
  return items.filter((item) => {
    const matchKw =
      !kw ||
      item.itemId.toLowerCase().includes(kw) ||
      item.name.toLowerCase().includes(kw) ||
      item.description.toLowerCase().includes(kw) ||
      item.partNumber.toLowerCase().includes(kw);
    const matchVen = !ven || item.vendor.toLowerCase().includes(ven);
    return matchKw && matchVen;
  });
}

export function catalogItemToLineItemFields(item: InventoryCatalogItem) {
  const description = item.description.trim()
    ? `${item.name} — ${item.description}`
    : item.name;

  return {
    description,
    type: item.type,
    unitOfMeasure: item.unitOfMeasure,
    cost: item.vendorPrice,
    taxGroup: item.taxGroup,
    vendor: item.vendor,
    vendorTerms: item.vendorTerms || 'Net 15',
    projectAccount: item.projectAccount,
    glAccount: item.glAccount,
  };
}

/** Returns field keys that received non-empty values from the catalog item. */
export function catalogPopulatedFieldKeys(
  item: InventoryCatalogItem,
): Array<keyof ReturnType<typeof catalogItemToLineItemFields>> {
  const fields = catalogItemToLineItemFields(item);
  return (Object.keys(fields) as Array<keyof typeof fields>).filter((key) => {
    const val = fields[key];
    return val !== undefined && val !== '' && val !== 0;
  });
}
