# CLAUDE.md — EDC Workshop Demo

Dette repo bruges som hands-on legeplads i EDC × Claude Code workshoppen.
Reglerne nedenfor gælder for **alle** der arbejder her — og Claude SKAL
overholde dem uden undtagelse.

## 🟢 Allerførste handling i en session — identificér brugeren

Som det aller første i en ny samtale i dette projekt SKAL Claude:

1. **Læs `demo/participants.json`** for at få den aktuelle deltager-liste.
2. **Vis listen** for brugeren i et terminal-venligt format —
   nummereret, grupperet pr. team, fx:

   ```
   Hej! Hvem er du? Skriv enten dit navn (delvist er fint),
   din slug, eller nummeret fra listen.

   Facilitatorer:
      1. Michael Nygaard            (michael)

   EDC:
      2. Rune Kobberø               (rune)
      3. Magloire Sendegeya         (magloire)
      ...

   Feriepartner:
     25. Caroline Friis             (caroline)
     ...
   ```

3. **Accepter fuzzy match** på brugerens svar:
   - Eksakt slug → match
   - Eksakt navn → match
   - Nummer fra listen → match
   - Delvist fornavn (fx "yo" eller "yonas") → match hvis unik
   - Flere mulige matches → spørg: "Mente du X eller Y?"
   - Intet match → vis listen igen og spørg på ny

4. **Bekræft kort**: "Hej Yonas — jeg holder dig til
   `demo/app/lab/yonas/`. Hvad skal vi bygge?"

5. **Husk slug'en** for resten af samtalen og begræns ALLE redigeringer
   til `demo/app/lab/<slug>/**` og deltagerens egen linje i
   `demo/participants.json`. Afvis alt andet — medmindre der findes en
   lokal regelfil under `demo/.claude/rules/` der eksplicit udvider
   tilladelserne for den slug.

Du må ikke redigere nogen fil før brugeren er identificeret. Hvis
brugeren siger "jeg er bare på besøg", så svar venligt at de er
velkomne til at læse koden, men at du ikke kan hjælpe med at redigere
uden en registreret deltager-slug.

## 🚨 Vigtigste regel — rør KUN din egen folder

Hver deltager har præcis ÉN slug (fx `yonas`). Du må kun røre filer i:

1. `demo/app/lab/<din-slug>/` — din egen workspace (alt herinde er frit)
2. `demo/participants.json` — kun din egen indgang i `participants`-arrayet

**Du må ALDRIG redigere:**

- Noget under `demo/app/lab/<en-anden-slug>/` — det er andres workspace
- Noget under `demo/app/` udenfor `lab/` — det er produktions-demoet (`/`)
- `demo/components/`, `demo/lib/`, `demo/types/` — fælles biblioteker
- Filer i repo-roden (`api/`, `slides/`, `workshop.html`, `.github/`, m.fl.)
- Andres linjer i `demo/participants.json`

Hvis du har brug for at ændre noget udenfor din egen folder for at få din
feature til at virke — **stop og spørg Matias eller Michael**. Det er
sandsynligvis et tegn på at din feature skal designes anderledes (selvstændig
i din folder), eller at vi bør lave en fælles helper sammen.

## Hvis du er Claude (læser dette automatisk)

Når brugeren beder dig redigere filer i dette repo:

1. **Identificér slug'en**: spørg brugeren hvad deres slug er hvis det
   ikke er åbenlyst fra branch-navn, eksisterende filer eller samtalens
   kontekst.
2. **Hold dig inden for boksen**: rør kun `demo/app/lab/<slug>/**` og
   tilføj/opdatér kun deres egen linje i `demo/participants.json`.
3. **Hvis brugeren beder dig røre noget udenfor**: advar tydeligt om at
   det er udenfor deres tilladte zone. Foreslå alternativer (kopier en
   helper ind i deres egen folder, brug en eksisterende fra `@/lib`).
   Gør det kun hvis brugeren bekræfter at de selv tager ansvar.

## Sådan tilføjer du dig selv

1. Tilføj én linje i `demo/participants.json` (i `participants`-arrayet):
   ```json
   {
     "slug": "din-slug",
     "name": "Dit Fulde Navn",
     "team": "team-navn",
     "tagline": "kort beskrivelse"
   }
   ```
2. Opret folderen `demo/app/lab/<din-slug>/`
3. Kopier `demo/app/lab/eksempel/page.tsx` ind som startpunkt og ret
   indholdet
4. Kør `npm run dev` i `demo/` og besøg `http://localhost:3000/lab/<din-slug>`

## Tekniske konventioner

- **Framework**: Next.js 16 App Router, TypeScript, Tailwind CSS v4
- **Path-alias**: `@/*` peger på `demo/` — brug det fx `@/lib/properties`
- **Sprog**: UI-tekst er dansk. Kode-kommentarer kan være dansk eller
  engelsk.
- **Data**: brug eksisterende `properties` fra `@/lib/properties` hvis du
  vil arbejde med bolig-data. Lav ikke duplikerede data-filer.
- **Styling**: brug Tailwind-classes (samme som resten af sitet). Tilføj
  IKKE nye CSS-filer eller globale styles.
- **State / interaktion**: hvis siden skal være interaktiv, brug
  `'use client'`-direktivet øverst i din `page.tsx`.

## Push og preview

- Lav en branch med din slug i navnet, fx `lab/<slug>` eller
  `feature/<slug>-<kort-beskrivelse>`
- Push branchen → Vercel laver automatisk en preview-URL
- Åbn PR → preview-URL postes som comment
- Når PR'en er klar: Matias merger til main (eller du selv hvis PR'en kun
  rører din egen folder — det tjekker CI for)

## Hvor du IKKE finder svar

Hvis du har brug for at ændre noget udenfor din egen folder (fælles
helper, ny route udenfor `/lab`, ændring i `demo/components/`), så er det
ikke en workshop-opgave. Skriv til Matias eller Michael — vi tager det
sammen.
