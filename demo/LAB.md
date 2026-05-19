# LAB.md — sådan tilføjer du din egen side i workshop-lab'en

10 minutter fra du står med tomme hænder til du har en side live på din
egen URL.

## Spillereglerne (læs disse først)

**Du må KUN redigere:**

- `demo/app/lab/<din-slug>/` — alt herinde er dit
- `demo/participants.json` — kun din egen linje

**Du må IKKE røre noget andet.** Hverken andres folders, fælles
biblioteker, eller produktions-demoet på `/`. CI-checken vil afvise
PR'en automatisk hvis du gør. Detaljer i `demo/CLAUDE.md`.

## Trin-for-trin

### 1. Vælg din slug

Slug'en bliver din URL: `/lab/<din-slug>`. Konventioner:

- Kun små bogstaver (a-z), tal og bindestreg
- Ingen mellemrum, ingen æøå
- Dit fornavn er typisk fint (`yonas`, `jacob`, `oliver`)
- Hvis to har samme fornavn, tilføj initialer (`thomas-s`, `thomas-l`)

### 2. Lav en branch

```bash
git checkout main
git pull
git checkout -b lab/<din-slug>
```

### 3. Registrér dig i participants.json

Åbn `demo/participants.json` og tilføj én linje til
`participants`-arrayet:

```json
{
  "slug": "din-slug",
  "name": "Dit Fulde Navn",
  "team": "dit-team",
  "tagline": "én sætning om hvad du laver"
}
```

Husk komma efter den forrige indgang.

### 4. Kopiér eksempel-folderen

```bash
cp -r demo/app/lab/eksempel demo/app/lab/<din-slug>
```

Åbn `demo/app/lab/<din-slug>/page.tsx` og ret indholdet til dit. Brug
`getParticipant('din-slug')` til at hente dit eget navn fra registry.

### 5. Start dev-serveren

```bash
cd demo
npm install        # kun første gang
npm run dev
```

Åbn `http://localhost:3000/lab/<din-slug>` i browseren. Filen
hot-reloader **øjeblikkeligt** når du gemmer — du behøver ikke pushe
for at se din kode.

### 6. Brug Claude

Det her er hele pointen med workshoppen. Eksempler:

- "Tilføj en filter-knap der viser kun boliger over X kr."
- "Lav et lille kort med statistik over boligerne fra `@/lib/properties`"
- "Tilføj en form der lader brugeren skrive en kommentar (gem i state)"
- "Brug subagent til at scanne `@/lib/properties` og foreslå hvad jeg
  kan bygge"

Husk: `demo/CLAUDE.md` fortæller Claude hvad I må røre. Den læser den
automatisk.

### 7. Push og åbn PR

```bash
git add demo/app/lab/<din-slug>/ demo/participants.json
git commit -m "lab(<din-slug>): første version"
git push -u origin lab/<din-slug>
```

På GitHub: tryk "Compare & pull request". Inden for ~30 sekunder
postet Vercel-bot en preview-URL som kommentar.

### 8. Mergé

Hvis PR'en kun rører `demo/app/lab/<din-slug>/` og din egen linje i
`participants.json` består CI-checken automatisk og PR'en kan merges
uden review.

Hvis CI fejler: tjek hvilke filer du har ændret. Hvis du har rørt noget
udenfor din zone (selv ved et uheld), så ret det og force-push.

### 9. Se dig selv på den live workshop

Når main har merget bygger Vercel produktions-deployet. Find dig selv
på:

- Lokalt: `http://localhost:3000/lab/<din-slug>`
- Live: `https://edc-x-claude-workshops.vercel.app/lab/<din-slug>`
- Facilitator-overblik: `https://edc-x-claude-workshops.vercel.app/lab`

## Hvad du har til rådighed i din folder

Du kan importere fra demo-projektet via `@/`-aliaset:

```tsx
import { properties } from '@/lib/properties';        // bolig-data
import { getParticipant } from '@/lib/participants';   // hent dig selv fra registry
import Link from 'next/link';
```

Tailwind-classes virker out-of-the-box. Brug samme farver som resten
af sitet:

- `bg-edc-blue`, `text-edc-blue` — primær blå
- `bg-edc-warm`, `text-edc-warm` — accent
- Standard Tailwind for resten

## Hvis du sidder fast

1. Tjek dev-serverens output i terminalen — TypeScript-fejl er gode
   hints
2. Spørg Claude med `@demo/CLAUDE.md @demo/app/lab/eksempel/ jeg vil
   bygge X, kig på eksemplet og hjælp`
3. Spørg Matias eller Michael — vi sidder lige ved siden af
