# EDC x Claude Code — Workshop-plan (v2, survey-baseret)

**Varighed:** 5 uger · tirsdag + torsdag · 1 time pr. session = 10 sessioner
**Målgruppe:** Udviklere fra edc.dk, Operational, Erhverv (C# hele vejen rundt, React på edc.dk)
**Format:** Kort foredrag (10–15 min) → live demo (10–15 min) → hands-on (25–30 min) → take-home (5 min)
**Facilitator:** Matias Gramkow

---

## Hvad fortæller survey'en os?

Baseret på de første svar (6 stk, ~20 forventet):

| Niveau | Hvem (indtil videre) | Andel |
|---|---|---|
| `tried` (begynder) | Edvard, Troels | ~33 % |
| `advanced` | Cecilie, Christian, Oliver | ~50 % |
| `daily` (power user) | Jacob | ~17 % |

**Ønskede emner (på tværs af niveau):**
- `best-practices` — 5/6
- `advanced-features` — 5/6
- `workflow` — 4/6
- `prompting` — 3/6 (både begyndere og advanced!)

**Hvad folk allerede bruger:**
- Nærmest alle: basic-chat, file-edit, bash, git-ops
- Kun 1/6 bruger hooks (Oliver)
- 3/6 har rørt MCP, men uden at "kunne det"
- 3/6 har prøvet subagents (men begynder Troels har tikket af — sikkert forvirring)
- Plan mode bruges kun af de advanced

**Hvad det betyder pædagogisk:**
1. **Ét hold, to spor.** Hver session har en A-øvelse (begynder) og B-øvelse (advanced) på samme tema. Det undgår at begyndere drukner og advanced keder sig.
2. **Par-arbejde på tværs af niveau** fra session 3. Power users lærer bedst ved at forklare — begyndere lærer hurtigst af at se.
3. **Én handout + én hjemmeopgave pr. session.** Så deltagerne har noget i hånden og noget at tage med til næste gang.
4. **Kødfuld prompting-linje** gennem hele forløbet — det er det emne hvor spredningen er størst, og alle vil have mere.

---

## Pædagogiske principper

- **"Det du tager hjem" > "det jeg viste"**. Hver session ender med noget konkret i hånden.
- **Skriv det ned, test det live**. Ingen PowerPoint-teori uden terminal bagefter.
- **Dumme spørgsmål først**. Start hver session med 2 min "hvad gik galt i hjemmeopgaven?".
- **Psykologisk sikkerhed**. Sessions 1–2: man arbejder kun på egen kode, ikke kolleger. Fra session 3: par på tværs af teams.

---

## Fast skabelon pr. session (60 min)

| Tid | Del | Hvad |
|---|---|---|
| 0:00–0:05 | Recap | Hjemmeopgave — hvad virkede? hvad gik galt? |
| 0:05–0:20 | Foredrag | Dagens emne, 3–4 kernepointer |
| 0:20–0:35 | Live demo | Samme emne vist i terminalen på ægte kode |
| 0:35–0:55 | Hands-on | A-spor (begynder) / B-spor (advanced) |
| 0:55–1:00 | Take-home | Handout + hjemmeopgave |

---

# Uge 1 — Fundamentet

## Session 1 (tirsdag) — Kickoff + "Hvad er en god prompt?"

**Matias' intro til forløbet + første emne** (som du foreslog).

**Foredrag (15 min):**
- Sådan foregår de næste 5 uger (tirsdag/torsdag, 2 spor, hjemmeopgaver, handouts)
- Survey-resultater vist tilbage: "her er vi som organisation"
- Claude Code i 3 minutter: hvad det er, hvad det ikke er
- **Dagens emne: Gode vs. dårlige prompts** — hvorfor det er fundamentet

**Live demo (15 min):**
- Samme opgave, to prompts:
  - ❌ "fix buggen i min kode"
  - ✅ "Læs `UserService.cs`. Metoden `GetUser` returnerer null når email er tom string — tilføj validering og en test der dækker det. Rør ikke andet."
- Vis forskellen live i deres sprog (C# eksempel)
- Kort om **plan mode** som teaser til torsdag

**Hands-on (25 min):**
- **A-spor (tried):** Åbn Claude Code i et C#-projekt. Stil 3 spørgsmål om koden. Brug cheatsheetet som skabelon.
- **B-spor (advanced/daily):** Find en opgave fra jeres backlog. Skriv én "worst case" prompt og én "best case" prompt. Kør begge. Noter forskellen.

**Handout:** `handouts/01-prompting-cheatsheet.md` — 1-sides skabelon: *[Kontekst] + [Opgave] + [Begrænsninger] + [Format/forventet output]*

**Hjemmeopgave til torsdag:**
- Brug Claude Code på mindst én rigtig opgave i jeres kode
- Noter 1 prompt der virkede godt og 1 der ikke gjorde
- Tag begge med til torsdag

---

## Session 2 (torsdag) — Plan mode vs. ikke plan mode

**Foredrag (15 min):**
- Dagens dilemma: Hvornår skal Claude tænke før den koder?
- Plan mode forklaret: Shift+Tab, "forklar hvad du vil gøre uden at ændre noget"
- De 3 situationer hvor plan mode vinder:
  1. Opgaven er uklar — du ved ikke helt hvad du vil
  2. Opgaven rører flere filer
  3. Du vil lære af Claudes tilgang før implementering
- Permissions-systemet kort: accept-edits, bypass-permissions, ask

**Live demo (15 min):**
- Tag en refactor-opgave. Kør den først UDEN plan mode → "go go go"-mode
- Rul tilbage. Kør med plan mode → se planen → "ja men ikke trin 3, lav det anderledes"
- Vis hvordan man godkender/afviser redigeringer
- Hvor `settings.json` ligger og hvad man kan sætte

**Hands-on (25 min):**
- **A-spor:** Tag en lille opgave (rename, tilføj et felt, skriv en test). Brug plan mode. Sammenlign med hvad du ville have gjort selv.
- **B-spor:** Tag en multi-file ændring. Brug plan mode. Afvis mindst ét trin i planen og bed om alternativ. Commit resultatet.

**Handout:** `handouts/02-planmode-beslutningstrae.md` — flowchart: "Skal jeg bruge plan mode?"

**Hjemmeopgave til tirsdag:**
- Brug plan mode på mindst én ægte opgave i løbet af weekenden
- Gem planen Claude foreslog (screenshot / kopiér) — vi kigger på den i session 3

---

# Uge 2 — Prompting er en superkraft

## Session 3 (tirsdag) — Kontekst er konge

**Foredrag (15 min):**
- Hvorfor Claude "hallucinerer": fordi den ikke ved hvad den ikke ved
- De 4 slags kontekst:
  1. **Filer** ("læs først `X.cs`, `Y.cs`")
  2. **Regler** ("vi bruger xUnit, ikke NUnit")
  3. **Eksempler** ("gør det som `ExistingService.cs` gør")
  4. **Begrænsninger** ("rør kun denne metode")
- Hvorfor `@filename` er dit bedste værktøj

**Live demo (15 min):**
- Tag samme opgave med 3 forskellige mængder kontekst:
  1. Ingen kontekst → generisk kode
  2. Filer + mønster → god kode
  3. Filer + mønster + eksempel → produktionsklar kode
- Vis på både C# og React (edc.dk-deltagere)

**Hands-on (25 min) — PAR-ØVELSE på tværs af teams:**
- **A+B sammen:** Par med én begynder + én advanced.
- Begynder vælger opgave fra sin kode. Advanced hjælper med at skrive en kontekst-rig prompt.
- Skift roller.
- Saml de 3 bedste prompts på tavlen.

**Handout:** `handouts/03-kontekst-checklist.md` — "Før du trykker enter: har du givet filer, regler, eksempler, begrænsninger?"

**Hjemmeopgave til torsdag:**
- Lav en "prompt-log" i en note-fil: hver gang du prompter denne uge, gem prompten + hvad der kom ud + 1-sætnings vurdering

---

## Session 4 (torsdag) — Avanceret prompting: scope, chains, debugging

**Foredrag (15 min):**
- Scope-kontrol: "ændr KUN X, rør ikke resten"
- Chain prompting: én opgave ad gangen vs. alt på én gang (og hvornår hvad)
- Debug-pattern: "her er fejlen + stacktrace + hvad jeg har prøvet — hvad er den mest sandsynlige årsag?"
- **Anti-patterns:** brede opgaver, blindt accept, "fix alt"-prompts

**Live demo (15 min):**
- Kør en rigtig fejl fra et projekt
- Vis 3 forskellige debug-prompts fra dårlig til fremragende
- Vis hvordan Claude bedst bruges til at *udelukke* mistænkte, ikke til at gætte

**Hands-on (25 min):**
- **A-spor:** Tag en bug. Skriv en debug-prompt med: fejl + stacktrace + hvad du har prøvet. Vurder resultatet.
- **B-spor:** Tag en større feature. Bryd den ned i 3 chained prompts. Kør dem sekventielt. Sammenlign med at have promptet "byg det hele".

**Handout:** `handouts/04-prompt-patterns.md` — 6 genbrugelige prompt-skabeloner (debug, refactor, test, review, forklar, scope-lock)

**Hjemmeopgave til tirsdag:**
- Vælg ét projekt du arbejder i. Find ud af om det har en `CLAUDE.md`. Hvis nej, tænk 5 min over hvad der burde stå i den. Tag notater med.

---

# Uge 3 — Workflows der virker

## Session 5 (tirsdag) — CLAUDE.md og projekt-hukommelse

**Foredrag (15 min):**
- Hvad en CLAUDE.md er: Claudes "onboarding-dokument" til jeres projekt
- Hvad hører IND: stack, konventioner, hvad man IKKE skal gøre, hvor tingene ligger
- Hvad hører IKKE IND: generel dokumentation, API-docs, ting der ændrer sig hver uge
- Memory-systemet (auto-memory): forskellen på projekt-CLAUDE.md og personlig memory

**Live demo (15 min):**
- Åbn et EDC-projekt uden CLAUDE.md. Stil et spørgsmål → se generisk svar.
- Tilføj en god CLAUDE.md. Stil samme spørgsmål → se præcis svar.
- Vis EDC.EDCDK.Website's CLAUDE.md som C#-eksempel
- Vis en React/TS-CLAUDE.md for edc.dk-folkene

**Hands-on (25 min):**
- **Alle spor:** Skriv (eller forbedr) en CLAUDE.md til dit team-repo. Hjemmeopgaven fra torsdag ER dit input.
- **A-spor:** Kopiér skabelonen, fyld ud.
- **B-spor:** Kritisér eksisterende CLAUDE.md i jeres repos. Slet det der er støj. Tilføj "det Claude plejer at gætte forkert på".

**Handout:** `handouts/05-claudemd-skabelon.md` — en udfyldbar skabelon + do/don't-liste

**Hjemmeopgave til torsdag:**
- Få din nye CLAUDE.md commit'et i dit repo (hvis muligt) — eller mindst: kør Claude med og uden den og noter forskellen

---

## Session 6 (torsdag) — Git-workflow, commits og review

**Foredrag (15 min):**
- `/commit` — generér god commit-besked ud fra dine ændringer
- `/review` — lad Claude kigge på et PR før kolleger gør
- Hvad Claude ER god til at fange: typing, manglende null-checks, konvention-brud, glemte tests
- Hvad Claude IKKE ER god til at fange: domæne-logik, performance på rigtig skala, sikkerhed på infrastrukturniveau
- Golden rule: Claude-review erstatter ikke kollega-review, det forbereder det

**Live demo (15 min):**
- Lav en reel ændring live. Kør `/commit`. Diskutér commit-beskeden.
- Kør `/review` på en PR fra jeres repo. Gå igennem hvilke kommentarer der er værd at rette.

**Hands-on (25 min) — PAR-ØVELSE:**
- Lav en lille ændring i dit repo.
- Commit med Claude.
- **Byt kode** med din par-partner.
- Review hinandens kode med Claude. Del feedback.

**Handout:** `handouts/06-review-checklist.md` — "Før du stoler på Claude-review, tjek selv: [liste]"

**Hjemmeopgave til tirsdag:**
- Brug `/commit` eller `/review` mindst én gang på ægte arbejde
- Find én ting Claude påpegede, som du ikke ville have fanget selv

---

# Uge 4 — Avancerede features

## Session 7 (tirsdag) — Slash commands og custom commands

**Foredrag (15 min):**
- Built-in commands: `/commit`, `/review`, `/init`, `/clear`, `/compact`
- Custom slash commands i `.claude/commands/` — simpel markdown-fil = ny kommando
- Hvornår er det værd at bygge en? (3+ gentagelser = byg den)
- Model-valg: Opus / Sonnet / Haiku — hvornår hvad?

**Live demo (15 min):**
- Byg live en `/pr-description` command for EDC
- Byg en `/explain-endpoint` command til C#-controllers
- Vis hvordan den kører

**Hands-on (25 min):**
- **A-spor:** Tilpas én af de færdige EDC-commands til dit eget repo. Kør den.
- **B-spor:** Byg en custom command til dit teams mest gentagne opgave. Commit den til `.claude/commands/` i dit repo.

**Handout:** `handouts/07-custom-command-kogebog.md` — 3 færdige EDC-kommandoer som starter-pakke

**Hjemmeopgave til torsdag:**
- Brug din/en custom command mindst 3 gange. Noter: hvad skulle justeres efter første kørsel?

---

## Session 8 (torsdag) — MCP, hooks og automatisering

**Foredrag (15 min):**
- MCP (Model Context Protocol) i praksis — hvad det giver dig
- Praktiske MCP-servere for EDC: filesystem, GitHub, evt. database
- Hooks: automatiske handlinger (fx kør tests før commit, tjek secrets før filer lukkes)
- Sikkerhed: hvad må hooks/MCP — og hvad må de ikke

**Live demo (15 min):**
- Opsæt GitHub MCP live → "lav en PR"-flow
- Opsæt en `PreToolUse`-hook der blokerer `rm -rf`
- Vis en `Stop`-hook der kører `dotnet test` når Claude er færdig

**Hands-on (25 min):**
- **A-spor:** Opsæt GitHub MCP. Kør "list mine PRs". Bare dét.
- **B-spor:** Skriv én hook til dit eget workflow (fx auto-test efter edit af `.cs`-fil, eller block hvis der røres `.env`).

**Handout:** `handouts/08-mcp-og-hooks-kickstart.md` — færdige `settings.json`-snippets

**Hjemmeopgave til tirsdag:**
- Behold mindst én hook eller én MCP-server aktiv i hele ugen. Noter én ting der sparede dig tid, og én ting der var irriterende.

---

# Uge 5 — Mastery og deling

## Session 9 (tirsdag) — Best practices og faldgruber

**Foredrag (15 min):**
- De 10 faldgruber vi (og I) er stødt på gennem de 8 sessioner
- Sikkerhed: secrets, supply chain, hvad Claude IKKE må se
- Kvalitetsbalance: hvornår stole på Claude, hvornår dobbelttjekke
- "Teknisk gæld fra AI" — kode der virker men er skrøbelig
- Prompt-fatigue og hvordan man undgår det

**Live demo (15 min):**
- Vis et stykke AI-genereret kode der SER rigtigt ud, men har en subtil bug
- Gennemgå hvordan man fanger den — uden at læse hver linje

**Hands-on (25 min) — GRUPPE-ØVELSE:**
- Matias deler et stykke AI-genereret C#-kode med 3 skjulte fejl
- Grupper på 3–4 finder fejlene. Brug Claude til at hjælpe.
- Fælles gennemgang af hvad der blev fundet.

**Handout:** `handouts/09-do-og-dont.md` — "EDC's do's and don'ts for AI-assisteret kode" (kan bruges som bilag til interne retningslinjer)

**Hjemmeopgave til torsdag:**
- Forbered 3 min "Min bedste Claude Code-oplevelse" til session 10

---

## Session 10 (torsdag) — Show & Tell + vejen frem

**Foredrag (10 min):**
- Recap af forløbet
- De største aha-oplevelser på tværs af sessioner

**Show & Tell (30 min):**
- Hver person/team: 3 min om "min bedste Claude Code-oplevelse" eller "dét jeg bygger videre på"

**Fælles (15 min):**
- EDC's fælles CLAUDE.md-standard — hvad er vi enige om?
- Hvordan holder vi momentum? (#claude-code-kanal, månedligt Show & Tell)
- Feedback på workshop-serien

**Handout:** `handouts/10-edc-claudecode-playbook.md` — alt vi har bygget, samlet i én fil som reference

**Take-home:**
- Én konkret forpligtelse pr. person ("om 3 måneder har jeg …")

---

## Handouts — oversigt

Hver handout er en kort markdown-fil (1–2 sider), printvenlig, som deltagerne kan proppe i deres repo eller OneNote.

| # | Fil | Type |
|---|---|---|
| 01 | `handouts/01-prompting-cheatsheet.md` | Skabelon |
| 02 | `handouts/02-planmode-beslutningstrae.md` | Flowchart |
| 03 | `handouts/03-kontekst-checklist.md` | Checklist |
| 04 | `handouts/04-prompt-patterns.md` | Skabeloner |
| 05 | `handouts/05-claudemd-skabelon.md` | Skabelon |
| 06 | `handouts/06-review-checklist.md` | Checklist |
| 07 | `handouts/07-custom-command-kogebog.md` | Færdige commands |
| 08 | `handouts/08-mcp-og-hooks-kickstart.md` | Config-snippets |
| 09 | `handouts/09-do-og-dont.md` | Retningslinjer |
| 10 | `handouts/10-edc-claudecode-playbook.md` | Samlet reference |

---

## Splitning i 2 hold — hvornår og hvordan?

**Sessions 1–2:** Samme hold. Alle skal med samme sted hen. A/B-øvelse er eneste forskel.

**Sessions 3–4, 7–8:** A/B-spor i hands-on, men foredrag + demo er fælles. Lad advanced-folk parre med begyndere.

**Sessions 5–6:** Alle arbejder på deres eget projekt — naturlig differentiering. Power users laver dybere CLAUDE.md og mere avancerede review-flows; begyndere bygger deres første.

**Sessions 9–10:** Ét hold. Det er deling og refleksion.

**Hvis gruppen bliver stor (~20):** Split fysisk i rummet fra session 3. A-spor i den ene ende (Matias patruljerer), B-spor i den anden (eventuelt en advanced deltager som "buddy").

---

## Forberedelse pr. session

| Hvad | Hvem | Hvornår |
|---|---|---|
| Survey udfyldt | Deltagere | Inden session 1 |
| Claude Code installeret + kørende | Deltagere | Inden session 1 |
| En lille backlog-opgave med | Deltagere | Hver session |
| Handout printet/delt | Matias | Dagen inden |
| Hjemmeopgave tjekket ind | Deltagere | Før næste session |

---

## Faciliterings-tips

- **Start altid med hjemmeopgaven** — det er dér læring landede
- **Terminal > PowerPoint** — vis det, ikke-fortæl det
- **Hands-on er hellig** — skær i foredrag, aldrig i øvelser
- **Blandede par fra session 3** — det er dér advanced folk lærer mest (ved at forklare)
- **Byg fælles vidensbank undervejs** — upload alle prompts/commands/CLAUDE.md'er til fælles repo
- **"Dumme spørgsmål" er de bedste** — skab tryghed fra dag 1
