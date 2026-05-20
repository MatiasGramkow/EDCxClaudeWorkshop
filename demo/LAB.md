# LAB.md — sådan tilføjer du din egen side i workshop-lab'en

15 minutter fra du står med tomme hænder til du har en side live på din
egen URL.

## Spillereglerne (læs disse først)

**Du må KUN redigere:**

- `demo/app/lab/<din-slug>/` — alt herinde er dit
- `demo/participants.json` — kun din egen linje

**Du må IKKE røre noget andet.** Hverken andres folders, fælles
biblioteker, eller produktions-demoet på `/`. CI-checken vil afvise
PR'en automatisk hvis du gør. Detaljer i `demo/CLAUDE.md`.

Din slug er allerede oprettet i `participants.json`. Find dig selv på
listen — Claude spørger dig om identitet første gang du starter en
session i `demo/`.

## Trin-for-trin

### 1. Fork repoet

Du har ikke direkte skrive-adgang til `MatiasGramkow/EDCxClaudeWorkshop`.
Du skal arbejde fra din egen fork:

1. Gå til `https://github.com/MatiasGramkow/EDCxClaudeWorkshop`
2. Tryk **Fork** øverst til højre
3. Du har nu `github.com/<dit-handle>/EDCxClaudeWorkshop`

### 2. Klon din fork lokalt

```bash
git clone git@github.com:<dit-handle>/EDCxClaudeWorkshop.git
cd EDCxClaudeWorkshop
git remote add upstream git@github.com:MatiasGramkow/EDCxClaudeWorkshop.git
```

`origin` = din fork. `upstream` = Matias' repo. Du henter ændringer
fra `upstream`, du pusher til `origin`.

### 3. Lav en branch

```bash
git checkout main
git pull upstream main
git checkout -b lab/<din-slug>
```

### 4. Kopiér eksempel-folderen som startpunkt

```bash
cp -r demo/app/lab/eksempel demo/app/lab/<din-slug>
```

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

Det her er hele pointen med workshoppen. Start Claude Code i
`demo/`-mappen — den læser `CLAUDE.md` automatisk og spørger om din
identitet før den redigerer noget. Eksempler:

- "Tilføj en filter-knap der viser kun boliger over X kr."
- "Lav et lille kort med statistik over boligerne fra `@/lib/properties`"
- "Tilføj en form der lader brugeren skrive en kommentar (gem i state)"
- "Brug subagent til at scanne `@/lib/properties` og foreslå hvad jeg
  kan bygge"

### 7. Push til DIN fork og åbn PR

```bash
git add demo/app/lab/<din-slug>/ demo/participants.json
git commit -m "lab(<din-slug>): første version"
git push -u origin lab/<din-slug>
```

På GitHub: gå til din fork → tryk **Contribute** → **Open pull
request**. Det opretter en PR fra `<dit-handle>:lab/<din-slug>` ind i
`MatiasGramkow:main`. Inden for ~30 sekunder poster Vercel-bot en
preview-URL som kommentar (første gang skal Matias godkende at preview
må køre — det er en engangs-ting pr. fork).

### 8. Vent på merge

CI-checken (`scope-check`) kører på PR'en. Hvis den kun rører din
lab-folder + din egen linje i `participants.json` består den
automatisk, og Matias eller du selv merger.

Hvis CI fejler: tjek hvilke filer du har ændret. Hvis du har rørt noget
udenfor din zone (selv ved et uheld), så ret det og push igen — PR'en
opdateres automatisk.

### 9. Se dig selv live

Når main har merget bygger Vercel produktions-deployet. Find dig selv
på:

- Lokalt: `http://localhost:3000/lab/<din-slug>`
- Live: `https://edc-x-claude-workshops.vercel.app/lab/<din-slug>`
- Facilitator-overblik: `https://edc-x-claude-workshops.vercel.app/lab`

### 10. Næste session — hold din fork opdateret

Før hver session, hent nyeste main fra upstream:

```bash
git checkout main
git pull upstream main
git push origin main         # hold din fork up-to-date
git checkout -b lab/<din-slug>-session-<n>
```

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
