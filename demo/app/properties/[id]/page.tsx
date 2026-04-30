import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findProperty } from '@/lib/properties';
import { ArrowLeft, Home, Ruler, Calendar } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = findProperty(id);
  if (!property) notFound();

  const formattedPrice = new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0
  }).format(property.price);

  const pricePerSqm = Math.round(property.price / property.squareMeters);

  return (
    <article className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-edc-accent text-sm hover:underline"
      >
        <ArrowLeft size={16} /> Tilbage til boliglisten
      </Link>

      <div className="aspect-[16/9] rounded-2xl bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.address}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h1 className="text-2xl font-bold text-edc-blue">
          {property.address}
        </h1>
        <p className="text-slate-500 mt-1">
          {property.zip} {property.city}
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Pris" value={formattedPrice} />
          <Stat label="Areal" value={`${property.squareMeters} m²`} icon={<Ruler size={18} />} />
          <Stat label="Værelser" value={`${property.rooms}`} icon={<Home size={18} />} />
          <Stat
            label="Bygget"
            value={`${property.yearBuilt}`}
            icon={<Calendar size={18} />}
          />
        </div>

        <p className="mt-6 text-slate-700 leading-relaxed">
          {property.description}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">
          Pris pr. m²:{' '}
          <span className="font-semibold text-edc-accent">
            {new Intl.NumberFormat('da-DK').format(pricePerSqm)} kr.
          </span>
        </div>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="font-semibold text-edc-blue mt-0.5">{value}</div>
    </div>
  );
}
