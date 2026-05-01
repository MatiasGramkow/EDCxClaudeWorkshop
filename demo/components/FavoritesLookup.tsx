'use client';

import { useState } from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
import type { Property } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';

interface FavoritesResponse {
  ok: boolean;
  user: { name: string; email: string } | null;
  count: number;
  favorites: Property[];
}

export default function FavoritesLookup() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<FavoritesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setData(null);
    try {
      const res = await fetch(
        `/demo/api/users/favorites?email=${encodeURIComponent(email)}`
      );
      const body = await res.json();
      if (!res.ok) {
        setErrorMsg(body.message || 'Noget gik galt');
      } else {
        setData(body as FavoritesResponse);
      }
    } catch {
      setErrorMsg('Kunne ikke kontakte serveren');
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

      {errorMsg && (
        <div className="mt-5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          ⚠️ {errorMsg}
        </div>
      )}

      {data && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 size={16} />
            <span className="font-semibold">Profil fundet</span>
          </div>

          <div>
            <div className="text-lg font-semibold text-edc-blue">
              Velkommen tilbage, {data.user?.name ?? ''}!
            </div>
            <div className="text-sm text-slate-500">
              {data.user?.email ?? ''} · {data.count}{' '}
              {data.count === 1 ? 'favorit' : 'favoritter'}
            </div>
          </div>

          {data.favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.favorites.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic">
              Ingen favoritter endnu.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
