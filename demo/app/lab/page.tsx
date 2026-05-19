import Link from 'next/link';
import { getAllParticipants } from '@/lib/participants';

export const metadata = {
  title: 'Workshop Lab — EDC × Claude Code',
  description: 'Deltager-galleri. Klik ind på en deltager for at se deres workspace.'
};

export default function LabDashboardPage() {
  const participants = getAllParticipants();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-wider text-edc-warm font-semibold">
          Workshop Lab
        </p>
        <h1 className="text-3xl font-bold text-edc-blue mt-1">
          Hvad har deltagerne bygget?
        </h1>
        <p className="text-slate-500 mt-2 max-w-2xl">
          Hver deltager har sin egen side under <code className="text-edc-blue">/lab/&lt;navn&gt;</code> som
          de iterer på gennem hele workshoppen. Klik ind for at se hvor de er
          lige nu. Facilitatorer: brug denne side som overblik under live-demoer.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/lab/${p.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-edc-blue hover:shadow-md transition"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-edc-blue">{p.name}</h2>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  {p.team}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                {p.tagline}
              </p>
              <p className="text-xs text-edc-warm mt-3 font-mono">
                /lab/{p.slug} →
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <aside className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-edc-blue mb-1">Sådan tilføjer du dig selv</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Tilføj én linje til <code>demo/participants.json</code> med din slug, navn, team og tagline</li>
          <li>Kopier mappen <code>demo/app/lab/eksempel/</code> til <code>demo/app/lab/&lt;din-slug&gt;/</code></li>
          <li>Kør <code>npm run dev</code> i <code>demo/</code> og se din side på <code>localhost:3000/lab/&lt;din-slug&gt;</code></li>
          <li>Når du er klar: åbn en PR — den får automatisk en preview-URL fra Vercel</li>
        </ol>
        <p className="mt-3">
          Detaljer i <code>demo/LAB.md</code>.
        </p>
      </aside>
    </div>
  );
}
