'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getParticipant } from '@/lib/participants';
import { properties } from '@/lib/properties';
import { formatPrice } from '@/lib/propertyService';

/**
 * Den fælles startskabelon der renderes for ALLE registrerede
 * deltagere indtil de laver deres egen page.tsx.
 *
 * Filen ligger i en underscore-folder (_starter) så den ikke selv
 * bliver en rute. Den eksporteres som komponent og bruges fra:
 *   - app/lab/[slug]/page.tsx  (fallback for alle slugs)
 *   - app/lab/eksempel/page.tsx (kopier-mig kilde)
 *
 * Deltagere må IKKE redigere denne fil — den er fælles. Hvis I
 * vil customize, så kopiér app/lab/eksempel/ til app/lab/<din-slug>/
 * og rediger jeres egen page.tsx fri.
 */
export default function StarterTemplate({ slug }: { slug: string }) {
  const me = getParticipant(slug);

  // 👇 Eksempel på client-side state — eksempel/page.tsx demonstrerer
  // brugen. Slet/erstat hvis du ikke vil have det i din egen kopi.
  const [likedCount, setLikedCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const top3 = properties.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <header className="space-y-2">
        <Link href="/lab" className="text-sm text-edc-warm hover:underline">
          ← Tilbage til lab-oversigten
        </Link>
        <h1 className="text-4xl font-bold text-edc-blue mt-3">
          {me?.name ?? 'Ukendt deltager'}
        </h1>
        <p className="text-lg text-slate-600">{me?.tagline}</p>
        <p className="text-sm text-slate-400 italic">
          👋 Det her er min lab-side — startskabelon. Det første jeg
          gør er at gøre den til min egen.
        </p>
        <div className="rounded-lg bg-edc-blue/5 border border-edc-blue/20 p-4 text-sm text-slate-700 mt-4">
          <p className="font-semibold text-edc-blue mb-1">
            Vil du customize den her side?
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Kopiér mappen{' '}
              <code className="text-edc-warm">demo/app/lab/eksempel/</code>{' '}
              til{' '}
              <code className="text-edc-warm">
                demo/app/lab/{slug}/
              </code>
            </li>
            <li>
              Ret <code className="text-edc-warm">MY_SLUG</code>{' '}
              øverst i filen til{' '}
              <code className="text-edc-warm">&quot;{slug}&quot;</code>
            </li>
            <li>Rediger sektion for sektion — alt i din folder er dit</li>
          </ol>
        </div>
      </header>

      {/* ───────────────────────── OM MIG ───────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-xl font-semibold text-edc-blue">Om mig</h2>
        <p className="text-sm text-slate-600">
          ✏️ Erstat den her tekst. Skriv om dig selv, dit team, og hvad
          du gerne vil bruge Claude til efter workshoppen.
        </p>
        <p className="text-sm text-slate-600">
          Eksempel: &quot;Jeg har arbejdet med .NET-backend i 6 år og er
          nysgerrig på om Claude kan hjælpe med vores legacy-services
          på edc.dk. Jeg lærer bedst ved at prøve mig frem.&quot;
        </p>
      </section>

      {/* ──────────────────── HVAD JEG HAR LÆRT ──────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-edc-blue mb-3">
          Hvad jeg har lært
        </h2>
        <ul className="space-y-2">
          <li className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-edc-blue">
              Session 1 — Prompts
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Kontekst er konge. En god prompt = præcis hvor, hvad og
              hvordan. ✏️ Skriv din egen indsigt.
            </p>
          </li>
          {/* ✏️ Tilføj en linje pr. session du har deltaget i */}
        </ul>
      </section>

      {/* ─────────────────── INTERAKTIV WIDGET ─────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-xl font-semibold text-edc-blue">
          Min favorit-bolig
        </h2>
        <p className="text-sm text-slate-600">
          Klik på en bolig for at vælge den. (Eksempel på{' '}
          <code className="text-edc-warm">useState</code> — kig i koden.)
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {top3.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelected(p.id);
                setLikedCount((c) => c + 1);
              }}
              className={`text-left rounded-lg border p-4 transition ${
                selected === p.id
                  ? 'border-edc-warm bg-amber-50 ring-1 ring-edc-warm'
                  : 'border-slate-200 hover:border-edc-blue'
              }`}
            >
              <p className="font-semibold text-edc-blue text-sm">
                {p.address}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {p.zip} {p.city}
              </p>
              <p className="text-xs text-edc-warm mt-2">
                {formatPrice(p.price)}
              </p>
            </button>
          ))}
        </div>
        {selected && (
          <p className="text-sm text-slate-600">
            Du har klikket {likedCount}{' '}
            {likedCount === 1 ? 'gang' : 'gange'}. Favorit:{' '}
            <span className="font-semibold text-edc-blue">
              {properties.find((p) => p.id === selected)?.address}
            </span>
          </p>
        )}
      </section>

      {/* ─────────────────────── IDEER ─────────────────────── */}
      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-edc-blue mb-3">
          🛠 Ideer til din næste feature
        </h2>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>En søgefunktion på boligerne (filter pr. by/pris/rum)</li>
          <li>Et diagram der viser gennemsnitspris pr. by</li>
          <li>En &quot;ranglistning&quot; af boligerne efter dine egne kriterier</li>
          <li>
            En form hvor du kan tilføje en kommentar (gem i{' '}
            <code className="text-edc-warm">localStorage</code>)
          </li>
          <li>
            Brug en subagent til at analysere{' '}
            <code className="text-edc-warm">@/lib/properties</code> og
            foreslå en visualisering
          </li>
          <li>En toggle der skifter mellem dansk og engelsk pris-format</li>
        </ul>
        <p className="text-xs text-slate-400 mt-4 italic">
          💡 Spørg Claude — &quot;kig på @demo/app/lab/{slug}/page.tsx og
          foreslå hvad jeg kan bygge ovenpå&quot;.
        </p>
      </section>
    </div>
  );
}
