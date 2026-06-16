export type ItemInventoryFilter = 'all' | 'active' | 'inactive';

export type ItemVendor = {
  id: string;
  vendorName: string;
  partNumber: string;
  price: number;
  active: boolean;
};

export type SetupItem = {
  id: string;
  itemId: string;
  name: string;
  description: string;
  unitOfMeasure: string;
  glAccount: string;
  cost: number;
  keywords: string;
  active: boolean;
  imageUrl: string | null;
  vendors: ItemVendor[];
};

export const ITEM_UOM_OPTIONS = [
  'Each',
  'Box',
  'Case',
  'Hour',
  'Day',
  'Pack',
  'Dozen',
  'Foot',
  'Pound',
  'Gallon',
] as const;

export const ITEM_GL_ACCOUNT_OPTIONS = [
  '10:1010 - Finance & Administration:Cash savings',
  '6100 - Computer Equipment',
  '6200 - Software & Licenses',
  '6300 - Office Supplies',
  '6400 - Professional Services',
  '6500 - Travel & Entertainment',
] as const;

export function createEmptyItem(): Omit<SetupItem, 'id'> {
  return {
    itemId: '',
    name: '',
    description: '',
    unitOfMeasure: 'Each',
    glAccount: ITEM_GL_ACCOUNT_OPTIONS[0],
    cost: 0,
    keywords: '',
    active: true,
    imageUrl: null,
    vendors: [],
  };
}

export function createSeedItems(): SetupItem[] {
  return [
    {
      id: 'item-gadget',
      itemId: '22346',
      name: 'Gadget',
      description: 'Great gadget to have on hand',
      unitOfMeasure: 'Each',
      glAccount: '10:1010 - Finance & Administration:Cash savings',
      cost: 100,
      keywords: 'gadget, supplies',
      active: true,
      imageUrl: null,
      vendors: [
        {
          id: 'vendor-1',
          vendorName: 'Abbey Carpet',
          partNumber: '5532231',
          price: 95.99,
          active: true,
        },
      ],
    },
    {
      id: 'item-laptop',
      itemId: '18402',
      name: 'Dell Latitude 5540',
      description: 'Business laptop — 16GB RAM, 512GB SSD',
      unitOfMeasure: 'Each',
      glAccount: '6100 - Computer Equipment',
      cost: 1299,
      keywords: 'laptop, dell, hardware',
      active: true,
      imageUrl: null,
      vendors: [
        {
          id: 'vendor-2',
          vendorName: 'Dell Technologies',
          partNumber: 'LAT5540-16',
          price: 1249,
          active: true,
        },
        {
          id: 'vendor-3',
          vendorName: 'CDW',
          partNumber: '5540-CDW',
          price: 1275.5,
          active: true,
        },
      ],
    },
    {
      id: 'item-monitor',
      itemId: '19201',
      name: 'Samsung 27" 4K Monitor',
      description: 'Samsung U28R55 4K UHD monitor',
      unitOfMeasure: 'Each',
      glAccount: '6100 - Computer Equipment',
      cost: 349.99,
      keywords: 'monitor, display',
      active: true,
      imageUrl: null,
      vendors: [
        {
          id: 'vendor-4',
          vendorName: 'Amazon Business',
          partNumber: 'U28R55',
          price: 329.99,
          active: true,
        },
      ],
    },
    {
      id: 'item-paper',
      itemId: '30112',
      name: 'Copy Paper — Letter (Case)',
      description: '20 lb white copy paper, 10 reams per case',
      unitOfMeasure: 'Case',
      glAccount: '6300 - Office Supplies',
      cost: 48.5,
      keywords: 'paper, office',
      active: true,
      imageUrl: null,
      vendors: [
        {
          id: 'vendor-5',
          vendorName: 'Staples',
          partNumber: 'STP-20LB-10',
          price: 44.99,
          active: true,
        },
        {
          id: 'vendor-6',
          vendorName: 'Office Depot',
          partNumber: 'OD-CP20',
          price: 46.25,
          active: false,
        },
      ],
    },
    {
      id: 'item-chair',
      itemId: '41005',
      name: 'Ergonomic Task Chair',
      description: 'Adjustable lumbar support, mesh back',
      unitOfMeasure: 'Each',
      glAccount: '6300 - Office Supplies',
      cost: 289,
      keywords: 'furniture, chair',
      active: false,
      imageUrl: null,
      vendors: [],
    },
  ];
}

export function cloneSetupItem(item: SetupItem): SetupItem {
  return {
    ...item,
    vendors: item.vendors.map((v) => ({ ...v })),
  };
}

export function cloneItemVendor(vendor: ItemVendor): ItemVendor {
  return { ...vendor };
}

export function itemsEqual(a: SetupItem, b: SetupItem): boolean {
  if (
    a.itemId !== b.itemId ||
    a.name !== b.name ||
    a.description !== b.description ||
    a.unitOfMeasure !== b.unitOfMeasure ||
    a.glAccount !== b.glAccount ||
    a.cost !== b.cost ||
    a.keywords !== b.keywords ||
    a.active !== b.active ||
    a.imageUrl !== b.imageUrl ||
    a.vendors.length !== b.vendors.length
  ) {
    return false;
  }
  return a.vendors.every((v, i) => {
    const other = b.vendors[i];
    return (
      v.id === other.id &&
      v.vendorName === other.vendorName &&
      v.partNumber === other.partNumber &&
      v.price === other.price &&
      v.active === other.active
    );
  });
}

export function formatItemListMeta(item: SetupItem): string {
  const glShort = item.glAccount.split(' - ').pop() ?? item.glAccount;
  return `${item.unitOfMeasure} / $${item.cost.toFixed(2)} / ${glShort}`;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ITEM_AVATAR_PALETTE = [
  { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  { bg: '#F3E8FF', color: '#7C3AED', border: '#DDD6FE' },
  { bg: '#FFF1F2', color: '#E11D48', border: '#FECDD3' },
];

export function getItemInitials(item: SetupItem): string {
  const words = item.name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function getItemAvatarStyle(item: SetupItem): { bg: string; color: string; border: string } {
  const code = item.itemId || item.name || item.id;
  const index = Math.abs(code.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % ITEM_AVATAR_PALETTE.length;
  return ITEM_AVATAR_PALETTE[index];
}

export type ItemImportResult = {
  items: SetupItem[];
  imported: number;
  skipped: number;
};

export type ItemImageImportResult = {
  items: SetupItem[];
  matched: number;
  unmatched: string[];
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function parseActiveValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return !['no', 'false', '0', 'inactive', 'n'].includes(normalized);
}

function parseCostValue(value: string): number {
  const parsed = parseFloat(value.replace(/[$,]/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function headerIndex(headers: string[], aliases: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const index = normalized.indexOf(alias);
    if (index >= 0) return index;
  }
  return -1;
}

export function parseItemsImportCsv(text: string, existingItems: SetupItem[]): ItemImportResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { items: existingItems, imported: 0, skipped: 0 };
  }

  const headers = parseCsvLine(lines[0]);
  const itemIdIndex = headerIndex(headers, ['itemid', 'id', 'sku']);
  const nameIndex = headerIndex(headers, ['itemname', 'name']);
  const descriptionIndex = headerIndex(headers, ['description', 'desc']);
  const uomIndex = headerIndex(headers, ['unitofmeasure', 'uom', 'unit']);
  const glIndex = headerIndex(headers, ['glaccount', 'gl', 'account']);
  const costIndex = headerIndex(headers, ['cost', 'price']);
  const keywordsIndex = headerIndex(headers, ['keywords', 'tags']);
  const activeIndex = headerIndex(headers, ['active', 'status']);

  const nextItems = [...existingItems];
  let imported = 0;
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const itemId = itemIdIndex >= 0 ? cells[itemIdIndex]?.trim() ?? '' : '';
    const name = nameIndex >= 0 ? cells[nameIndex]?.trim() ?? '' : '';

    if (!itemId && !name) {
      skipped += 1;
      continue;
    }

    const importedItem: SetupItem = {
      id: `item-${crypto.randomUUID()}`,
      itemId: itemId || name.slice(0, 12).replace(/\s+/g, '-').toUpperCase(),
      name: name || itemId,
      description: descriptionIndex >= 0 ? cells[descriptionIndex]?.trim() ?? '' : '',
      unitOfMeasure:
        uomIndex >= 0
          ? cells[uomIndex]?.trim() || 'Each'
          : 'Each',
      glAccount:
        glIndex >= 0
          ? cells[glIndex]?.trim() || ITEM_GL_ACCOUNT_OPTIONS[0]
          : ITEM_GL_ACCOUNT_OPTIONS[0],
      cost: costIndex >= 0 ? parseCostValue(cells[costIndex] ?? '0') : 0,
      keywords: keywordsIndex >= 0 ? cells[keywordsIndex]?.trim() ?? '' : '',
      active: activeIndex >= 0 ? parseActiveValue(cells[activeIndex] ?? '') : true,
      imageUrl: null,
      vendors: [],
    };

    const existingIndex = nextItems.findIndex(
      (item) => item.itemId.toLowerCase() === importedItem.itemId.toLowerCase(),
    );

    if (existingIndex >= 0) {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        ...importedItem,
        id: nextItems[existingIndex].id,
        vendors: nextItems[existingIndex].vendors,
        imageUrl: nextItems[existingIndex].imageUrl,
      };
    } else {
      nextItems.push(importedItem);
    }

    imported += 1;
  }

  return { items: nextItems, imported, skipped };
}

export function applyItemImageImports(items: SetupItem[], files: File[]): ItemImageImportResult {
  const nextItems = items.map(cloneSetupItem);
  const unmatched: string[] = [];
  let matched = 0;

  for (const file of files) {
    const stem = file.name.replace(/\.[^.]+$/, '').trim().toLowerCase();
    const itemIndex = nextItems.findIndex(
      (item) =>
        item.itemId.toLowerCase() === stem ||
        item.id.toLowerCase() === stem ||
        item.name.toLowerCase().replace(/\s+/g, '-') === stem,
    );

    if (itemIndex < 0) {
      unmatched.push(file.name);
      continue;
    }

    if (nextItems[itemIndex].imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(nextItems[itemIndex].imageUrl!);
    }

    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      imageUrl: URL.createObjectURL(file),
    };
    matched += 1;
  }

  return { items: nextItems, matched, unmatched };
}
