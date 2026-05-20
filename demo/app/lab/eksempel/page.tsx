'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getParticipant } from '@/lib/participants';
import { properties } from '@/lib/properties';
import { formatPrice } from '@/lib/propertyService';

/**
 * 👋 VELKOMMEN — det her er din startskabelon.
 *
 * Sådan gør du den til din egen:
 *   1. Kopiér hele mappen `demo/app/lab/eksempel/` til
 *      `demo/app/lab/<din-slug>/` (fx `demo/app/lab/yonas/`)
 *   2. Ret konstanten MY_SLUG nedenfor til din egen slug
 *   3. Kør `npm run dev` i `demo/` og se din side på
 *      http://localhost:3000/demo/lab/<din-slug>
 *   4. Rediger sektion for sektion — alle de markerede steder er
 *      ment som "rediger mig". Du kan også slette sektioner du ikke
 *      vil bruge.
 *
 * Du må ALT i den her fil. Du må KUN ikke ændre filer udenfor din
 * egen folder + din egen linje i `demo/participants.json`.
 */

// 👇 SKIFT MIG til din egen slug når du kopierer mappen
const MY_SLUG = 'eksempel';

export default function StarterLabPage() {
  const me = getParticipant(MY_SLUG);

  // 👇 EKSEMPEL PÅ STATE — slet/ændr/udvid frit
  const [likedCount, setLikedCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  // Henter de første 3 boliger fra demo-data. Du kan også
  // filtrere, sortere, slice'e — properties er bare et array.
  const top3 = properties.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* ───────────────────────────────────────────────────────────
          SEKTION 1 — HERO
          Hilsen og dit navn. Hentet fra participants.json så det
          opdateres automatisk når du redigerer din linje der.
         ─────────────────────────────────────────────────────────── */}
      <header className="space-y-2">
        <Link href="/lab" className="text-sm text-edc-warm hover:underline">
          ← Tilbage til lab-oversigten
        </Link>
        <h1 className="text-4xl font-bold text-edc-blue mt-3">
          {me?.name ?? 'Ukendt deltager'}
        </h1>
        <p className="text-lg text-slate-600">{me?.tagline}</p>
        <p className="text-sm text-slate-400 italic">
          👋 Det her er min lab-side. Det første jeg gør er at gøre den
          til min egen.
        </p>
      </header>

      {/* ───────────────────────────────────────────────────────────
          SEKTION 2 — OM MIG
          Skriv lidt om dig selv. Hvad arbejder du med? Hvad vil du
          gerne have ud af workshoppen?
         ─────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-xl font-semibold text-edc-blue">Om mig</h2>
        <p className="text-sm text-slate-600">
          ✏️ Erstat den her tekst. Skriv om dig selv, dit team, og hvad
          du gerne vil bruge Claude til efter workshoppen.
        </p>
        <p className="text-sm text-slate-600">
          Eksempel: "Jeg har arbejdet med .NET-backend i 6 år og er
          nysgerrig på om Claude kan hjælpe med vores legacy-services
          på edc.dk. Jeg lærer bedst ved at prøve mig frem."
        </p>
      </section>

      {/* ───────────────────────────────────────────────────────────
          SEKTION 3 — HVAD JEG HAR LÆRT
          Opdater efter hver session. Brug det som din egen
          læringsdagbog.
         ─────────────────────────────────────────────────────────── */}
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

      {/* ───────────────────────────────────────────────────────────
          SEKTION 4 — INTERAKTIV WIDGET
          Et lille eksempel på client-side state. Klik på en bolig
          for at vælge den. Slet hele sektionen hvis du ikke vil have
          den.
         ─────────────────────────────────────────────────────────── */}
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

      {/* ───────────────────────────────────────────────────────────
          SEKTION 5 — IDEER TIL HVAD DU KAN BYGGE
          Inspiration. Slet eller behold.
         ─────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-edc-blue mb-3">
          🛠 Ideer til din næste feature
        </h2>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>En søgefunktion på boligerne (filter pr. by/pris/rum)</li>
          <li>Et diagram der viser gennemsnitspris pr. by</li>
          <li>En "ranglistning" af boligerne efter dine egne kriterier</li>
          <li>
            En form hvor du kan tilføje en kommentar (gem i{' '}
            <code className="text-edc-warm">localStorage</code>)
          </li>
          <li>
            Brug en subagent til at analysere{' '}
            <code className="text-edc-warm">@/lib/properties</code> og
            foreslå et indsigtsfuldt visualisering
          </li>
          <li>
            En toggle der skifter mellem dansk og engelsk pris-format
          </li>
        </ul>
        <p className="text-xs text-slate-400 mt-4 italic">
          💡 Spørg Claude — "kig på @demo/app/lab/{`<min-slug>`}/page.tsx
          og foreslå hvad jeg kan bygge ovenpå".
        </p>
      </section>
    </div>
  );
}
