export type PropertyType = 'apartment' | 'house' | 'townhouse';

export interface Property {
  id: string;
  address: string;
  city: string;
  zip: string;
  price: number;
  squareMeters: number;
  rooms: number;
  type: PropertyType;
  imageUrl: string;
  description: string;
  yearBuilt: number;
}
