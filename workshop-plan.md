# EDC x Claude Code — Workshop-plan (v3, ny format)

**Varighed:** 5 uger · tirsdag + torsdag · 1 time pr. session = **9 sessioner**
**Målgruppe:** Udviklere fra edc.dk, Operational, Erhverv (C# hele vejen rundt, React på edc.dk)
**Format fra session 2:** Recap → deltager-præsentation (1 person) → vælg næste præsentant → Matias-demo (hvis tid)
**Facilitatorer:** Matias Gramkow & Michael (faciliterer alle sessioner — deltagerne præsenterer)

---

## 📍 Status pr. 2026-05-01

- **Format-skifte (2026-05-01):** Workshoppen kører på **deltager-præsentationer** fra session 2. Én deltager pr. session præsenterer dagens emne. Matias og Michael faciliterer og hjælper med slides ugen før. Vi vælger næste præsentant i slutningen af hver session — hvis ingen melder sig, vælger vi.
- **Sammenslået session 3+4 (2026-05-01):** "Kontekst er konge" og "Avanceret prompting" er nu én session. Workshoppen er gået fra 10 til 9 sessioner.
- **Hjemmesiden er KUN til os.** `/workshop?peek=<token>` er facilitator-arbejdsdokument, ikke deltager-facing. Den viser:
  1. Hvem præsenterer (presenter-pill pr. session)
  2. Forarbejde-video (URL pr. session — vi sender ud til deltagerne før hver gang)
  3. PowerPoint-deck (upload via `/api/deck`, gemmes i Vercel Blob)
  4. Reference-noter (foredrag/demo/prompts) som den der præsenterer trækker fra når de bygger slides
- **Live site:** `/workshop` på Vercel (edc-x-claude-workshops) — 9 sessioner med server-side gating pr. dato
- **Start-dato:** Tirsdag 2026-05-05 kl. **11:00** (sat i `api/session.js` → `START_DATE_ISO`)
- **Facilitator peek:** URL `/workshop?peek=<WORKSHOP_PEEK_TOKEN>` (env var på Vercel). På localhost: hvilken som helst `?peek=anything` virker.
- **Indhold:** leveres fra `api/session.js` (ikke længere fra denne md-fil). Per session: `presenters: []` + `prework: { videoUrl, note }`.
- **Endpoints:**
  - `GET /api/session?n=N&peek=...` — session-data + presenters + prework
  - `GET /api/deck?session=N&peek=...` — list uploaded decks
  - `POST /api/deck?peek=...` — Vercel Blob client-upload-protokol (handleUpload)
  - `DELETE /api/deck?session=N&id=...&peek=...` — fjern et deck

---

## Ændringer i v3 (2026-05-01)

| Hvad | Hvorfor |
|---|---|
| **Start-tid 09:00 → 11:00** | Pasrer bedre med deltagernes morgener |
| **Ny session-skabelon (session 2-9)** | Recap (10 min) + deltager-præsentation (35 min) + vælg næste præsentant (5 min) + Matias-demo hvis tid (10 min) |
| **Session 1 = uændret** | Kickoff har ingen pre-work og ingen deltager-præsentation. Matias og Michael kører den. Vælger første præsentant under formatets gennemgang. |
| **Session 3 = sammenslået "Kontekst" + "Avanceret prompting"** | Begge handler om prompting — det giver én tæt session i stedet for to spredte. Ny tilføjelse: hvor vigtig den første prompt er, og `/clear`-metoden (skriv setup til md, så `/clear` — undgå `/compact`). |
| **Session 5 (Git) — tilføjet PAT + `az` til Azure DevOps** | Deltagerne skal kunne lade Claude pushe/pull mod EDC-repos uden manuel auth |
| **Session 6 (Skills, agents) — alle subagents flyttet hertil** | Konsoliderer skills + subagents + model-tuning på ét sted |
| **Session 7 (MCP og hooks) — kun MCP og hooks** | Subagents er væk fra session 7 — den er ren MCP/hooks nu |
| **9 sessioner i alt (var 10)** | Workshoppen ender på Tue Uge 5 i stedet for Thu Uge 5 |

---

## Sessioner — overblik

| # | Dag | Titel | Tema |
|---|---|---|---|
| 1 | Tirsdag · Uge 1 | Kickoff + Gode vs. dårlige prompts | Fundamentet |
| 2 | Torsdag · Uge 1 | Plan mode vs. ikke plan mode | Fundamentet |
| 3 | Tirsdag · Uge 2 | Kontekst er konge (første prompt + `/clear`-flow + scope/chain/debug + /rewind) | Prompting er en superkraft |
| 4 | Torsdag · Uge 2 | CLAUDE.md og projekt-hukommelse | Workflows der virker |
| 5 | Tirsdag · Uge 3 | Git-workflow, commits og review (+ PAT/Azure DevOps) | Workflows der virker |
| 6 | Torsdag · Uge 3 | Skills, agents og model-tuning | Avancerede features |
| 7 | Tirsdag · Uge 4 | MCP og hooks | Avancerede features |
| 8 | Torsdag · Uge 4 | Best practices og faldgruber | Mastery og deling |
| 9 | Tirsdag · Uge 5 | Show & Tell + vejen frem | Mastery og deling |

---

## Fast skabelon pr. session (60 min)

### Session 1 — uændret (Matias + Michael kører)

| Tid | Del | Hvad |
|---|---|---|
| 0:00–0:05 | Velkomst | Kort intro |
| 0:05–0:15 | Foredrag | Hvordan de næste 5 uger foregår + vælg næste præsentant |
| 0:15–0:30 | Live demo | Dårlig vs. god prompt på `/demo` |
| 0:30–0:55 | Par-øvelse | Deltagerne prøver begge prompt-typer på egen kode |
| 0:55–1:00 | Take-home | Del indsigter + handout |

### Session 2-9 — ny skabelon

| Tid | Del | Hvad |
|---|---|---|
| 0:00–0:10 | Recap | Hjemmeopgave — hvad virkede? hvad gik galt? |
| 0:10–0:45 | Deltager-præsentation | 1 person fra holdet præsenterer dagens emne (slides bygget ugen før med Matias/Michael) |
| 0:45–0:50 | Beslut næste præsentant | Hvem tager næste session? Hvis ingen melder sig, vælger Matias/Michael |
| 0:50–1:00 | Matias-demo | Live-demo af noget relateret hvis der er tid |

---

## Operativt flow pr. session

1. **Forberedelse (mellem sessioner — uge før):**
   - Næste præsentant arbejder med Matias/Michael på slides
   - Reference-noter (foredrag/demo/prompts) i `api/session.js` er udgangspunktet
   - Pre-work-video lægges som URL i `api/session.js` → `prework.videoUrl` og deles med deltagerne
   - Slides uploades på `/workshop?peek=<token>` under den relevante session-blok (gemt som .pptx eller .pdf i Vercel Blob)
2. **Live (60 min):**
   - 1 deltager præsenterer (max — ikke 2)
   - Matias/Michael faciliterer + giver hånd hvis præsentanten går i stå
   - Reference-noter på `/workshop` er backstage — bruges som spørge-buffer + til at bygge Matias-demo
3. **Afslutning af session:**
   - Vælg næste præsentant — opdater `presenters: []` i `api/session.js`

### Presenter-rotation

| Session | Præsentant |
|---|---|
| 1 | Matias & Michael (kickoff) |
| 2 | Vælges i session 1 |
| 3-9 | Vælges ved afslutning af forrige session |

---

# Uge 1 — Fundamentet

## Session 1 (tirsdag) — Kickoff + "Hvad er en god prompt?"

**Format:** Matias + Michael kører dette. Ingen deltager-præsentation. Bruges også til at vælge præsentant til session 2.

**Foredrag (10 min):**
- 5 ugers forløb · 9 sessioner · tirsdag + torsdag · 1 time
- Format fra session 2: deltager-præsenterer (1 person), Matias/Michael faciliterer
- Vælg næste præsentant under denne foredrag — hvis ingen melder sig, vælger vi 1
- Pre-work fra session 2 (kort video sendes ud)
- Dagens emne: gode vs. dårlige prompts
- `Esc Esc` som undo-knap fra dag 1 — tryghed uden frygt

**Live demo (15 min):**
- Brug demo-projektet på `/demo` — alle priser vises i USD ("$8,500,000.00")
- Dårlig prompt vs. god prompt vist live i terminalen

**Hands-on (25 min):**
- Par-øvelse 2 og 2: prøv begge prompt-typer på samme opgave

**Hjemmeopgave til session 2:**
- Brug Claude Code på mindst én rigtig opgave inden torsdag
- Tag prompt der virkede + en der ikke virkede med

---

## Session 2 (torsdag) — Plan mode vs. ikke plan mode

**Deltager-præsenterer:** Plan mode + permissions + hele mode-cyklen (Shift+Tab)

**Reference-noter dækker:**
- Plan mode (Shift+Tab) — hvornår tænk-først
- acceptEdits / auto / bypassPermissions — sweet spots
- `.claude/settings.json` baseline for EDC
- Context-hygiejne kort (`/clear`, `/compact`, `/context`)

**Hjemmeopgave:** brug plan mode i den weekend, tag plan med til session 3

---

# Uge 2 — Prompting er en superkraft (kondenseret til ÉN session)

## Session 3 (tirsdag) — Kontekst er konge

**Deltager-præsenterer:** Kontekst er konge — fra første prompt til `/clear`-flow + scope/chains/debug + /rewind/Ctrl+B

**Reference-noter dækker:**
- **Den første prompt er alt** — den sætter tone, scope, kvalitet for hele samtalen
- De 4 slags kontekst (filer, regler, eksempler, begrænsninger)
- `@`-syntaks: `@fil`, `@fil#L20-40`, `@mappe/`
- Anti-pattern: copy-paste hele filer
- **`/clear`-metoden (anbefalet over `/compact`):**
  1. Skriv `setup.md` med "hvad arbejder vi på, hvad er gjort, næste skridt"
  2. `/clear`
  3. Genstart: "Læs @setup.md og fortsæt"
- Scope-lock pattern, chain prompting, debug-pattern med hypotese
- `/rewind` (Esc Esc) — 4 valg: code only / conversation only / both / cancel
- `Ctrl+B` background tasks + `/tasks` + `Ctrl+T`

**Hjemmeopgave:** find ud af om dit projekt har en CLAUDE.md, ellers tænk på hvad der bør stå i den

---

## Session 4 (torsdag) — CLAUDE.md og projekt-hukommelse

**Deltager-præsenterer:** CLAUDE.md, `.claude/rules/`, `/memory`, `/init`

**Hjemmeopgave:** committe CLAUDE.md i et af dine repos

---

# Uge 3 — Workflows der virker

## Session 5 (tirsdag) — Git-workflow, commits, review (+ PAT/Azure DevOps)

**Deltager-præsenterer:** `/commit`, `/review`, custom /commit, og **PAT + `az`-CLI til Azure DevOps**

**Reference-noter dækker:**
- `/commit` og `/review` flow
- Hvad Claude fanger / ikke fanger
- **Azure DevOps adgang:**
  - PAT-oprettelse: User Settings → Personal Access Tokens → scope `Code (read & write)`, max 90 dages udløb
  - Git Credential Manager: `git config --global credential.helper "manager-core"`
  - `az login` + `az extension add --name azure-devops` + `az devops login`
  - `az repos pr create` for at lade Claude oprette PRs
- Sikkerhed: aldrig PAT i prompts/repos/Slack

**Hjemmeopgave:** brug /commit eller /review en gang, sæt PAT/az op hvis ikke gjort

---

## Session 6 (torsdag) — Skills, agents og model-tuning

**Deltager-præsenterer:** Custom commands, skills, **subagents** (alle subagent-emner samles her), `/model`, `/effort`

**Reference-noter dækker:**
- Built-in commands + custom `.claude/commands/`
- `.claude/skills/<navn>/SKILL.md` med paths-frontmatter
- **Subagents — fuldt dækket:**
  - Built-in (Explore, Plan)
  - Custom: code-archaeologist, test-reviewer
  - Parallelle subagents (review 3 PRs samtidig)
  - Hvornår delegere
- Model + effort tuning: Opus/Sonnet/Haiku, low/medium/high/xhigh/max, `Option+P` quick-switch
- Headless mode (`claude -p`)

**Hjemmeopgave:** byg ét custom command + brug det 3 gange

---

# Uge 4 — Avancerede features

## Session 7 (tirsdag) — MCP og hooks

**Deltager-præsenterer:** MCP-servere + hooks (PreToolUse / PostToolUse / Stop / UserPromptSubmit)

**Reference-noter dækker:**
- `/mcp` picker
- GitHub MCP (også relevant for Azure DevOps MCP)
- `.mcp.json` projekt-niveau (committes uden secrets)
- Hooks: bloker farlige kommandoer, auto-test efter Stop, auto-format efter Edit
- Sikkerhed + exit codes

**Hjemmeopgave:** installer en MCP eller byg en hook, aktiv hele ugen

---

## Session 8 (torsdag) — Best practices og faldgruber

**Deltager-præsenterer:** Top 10 faldgruber, AI-kode med skjulte bugs, secrets-tjek

**Hjemmeopgave:** forbered 3-min Show & Tell til session 9

---

# Uge 5 — Mastery og deling

## Session 9 (tirsdag) — Show & Tell + vejen frem

**Deltager-præsenterer:** Hele holdet har 3 min hver til "min bedste Claude Code-oplevelse"

**Reference-noter dækker:**
- `/remote-control`, `/teleport`, `/mobile` som closer
- EDC fælles CLAUDE.md-standard
- Hvordan holder vi momentum (#claude-code kanal, månedligt Show & Tell)

---

## Pædagogiske principper

- **"Det du tager hjem" > "det jeg viste"**. Hver session ender med noget konkret i hånden.
- **Skriv det ned, test det live**. Slides sætter rammen — terminalen er hvor det lander.
- **Dumme spørgsmål først**. Start hver session med 2 min "hvad gik galt i hjemmeopgaven?".
- **Psykologisk sikkerhed**. Sessions 1–2: man arbejder kun på egen kode, ikke kolleger. Fra session 3: par på tværs af teams hvor relevant.
- **Deltager-præsentation = læring i sig selv**. At forklare et emne tvinger til dybere forståelse end at høre om det. Roteret rundt blandt holdet.

---

## Forberedelse pr. session

| Hvad | Hvem | Hvornår |
|---|---|---|
| Slides bygget med Claude Code | Næste præsentant + Matias/Michael | Ugen før |
| Pre-work video sendt ud | Facilitatorer | Senest 24 timer før |
| Egen backlog-opgave med | Deltagere | Hver session |
| Hjemmeopgave tjekket ind | Deltagere | Før næste session |

---

## Faciliterings-tips

- **Start altid med hjemmeopgaven** — det er dér læring landede
- **Hjælp præsentanten uden at overtage** — Matias/Michael støtter, men deltageren har scenen
- **Terminal > slides** — hvis Matias-demoen kommer i sidste 10 min, så LIVE i terminalen
- **Reference-noter = bagagerum**, ikke pligtlæsning. Træk fra dem, lad være med at læse op af dem.
- **Byg fælles vidensbank undervejs** — upload alle prompts/commands/CLAUDE.md'er til fælles repo
- **"Dumme spørgsmål" er de bedste** — skab tryghed fra dag 1
