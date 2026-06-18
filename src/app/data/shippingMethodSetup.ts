export type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

export function createSeedShippingMethods(): ShippingMethod[] {
  return [
    { id: 'ship-bluedart', name: 'Bluedart', description: 'Indian Shipping service', active: true },
    { id: 'ship-dhl', name: 'DHL', description: '', active: true },
    { id: 'ship-dhs', name: 'DHS', description: 'Indian Shipping Service', active: false },
    { id: 'ship-ekart', name: 'Ekart', description: 'Express', active: true },
    { id: 'ship-fedex', name: 'Fed Ex', description: '', active: true },
    { id: 'ship-ups', name: 'UPS', description: '', active: true },
    { id: 'ship-usps', name: 'USPS', description: '', active: true },
    { id: 'ship-xpressbees', name: 'XpressBees', description: 'Indian Shipping Service', active: true },
  ];
}

export function cloneShippingMethod(method: ShippingMethod): ShippingMethod {
  return { ...method };
}
