# EDC x Claude Code — Workshop-plan

**Varighed:** 5 uger (tirsdag + torsdag, 1 time pr. session = 10 sessioner)
**Målgruppe:** Alle EDC-udviklerteams (Edc.dk, Operational, Erhverv, Arkitekterne)
**Format:** Foredrag + live demo + hands-on-øvelser
**Facilitator:** Matias Gramkow

---

## Uge 1 — Fundamentet

### Session 1 (tirsdag): Velkommen til Claude Code
**Tema:** Hvad er Claude Code, og hvorfor bruger vi det?

- Intro til workshop-serien (forventninger, format, "safe space")
- AI-assisteret udvikling vs. AI-genereret kode — forskellen
- Claude Code vs. ChatGPT/Copilot/Cursor — hvad gør det anderledes?
- Live demo: Åbn terminalen, start Claude Code, stil et spørgsmål
- Gennemgang af survey-resultater (hvor er vi som organisation?)
- **Hands-on:** Alle åbner Claude Code i deres projekt og stiller 3 spørgsmål om deres kode

**Deltagerne tager med:**
- Forståelse af hvad Claude Code er og ikke er
- Claude Code kører og virker på deres maskine

---

### Session 2 (torsdag): Grundlæggende interaktion
**Tema:** Lær at "tale" med Claude Code

- Permissions-systemet: hvad må Claude, og hvad skal du godkende?
- Navigering: læse filer, søge i kode, forstå kontekst
- Redigering: lade Claude redigere filer, godkende ændringer
- Bash-kommandoer: hvornår og hvordan Claude kører shell-kommandoer
- Keyboard shortcuts og interface-tips
- **Hands-on:** Tag en lille bug eller refactoring-opgave og løs den med Claude Code

**Deltagerne tager med:**
- Komfort med at lade Claude læse og redigere filer
- Forståelse af permissions og sikkerhed

---

## Uge 2 — Prompting er en superkraft

### Session 3 (tirsdag): Prompting 101
**Tema:** Kunsten at skrive gode prompts

- Hvorfor prompten er alt (garbage in = garbage out)
- De 5 byggeklodser: kontekst, opgave, format, begrænsninger, eksempler
- Specifik vs. vag: "fix buggen" vs. "i UserService.cs linje 42 returnerer GetUser null når email er tom — tilføj validering"
- Iterativ prompting: start bredt, snævr ind
- Live demo: Dårlig prompt vs. god prompt — se forskellen
- **Hands-on:** Omskriv 3 dårlige prompts til gode prompts, test dem i Claude Code

**Deltagerne tager med:**
- Forståelse af at prompts er en skill der kan trænes
- En tjekliste for gode prompts

---

### Session 4 (torsdag): Prompting for udviklere
**Tema:** Avancerede prompting-patterns til daglig kode

- "Forklar inden du koder" — få Claude til at tænke højt
- Scope-kontrol: "ændr KUN denne metode, rør ikke resten"
- Kontekst-loading: "læs først X, Y, Z — derefter..."
- Chain prompting: en opgave ad gangen vs. alt på én gang
- Fejl-debugging: "her er fejlen, her er stacktrace, hvad er årsagen?"
- Anti-patterns: hvad du IKKE skal gøre (for brede prompts, ingen kontekst, blindt accept)
- **Hands-on:** Par-øvelse — skriv prompts til hinandens opgaver

**Deltagerne tager med:**
- Arsenal af prompting-patterns
- Vane med at give kontekst før opgave

---

## Uge 3 — Workflows der virker

### Session 5 (tirsdag): CLAUDE.md og projekt-setup
**Tema:** Gør Claude klogere på jeres kode

- CLAUDE.md: hvad er det, og hvorfor er det vigtigt?
- Gennemgang af EDC.EDCDK.Website's CLAUDE.md som eksempel
- Hvad hører i en CLAUDE.md (og hvad gør IKKE)
- Memory-systemet: automatisk hukommelse på tværs af samtaler
- Settings og konfiguration (`.claude/settings.json`)
- **Hands-on:** Skriv/forbedr CLAUDE.md for jeres eget projekt/modul

**Deltagerne tager med:**
- En CLAUDE.md der gør Claude bedre til deres projekt
- Forståelse af memory og persistent kontekst

---

### Session 6 (torsdag): Git-workflow og code review
**Tema:** Claude Code i dit daglige Git-flow

- `/commit` — automatiske commit-beskeder
- `/review` — code review af PRs
- Git diff-analyse: "hvad har jeg ændret, og er det korrekt?"
- PR-oprettelse med Claude Code
- Code review-patterns: hvad Claude er god til at fange
- Sikkerhed: hvad skal du altid selv tjekke?
- **Hands-on:** Lav en ændring, commit med Claude, review hinandens kode med Claude

**Deltagerne tager med:**
- Claude Code integreret i deres Git-workflow
- Forståelse af hvornår Claude review er nok, og hvornår det ikke er

---

## Uge 4 — Avancerede features

### Session 7 (tirsdag): Slash commands og custom commands
**Tema:** Automatiser dine workflows

- Alle built-in slash commands (`/commit`, `/review`, `/init`, osv.)
- Custom slash commands: `.claude/commands/`
- Brug cases: team-specifikke kommandoer, standardiseret output
- Plan mode: hvornår og hvordan
- Model-skift: Opus vs. Sonnet vs. Haiku — hvornår bruger du hvad?
- **Hands-on:** Opret en custom command til jeres teams mest gentagne opgave

**Deltagerne tager med:**
- Mindst 1 custom command til deres team
- Forståelse af model-valg

---

### Session 8 (torsdag): MCP-servere og hooks
**Tema:** Udvid Claude Code med eksterne værktøjer

- MCP (Model Context Protocol): hvad er det?
- Praktiske MCP-servere: filesystem, GitHub, database, osv.
- Hooks: automatiske handlinger ved events
- Settings.json: permissions, hooks, MCP-config
- Sikkerhed og governance: hvad bør org-wide settings indeholde?
- **Hands-on:** Opsæt en MCP-server og en hook til jeres workflow

**Deltagerne tager med:**
- Forståelse af MCP-økosystemet
- Mindst 1 MCP-server konfigureret

---

## Uge 5 — Mastery og deling

### Session 9 (tirsdag): Best practices og faldgruber
**Tema:** Hvad vi har lært — og hvad vi IKKE skal gøre

- De 10 mest almindelige fejl med AI-assisteret udvikling
- Sikkerhed: kode-review, secrets, supply chain
- Kvalitet: hvornår du skal stole på Claude, og hvornår du skal dobbelttjekke
- Teknisk gæld: AI-kode der virker men er dårlig
- Ergonomi: undgå "prompt fatigue"
- Organisationens retningslinjer for AI-brug
- **Hands-on:** Gruppeøvelse — find fejl i AI-genereret kode

**Deltagerne tager med:**
- En konkret "do's and don'ts"-liste
- Sund skepsis + selvtillid i balance

---

### Session 10 (torsdag): Show & Tell + vejen frem
**Tema:** Del hvad du har bygget, og planlæg fremtiden

- Hver person/team præsenterer: "Min bedste Claude Code-oplevelse"
- Vidensdeling: tips, tricks og workflows fra hele organisationen
- Fælles CLAUDE.md-standard for EDC-projekter
- Næste skridt: hvordan holder vi momentum?
- Oprettelse af #claude-code Teams/Slack-kanal til løbende deling
- Feedback på workshop-serien
- **Afslutning:** Fælles mål — "om 3 måneder vil vi..."

**Deltagerne tager med:**
- Inspiration fra kollegaer
- En plan for fortsat læring

---

## Forberedelse pr. session

| Hvad | Hvem |
|------|------|
| Alle har Claude Code installeret og kørende | Deltagere (inden session 1) |
| Survey udfyldt og sendt | Deltagere (inden session 1) |
| Hav en lille opgave klar fra jeres backlog | Deltagere (til hands-on) |
| Slides + live demo forberedt | Matias |

## Materialer

| Fil | Beskrivelse |
|-----|-------------|
| `survey.html` | Spørgeskema — send ud inden session 1 |
| `workshop-plan.md` | Denne plan |

## Tips til facilitering

- **Start altid med en kort recap** (2 min) af forrige session
- **Live demo > slides** — vis det i terminalen, ikke på PowerPoint
- **Hands-on tid er hellig** — skær i foredrag, aldrig i øvelser
- **Par-arbejde virker** — mix teams så folk lærer af hinanden
- **"Dumme spørgsmål" er de bedste** — skab tryghed fra dag 1
- **Saml tips undervejs** — byg en fælles vidensbank
