'use client';

import { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { properties } from '@/lib/properties';

export default function HomePage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.zip.includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-edc-blue">
          Find din næste bolig
        </h1>
        <p className="text-slate-500 mt-1">
          {properties.length} boliger til salg lige nu
        </p>
      </div>

      <SearchBar onSearch={setQuery} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          Ingen boliger matchede &quot;{query}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
