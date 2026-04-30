import type { Property } from '@/types/property';

export const properties: Property[] = [
  {
    id: 'strandvejen-12',
    address: 'Strandvejen 12',
    city: 'Hellerup',
    zip: '2900',
    price: 8500000,
    squareMeters: 145,
    rooms: 4,
    type: 'apartment',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
    description: 'Lys lejlighed med havudsigt og altan mod syd. Renoveret køkken og badeværelse i 2022.',
    yearBuilt: 1932
  },
  {
    id: 'norrebrogade-88',
    address: 'Nørrebrogade 88, 3.tv',
    city: 'København N',
    zip: '2200',
    price: 4250000,
    squareMeters: 78,
    rooms: 3,
    type: 'apartment',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    description: 'Charmerende byejendom tæt på Assistens Kirkegård og Nørreport.',
    yearBuilt: 1898
  },
  {
    id: 'hovedgaden-24',
    address: 'Hovedgaden 24',
    city: 'Lyngby',
    zip: '2800',
    price: 6900000,
    squareMeters: 110,
    rooms: 4,
    type: 'townhouse',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    description: 'Familievenligt rækkehus med have og carport. Tæt på skole og station.',
    yearBuilt: 1985
  },
  {
    id: 'bispebjerg-bakke-5',
    address: 'Bispebjerg Bakke 5, 1.th',
    city: 'København NV',
    zip: '2400',
    price: 3200000,
    squareMeters: 62,
    rooms: 2,
    type: 'apartment',
    imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
    description: 'Kompakt to-værelses i populært område. Perfekt til førstegangskøber.',
    yearBuilt: 1956
  },
  {
    id: 'skovbrynet-7',
    address: 'Skovbrynet 7',
    city: 'Holte',
    zip: '2840',
    price: 12500000,
    squareMeters: 220,
    rooms: 6,
    type: 'house',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    description: 'Eksklusiv villa med privat have, dobbelt garage og direkte adgang til skoven.',
    yearBuilt: 2008
  }
];

export function findProperty(id: string): Property | undefined {
  return properties.find(p => p.id === id);
}
