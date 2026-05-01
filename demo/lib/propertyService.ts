// Property service — opslag og søgning i bolig-listen.
//
// Bemærk: getAll har en "realistisk dårlig" performance-implementering
// (flere passes over array'et) — bruges som demo i session 1 ("optimer
// denne metode"). Fix den gerne sammen med Claude.

import { properties } from './properties';
import type { Property } from '@/types/property';

export interface PropertyListItem {
  id: string;
  title: string;
  city: string;
  pricePerSqm: number;
  formattedPrice: string;
}

export function getAll(query?: string): PropertyListItem[] {
  // Inefficient: filter, then map, then sort, then map again — multiple
  // passes through the array even though it could be done in one.
  const filtered = properties.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.zip.includes(q)
    );
  });

  const withPricePerSqm = filtered.map(p => ({
    ...p,
    pricePerSqm: Math.round(p.price / p.squareMeters)
  }));

  withPricePerSqm.sort((a, b) => a.price - b.price);

  return withPricePerSqm.map(p => ({
    id: p.id,
    title: `${p.address}, ${p.city}`,
    city: p.city,
    pricePerSqm: p.pricePerSqm,
    formattedPrice: formatPrice(p.price)
  }));
}

export function findById(id: string): Property | null {
  return properties.find(p => p.id === id) ?? null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(price);
}
