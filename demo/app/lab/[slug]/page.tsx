import { notFound } from 'next/navigation';
import { getAllParticipants, getParticipant } from '@/lib/participants';
import StarterTemplate from '../_starter/StarterTemplate';

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
 * Default-side for alle registrerede deltagere der endnu ikke har
 * lavet deres egen page.tsx under app/lab/<slug>/.
 *
 * Renderer den fælles startskabelon med deres egen slug, så hver
 * deltager ser en populeret side fra dag ét. Når en deltager opretter
 * app/lab/<slug>/page.tsx, vinder den statiske rute automatisk over
 * denne dynamiske og overstyrer fallback'en.
 */
export default async function ParticipantFallbackPage({ params }: Props) {
  const { slug } = await params;
  const participant = getParticipant(slug);

  if (!participant) {
    notFound();
  }

  return <StarterTemplate slug={slug} />;
}
