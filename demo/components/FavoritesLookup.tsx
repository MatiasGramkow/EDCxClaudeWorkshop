'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Property } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';

export default function FavoritesLookup() {
  const [email, setEmail] = useState('');
  const [favorites, setFavorites] = useState<Property[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/demo/api/users/favorites?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Noget gik galt');
        setFavorites(null);
      } else {
        setFavorites(data.favorites ?? []);
      }
      setHasSearched(true);
    } catch {
      setErrorMsg('Kunne ikke kontakte serveren');
      setFavorites(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Heart size={20} className="text-rose-500" fill="currentColor" />
        <h2 className="text-lg font-semibold text-edc-blue">
          Hent mine favoritter
        </h2>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Indtast din email så viser vi de boliger, du har gemt. Prøv fx{' '}
        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
          demo@edc.dk
        </code>
        .
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@email.dk"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-edc-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-edc-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Henter…' : 'Hent'}
        </button>
      </form>

      {hasSearched && (
        <div className="mt-5">
          {errorMsg ? (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              ⚠️ {errorMsg}
            </div>
          ) : favorites && favorites.length === 0 ? (
            <div className="text-sm text-slate-500 italic">
              Ingen favoritter endnu.
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
