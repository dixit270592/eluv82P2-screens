import widgetImg from '../../assets/inventory/widget.png';
import gadgetImg from '../../assets/inventory/gadget.png';
import screwsImg from '../../assets/inventory/screws.png';
import laptopImg from '../../assets/inventory/laptop.png';
import monitorImg from '../../assets/inventory/monitor.png';
import paperImg from '../../assets/inventory/paper.png';
import chairImg from '../../assets/inventory/chair.png';
import servicesImg from '../../assets/inventory/services.png';

/** Bundled catalog thumbnails — 4:3 product photos, consistent studio style. */
export const INVENTORY_CATALOG_IMAGES: Record<string, string> = {
  'cat-widget': widgetImg,
  'cat-gadget': gadgetImg,
  'cat-screws': screwsImg,
  'cat-laptop': laptopImg,
  'cat-monitor': monitorImg,
  'cat-paper': paperImg,
  'cat-chair': chairImg,
  'cat-services': servicesImg,
};

export function getInventoryCatalogImage(catalogId: string): string | undefined {
  return INVENTORY_CATALOG_IMAGES[catalogId];
}
