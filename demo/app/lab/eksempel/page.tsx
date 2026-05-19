import Link from 'next/link';
import { getParticipant } from '@/lib/participants';
import { properties } from '@/lib/properties';
import { formatPrice } from '@/lib/propertyService';

/**
 * Eksempel-deltagerside.
 *
 * Det her er en MINIMAL skabelon — kopiér hele mappen til
 * demo/app/lab/<din-slug>/ og ret indholdet.
 *
 * Du har fri adgang til:
 *  - alt under @/lib/* (data + helpers fra demo-projektet)
 *  - alt under @/components/* (UI-byggesten)
 *  - Tailwind CSS (samme classes som resten af sitet)
 *
 * Du må IKKE røre filer udenfor demo/app/lab/<din-slug>/ +
 * én linje i demo/participants.json. CODEOWNERS holder øje.
 */

export default function EksempelLabPage() {
  const me = getParticipant('eksempel');
  const top3 = properties.slice(0, 3);

  return (
    <div className="space-y-8">
      <header>
        <Link href="/lab" className="text-sm text-edc-warm hover:underline">
          ← Tilbage til lab-oversigten
        </Link>
        <h1 className="text-3xl font-bold text-edc-blue mt-2">{me?.name}</h1>
        <p className="text-slate-500 mt-1">{me?.tagline}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-edc-blue mb-3">
          Hej fra eksempel-deltageren 👋
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Det her er det mønster I skal følge: én mappe pr. deltager med en{' '}
          <code className="text-edc-warm">page.tsx</code>. Brug den til hvad I
          vil — vis en feature I har bygget, eksperimentér med en Claude-prompt,
          eller byg et lille UI-stykke der løser et problem I har set i ægte
          EDC-kode.
        </p>
        <p className="text-sm text-slate-600">
          Eksemplet herunder demonstrerer at I har adgang til{' '}
          <code className="text-edc-warm">@/lib/properties</code> og kan
          genbruge demo-projektets data:
        </p>
      </section>

      <section>
        <h3 className="text-sm uppercase tracking-wider text-slate-500 mb-2">
          Top 3 boliger lige nu
        </h3>
        <ul className="grid gap-3 sm:grid-cols-3">
          {top3.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="font-semibold text-edc-blue text-sm">{p.address}</p>
              <p className="text-xs text-slate-500 mt-1">
                {p.zip} {p.city}
              </p>
              <p className="text-xs text-edc-warm mt-2">{formatPrice(p.price)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
