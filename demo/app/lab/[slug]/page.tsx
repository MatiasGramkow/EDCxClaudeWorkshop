import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllParticipants, getParticipant } from '@/lib/participants';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllParticipants().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const participant = getParticipant(slug);
  if (!participant) return { title: 'Ukendt deltager' };
  return {
    title: `${participant.name} — Workshop Lab`,
    description: participant.tagline
  };
}

/**
 * Fallback-side for deltagere som er registreret i participants.json
 * men endnu ikke har lavet deres egen app/lab/<slug>/page.tsx.
 *
 * Når en deltager opretter app/lab/<slug>/page.tsx, vinder den
 * statiske rute automatisk over [slug] og denne fil bliver bypasset.
 */
export default async function ParticipantFallbackPage({ params }: Props) {
  const { slug } = await params;
  const participant = getParticipant(slug);

  if (!participant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lab" className="text-sm text-edc-warm hover:underline">
          ← Tilbage til lab-oversigten
        </Link>
        <h1 className="text-3xl font-bold text-edc-blue mt-2">
          {participant.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {participant.team} · {participant.tagline}
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 space-y-3">
        <p className="text-lg font-semibold text-edc-blue">
          Tom workspace
        </p>
        <p className="text-sm max-w-md mx-auto">
          {participant.name} har ikke lavet sin side endnu. Når der ligger en{' '}
          <code className="text-edc-warm">page.tsx</code> under{' '}
          <code className="text-edc-warm">
            demo/app/lab/{participant.slug}/
          </code>{' '}
          vises den her.
        </p>
        <p className="text-xs text-slate-400 pt-2">
          Kopiér <code>demo/app/lab/eksempel/page.tsx</code> som startpunkt og
          ret indholdet til dit eget.
        </p>
      </div>
    </div>
  );
}
