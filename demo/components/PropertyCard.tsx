import Link from 'next/link';
import type { Property } from '@/types/property';
import { formatPrice } from '@/lib/propertyService';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formattedPrice = formatPrice(property.price);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="block bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.address}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-edc-blue text-lg leading-tight">
          {property.address}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          {property.zip} {property.city}
        </p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xl font-bold text-edc-accent">{formattedPrice}</span>
          <span className="text-xs text-slate-500">
            {property.squareMeters} m² · {property.rooms} vær.
          </span>
        </div>
      </div>
    </Link>
  );
}
