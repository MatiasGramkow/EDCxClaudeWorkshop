import registry from '@/participants.json';

export type Participant = {
  slug: string;
  name: string;
  team: string;
  tagline: string;
};

type Registry = {
  participants: Participant[];
};

const data = registry as unknown as Registry;

export function getAllParticipants(): Participant[] {
  return data.participants;
}

export function getParticipant(slug: string): Participant | undefined {
  return data.participants.find((p) => p.slug === slug);
}
