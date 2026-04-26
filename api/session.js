// Workshop session API — gates content until session start time.
// Matias: rediger START_DATE og session-indholdet nedenfor.
// Facilitator-preview: sæt WORKSHOP_PEEK_TOKEN som Vercel env var, og kald /api/session?n=X&peek=<token>

// Første tirsdag kl 09:00 dansk tid. Ret denne hvis datoen flytter sig.
// Alle andre sessioner beregnes automatisk herfra (tirsdag + torsdag i 5 uger).
const START_DATE_ISO = '2026-05-05T07:00:00Z'; // 09:00 Europe/Copenhagen (CEST, UTC+2)
const SESSION_DURATION_MIN = 60;

function sessionUnlockAt(n) {
    const start = new Date(START_DATE_ISO);
    const weekIdx = Math.floor((n - 1) / 2); // 0..4
    const isThursday = (n - 1) % 2 === 1;
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + weekIdx * 7 + (isThursday ? 2 : 0));
    return d.getTime();
}

function formatDanish(ts) {
    const d = new Date(ts);
    const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const day = days[d.getUTCDay()];
    const dayNum = d.getUTCDate();
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    // Display time in Danish local time (UTC+2 assumed during summer workshop period)
    const hh = String((d.getUTCHours() + 2) % 24).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${day} ${dayNum}. ${month} ${year} kl. ${hh}:${mm}`;
}

// ---------------------------------------------------------------------------
// Session-indhold. Rediger frit — ét object pr. session.
// ---------------------------------------------------------------------------
const SESSIONS = [
    // ---- Session 1 ----------------------------------------------------------
    {
        number: 1,
        title: 'Kickoff + Gode vs. dårlige prompts',
        subtitle: 'Sådan foregår de næste 5 uger — og hvorfor en prompt er alt',
        theme: 'Fundamentet',
        day: 'Tirsdag · Uge 1',
        schedule: [
            { t: '0:00–0:05', what: 'Velkomst + runde: hvem er I, hvad bruger I Claude til i dag?' },
            { t: '0:05–0:20', what: 'Foredrag: sådan foregår forløbet + hvorfor prompten er alt' },
            { t: '0:20–0:35', what: 'Live demo: samme opgave, dårlig vs. god prompt' },
            { t: '0:35–0:55', what: 'Par-øvelse: prøv begge prompt-typer på jeres egen kode' },
            { t: '0:55–1:00', what: 'Del indsigter + take-home: handout + hjemmeopgave' }
        ],
        foredrag: [
            '5 uger · tirsdag + torsdag · 1 time pr. session',
            'Fast format: recap → foredrag → demo → hands-on → take-home',
            '**Min rolle: facilitator, ikke guru.** Jeg er ikke Claude-eksperten — vi finder strukturen sammen. Spar med hinanden, del prompts der virker (og dem der ikke gør), spørg højt. Workshoppen bliver kun så god som det vi sammen lægger i den.',
            'Handout + hjemmeopgave pr. session så I tager noget med videre',
            'Dagens kerne: en dårlig prompt giver generisk kode. En god prompt giver produktionsklar kode.',
            'De 4 byggeklodser: [Kontekst] + [Opgave] + [Begrænsninger] + [Forventet output]',
            '**Tryghed fra start:** Når Claude laver noget du fortryder, tryk `Esc Esc` — det er undo for hele sessionen. Vi går i dybden med `/rewind` i session 4, men I må gerne bruge det fra dag 1 — det er hvad der gør det trygt at lade Claude prøve noget vildt.'
        ],
        demo: [
            {
                heading: 'Setup — forklar scenariet (1 min)',
                say: 'I vores UserService har vi en metode GetUser(string email). Min kollega siger den returnerer null når email er tom — det burde jo kaste en fejl. Lad os få Claude til at fixe det.',
                body: 'Åbn terminalen med Claude Code kørende i et C#-projekt. Åbn også UserService.cs i IDE\'en side om side så deltagerne kan se filen. Sørg for clean git status.'
            },
            {
                heading: 'Dårlig prompt — "realistisk dårlig" (2 min)',
                body: 'Forklar: "det her ligner en prompt de fleste skriver på autopilot — med lidt kontekst, men uden detaljer". Dette er pointen: det er IKKE en stråmand, det er hverdag.',
                promptLabel: 'Dårlig prompt — kopier til Claude',
                prompt: 'Fix buggen i UserService.cs hvor GetUser returnerer null',
                expected: 'Claude læser filen, gætter på hvad "bug" betyder, og laver *en* ændring — måske returnerer den default User, måske kaster ArgumentNullException, måske ændrer den noget helt andet. Du får kode, men ikke nødvendigvis den du ville have. Mangler: HVORNÅR sker det? HVAD skal der ske i stedet? Må andre filer røres? Skal der tests med?'
            },
            {
                heading: 'God prompt — samme opgave, med kontekst (3 min)',
                say: 'Nu gør vi det igen — men vi giver Claude alt det den ikke har.',
                body: 'Kør `/clear` først så Claude starter forfra.',
                promptLabel: 'God prompt — kopier til Claude',
                prompt: `Læs UserService.cs.

Metoden GetUser returnerer null når email-parameteren er tom eller whitespace. Det bør i stedet kaste en ArgumentException med besked "email må ikke være tom".

Opgave:
1. Tilføj en guard clause øverst i metoden
2. Skriv en xUnit-test i UserServiceTests.cs der dækker det
3. Rør IKKE resten af klassen

Brug samme test-stil som de eksisterende tests i filen.`,
                expected: 'Claude læser filen, laver præcis guard clause, tilføjer en matchende test. Ingen scope creep. Klar til review.'
            },
            {
                heading: 'Pointe — hvad ændrede sig? (1 min)',
                say: 'Fire ting Claude havde denne gang som den ikke havde før: hvilken fil, hvilken metode, præcis hvad er galt, og hvad den IKKE må røre.',
                body: 'Dette er mønstret vi træner de næste 4 sessioner: **[Fil] + [Opgave] + [Begrænsninger] + [Forventet output]**.'
            },
            {
                heading: 'Bonus — performance-prompt (2 min)',
                say: 'Samme pointe, anden type opgave. Igen: det her er hvad folk skriver når de har travlt.',
                body: 'Kør `/clear`. Prøv først denne:',
                promptLabel: 'Dårlig performance-prompt',
                prompt: 'GetAll-metoden i PropertyController er langsom. Kan du optimere den?',
                expected: 'Claude læser filen, foreslår et par generiske optimeringer (tilføj caching, lav paginering, brug AsNoTracking) og går måske i gang med at ændre kode. Problem: vi ved ikke hvad der er flaskehalsen, hvor langsom den er, hvilke trade-offs der er ok, eller hvilke ændringer vi vil have. Claude gætter — og du får en løsning på et problem du ikke er sikker på er DET problem.'
            },
            {
                heading: 'God performance-prompt (2 min)',
                body: 'Kør `/clear` igen.',
                promptLabel: 'God prompt — analyse først',
                prompt: `Læs PropertyController.cs.

Metoden GetAll (linje 45-60) kalder _repo.GetAll() og mapper med LINQ. På datasæt > 50k rows tager det ~3s. Profiler viser at mapperen er flaskehalsen.

Opgave:
1. Foreslå 2-3 konkrete ændringer — ranger dem efter forventet effekt
2. Forklar fordele/ulemper for hver
3. Rør INGEN kode endnu — jeg vælger hvilken ændring vi laver først`,
                expected: 'Claude læser filen, giver 2-3 rankede forslag med pros/cons. Du vælger. Pointe: analyse-først undgår at Claude kører af sted og skriver kode du ikke vil have.'
            },
            {
                heading: 'Vis @-tricket (2 min)',
                say: 'I stedet for at copy-paste filer eller beskrive dem, brug @-syntaks.',
                promptLabel: 'Prompt med @-reference',
                prompt: 'Forklar @UserService.cs:GetUser i 3 bullets. Ingen kode.',
                expected: 'Claude læser filen automatisk via @-referencen og svarer præcist. Deltagerne ser at de ikke skal kopiere kode ind — bare pege på filer.'
            },
            {
                heading: 'React-variant — for edc.dk-folkene (2 min)',
                say: 'Samme princip, andet stack.',
                promptLabel: 'God prompt — React',
                prompt: `Læs @PropertyCard.tsx og @property-card.test.tsx.

Tilføj en "favorit"-knap øverst til højre i komponenten med en onToggle-prop (default false). Brug lucide-react's Heart-ikon. Rør ikke eksisterende markup — læg knappen som nyt søskende-element øverst i card-containeren.

Skriv også en test der verificerer at klik kalder onToggle.

Rør IKKE andre komponenter. Ingen nye dependencies.`,
                expected: 'Præcis én komponent opdateret + matchende test. Pointe: mønsteret [Fil + Opgave + Begrænsninger + Output] er universelt — C#, React, hvad som helst.'
            },
            {
                heading: 'Bonus — `Esc Esc` undo (1 min)',
                say: 'Inden vi sender jer ud i hands-on: én ting der gør det HELT trygt at lade Claude prøve noget. Tryk Esc to gange — så får I en menu hvor I kan rulle tilbage til ethvert tidligere punkt i samtalen.',
                body: 'Vis live: lad Claude lave en lille ændring. Tryk `Esc Esc`. Vælg et tidligere step i menuen. Filerne ruller tilbage. Sig: "Vi går i dybden med det i session 4 — men brug det allerede i dag. Det er hvad der gør det ok at klikke accept hurtigt."',
                promptLabel: 'Keybind — prøv det selv',
                prompt: 'Esc Esc',
                expected: 'En rewind-menu åbner. I kan vælge "rewind code only", "rewind conversation only", "rewind both", eller annullere. Pointen i session 1: I behøver ikke vide hvilken — bare ved at det findes så I tør lade Claude køre.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'Fælles hands-on — par op 2 og 2',
                steps: [
                    'Par jer op med sidemanden — gerne på tværs af teams',
                    'Åbn Claude Code i et af JERES egne projekter (skift gerne imellem)',
                    'Vælg en konkret opgave I begge kender: en bug, en lille refactor, eller "forklar denne metode"',
                    'Skriv først en **hurtig prompt** — som I ville skrive på en travl dag',
                    'Skriv så en **prompt med de 4 byggeklodser** ([Fil] + [Opgave] + [Begrænsninger] + [Forventet output])',
                    'Sammenlign: hvad var forskellen på svarene? Hvilken ville I stole nok på til at committe?',
                    'Del én indsigt højt med rummet — den der overraskede jer mest'
                ]
            },
            bSpor: { title: '', steps: [] }
        },
        prompts: [
            {
                label: 'Dårlig prompt — eksempel 1 ("realistisk dårlig")',
                language: 'text',
                text: 'Fix buggen i UserService.cs hvor GetUser returnerer null'
            },
            {
                label: 'God prompt — samme opgave',
                language: 'text',
                text: `Læs UserService.cs.

Metoden GetUser returnerer null når email-parameteren er tom eller whitespace. Det bør i stedet kaste en ArgumentException med besked "email må ikke være tom".

Opgave:
1. Tilføj en guard clause øverst i metoden
2. Skriv en xUnit-test i UserServiceTests.cs der dækker det
3. Rør IKKE resten af klassen

Brug samme test-stil som de eksisterende tests i filen.`
            },
            {
                label: 'Dårlig prompt — eksempel 2 ("realistisk dårlig")',
                language: 'text',
                text: 'GetAll-metoden i PropertyController er langsom. Kan du optimere den?'
            },
            {
                label: 'God prompt — samme opgave',
                language: 'text',
                text: `Læs PropertyController.cs.

Metoden GetAll (linje 45-60) kalder _repo.GetAll() og mapper med LINQ. På datasæt > 50k rows tager det ~3s. Profiler viser at mapperen er flaskehalsen.

Opgave:
1. Foreslå 2-3 konkrete ændringer — ranger dem efter forventet effekt
2. Forklar fordele/ulemper for hver
3. Rør INGEN kode endnu — jeg vælger hvilken ændring vi laver først`
            },
            {
                label: 'Hands-on A — skabelon til dine 3 spørgsmål',
                language: 'text',
                text: `Læs [filnavn].

Forklar kort:
1. Hvad gør [metodenavn]?
2. Hvilke andre filer kalder denne metode?
3. Er der noget der ser skrøbeligt ud?

Svar i punktform. Rør ikke koden.`
            }
        ],
        handout: {
            title: 'Prompting Cheatsheet v1',
            content: [
                'En god prompt har 4 dele:',
                '',
                '**1. Kontekst** — hvilke filer skal Claude læse? ("Læs X.cs og Y.cs")',
                '**2. Opgave** — hvad vil du have gjort? (konkret, verbum først)',
                '**3. Begrænsninger** — hvad må Claude IKKE gøre? ("rør ikke resten", "kun denne metode")',
                '**4. Forventet output** — hvad ser "done" ud som? (test der passerer, diff på én fil, …)',
                '',
                'Rule of thumb: hvis din prompt kan læses som "gør det bedre", mangler der kontekst.',
                '',
                '**Tryghed:** `Esc Esc` = undo for hele sessionen. Du kan altid rulle tilbage til hvor som helst. Brug det.'
            ]
        },
        hjemmeopgave: [
            'Brug Claude Code på mindst én rigtig opgave inden torsdag',
            'Gem én prompt der virkede godt, og én der ikke gjorde',
            'Tag begge med til session 2 — vi starter med at dele dem'
        ]
    },

    // ---- Session 2 ----------------------------------------------------------
    {
        number: 2,
        title: 'Plan mode vs. ikke plan mode',
        subtitle: 'Hvornår skal Claude tænke før den koder? — og hele mode-cyklen (Shift+Tab)',
        theme: 'Fundamentet',
        day: 'Torsdag · Uge 1',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: del jeres "den der virkede" og "den der ikke virkede"' },
            { t: '0:05–0:20', what: 'Foredrag: plan mode + permissions' },
            { t: '0:20–0:35', what: 'Live demo: samme opgave med og uden plan mode' },
            { t: '0:35–0:55', what: 'Hands-on: brug plan mode på en ægte opgave' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            'Plan mode = Shift+Tab. Claude skriver en plan men rører ikke filer endnu.',
            'Brug plan mode når: opgaven er uklar, rører flere filer, eller du vil lære Claudes tilgang',
            'Brug IKKE plan mode når: opgaven er 1-filers, triviel, eller du har travlt og koden er let at rulle tilbage',
            'Permissions: accept-edits (farligt uden review), ask (default, trygt), bypass (kun i sandboxes)',
            'Settings.json lever i `.claude/settings.json` — kan committes med projektet',
            '',
            '**Hele mode-cyklen — `Shift+Tab` cykler igennem dem alle:**',
            '**plan** — Claude tænker, skriver plan, rører ingen filer. Til usikre/multi-file opgaver.',
            '**default (ask)** — Claude spørger før hver edit / hver bash-kommando. Trygt, men klik-tungt.',
            '**acceptEdits** — Claude må selv lave fil-edits, men spørger stadig før Bash. Sweet spot for daglig kodning når du tjekker diff bagefter.',
            '**auto / bypassPermissions** — Claude må gøre ALT uden at spørge (inkl. Bash). Kun i sandbox / disposable repos / når I ved I kan rulle tilbage. Ikke noget for produktions-repos.',
            'Tommelfingerregel: start dagen i plan, gå til acceptEdits når I ved hvad I vil, gem auto til weekend-eksperimenter.'
        ],
        demo: [
            {
                heading: 'Setup — vælg en multi-file refactor (1 min)',
                say: 'Vi vil udtrække valideringen fra PropertyService.UpdateProperty til en separat PropertyValidator-klasse. Det rammer 3-4 filer.',
                body: 'Sørg for clean git status — vi skal kunne rulle tilbage mellem runder.'
            },
            {
                heading: 'Runde 1 — UDEN plan mode (3 min)',
                body: 'Kør `/clear`. Bekræft at du IKKE er i plan mode (ingen "plan mode" badge øverst).',
                promptLabel: 'Samme prompt til begge runder',
                prompt: `Udtræk valideringen fra UpdateProperty i PropertyService.cs til en separat PropertyValidator-klasse.

Brug FluentValidation. Behold eksisterende tests grønne.`,
                expected: 'Claude begynder at ændre filer direkte — 3-4 filer rammes. Kør `dotnet test`. Måske grønne, måske røde. Noter: du kom hurtigt frem, men havde ingen chance for at rette kurs undervejs.'
            },
            {
                heading: 'Rul tilbage (30 sek)',
                body: 'Stop Claude hvis den arbejder. Kør i en anden terminal:',
                promptLabel: 'Terminal-kommando',
                prompt: 'git reset --hard HEAD && git clean -fd',
                expected: 'Alle ændringer væk. Tilbage til start.'
            },
            {
                heading: 'Runde 2 — MED plan mode (4 min)',
                say: 'Tryk Shift+Tab — se "plan mode" dukke op øverst. Kør SAMME prompt som før.',
                promptLabel: 'Samme prompt — men nu i plan mode',
                prompt: `Udtræk valideringen fra UpdateProperty i PropertyService.cs til en separat PropertyValidator-klasse.

Brug FluentValidation. Behold eksisterende tests grønne.`,
                expected: 'Claude svarer med en nummereret plan: "1. Opret PropertyValidator.cs ..., 2. Flyt regler ..., 3. ...". INGEN filer rørt. Du kan læse planen i ro og mag.'
            },
            {
                heading: 'Afvis et trin — bed om alternativ (3 min)',
                say: 'Se at Claude foreslår at flytte alle regler på én gang. Det vil vi ikke — vi vil trinvist så vi kan teste imellem.',
                promptLabel: 'Afvisning + ny retning',
                prompt: `Jeg vil flytte én valideringsregel ad gangen og kunne køre tests mellem hver. Opdater planen så hvert trin kan testes isoleret — første trin flytter kun én regel.`,
                expected: 'Claude laver ny, mere granuleret plan. Godkend (Accept) — nu begynder den at implementere. Pointe: plan mode = samtale om tilgang FØR kode.'
            },
            {
                heading: 'Vis anbefalet .claude/settings.json (2 min)',
                say: 'Mens vi er i settings-land — her er hvad jeg vil anbefale vi sætter som baseline for EDC-projekter.',
                body: 'Åbn `.claude/settings.json` i et projekt. Vis at det er en commit-bar fil.',
                promptLabel: '.claude/settings.json — baseline for EDC',
                prompt: `{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(dotnet build)",
      "Bash(dotnet test)",
      "Bash(dotnet run)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git status)",
      "Bash(npm test)",
      "Bash(npm run build)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)",
      "Bash(git reset --hard:*)"
    ]
  }
}`,
                expected: 'Deltagerne kopierer den ind i deres eget projekt. Allow-listen fjerner klik-friktion; deny-listen forhindrer uheld. Forklar: `defaultMode: "plan"` er også en mulighed hvis du vil have plan mode tvunget altid.'
            },
            {
                heading: 'Shift+Tab cyklen — vis alle mode-skift live (3 min)',
                say: 'Plan er kun ét punkt på en cykel. Tryk Shift+Tab gentagne gange og I ser badge\'en øverst skifte mellem plan → default (ask) → acceptEdits → auto / bypassPermissions → og rundt igen.',
                body: 'Tryk Shift+Tab fire gange foran deltagerne. Læs badge\'en højt hver gang. Forklar i én sætning hvad hver mode betyder mens I står i den. Pointe: I behøver ikke huske hvad de hedder — bare at I kan cykle.',
                promptLabel: 'Keybind — prøv det selv',
                prompt: 'Shift+Tab',
                expected: 'Mode-badge skifter øverst. Hver mode har en farve så det er svært at tage fejl. Deltagerne ser at det er ét keystroke at gå fra "trygt" til "lad Claude køre".'
            },
            {
                heading: 'acceptEdits i praksis — daglig kodning (2 min)',
                say: 'acceptEdits er hvor jeg lever til daglig. Claude må selv ændre filer, men spørger stadig før Bash. Det betyder I kan kigge på diff\'en bagefter uden at klikke accept 20 gange.',
                body: 'Cykl til acceptEdits via Shift+Tab. Kør en lille opgave. Vis at fil-edits ryger igennem uden prompt, men `dotnet test` stadig spørger. Pointe: I bevarer kontrol over det destruktive (Bash), men sparer klik på det reversible (filer — som I altid kan `git diff`).',
                promptLabel: 'Test-prompt i acceptEdits-mode',
                prompt: 'Tilføj en kort XML-doc-kommentar til UserService.GetUser der beskriver throw-betingelsen.',
                expected: 'Claude redigerer filen direkte uden permission-prompt. Bagefter: `git diff` viser præcis hvad der skete. Tryggere end det lyder.'
            },
            {
                heading: 'auto / bypassPermissions — hvornår (1 min)',
                say: 'Sidste stop på cyklen er auto / bypassPermissions. Det betyder Claude kan gøre HVAD SOM HELST uden at spørge — inklusiv Bash, fil-sletning, alt. Det er kraftfuldt og farligt.',
                body: '**Brug det KUN når:** repo er disposable (sandbox, scratch, branch I gladeligt kan smide), I har commit-historik så I kan rulle tilbage, eller I tester et gennemløb og kan starte forfra.\n\n**Brug det IKKE i:** produktions-repos, repos uden tests, eller når I ikke har clean git status. Hvis I er i tvivl: brug acceptEdits.',
                promptLabel: 'Startup-flag — start Claude direkte i en mode',
                prompt: 'claude --permission-mode plan',
                expected: 'Claude starter direkte i plan mode uden at I skal trykke Shift+Tab. Andre værdier: `acceptEdits`, `bypassPermissions`. Praktisk til shell-aliaser eller wrapper-scripts: `alias claude-plan="claude --permission-mode plan"`.'
            },
            {
                heading: 'Bonus — context-hygiejne (3 min)',
                say: 'Tre kommandoer I bør kende fra start — de holder Claude skarp i lange sessioner og er #1 på listen over "ting jeg ville ønske jeg vidste fra start".',
                body: '**`/clear`** — tøm samtalen helt, start forfra. Brug når du skifter til en ikke-relateret opgave.\n\n**`/compact`** — behold kernen, smid detaljerne. Brug når samtalen bliver lang men du vil fortsætte.\n\n**`/context`** — vis hvor meget context der er brugt. Brug til at beslutte om du skal `/compact` eller `/clear`.',
                promptLabel: 'Prøv /context live',
                prompt: '/context',
                expected: 'Claude viser token-forbrug. Tommelfingerregel: over 80% → `/compact`. Når opgaven skifter → `/clear`. Pointen: Claude bliver ikke "dum" over tid — den bliver overfyldt. Hygiejne hjælper.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'A-spor (begynder)',
                steps: [
                    'Tag en lille opgave: rename en variabel, tilføj et felt, skriv en test',
                    'Tryk Shift+Tab for at gå i plan mode',
                    'Giv Claude opgaven med kontekst (brug cheatsheetet fra session 1)',
                    'Læs planen. Godkend eller afvis.',
                    'Sammenlign med hvad du selv ville have gjort'
                ]
            },
            bSpor: {
                title: 'B-spor (advanced)',
                steps: [
                    'Tag en multi-file ændring (fx tilføj nyt felt som kræver DB migration + DTO + API)',
                    'Kør i plan mode',
                    'Afvis mindst ét trin i planen — bed om alternativ',
                    'Commit resultatet og sammenlign planen med den endelige diff'
                ]
            }
        },
        prompts: [
            {
                label: 'Plan mode — skabelon til multi-file opgave',
                language: 'text',
                text: `Jeg vil tilføje et nyt felt "ExternalId" til Property-entiteten.

Før du rører noget: lav en plan for hvad der skal ændres. Kig på:
- Entitet (Property.cs)
- EF Core migration
- DTO / mapping
- API-kontrakt
- Tests

Giv en nummereret plan med filerne. Jeg godkender eller afviser hvert trin.`
            },
            {
                label: 'Plan mode — refactor med scope-lock',
                language: 'text',
                text: `Læs PropertyService.cs.

Lav en plan for at udtrække valideringen i UpdateProperty (linje 80-120) til en separat ValidatorClass.

Krav:
- Kun denne metode + ny validator-fil rammes
- Behold eksisterende offentlig kontrakt
- Tests skal stadig passere uden ændring

Giv mig planen først. Jeg godkender før du koder.`
            },
            {
                label: 'settings.json — plan mode som default',
                language: 'json',
                text: `{
  "permissions": {
    "defaultMode": "plan"
  }
}`
            },
            {
                label: 'settings.json — tryggere permissions',
                language: 'json',
                text: `{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(dotnet build)",
      "Bash(dotnet test)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git status)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)"
    ]
  }
}`
            },
            {
                label: 'Startup-flag — start direkte i plan mode',
                language: 'bash',
                text: 'claude --permission-mode plan'
            },
            {
                label: 'Startup-flag — start direkte i acceptEdits',
                language: 'bash',
                text: 'claude --permission-mode acceptEdits'
            },
            {
                label: 'Shell-alias — én genvej pr. mode',
                language: 'bash',
                text: `alias claude-plan="claude --permission-mode plan"
alias claude-edit="claude --permission-mode acceptEdits"
alias claude-yolo="claude --permission-mode bypassPermissions"  # kun i sandbox`
            },
            {
                label: 'settings.json — auto/bypass kun for sandbox-projekt',
                language: 'json',
                text: `{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}`
            }
        ],
        handout: {
            title: 'Plan mode — beslutningstræ',
            content: [
                '**Skal jeg bruge plan mode?**',
                '',
                '→ Rammer opgaven mere end én fil? → **JA, plan mode**',
                '→ Er du usikker på hvordan den skal løses? → **JA, plan mode**',
                '→ Er opgaven i et kritisk område (auth, betaling, data)? → **JA, plan mode**',
                '→ Vil du lære af Claudes tilgang? → **JA, plan mode**',
                '→ Ellers: bare lad Claude kode. Git er din sikkerhedsline.',
                '',
                '**Tip:** `Shift+Tab` toggler mode. Du kan altid gå fra "run" til "plan" midt i opgaven.',
                '',
                '**Hele cyklen (Shift+Tab):**',
                '☐ **plan** — tænker, rører ingen filer',
                '☐ **default (ask)** — spørger før hver edit + Bash',
                '☐ **acceptEdits** — fri til fil-edits, spørger før Bash (sweet spot)',
                '☐ **auto / bypassPermissions** — fri til alt (kun sandbox)',
                '',
                'Startup-flag: `claude --permission-mode plan` (eller `acceptEdits` / `bypassPermissions`).'
            ]
        },
        hjemmeopgave: [
            'Brug plan mode på mindst én ægte opgave i weekenden',
            'Gem planen Claude foreslog (screenshot / kopier)',
            'Tag den med til session 3 — vi kigger på dem sammen'
        ]
    },

    // ---- Session 3 ----------------------------------------------------------
    {
        number: 3,
        title: 'Kontekst er konge',
        subtitle: 'Hvorfor Claude hallucinerer — og hvordan du stopper det',
        theme: 'Prompting er en superkraft',
        day: 'Tirsdag · Uge 2',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: hvem brugte plan mode? Hvad fandt I?' },
            { t: '0:05–0:20', what: 'Foredrag: de 4 slags kontekst' },
            { t: '0:20–0:35', what: 'Live demo: 0 → lidt → meget kontekst' },
            { t: '0:35–0:55', what: 'Par-øvelse på tværs af teams' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            'Claude "hallucinerer" fordi den gætter når den ikke ved. Giv den det den ikke ved.',
            '**Filer** — "læs først X.cs, Y.cs"',
            '**Regler** — "vi bruger xUnit, ikke NUnit. Vi bruger records, ikke classes."',
            '**Eksempler** — "gør det som ExistingService.cs gør"',
            '**Begrænsninger** — "kun denne metode. Ingen nye dependencies."',
            '`@filnavn` er det hurtigste værktøj til at tilføje filkontekst',
            '',
            '**Dagens hovedemne: `@`-syntaks i prompten.** Det er forskellen mellem at copy-paste 200 linjer kode ind i prompten (langsomt, fylder context, fejlbehæftet) og at pege Claude på filen direkte.',
            '`@filnavn.cs` — Claude læser hele filen',
            '`@filnavn.cs#L20-40` — Claude læser kun linje 20-40 (sparer context når filen er stor)',
            '`@mappe/` — Claude lister mappen og afgør selv hvad der er relevant',
            '`@filnavn.cs#funktionsnavn` — peger på et symbol (virker ikke alle steder, men ofte)',
            'Brug tab-completion: skriv `@` og start på et filnavn — Claude foreslår paths fra repoet.'
        ],
        demo: [
            {
                heading: 'Setup — én opgave, flere runder (1 min)',
                say: 'Vi vil tilføje et "ExternalId"-felt til Property-entiteten. Samme opgave hver gang — men vi varierer hvor meget kontekst Claude får, og HVORDAN vi giver den.',
                body: 'Clean git status mellem hver runde: `git reset --hard HEAD && git clean -fd`. Kør `/clear` i Claude før hver runde.'
            },
            {
                heading: 'Realistisk dårlig — copy-paste hele filen (2 min)',
                say: 'Det her er hvad rigtig mange gør: åbner filen, markerer alt, copy-paster det ind i prompten. Det virker — men det er langsomt, fylder context, og Claude får ingen forbindelse til repoet bagefter (kan ikke åbne andre filer selv).',
                body: 'Kør `/clear`. Åbn Property.cs, ⌘A + ⌘C, paste det hele ind i prompten med en kort instruktion ovenpå. Vis at prompten nu fylder hundredvis af linjer.',
                promptLabel: 'Anti-pattern — paste hele filen',
                prompt: `Her er Property.cs:

\`\`\`csharp
[paste 150 linjer kode her]
\`\`\`

Tilføj en ExternalId-property (string, nullable). Husk migration.`,
                expected: 'Det virker, men: prompten er kæmpe, Claude kan ikke navigere til relaterede filer på egen hånd, og I kan ikke gøre det igen i morgen uden at gentage paste-arbejdet. Det er hvad I IKKE skal gøre.'
            },
            {
                heading: 'Samme opgave med `@` — pointen (1 min)',
                say: 'Nu samme opgave med ét `@`. Claude læser filen selv, ved hvor i repoet den ligger, og kan finde relaterede filer.',
                body: 'Kør `/clear`. Skriv prompten med `@`-reference. Pointe: 90% kortere prompt, samme eller bedre resultat.',
                promptLabel: '`@` i stedet for paste',
                prompt: 'Tilføj en ExternalId-property (string, nullable) til @Property.cs. Husk migration.',
                expected: 'Claude læser filen via `@`, finder migration-mappe selv, laver ændringen. Pointe: dette er den vigtigste vane vi træner i dag — `@` over paste, ALTID.'
            },
            {
                heading: 'Line-refs — `@file#L20-40` (2 min)',
                say: 'Når filen er stor, vil I ikke have Claude til at læse hele filen. Brug `#L20-40` til at pege på et bestemt vindue.',
                body: 'Kør `/clear`. Skriv:',
                promptLabel: 'Linje-reference',
                prompt: `Forklar @PropertyService.cs#L80-120 i 5 bullets.

Hvad gør koden? Hvilke afhængigheder har den? Er der noget skrøbeligt?`,
                expected: 'Claude læser kun de 40 linjer i stedet for hele filen. Sparer context, går hurtigere, fokuseret svar. Pointe: brug line-refs når I ved præcis hvor problemet er — fx fra en stacktrace eller en code review-kommentar.'
            },
            {
                heading: 'Mappe-ref — `@Migrations/` (1 min)',
                say: 'I behøver ikke vide præcis hvilken fil I vil pege på — Claude kan selv lede i en mappe.',
                promptLabel: 'Mappe-reference',
                prompt: 'Find seneste migration i @Migrations/ og forklar hvad den ændrer på.',
                expected: 'Claude lister mappen, vælger seneste fil baseret på timestamp i filnavn, læser den. Pointe: nyttigt når I tænker "den lå et sted i den mappe..." og ikke gider lede.'
            },
            {
                heading: 'Runde 1 — "realistisk dårlig" (2 min)',
                promptLabel: 'Runde 1 — kopier til Claude',
                prompt: 'Tilføj en ExternalId-property (string) til Property-entiteten. Husk migration.',
                expected: 'Claude finder Property.cs, tilføjer feltet, laver en migration. Men: migrationen ender måske i forkert projekt (Api i stedet for Infrastructure), mapperen opdateres ikke (så feltet aldrig når UI), DTO\'en glemmes, feltet navngives "ExternalID" i stedet for "ExternalId". Prompten nævner ikke hvor migration hører hjemme, hvilke andre filer der er i kæden, eller hvilken naming-konvention vi bruger.'
            },
            {
                heading: 'Runde 2 — filer + regler (3 min)',
                body: 'Rul tilbage + `/clear`.',
                promptLabel: 'Runde 2 — kopier til Claude',
                prompt: `Læs @Property.cs og seneste migration i @Migrations/.

Tilføj en ny string-property ExternalId (nullable) til Property-entiteten. Lav også EF Core migration.

Projektet bruger EF Core 8, SQL Server. Migrations lever i Infrastructure-projektet.`,
                expected: 'Entitet opdateret, migration oprettet i rette projekt. Meget bedre end runde 1 — men stadig mangler DTO og mapper der rammes af ændringen.'
            },
            {
                heading: 'Runde 3 — filer + regler + eksempel + forbud (4 min)',
                body: 'Rul tilbage + `/clear`. Dette er "produktionsklar"-varianten.',
                promptLabel: 'Runde 3 — kopier til Claude',
                prompt: `Læs @Property.cs, @PropertyDto.cs, @PropertyMapper.cs og seneste migration i @Migrations/.

Tilføj string-property ExternalId (nullable) til Property.

Gør det på SAMME måde og SAMME steder som da vi tilføjede "Reference"-feltet (se @Migrations/20240115_AddReference.cs og hvordan det mappes i @PropertyMapper.cs).

Omfang:
- Property.cs (entitet)
- Ny migration
- PropertyDto.cs (nyt felt)
- PropertyMapper.cs (map begge veje)

Rør IKKE: controllers, commands, tests. Dem tager vi bagefter.`,
                expected: 'Præcis 4 filer ændret. Matcher eksisterende mønster linje for linje. Klar til review. Forskellen mellem runde 1 og 3 er hele sessionen\'s pointe.'
            },
            {
                heading: 'Pointe — hvad gjorde forskellen? (1 min)',
                say: 'Runde 3 havde 4 ting runde 1 ikke havde: relevante filer, regler om stack, et eksempel at kopiere mønster fra, og et klart forbud mod scope creep.',
                body: 'Dette er kontekst-checklisten deltagerne skal tage med sig. Handout bag denne session samler det.'
            },
            {
                heading: 'React-variant (2 min)',
                say: 'For edc.dk-folkene — samme princip virker i frontend.',
                promptLabel: 'Runde 3 — React',
                prompt: `Læs @PropertyCard.tsx, @FavoriteButton.tsx, og @PropertyCard.stories.tsx.

Tilføj et "favorit"-ikon øverst til højre på PropertyCard. BRUG den eksisterende FavoriteButton-komponent — lav ikke en ny.

Opdater også stories-filen med en variant "withFavorite".

Rør IKKE: styling (Tailwind-klasser), andre komponenter.`,
                expected: 'Claude genbruger eksisterende FavoriteButton i stedet for at reimplementere. Pointe: et konkret eksempel er stærkere end 5 linjers regler.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'Par-øvelse (A+B sammen)',
                steps: [
                    'Par jer på tværs af teams: 1 begynder + 1 advanced pr. par',
                    'Begynder: vælg en opgave fra din kode',
                    'Advanced: hjælp med at skrive en kontekst-rig prompt (brug checklisten)',
                    'Kør prompten. Noter hvad der blev bedre i forhold til "hvad begynder ville have skrevet alene"',
                    'Byt roller, ny opgave',
                    'Deltag i fælles opsamling: hvad var den bedste prompt-justering?'
                ]
            },
            bSpor: {
                title: '',
                steps: []
            }
        },
        prompts: [
            {
                label: '`@`-cheat sheet — alle mønstre',
                language: 'text',
                text: `# @-syntaks — kopier som reference

# Hel fil
@PropertyService.cs

# Linje-vindue (sparer context)
@PropertyService.cs#L80-120

# Enkelt linje
@PropertyService.cs#L42

# Mappe (Claude vælger relevante filer selv)
@Migrations/
@src/features/property/

# Flere referencer i samme prompt
Læs @PropertyService.cs og @PropertyService.test.cs.

# React/TypeScript
@PropertyCard.tsx
@PropertyCard.tsx#L15-30
@src/components/

# Tip: skriv @ + start på filnavn → Claude foreslår paths via tab-completion`
            },
            {
                label: 'C# — peg på metode med line-ref',
                language: 'text',
                text: `Forklar @PropertyService.cs#L80-120 i 5 bullets.

- Hvad gør koden?
- Hvilke afhængigheder har den?
- Er der null-paths uden guards?
- Er der noget der kunne brydes hvis Property.Agent er null?
- Hvad ville være den minimale ændring for at fixe det?

Ingen kode. Kun analyse.`
            },
            {
                label: 'React — peg på komponent + test med `@`',
                language: 'text',
                text: `Læs @PropertyCard.tsx og @property-card.test.tsx#L1-40.

Tilføj et "favorit"-ikon øverst til højre. Brug det eksisterende @FavoriteButton.tsx — opret ikke en ny.

Skriv også en test der dækker klik-toggling.

Rør IKKE styling. Ingen nye dependencies.`
            },
            {
                label: 'Anti-pattern (vis IKKE gør sådan) — paste hele filen',
                language: 'text',
                text: `Her er PropertyService.cs:

\`\`\`csharp
[200 linjer kode pasted]
\`\`\`

Tilføj feltet ExternalId.

# DETTE ER HVAD I IKKE SKAL GØRE.
# Gør i stedet: "Tilføj ExternalId til @PropertyService.cs"`
            },
            {
                label: 'Kontekst-rig prompt — template',
                language: 'text',
                text: `Læs @[fil1] og @[fil2].

Projektet bruger:
- [sprog/framework]
- [konvention 1]
- [konvention 2]

Opgave:
[hvad skal ske]

Gør det på samme måde som @[eksempel-fil] gør [feature].

Rør IKKE: [filer/områder der skal være urørte]
Forventet output: [diff, test der passerer, osv.]`
            },
            {
                label: 'Kontekst-rig prompt — C# konkret',
                language: 'text',
                text: `Læs @PropertyService.cs og @PropertyRepository.cs.

Projektet bruger:
- .NET 8 + EF Core
- MediatR til commands/queries
- FluentValidation
- xUnit + FluentAssertions

Opgave:
Tilføj en ny command UpdatePropertyStatus der sætter status-feltet.

Gør det på samme måde som @UpdatePropertyAddress.cs gør det: Command → Handler → Validator → Test.

Rør IKKE: controllers, DTOs, andre entities.
Forventet output: 4 nye filer + 1 test der passerer.`
            },
            {
                label: 'Kontekst-rig prompt — React konkret',
                language: 'text',
                text: `Læs @PropertyCard.tsx og @property-card.test.tsx.

Projektet bruger:
- React 19 + TypeScript
- Tailwind (ingen CSS-filer)
- Vitest + React Testing Library
- Vi skriver tests i AAA-struktur

Opgave:
Tilføj et "favorit"-ikon øverst til højre med en onToggle-prop.

Gør det som @FavoriteButton.tsx ellers gør det i projektet.

Rør IKKE: styling-systemet. Ingen nye dependencies.
Forventet output: opdateret komponent + test for "klik toggler favorit".`
            }
        ],
        handout: {
            title: 'Kontekst-checklist + `@`-cheat sheet',
            content: [
                '**Før du trykker enter — har du givet Claude:**',
                '',
                '☐ **Filer** den skal læse (`@filnavn`)',
                '☐ **Regler** (framework, konventioner, "vi gør X sådan")',
                '☐ **Eksempler** (peg på en eksisterende fil der løser samme mønster)',
                '☐ **Begrænsninger** ("rør ikke X", "ingen nye dependencies")',
                '☐ **Forventet output** (hvordan ser "done" ud?)',
                '',
                'Mangler du mere end 1-2 flueben → omskriv prompten.',
                '',
                '---',
                '',
                '**`@`-syntaks cheat sheet — kopier IKKE filer ind i prompten:**',
                '',
                '`@filnavn.cs` — læs hele filen',
                '`@filnavn.cs#L20-40` — kun linje 20-40 (sparer context på store filer)',
                '`@filnavn.cs#L42` — kun linje 42',
                '`@mappe/` — Claude lister mappen og vælger',
                '`@a.cs og @b.cs` — flere filer i samme prompt',
                '',
                '**Pro tip:** skriv `@` + start på filnavn → tab-completion foreslår fra repoet.',
                '',
                '**Anti-pattern:** copy-paste hele filer ind i prompten. Det fylder context, kan ikke gentages, og Claude mister forbindelsen til repoet.'
            ]
        },
        hjemmeopgave: [
            'Lav en "prompt-log" denne uge: gem hver prompt + resultat + 1-sætnings vurdering',
            'Tag logfilen med til torsdag — vi kigger på mønstre'
        ]
    },

    // ---- Session 4 ----------------------------------------------------------
    {
        number: 4,
        title: 'Avanceret prompting: scope, chains, debug',
        subtitle: 'Prompt-patterns der virker igen og igen',
        theme: 'Prompting er en superkraft',
        day: 'Torsdag · Uge 2',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: del 1 prompt fra jeres log der overraskede jer' },
            { t: '0:05–0:20', what: 'Foredrag: scope, chains, debug-pattern, anti-patterns' },
            { t: '0:20–0:35', what: 'Live demo: bug-fix med god debug-prompt' },
            { t: '0:35–0:55', what: 'Hands-on: A/B spor' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            '**Scope-kontrol:** "ændr KUN X, rør ikke Y" — forhindrer scope creep',
            '**Chain prompting:** én opgave ad gangen vs. alt på én gang (og hvornår hvad)',
            '**Debug-pattern:** fejl + stacktrace + hvad du har prøvet + din hypotese',
            '**Anti-patterns:** brede opgaver, blindt accept, "fix alt"-prompts',
            'Claude er bedre til at *udelukke* mistænkte end at *gætte* løsningen',
            '',
            '**Også i dag — to power-features der gør debug-flow markant bedre:**',
            '`/rewind` (eller `Esc Esc`) — undo for hele samtalen. Vælg om du vil rulle KODE tilbage, SAMTALEN tilbage, eller BEGGE. Du kan eksperimentere uden frygt.',
            '`Ctrl+B` — kør en task i baggrunden mens du fortsætter prompting (fx `dotnet test --watch`). `/tasks` viser status, `Ctrl+T` åbner task-list overlay. Claude kan læse output og fixe fejl mens den kører.'
        ],
        demo: [
            {
                heading: 'Setup — en konkret bug (1 min)',
                say: 'Vores endpoint GET /api/properties fejler for nogle brugere med "Object reference not set to an instance of an object". Det sker kun for brugere uden tildelt agent.',
                body: 'Hav stacktrace-outputtet klar i et tekstvindue du kan kopiere fra.'
            },
            {
                heading: 'Dårlig debug-prompt — "realistisk dårlig" (1 min)',
                body: 'Det her er hvad man skriver når man er stresset og bare vil have Claude til at løse det.',
                promptLabel: 'Dårlig prompt',
                prompt: 'Min GET /api/properties endpoint giver NullReferenceException i produktion. Kan du finde fejlen og fixe den?',
                expected: 'Claude læser PropertiesController.cs, ser på kaldte services, og begynder at tilføje null-checks alle steder "for en sikkerheds skyld". Fixet virker måske — men du ved ikke om DEN specifikke NRE faktisk er løst, eller om Claude har dækket symptomer uden at finde årsagen. Mangler: stacktrace, reproduktions-info, din hypotese, og hvad der ikke må ændres.'
            },
            {
                heading: 'God debug-prompt (3 min)',
                body: 'Kør `/clear`. Bemærk: prompten har hypotese + hvad du har prøvet.',
                promptLabel: 'God debug-prompt',
                prompt: `Fejl i PropertiesController.GetAll() (endpoint GET /api/properties).

Stacktrace:
System.NullReferenceException: Object reference not set to an instance of an object.
   at PropertyMapper.ToDto(Property property) line 42
   at PropertiesController.GetAll() line 28

Hvad jeg har prøvet:
- Tjekket at Property-listen ikke er null (den er ikke)
- Sat breakpoint på linje 42 — property.Agent er null for nogle rows

Min hypotese: PropertyMapper.ToDto accesserer property.Agent.Name uden null-check, og nogle properties har ingen tildelt agent.

Opgave: udeluk eller bekræft min hypotese. Læs @PropertyMapper.cs linje 42 og omkring. Foreslå IKKE fix endnu.`,
                expected: 'Claude læser filen, bekræfter hypotesen, peger på linje 42. Foreslår IKKE fix endnu — venter på godkendelse. Kontrast til dårlig prompt er åbenbar.'
            },
            {
                heading: 'Scope-lock pattern (2 min)',
                say: 'Når Claude har for tendens til at "forbedre" alt muligt andet end det du bad om, brug dette mønster.',
                promptLabel: 'Scope-lock eksempel',
                prompt: `Ændring: gør metoden PropertySearch.Filter async.

Scope-regler (SKAL overholdes):
- Kun denne metode ændres signaturmæssigt
- Offentlig signatur må ændres (Task-return er ok)
- Kald-steder opdateres til at awaite (det er ok)
- Ingen andre metoder refactores
- Ingen nye dependencies

Hvis du tænker "det ville være pænere at også...", SKRIV det som kommentar i svaret — men LAV det IKKE.`,
                expected: 'Claude gør KUN det, og lister sine "ville være pænere hvis..."-forslag som tekst til sidst. Du kan vælge at tage dem bagefter — eller ignorere.'
            },
            {
                heading: 'Chain prompting — stor feature opdelt (4 min)',
                say: 'Vi vil bygge "favoritter" — brugere kan favoritisere properties og kalde /api/me/favorites for at hente dem. Det rører 4-6 filer. I stedet for én mega-prompt deler vi op.',
                body: 'Kør `/clear`. Dette er trin 1 af 3.',
                promptLabel: 'Trin 1 af 3 — PLANLÆG kun',
                prompt: `Trin 1 af 3 — LÆS KUN. Ingen kode endnu.

Jeg vil tilføje "favoritter": brugere kan markere properties som favorit, og kalde GET /api/me/favorites for at hente dem.

Læs: @Property.cs, @User.cs, @ApplicationDbContext.cs, seneste 3 migrations, @PropertiesController.cs.

Giv mig:
1. Hvilke 4-6 filer skal ændres/oprettes?
2. Afhængigheder mellem dem (hvad skal laves først)?
3. En nummereret plan hvor hvert trin er isoleret testbart.

Rør ingen filer. Kun plan.`,
                expected: 'Claude giver 4-6 trins plan med afhængigheder. Du reviewer. Dette er PLANLÆGNINGEN. Næste trin er "implementer trin 1 af planen" — og så videre. Pointe: små trin = små bugs, nem at rulle tilbage.'
            },
            {
                heading: 'Trin 2 af 3 — implementér kun første punkt (1 min)',
                body: 'Når trin 1\'s plan er godkendt, gå videre:',
                promptLabel: 'Trin 2 af 3',
                prompt: `Trin 2 af 3 — implementér kun første punkt fra planen (FavoriteEntity + migration).

Rør IKKE de andre punkter endnu — det gør vi i trin 3.

Skriv også testen der verificerer at entiteten kan gemmes.`,
                expected: 'Én afgrænset ændring, én test. Kør tests. Hvis grønne → fortsæt med trin 2 af planen. Hvis røde → fix før du går videre.'
            },
            {
                heading: 'TDD-loop — test først, implementér efter (4 min)',
                say: 'En af de mest undervurderede måder at bruge Claude: skriv testen FØR, lad Claude implementere, kør, iterér.',
                body: 'Denne tilgang tvinger Claude til at forstå HVAD der skal virke før HVORDAN. Drastisk færre hallucinationer.',
                promptLabel: 'TDD-loop prompt',
                prompt: `Jeg starter en TDD-loop.

Læs @PropertySearchTests.cs — jeg har lige tilføjet en ny test "Filter_ReturnsOnlyActiveProperties_WhenIsActiveIsTrue" der fejler.

Opgave:
1. Kør testen og bekræft at den fejler (forventet)
2. Implementér MINIMUM det der skal til for at testen passerer — ikke mere
3. Kør testen igen og bekræft at den passerer
4. Stop. Rør ingen andre metoder.

Hvis du tænker "jeg burde også fikse...", SKRIV det som kommentar — men LAV det IKKE.`,
                expected: 'Claude kører test (rød) → implementerer → kører igen (grøn) → stopper. Ingen scope creep. Pointe: du kontrollerer præcist hvad der implementeres, og du har en test der beviser det virker.'
            },
            {
                heading: '`/rewind` — de 4 valg i menuen (3 min)',
                say: 'I session 1 viste jeg `Esc Esc` som "undo". Nu går vi i dybden — for det er ikke ÉT undo, det er fire forskellige.',
                body: 'Lad Claude gøre en lille ting. Tryk `Esc Esc` (eller skriv `/rewind`). Menu åbner med 4 valg:\n\n**1. Rewind code only** — filerne ruller tilbage, men samtalen forbliver. Brug når Claude prøvede et fix, du vil prøve igen, og vil have at Claude husker hvad der ikke virkede.\n\n**2. Rewind conversation only** — samtalen ruller tilbage, men filerne forbliver. Brug når du vil have Claude til at glemme en pinlig instruktion ("nej det var ikke det jeg mente"), men beholde de gode ændringer.\n\n**3. Rewind both** — alt tilbage. Brug ved fuld restart af et eksperiment.\n\n**4. Cancel** — annuller, ingen ændring.',
                promptLabel: 'Åbn rewind-menuen',
                prompt: '/rewind',
                expected: 'Menu med 4 valg vises. Demo: lav 3 ændringer i træk, tryk `/rewind`, vælg "rewind code only", brug 2-3 min på at vise hvordan Claude nu husker hvad der ikke virkede og foreslår en anden tilgang. Pointe: dette er forskellen mellem "AI-skrækkelig backup-strategi" og "AI-eksperimenter uden frygt".'
            },
            {
                heading: '`Ctrl+B` — kør tests i baggrunden mens du prompter (3 min)',
                say: 'Indtil nu har vi kørt `dotnet test` én gang og ventet. Nu starter vi det i baggrunden i watch-mode og lader Claude se output mens vi fortsætter samtalen.',
                body: 'Tryk `Ctrl+B`. Claude beder om kommandoen. Skriv `dotnet test --watch`. Tasken starter i baggrunden — du beholder prompten. Skriv en prompt der ændrer kode. Tasken re-kører tests automatisk. Claude kan læse output via `/tasks` og fixe fejlene live.',
                promptLabel: 'Background task — watch tests',
                prompt: 'dotnet test --watch',
                expected: 'Output: "Started background task #1 (dotnet test --watch)". Du kan fortsætte prompting. Når en test brydes, kan Claude læse fejlen via `/tasks` og foreslå et fix uden du skal copy-paste output. Pointe: dette er hvad der gør TDD-loop fra forrige demo dobbelt så hurtig.'
            },
            {
                heading: '`/tasks` og `Ctrl+T` — se status (1 min)',
                say: 'Når du har background tasks kørende, har du to måder at kigge på dem.',
                body: '`/tasks` — slash-kommando, lister alle tasks med status (running, finished, failed) + seneste output.\n\n`Ctrl+T` — hurtig overlay direkte over Claude-vinduet. Lukker når du trykker Esc. Brug det som en "hurtig kig"-genvej.',
                promptLabel: 'List background tasks',
                prompt: '/tasks',
                expected: 'Liste af alle running + nyligt afsluttede tasks. Vis hvordan I kan bede Claude læse output: "læs output fra task 1 og fix den fejlende test". Pointe: I behøver ikke længere have terminalen åben i et andet vindue.'
            },
            {
                heading: 'Combo — `/rewind` + `Ctrl+B` (2 min)',
                say: 'Disse to features sammen er kraftige. Eksperimenter frit, hvis det går galt: rul tilbage. Background tests fortæller dig hvornår det går galt.',
                body: 'Sæt `dotnet test --watch` i baggrunden via `Ctrl+B`. Bed Claude lave en risikabel refactor. Tasken viser røde tests inden for sekunder. `/rewind code only` ruller filerne tilbage. Claude husker hvad der ikke virkede. Prøv en anden tilgang. Pointe: dette er hvordan I tør bruge auto/bypassPermissions-mode i sandbox uden at sove dårligt.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'A-spor (begynder)',
                steps: [
                    'Tag en konkret bug (egen eller en sammen-valgt)',
                    'Brug debug-skabelonen nedenfor',
                    'Kør Claude med den. Læs svaret højt for din nabo.',
                    'Noter: hvad fangede Claude som du ikke havde tænkt på?'
                ]
            },
            bSpor: {
                title: 'B-spor (advanced)',
                steps: [
                    'Tag en større feature (4+ filer)',
                    'Bryd den ned i 3 chained prompts — ét steg ad gangen',
                    'Kør dem sekventielt. Verificer efter hvert trin.',
                    'Sammenlign med at have sagt "byg det hele" — hvor gik det galt?'
                ]
            }
        },
        prompts: [
            {
                label: 'Debug-skabelon',
                language: 'text',
                text: `Jeg har en fejl i [fil/funktion].

Fejlen:
[paste fejl + stacktrace her]

Hvad jeg har prøvet:
- [forsøg 1]
- [forsøg 2]

Min hypotese: [hvad jeg tror det er]

Opgave: udeluk eller bekræft min hypotese først. Foreslå IKKE fix endnu. Læs @[relevante filer].`
            },
            {
                label: 'Scope-lock prompt',
                language: 'text',
                text: `Ændring: [beskriv opgave].

Scope-regler (SKAL overholdes):
- Kun denne metode rammes: [navn]
- Ingen ændringer i offentlig API
- Ingen nye dependencies
- Eksisterende tests skal stadig passere uden ændring

Hvis du tænker "det ville være pænere at...", skriv det i svaret — men lav det IKKE.`
            },
            {
                label: 'Chain prompting — trin 1 af 3',
                language: 'text',
                text: `Trin 1 af 3 — læs kun, kod ikke endnu.

Opgave: jeg vil bygge [feature]. Læs @[relevante filer] og giv mig:
1. Hvilke 3-5 filer skal ændres?
2. Hvilke afhængigheder er der mellem dem?
3. I hvilken rækkefølge bør ændringerne laves?

Svar i punktform. Ingen kode.`
            },
            {
                label: 'Chain prompting — trin 2 af 3',
                language: 'text',
                text: `Trin 2 af 3 — implementér kun første ændring fra planen.

Implementér kun [fil X] fra din plan. Skriv også testen der verificerer at denne ændring virker isoleret.

Rør IKKE de andre filer endnu — det gør vi i trin 3.`
            },
            {
                label: '`/rewind` — åbn undo-menuen',
                language: 'text',
                text: `/rewind

# Eller keybind: Esc Esc
# Menu-valg:
#   1. Rewind code only       — filer tilbage, samtale beholdes
#   2. Rewind conversation    — samtale tilbage, filer beholdes
#   3. Rewind both            — alt tilbage
#   4. Cancel`
            },
            {
                label: '`Ctrl+B` — start background task',
                language: 'text',
                text: `# Tryk Ctrl+B i Claude Code, så bliver du spurgt om kommando.
# Eksempler på gode background tasks:

dotnet test --watch
dotnet watch run
npm run test:watch
npm run dev`
            },
            {
                label: '`/tasks` — se status på baggrunds-tasks',
                language: 'text',
                text: `/tasks

# Eller Ctrl+T for et hurtigt overlay (lukkes med Esc).
# Bed Claude læse output:
# "Læs output fra task 1 og fix den fejlende test."`
            }
        ],
        handout: {
            title: '6 prompt-patterns + 2 power-features',
            content: [
                '**1. Debug** — Fejl + stacktrace + hypotese → "udeluk hypotesen først"',
                '**2. Refactor** — "ændr kun X, bevar offentlig kontrakt, tests skal stadig passere"',
                '**3. Test** — "skriv test for [metode] i stilen af @[eksempel-test]"',
                '**4. Review** — "kig efter: null-checks, glemte tests, scope creep. Ingen stil-kommentarer."',
                '**5. Forklar** — "læs @[fil]. Forklar i 5 bullets hvad den gør. Ingen kode."',
                '**6. Scope-lock** — "hvis du tænker pænere, skriv det — men ændr det IKKE"',
                '',
                '---',
                '',
                '**Power-feature 1: `/rewind` (eller `Esc Esc`)**',
                '- Rewind code only — filer tilbage, samtalen beholdes (Claude husker hvad der ikke virkede)',
                '- Rewind conversation only — fjerner pinlig instruktion, beholder gode ændringer',
                '- Rewind both — fuld restart',
                '',
                '**Power-feature 2: `Ctrl+B` background tasks**',
                '- Start `dotnet test --watch` i baggrunden, fortsæt prompting samtidig',
                '- `/tasks` lister status, `Ctrl+T` er hurtig overlay',
                '- Claude kan læse output og fixe live: "læs output fra task 1, fix den fejlende test"'
            ]
        },
        hjemmeopgave: [
            'Find ud af om dit projekt har en CLAUDE.md',
            'Hvis nej: brug 5 min på at notere hvad der burde stå i den',
            'Tag noterne med til session 5'
        ]
    },

    // ---- Session 5 ----------------------------------------------------------
    {
        number: 5,
        title: 'CLAUDE.md og projekt-hukommelse',
        subtitle: 'Gør Claude klogere på lige præcis jeres kode',
        theme: 'Workflows der virker',
        day: 'Tirsdag · Uge 3',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: prompt-patterns I har brugt' },
            { t: '0:05–0:20', what: 'Foredrag: hvad CLAUDE.md er (og ikke er) + memory-systemet' },
            { t: '0:20–0:35', what: 'Live demo: før/efter med god CLAUDE.md' },
            { t: '0:35–0:55', what: 'Hands-on: skriv/forbedr jeres egen' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            'CLAUDE.md = projektets "onboarding-dokument" til Claude',
            'Lever i repo-root. Committes. Alle får samme context.',
            'IND: stack, konventioner, hvor tingene ligger, hvad man IKKE må',
            'UD: general dokumentation, API-refs, ting der ændrer sig hver uge',
            'Memory-systemet: personlig auto-hukommelse på tværs af samtaler (anden ting end CLAUDE.md)',
            '',
            '**Tre hukommelses-lag — tag dem stille og roligt:**',
            '**1. CLAUDE.md** — projekt-onboarding, committes til repo, alle på teamet får den. Kort og kerneagtig.',
            '**2. `.claude/rules/*.md`** — del CLAUDE.md op pr. område. Hver fil kan have YAML-frontmatter med `paths: ["src/api/**/*.ts"]` så reglen KUN aktiveres når Claude rører de filer. Smart når jeres backend og frontend bor i samme repo og har vidt forskellige konventioner.',
            '**3. Auto-memory** — personlig hukommelse på tværs af samtaler. Lever i `~/.claude/projects/<project>/memory/MEMORY.md` (gem ALDRIG hemmeligheder her — ikke committet, men ligger på disk). Claude lærer dine præferencer over tid. Ses og redigeres med `/memory`.',
            '`/init` — auto-genererer CLAUDE.md-skabelon ved at scanne dit repo. Start her hvis I ikke har en endnu.'
        ],
        demo: [
            {
                heading: 'Setup — find et EDC-repo uden CLAUDE.md (1 min)',
                say: 'Jeg bruger et af vores egne repos hvor vi ikke har lavet CLAUDE.md endnu.',
                body: 'Tjek at der ikke allerede ligger en CLAUDE.md i rod. Hvis der gør: flyt den midlertidigt eller vælg andet repo.'
            },
            {
                heading: 'Før CLAUDE.md — stil et typisk spørgsmål (2 min)',
                body: 'Kør `/clear` i Claude først. Stil dette:',
                promptLabel: 'Spørgsmål (før CLAUDE.md)',
                prompt: 'Hvordan laver jeg en ny endpoint der returnerer alle aktive properties? Forklar først hvilke filer der skal ændres, i hvilken rækkefølge, inden du koder.',
                expected: 'Claude gætter stack, mappestruktur, konventioner. Måske korrekt, måske foreslår AddAsync + direkte DB-kald fra controller. Generisk. Noter svaret højt for deltagerne — "dette er hvad en ny udvikler uden kontekst også ville svare".'
            },
            {
                heading: 'Tilføj målrettet CLAUDE.md (3 min)',
                body: 'Opret `CLAUDE.md` i projekt-rod. Tilpas efter jeres stack.',
                promptLabel: 'CLAUDE.md — C# backend skabelon',
                prompt: `# EDC Property API

## Stack
- .NET 8, EF Core 8, SQL Server
- MediatR til commands/queries
- FluentValidation
- xUnit + FluentAssertions

## Konventioner
- Records til DTOs og commands, ikke classes
- Command → Handler → Validator pattern
- Async hele vejen — aldrig .Result eller .Wait()
- Endpoint-navne i plural (/api/properties, ikke /api/property)

## Struktur
- src/Api — controllers og startup
- src/Application — commands, queries, handlers
- src/Domain — entities, domain services
- src/Infrastructure — EF, migrations, external
- tests/* — ét test-projekt pr. lag

## Ting der IKKE skal gøres
- Ingen direct DB-kald fra controllers — altid gennem MediatR
- Ingen nye NuGet-pakker uden at spørge

## Ting Claude ofte gætter forkert på
- Vi bruger TimeProvider (.NET 8), ikke DateTime.UtcNow
- Migrations laves i Infrastructure-projektet, ikke Api
- "Property" er domænebegrebet for bolig, ikke C#-property`,
                expected: 'Gem filen. Hvis Claude Code kører, start det evt om så CLAUDE.md bliver loaded.'
            },
            {
                heading: 'Efter CLAUDE.md — stil SAMME spørgsmål (2 min)',
                body: 'Kør `/clear` — vigtigt, ellers bruger Claude svaret fra før.',
                promptLabel: 'Samme spørgsmål (efter CLAUDE.md)',
                prompt: 'Hvordan laver jeg en ny endpoint der returnerer alle aktive properties? Forklar først hvilke filer der skal ændres, i hvilken rækkefølge, inden du koder.',
                expected: 'Claude følger jeres pattern: Command → Handler → Validator → Controller. Plural endpoint-navn. Filer i rigtige mapper. Kvalitativ forskel som er tydelig for alle i rummet.'
            },
            {
                heading: 'React-variant for edc.dk (3 min)',
                say: 'Samme princip, andet stack. Her er hvad I bør lægge i frontend-repoet.',
                promptLabel: 'CLAUDE.md — React frontend skabelon',
                prompt: `# EDC edc.dk Frontend

## Stack
- React 19, TypeScript 5.5
- Vite, Tailwind CSS
- TanStack Query til data fetching
- Zustand til global state
- Vitest + React Testing Library

## Konventioner
- Funktionelle komponenter kun, ingen class components
- Named exports, ikke default
- Tests i \`[navn].test.tsx\` ved siden af komponenten
- Types i samme fil, medmindre delt — så i \`types.ts\`

## Struktur
- src/components — genbrugelige UI-komponenter
- src/features/[feature] — side/feature-specifik kode
- src/lib — utilities og hooks
- src/api — API-klient (genereret fra OpenAPI)

## Ting der IKKE skal gøres
- Ingen useEffect til data fetching — brug TanStack Query
- Ingen any — brug unknown + type guards
- Ingen CSS-filer — kun Tailwind

## Ting Claude ofte gætter forkert på
- Vi bruger Zustand, ikke Redux eller Context
- Formularer bruger react-hook-form + zod, ikke Formik
- Priser formatteres med Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" })`,
                expected: 'Deltagerne kan kopiere skabelonen direkte til deres repo og tilpasse. Hold den under 100 linjer — kortere = læst og brugt.'
            },
            {
                heading: 'Do & don\'t for CLAUDE.md (1 min)',
                say: 'Før vi går til hands-on: hvad hører IKKE ind i CLAUDE.md.',
                body: '**SKAL IND:** stack, konventioner, struktur, forbud, ting Claude ofte gætter forkert på.\n\n**MÅ IKKE IND:** generel API-dokumentation, README-indhold, stil-guides på flere sider, ting der ændrer sig hver uge.\n\n**Tommelfingerregel:** under 100 linjer. Længere → skær eller del op.'
            },
            {
                heading: '`/init` — auto-generér CLAUDE.md fra repo (2 min)',
                say: 'Hvis I ikke har en CLAUDE.md endnu og ikke ved hvor I skal starte: brug `/init`. Den scanner repoet og foreslår en skabelon I kan rette i.',
                body: 'Stå i et repo uden CLAUDE.md. Kør:',
                promptLabel: 'Slash command — auto-init',
                prompt: '/init',
                expected: 'Claude læser projektets struktur, package.json/csproj/etc., og foreslår en CLAUDE.md med stack-detaljer, mappestruktur og placeholder-sektioner. Den er IKKE perfekt — men 80% færdig er bedre end blank canvas. Pointe: brug den som startpunkt og rediger derefter.'
            },
            {
                heading: '`.claude/rules/*.md` — del op efter område (3 min)',
                say: 'Når CLAUDE.md begynder at være over 100 linjer fordi I har både frontend OG backend i samme repo, så del den op. Læg regler i `.claude/rules/` med en `paths`-frontmatter så reglerne kun aktiveres når relevante filer er i context.',
                body: 'Opret `.claude/rules/api-conventions.md` med YAML-frontmatter der peger på backend-paths.',
                promptLabel: '.claude/rules/api-conventions.md',
                prompt: `---
paths: ["src/Api/**/*.cs", "src/Application/**/*.cs", "src/Infrastructure/**/*.cs"]
---

# Backend-konventioner (.NET)

Disse regler aktiveres KUN når Claude rører filer i src/Api, src/Application eller src/Infrastructure.

- Records til DTOs og commands, ikke classes
- Async hele vejen — aldrig .Result eller .Wait()
- Endpoint-navne i plural (/api/properties)
- Ingen direct DB-kald fra controllers — altid gennem MediatR
- TimeProvider i stedet for DateTime.UtcNow
- Migrations laves i Infrastructure-projektet`,
                expected: 'Filen ligger i `.claude/rules/`. Når Claude rører frontend-kode, ignoreres reglen. Når den rører backend, indlæses den. Pointe: jeres React-folk slipper for backend-noise og omvendt.'
            },
            {
                heading: 'Frontend-pendant — `.claude/rules/frontend.md` (2 min)',
                body: 'Same trick for React-siden:',
                promptLabel: '.claude/rules/frontend.md',
                prompt: `---
paths: ["src/components/**/*.tsx", "src/features/**/*.tsx", "src/lib/**/*.ts"]
---

# Frontend-konventioner (React 19)

- Funktionelle komponenter kun — ingen class components
- Named exports, ikke default
- TanStack Query til data fetching (ingen useEffect-fetch)
- Tailwind only — ingen CSS-filer
- Tests i [navn].test.tsx ved siden af komponenten
- Priser: Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" })`,
                expected: 'Aktiveres kun for tsx-/ts-filer i de paths. Pointe: I kan have 5-6 fokuserede rule-filer i stedet for én lang CLAUDE.md.'
            },
            {
                heading: '`/memory` — personlig hukommelse på tværs af samtaler (2 min)',
                say: 'CLAUDE.md er for projektet — `/memory` er for DIG. Personlige præferencer (navn, foretrukket stil, kontekst Claude bør huske om dig) der ikke skal i repoet.',
                body: 'Kør `/memory` i Claude Code.',
                promptLabel: 'Slash command — vis personlig memory',
                prompt: '/memory',
                expected: 'Claude åbner editor for `~/.claude/projects/<project>/memory/MEMORY.md`. Vis hvordan auto-memory bygger sig op over tid (fx "User foretrækker dansk i prompts, engelsk i kode-kommentarer"). VIGTIGT — sig højt: **hemmeligheder må aldrig stå her**. Filen er ikke krypteret. Det er præferencer, ikke credentials.'
            },
            {
                heading: 'Sammenhæng — hvilken hukommelse hvor? (1 min)',
                body: '**Beslutningstræ:**\n\n**Skal hele teamet få det?** → CLAUDE.md (rod) eller `.claude/rules/*.md` (område)\n**Er det specifikt til ét område af repoet?** → `.claude/rules/*.md` med paths-frontmatter\n**Er det MIN præference (ikke teamets)?** → `/memory` (auto-memory)\n**Er det en hemmelighed?** → INGEN AF DEM. Brug env vars eller secrets manager.\n\nHold CLAUDE.md kort. Brug rule-filer til specialisering. Brug memory til personlige ting.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'A-spor (begynder)',
                steps: [
                    'Kopiér skabelonen nedenfor',
                    'Udfyld den med dit projekts info (5-10 min arbejde)',
                    'Læg den i projektets rod som CLAUDE.md',
                    'Stil samme spørgsmål før og efter — noter forskellen'
                ]
            },
            bSpor: {
                title: 'B-spor (advanced)',
                steps: [
                    'Åbn jeres eksisterende CLAUDE.md (hvis I har en)',
                    'Slet alt der er støj eller forældet',
                    'Tilføj "ting Claude plejer at gætte forkert på" (konkrete eksempler)',
                    'Commit og del i #claude-code-kanalen'
                ]
            }
        },
        prompts: [
            {
                label: 'CLAUDE.md — skabelon til C# backend',
                language: 'markdown',
                text: `# [Projektnavn]

## Stack
- .NET 8, EF Core 8, SQL Server
- MediatR, FluentValidation, AutoMapper
- xUnit + FluentAssertions

## Konventioner
- Records til DTOs og commands, ikke classes
- Command → Handler → Validator pattern
- Async hele vejen — aldrig .Result eller .Wait()
- Endpoint-navne i plural (/api/properties, ikke /api/property)

## Struktur
- src/Api — controllers og startup
- src/Application — commands, queries, handlers
- src/Domain — entities, domain services
- src/Infrastructure — EF, external integrations
- tests/* — én test-projekt pr. lag

## Ting der IKKE skal gøres
- Ingen direct DB-kald fra controllers — altid gennem MediatR
- Ingen nye NuGet-pakker uden at spørge
- Tests må ikke mocke MediatR — brug testdouble for repositories i stedet

## Ting Claude ofte gætter forkert på
- Vi bruger TimeProvider (.NET 8), ikke DateTime.UtcNow direkte
- Migrations laves i Infrastructure-projektet, ikke Api`
            },
            {
                label: 'CLAUDE.md — skabelon til React frontend',
                language: 'markdown',
                text: `# [Projektnavn]

## Stack
- React 19, TypeScript 5.5
- Vite, Tailwind CSS
- TanStack Query, Zustand
- Vitest + React Testing Library

## Konventioner
- Funktionelle komponenter kun, ingen class components
- Named exports, ikke default exports
- Tests i \`[navn].test.tsx\` ved siden af komponenten
- Types i samme fil med mindre de deles — så ligger de i \`types.ts\`

## Struktur
- src/components — genbrugelige UI-komponenter
- src/features/[feature] — side/feature-specifik kode
- src/lib — utilities og hooks
- src/api — API-klient (genereret fra OpenAPI)

## Ting der IKKE skal gøres
- Ingen useEffect til data fetching — brug TanStack Query
- Ingen any — brug unknown + type guards
- Ingen CSS-filer — kun Tailwind

## Ting Claude ofte gætter forkert på
- Vi bruger Zustand til global state, ikke Redux eller Context
- Formularer bruger react-hook-form + zod, ikke Formik`
            },
            {
                label: 'Spørgsmål til at teste CLAUDE.md før/efter',
                language: 'text',
                text: `Hvordan laver jeg en ny endpoint der returnerer alle properties med status "active"?

Forklar først hvilke filer der skal ændres, i hvilken rækkefølge, inden du koder.`
            },
            {
                label: 'CLAUDE.md — udvidet EDC-stil (med "Ting Claude gætter forkert på")',
                language: 'markdown',
                text: `# [Projektnavn] — EDC

## Stack
- .NET 8, EF Core 8, SQL Server
- MediatR, FluentValidation, AutoMapper
- xUnit + FluentAssertions
- Serilog til logging

## Konventioner
- Records til DTOs og commands, ikke classes
- Command → Handler → Validator pattern (én pr. fil)
- Async hele vejen — aldrig .Result eller .Wait()
- Endpoint-navne i plural (/api/properties, ikke /api/property)
- TimeProvider (.NET 8) i stedet for DateTime.UtcNow

## Struktur
- src/Api — controllers og startup
- src/Application — commands, queries, handlers, validators
- src/Domain — entities, domain services, value objects
- src/Infrastructure — EF, migrations, external integrations
- tests/* — ét test-projekt pr. lag

## Ting Claude IKKE skal gøre
- Ingen direct DB-kald fra controllers — altid gennem MediatR
- Ingen nye NuGet-pakker uden at spørge teamet først
- Tests må ikke mocke MediatR — brug testdouble for repositories
- Ingen Console.WriteLine — brug ILogger

## Ting Claude plejer at gætte forkert på
- Migrations laves i **Infrastructure**-projektet, ikke Api eller Domain
- Vi bruger **TimeProvider**, ikke DateTime.UtcNow direkte (testbarhed)
- "Property" er domæne-begrebet for **bolig**, ikke C#-property
- Priser er **decimal**, aldrig double/float (præcision)
- Tidszoner: alt brugervendt er **Europe/Copenhagen**, alt persistent er UTC
- Vi bruger **IHttpClientFactory**, aldrig new HttpClient() direkte
- "Agent" er ejendomsmægler, ikke en bot/AI-agent
- Endpoint-routing: kebab-case i URL, PascalCase i C#`
            },
            {
                label: 'CLAUDE.md — udvidet React-stil (edc.dk)',
                language: 'markdown',
                text: `# edc.dk Frontend

## Stack
- React 19, TypeScript 5.5
- Vite 6, Tailwind CSS 4
- TanStack Query v5, Zustand v5
- Vitest + React Testing Library
- react-hook-form + zod

## Konventioner
- Funktionelle komponenter kun, ingen class components
- Named exports, ikke default exports
- Tests i \`[navn].test.tsx\` ved siden af komponenten
- Types i samme fil med mindre de deles — så i \`types.ts\`
- Hooks-filer hedder \`use-*.ts\`

## Struktur
- src/components — genbrugelige UI-komponenter
- src/features/[feature] — side/feature-specifik kode
- src/lib — utilities og hooks
- src/api — API-klient (genereret fra OpenAPI)

## Ting Claude IKKE skal gøre
- Ingen useEffect til data fetching — brug TanStack Query
- Ingen \`any\` — brug \`unknown\` + type guards
- Ingen CSS-filer — kun Tailwind
- Ingen default exports

## Ting Claude plejer at gætte forkert på
- State: vi bruger **Zustand**, ikke Redux eller Context
- Forms: **react-hook-form + zod**, ikke Formik eller direkte useState
- Priser: \`Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" })\` — aldrig manuel formatering
- Sprog i UI: dansk; sprog i kode/kommentarer: engelsk
- Datoer: \`date-fns\` med \`da\` locale, aldrig moment
- Vi har en \`<Button>\`-komponent — brug den, lav ikke nye knapper`
            },
            {
                label: '.claude/rules/api-conventions.md — paths-scoped regel',
                language: 'markdown',
                text: `---
paths: ["src/Api/**/*.cs", "src/Application/**/*.cs", "src/Infrastructure/**/*.cs"]
---

# Backend-konventioner (.NET)

Aktiveres kun når Claude rører backend-filer.

- Records til DTOs og commands, ikke classes
- Async hele vejen
- TimeProvider i stedet for DateTime.UtcNow
- Migrations laves i Infrastructure-projektet
- Ingen direct DB-kald fra controllers — altid gennem MediatR`
            },
            {
                label: '.claude/rules/frontend.md — paths-scoped regel',
                language: 'markdown',
                text: `---
paths: ["src/components/**/*.tsx", "src/features/**/*.tsx", "src/lib/**/*.ts"]
---

# Frontend-konventioner (React 19)

Aktiveres kun når Claude rører frontend-filer.

- Funktionelle komponenter, named exports
- TanStack Query til fetching, ikke useEffect
- Tailwind only — ingen CSS-filer
- Forms: react-hook-form + zod
- Priser: Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" })`
            },
            {
                label: '/init — start fra blank repo',
                language: 'text',
                text: `/init

# Claude scanner repoet og foreslår en CLAUDE.md.
# Den er ikke perfekt — men hurtig start.
# Ret derefter manuelt:
#   - Slet sektioner du ikke bruger
#   - Tilføj "Ting Claude gætter forkert på"
#   - Skær til under 100 linjer`
            },
            {
                label: '/memory — vis og rediger personlig hukommelse',
                language: 'text',
                text: `/memory

# Åbner ~/.claude/projects/<project>/memory/MEMORY.md
# Personlig — committes IKKE.
# VIGTIGT: aldrig hemmeligheder her.`
            }
        ],
        handout: {
            title: 'CLAUDE.md + rules + memory — do & don\'t',
            content: [
                '**SKAL være i CLAUDE.md:**',
                '☑ Stack (specifikke versioner hvis relevant)',
                '☑ Konventioner der ikke er synlige i koden',
                '☑ Hvor tingene ligger (mappestruktur)',
                '☑ Ting Claude plejer at gætte forkert på',
                '☑ Forbud ("ingen nye dependencies uden at spørge")',
                '',
                '**MÅ IKKE være der:**',
                '☒ Generel API-dokumentation',
                '☒ Ting der står i README',
                '☒ Stil-guide der rummer flere siders regler',
                '☒ Ting der ændrer sig hver uge',
                '',
                'Rule of thumb: under 100 linjer. Hvis længere → del op eller skær.',
                '',
                '---',
                '',
                '**Beslutningstræ — hvor lægger jeg det?**',
                '',
                'Skal hele teamet få det? → **CLAUDE.md** (rod, committes)',
                'Specifikt til ét område (api, frontend, infra)? → **`.claude/rules/[område].md`** med `paths`-frontmatter',
                'Min personlige præference? → **`/memory`** (auto-memory, ikke committet)',
                'Hemmelighed (token, kunde-data)? → **INGEN AF DEM** — env vars / secrets manager',
                '',
                '**Quick-start kommandoer:**',
                '- `/init` — auto-generér CLAUDE.md fra repo',
                '- `/memory` — vis/rediger personlig memory'
            ]
        },
        hjemmeopgave: [
            'Få din nye/opdaterede CLAUDE.md committed til dit repo',
            'Kør Claude på samme opgave med og uden CLAUDE.md — noter forskellen',
            'Tag eksempel med til session 6'
        ]
    },

    // ---- Session 6 ----------------------------------------------------------
    {
        number: 6,
        title: 'Git-workflow, commits og review',
        subtitle: 'Claude i dit daglige Git-flow — og hvornår du ikke skal stole på den',
        theme: 'Workflows der virker',
        day: 'Torsdag · Uge 3',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: før/efter CLAUDE.md' },
            { t: '0:05–0:20', what: 'Foredrag: /commit, /review, hvad Claude fanger og ikke fanger' },
            { t: '0:20–0:35', what: 'Live demo: commit + review flow' },
            { t: '0:35–0:55', what: 'Par-øvelse: byt kode og review hinandens' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            '`/commit` — Claude analyserer diff og foreslår commit-besked i jeres stil',
            '`/review` — Claude kigger på PR før kolleger gør',
            'Claude ER god til: typing, null-checks, konvention-brud, glemte tests, døde kode-stier',
            'Claude ER IKKE god til: domæne-logik, performance på skala, infra-sikkerhed, forretningsregler',
            'Golden rule: Claude-review forbereder kollega-review — det erstatter det ikke'
        ],
        demo: [
            {
                heading: 'Setup — lav en reel ændring (1 min)',
                say: 'Jeg har staget en ændring: guard clause i UserService.GetUser + matchende test. Ikke committed endnu.',
                body: 'Vis `git diff --cached` så deltagerne ser hvad der skal committes. Hvis du ikke har noget staget, lav en lille ændring live først.'
            },
            {
                heading: 'Brug /commit (2 min)',
                promptLabel: 'Slash command — kør i Claude Code',
                prompt: '/commit',
                expected: 'Claude analyserer diff\'en og foreslår fx: "fix(user): guard against empty email in GetUser". Den læser konvention fra dine seneste commits. Commit hvis den rammer — ellers juster.'
            },
            {
                heading: 'Når stilen ikke matcher — juster (2 min)',
                say: 'Hvis Claude skriver engelsk men I vil have dansk, eller omvendt — bed om præcis det I vil.',
                promptLabel: 'Juster commit-besked',
                prompt: `Vores stil er Conventional Commits på dansk, aktiv form, under 72 tegn første linje.

Eksempel på vores format: "fix(user): håndter tom email i GetUser"

Opdater commit-beskeden.`,
                expected: 'Claude retter beskeden. Pointe: dette er et signal om at I burde bygge en custom /commit — det gør vi i session 7.'
            },
            {
                heading: 'Brug /review på en åben PR (4 min)',
                say: 'Jeg har en PR åben med et par commits — lad os se hvad Claude fanger.',
                body: 'Skift til branch med ændringer og kør:',
                promptLabel: 'Slash command',
                prompt: '/review',
                expected: 'Claude gennemgår diff\'en og peger på: null-checks, test-dækning, konvention-brud, scope creep. Ingen stil-/formatteringskommentarer (dem har linters).'
            },
            {
                heading: 'Diskutér — hvad er værd at rette? (3 min)',
                say: 'Gå gennem Claudes kommentarer én for én. Sig højt: "ja, ret" / "nej, ikke relevant" / "interessant men uden for scope".',
                body: '**Pointen:** Claude-review er en sparringspartner, ikke en dommer. Du filtrerer. Det der er værdifuldt: null-checks, edge cases, konventions-brud. Det der ikke er: "måske kunne navngivningen være klarere".'
            },
            {
                heading: 'Manuel review-prompt (2 min)',
                say: 'Hvis I ikke bruger /review (fx på kolleges PR), kan I skrive det selv.',
                promptLabel: 'Manuel review-prompt',
                prompt: `Review ændringerne i denne branch (kør git diff main...HEAD for at se dem).

Kig efter:
1. Null/empty-håndtering der mangler
2. Tests der kun dækker happy path
3. Brud på konventioner fra @CLAUDE.md
4. Scope creep (ændringer der ikke hører til denne feature)
5. N+1 queries eller "hent alt og filtrer i memory"-mønstre

Kig IKKE efter:
- Stil/formatering (linters)
- Navnevalg (subjektivt)

Svar i punktform med fil:linje-reference.`,
                expected: 'Fokuseret review. Bemærk: negative instruktioner ("kig IKKE efter") er lige så vigtige som positive — de fjerner støj.'
            },
            {
                heading: 'Hvornår IKKE stole på /review (1 min)',
                body: '**Claude fanger dårligt:**\n- Forretningslogik ("returnerer vi den rigtige pris?")\n- Performance på rigtig skala\n- Sikkerhed på infra-niveau (auth, SQL injection i edge cases)\n- Migrations (hvad sker der med data?)\n\n**Golden rule:** Claude-review forbereder kollega-review — det erstatter det ikke.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'Par-øvelse (alle)',
                steps: [
                    'Lav en lille ændring i dit repo (bug-fix, refactor, ny test)',
                    'Brug `/commit` til at lave commit-besked',
                    'Push til branch',
                    'Par jer op og byt branch-navn',
                    'Kør `/review` på partnerens branch',
                    'Del feedback: hvilken kommentar var spot on? Hvilken ramte ved siden af?'
                ]
            },
            bSpor: {
                title: '',
                steps: []
            }
        },
        prompts: [
            {
                label: '/commit — skabelon (hvis Claude ikke rammer jeres stil)',
                language: 'text',
                text: `Skriv en commit-besked til de stagede ændringer.

Vores stil:
- Conventional Commits (feat/fix/refactor/test/docs/chore)
- Present tense, aktiv form
- Første linje under 72 tegn
- Body kun hvis ændringen er ikke-triviel — ellers bare én linje

Eksempel på good commit:
"fix(property): handle null email in GetUser

Guard clause added. Previously returned null silently which
caused NullReferenceException in PropertyController."

Læs @.git/COMMIT_EDITMSG hvis der er en template.`
            },
            {
                label: 'Manuel review-prompt (hvis I ikke bruger /review)',
                language: 'text',
                text: `Review denne PR:

[paste diff eller peg på branch]

Kig efter:
1. Null/empty-håndtering der mangler
2. Tests der ikke dækker edge cases
3. Brud på konventioner fra @CLAUDE.md
4. Scope creep (ændringer der ikke hører til denne feature)
5. Performance-issues (N+1, unødige allocations)

Kig IKKE efter:
- Stil/formatering (det har vi linters til)
- Navnevalg (det er subjektivt)

Svar i punktform med fil:linje-reference.`
            },
            {
                label: 'Custom /commit — .claude/commands/commit.md',
                language: 'markdown',
                text: `---
description: Lav commit med EDC's konvention
---

Analysér de stagede ændringer med \`git diff --cached\`.

Lav en commit-besked på dansk med følgende struktur:
- Type-prefix: feat/fix/refactor/test/docs/chore
- Scope i parentes (fx \`feat(property-search)\`)
- Første linje under 72 tegn
- Body kun hvis ændringen er ikke-triviel

Eksempel:
\`fix(property): håndter null email i GetUser\`

Vis beskeden. Spørg om den skal committes.`
            }
        ],
        handout: {
            title: 'Review-checklist — når du stoler på Claude',
            content: [
                '**Claude-review er nok når:**',
                '☑ Små refactorings',
                '☑ Typing-/null-checks',
                '☑ Testdækning af nye metoder',
                '☑ Konventions-brud',
                '',
                '**Du skal selv (eller kollega) reviewe når:**',
                '☐ Det rører forretningslogik',
                '☐ Der er performance-konsekvenser',
                '☐ Det rører sikkerhed (auth, secrets, SQL, input validation)',
                '☐ Det er nye arkitektur-valg',
                '☐ Det er en migration',
                '',
                'Tommelfingerregel: "ville jeg mærke det hvis det var forkert om 3 måneder?" → ja → kollega-review også.'
            ]
        },
        hjemmeopgave: [
            'Brug `/commit` eller `/review` mindst én gang på ægte arbejde',
            'Find én ting Claude fangede som du ikke ville have fanget selv',
            'Tag den med til session 7'
        ]
    },

    // ---- Session 7 ----------------------------------------------------------
    {
        number: 7,
        title: 'Skills, agents og model-tuning',
        subtitle: 'Automatisér dine gentagne workflows — skills, subagents, slash commands og model-/effort-tuning',
        theme: 'Avancerede features',
        day: 'Tirsdag · Uge 4',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: hvad /review fangede hos jer' },
            { t: '0:05–0:20', what: 'Foredrag: built-in + custom slash commands + model-valg' },
            { t: '0:20–0:35', what: 'Live demo: byg en /pr-description command' },
            { t: '0:35–0:55', what: 'Hands-on' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            'Built-in: `/commit`, `/review`, `/init`, `/clear`, `/compact`, `/help`',
            'Custom: markdown-fil i `.claude/commands/navn.md` → `/navn`',
            'Regel: 3+ gentagelser = byg en command',
            'Kan tage argumenter: `$ARGUMENTS` i markdownen',
            'Model-valg: Opus til komplekse opgaver, Sonnet til daglig kodning, Haiku til hurtige simple',
            '',
            '**Tre nye værktøjer i dag — alle løser samme grund-problem (gentagne workflows), men på forskelligt niveau:**',
            '**Skills** (`.claude/skills/<navn>/SKILL.md`) — selvstændige, model-aktiverede capabilities. Mere end en prompt: kan have tools-restriction, paths-trigger, og auto-invocation. Brug når en hel arbejdsgang skal gentages konsistent.',
            '**Subagents** (`.claude/agents/<navn>.md` + `/agents`-picker) — isolerede Claude-instanser med eget context. Brug til research/review der ikke skal forurene hovedsamtalen, eller til parallelle opgaver.',
            '**Model & effort** — `/model` skifter model (Opus/Sonnet/Haiku/opusplan), `/effort` skifter tænke-budget (low/medium/high/xhigh/max). Tradeoff cost ↔ speed ↔ intelligence. `Option+P` (mac) / `Alt+P` (linux/win) er quick-switch keybind.'
        ],
        demo: [
            {
                heading: 'Byg /pr-description live (4 min)',
                say: 'I vores team skriver vi PR-beskrivelser efter samme skabelon hver gang. Lad os automatisere det.',
                body: 'Opret filen `.claude/commands/pr-description.md` i projektet. Indholdet herunder er hele kommandoen — front matter + instruktion til Claude.',
                promptLabel: '.claude/commands/pr-description.md',
                prompt: `---
description: Lav PR-beskrivelse baseret på commits i branch
---

Læs output af \`git log main..HEAD --oneline\` for at se commits.
Læs output af \`git diff main...HEAD --stat\` for at se ændrede filer.

Lav en PR-beskrivelse på dansk:

## Hvad
[1-2 linjer om hvad der er ændret]

## Hvorfor
[1-2 linjer om motivation — udled fra commits eller spørg mig]

## Test-plan
- [ ] [checklist af hvad der skal testes]

## Risiko
[Ingen / Lav / Medium / Høj + kort begrundelse]

Hvis argumentet \$ARGUMENTS er sat (fx Jira-nummer), inkludér det øverst som "Issue: [id]".`,
                expected: 'Filen ligger nu i `.claude/commands/`. Commit den til repo — hele teamet får adgang.'
            },
            {
                heading: 'Kør /pr-description — uden argument (1 min)',
                body: 'Stå i en branch med commits der afviger fra main.',
                promptLabel: 'Slash command',
                prompt: '/pr-description',
                expected: 'Claude kører `git log` + `git diff`, udfylder skabelonen baseret på faktiske commits. Kopier direkte ind i GitHub når du opretter PR.'
            },
            {
                heading: 'Kør /pr-description — med argument (1 min)',
                promptLabel: 'Slash command med Jira-ID',
                prompt: '/pr-description EDC-1234',
                expected: 'Samme output, men med "Issue: EDC-1234" øverst. Peg på \\$ARGUMENTS i markdown-filen — det er magi\'en.'
            },
            {
                heading: 'Byg /explain-endpoint — for onboarding (3 min)',
                say: 'Ny udvikler spørger ofte "hvad gør denne controller?". Automatisér svaret.',
                body: 'Opret `.claude/commands/explain-endpoint.md`:',
                promptLabel: '.claude/commands/explain-endpoint.md',
                prompt: `---
description: Forklar en C#-endpoint for en ny udvikler
---

Læs filen \$ARGUMENTS.

Forklar på dansk for en udvikler der er NY i projektet:

1. **Hvad endpoint'et gør** (én sætning)
2. **Input og output** (typer og betydning)
3. **Dataflow** (hvilke services/repositories kaldes i hvilken rækkefølge)
4. **Afhængigheder** (DB, eksterne systemer, caches)
5. **Fejl-paths** (hvad kan gå galt og hvordan håndteres det)

Svar kortfattet. Ingen kode-snippets.`,
                expected: 'Filen er på plads.'
            },
            {
                heading: 'Brug /explain-endpoint (1 min)',
                promptLabel: 'Slash command med filsti',
                prompt: '/explain-endpoint PropertiesController.cs',
                expected: 'Struktureret forklaring på 5 punkter. Kopier direkte til jeres onboarding-wiki næste gang I onboarder.'
            },
            {
                heading: 'Skills — `.claude/skills/<navn>/SKILL.md` (3 min)',
                say: 'Skills er det næste skridt fra slash commands. Hvor en command er én markdown-fil med en prompt, er en skill en hel mappe med metadata, regler om hvilke tools den må bruge, og automatisk aktivering når Claude rører bestemte filer.',
                body: 'Opret mappen `.claude/skills/edc-test-writer/` og læg en `SKILL.md` deri.',
                promptLabel: '.claude/skills/edc-test-writer/SKILL.md',
                prompt: `---
name: edc-test-writer
description: Skriv xUnit-tests i EDC-stil for en C#-metode. Kald automatisk når Claude rører *.cs i tests/.
disable-model-invocation: false
allowed-tools: ["Read", "Edit", "Write", "Grep", "Glob"]
paths: ["tests/**/*.cs"]
---

# EDC Test Writer

Du er specialist i at skrive tests for EDC's .NET-projekter.

## Krav til hver test
- AAA-struktur (Arrange / Act / Assert)
- FluentAssertions, ikke Assert.Equal
- Én test pr. scenarie — ikke én stor "happy path"
- Dæk: happy path, null/empty, edge cases, exception-paths
- Test-navne: \`Method_ShouldDoX_WhenY\`

## Forbud
- Ingen mocks af MediatR — brug fakes/spies for repos
- Ingen test-data uden klar betydning ("foo" → "user@example.com")

## Output
Læg testen i den korrekte test-fil baseret på navnekonvention. Hvis filen ikke findes, opret den.`,
                expected: 'Filen ligger nu i `.claude/skills/edc-test-writer/SKILL.md`. Genstart Claude. Når du nu rører tests/-filer kan skill\'en aktiveres automatisk via paths, og du kan også kalde den eksplicit. Pointe: en skill er hvad I bygger når en `command` ikke længere er nok.'
            },
            {
                heading: 'Subagents — `.claude/agents/` + `/agents`-picker (3 min)',
                say: 'Subagents er hvor I sender en isoleret Claude-instans af sted med en specifik opgave. Den har sit EGET context-vindue — så den ødelægger ikke jeres hovedsamtale, og I kan have flere kørende parallelt.',
                body: 'Vis `/agents`-picker. Den viser built-in agents (Explore, Plan) + jeres custom agents.',
                promptLabel: 'Slash command — agent picker',
                prompt: '/agents',
                expected: 'En liste over tilgængelige agenter. Vis hvordan I kan vælge en med pile-tasterne. Forklar: hver agent får sit eget context-vindue når den invokeres.'
            },
            {
                heading: 'Custom agent — code-archaeologist (2 min)',
                body: 'Opret `.claude/agents/code-archaeologist.md`:',
                promptLabel: '.claude/agents/code-archaeologist.md',
                prompt: `---
name: code-archaeologist
description: Find ud af hvorfor en linje kode ser ud som den gør — git blame + commit-historik + relateret context
tools: Read, Grep, Glob, Bash
model: sonnet
---

Du er kode-arkæolog. Når du får en fil + linje (eller en kodestump), gør du følgende:

1. \`git blame\` på linjen → hvem rørte den senest, hvilken commit
2. \`git log --follow\` på filen → tidligere commits der rørte den
3. Læs commit-beskederne — find den der introducerede koden
4. Se i README/CLAUDE.md/CHANGELOG om der er kontekst
5. Sammenfat på 5 punkter:
   - Hvem skrev koden, hvornår
   - Hvilken commit-besked sagde de
   - Hvilken issue/PR (hvis nævnt)
   - Hvilken anden kode blev ændret samtidig
   - Sandsynlig grund til den nuværende form

Du svarer kortfattet. Ingen fix-forslag — kun arkæologi.`,
                expected: 'Filen ligger i `.claude/agents/`. Genstart Claude. Nu kan I kalde agenten via `/agents` eller bede Claude om at delegere: "brug code-archaeologist på @PropertyService.cs#L42". Pointe: I delegerer en specialopgave så jeres hovedsamtale forbliver fokuseret.'
            },
            {
                heading: 'Hvornår delegere til subagent? (1 min)',
                body: '**Brug subagent når:**\n- Opgaven kræver at læse 10+ filer og I kun vil have summary tilbage\n- Flere uafhængige opgaver kan køre parallelt (fx review 3 PRs)\n- Det er en specialopgave I gerne vil isolere fra hovedsamtalen\n\n**IKKE subagent når:**\n- Opgaven har brug for context fra jeres samtale (subagenten starter blank)\n- Det kun er en enkelt prompt — bare prompt direkte\n- I skal have kontrol step-by-step (subagent kører autonomt indtil færdig)'
            },
            {
                heading: 'Model-skift live (2 min)',
                say: 'Ikke alt kræver Opus. For hurtige simple opgaver skifter vi ned.',
                promptLabel: 'Vis modeller',
                prompt: '/model',
                expected: 'Claude viser tilgængelige modeller: Opus, Sonnet, Haiku, og aliaset `opusplan` (= Opus Plan-mode + Sonnet til execution). Vælg Haiku. Kør en hurtig prompt (fx "opsummer @README.md i 3 bullets"). Mærkbart hurtigere + billigere. Forklar tommelfingerregel: **Opus til arkitektur/design, Sonnet til daglig kodning (default), Haiku til simpel opsummering/search**. `opusplan` = bedst af to verdener: Opus tænker, Sonnet eksekverer.'
            },
            {
                heading: '`Option+P` quick-switch + `/effort` (2 min)',
                say: 'I behøver ikke åbne `/model`-menuen hver gang. På Mac: `Option+P`. På Linux/Windows: `Alt+P`. Det er en hurtig cycler.',
                body: 'Tryk `Option+P` foran deltagerne et par gange. Vis at modellen skifter i status-baren. Vis derefter `/effort` — det er separat fra model og styrer hvor MEGET den valgte model må tænke.',
                promptLabel: 'Skift effort-niveau',
                prompt: '/effort low',
                expected: '`/effort low` = mindre thinking-budget = hurtigere + billigere. `medium` (default) for daglig kodning. `high`/`xhigh`/`max` til komplekse refactors og arkitektur-design. Pointe: model + effort er to dimensioner — kombiner dem efter opgavens vægt. Daglig kodning: Sonnet + medium. Hurtig opsummering: Haiku + low. Stort design-spørgsmål: Opus + high.'
            },
            {
                heading: 'Cost-tip — `/effort low` til simple ting (1 min)',
                body: '**Eksempel:** "opsummer denne fil i 3 bullets" — det skal IKKE bruge `high`-effort. Sæt `/effort low` først og kør så mange små opsummeringer du vil. I sparer tokens, går hurtigere, samme resultat.\n\n**Tommelfingerregel:** hvis I tænker "det her kunne en intern kollega svare på i hovedet" → `low`. Hvis I tænker "her skal læses kode og tænkes flere skridt frem" → `medium` eller `high`.',
                promptLabel: 'Test efter /effort low',
                prompt: 'Opsummer @README.md i 3 bullets. Ingen analyse — bare bullets.',
                expected: 'Hurtigt svar, lav cost. Sammenlign med samme prompt på `/effort high` — sandsynligvis identisk svar, men 5x langsommere og dyrere. Pointe: cost-discipline starter med at vide at /effort findes.'
            },
            {
                heading: 'Bonus — /test-gen som bonus til begyndere (2 min)',
                body: 'Én mere nyttig command — test-generering i jeres stil:',
                promptLabel: '.claude/commands/test-gen.md',
                prompt: `---
description: Generér tests for en metode i EDC-stil
---

Læs filen \$ARGUMENTS.

Find metoden jeg peger på (spørg hvis uklart).

Generér xUnit-tests i samme stil som eksisterende tests i projektet:
- AAA-struktur (Arrange/Act/Assert)
- FluentAssertions
- Én test pr. scenarie, ikke én stor "happy path"-test
- Dæk: happy path, null/empty input, edge cases, exception-paths

Læg testen i den korrekte test-fil. Hvis den ikke findes, opret den.

Kør IKKE testene endnu — vis mig diff'en først.`,
                expected: 'Begyndere i B-spor kan kopiere denne direkte til deres repo. Dette er skabelonen til "hvad er en custom command værd".'
            },
            {
                heading: 'Headless mode — Claude i terminal + CI (3 min)',
                say: 'Claude Code kan køre ikke-interaktivt. Perfekt til scripts, CI, eller automatisering — fx auto-genereret PR-beskrivelse i GitHub Actions.',
                body: 'Brug `claude -p "..."` (print mode). Claude svarer én gang og exiter — ingen REPL, ingen interaktion.',
                promptLabel: 'Terminal-kommando (ikke inde i Claude Code)',
                prompt: 'claude -p "Opsummer ændringerne i de sidste 5 commits i dette repo i 3 bullets" --output-format text',
                expected: 'Claude starter, læser git log, svarer med bullets, exiter. Output kan pipes til andre scripts. Pointe: kombineret med custom commands + subagents (næste session) kan hele review-flows automatiseres i CI.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'A-spor (begynder)',
                steps: [
                    'Kopiér en af de 3 færdige EDC-commands nedenfor til `.claude/commands/` i dit repo',
                    'Tilpas den til dit projekt (stack, konventioner)',
                    'Kør den på en ægte opgave'
                ]
            },
            bSpor: {
                title: 'B-spor (advanced)',
                steps: [
                    'Identificer jeres teams mest gentagne prompt-mønster',
                    'Byg en custom command der automatiserer det',
                    'Commit den til `.claude/commands/` i teams repo',
                    'Del i #claude-code-kanalen'
                ]
            }
        },
        prompts: [
            {
                label: '/pr-description — .claude/commands/pr-description.md',
                language: 'markdown',
                text: `---
description: Lav PR-beskrivelse baseret på commits i branch
---

Læs output af \`git log main..HEAD --oneline\` for at se commits.
Læs output af \`git diff main...HEAD --stat\` for at se filer.

Lav en PR-beskrivelse på dansk med:

## Hvad
[1-2 linjer om hvad der er ændret]

## Hvorfor
[1-2 linjer om motivation — udled fra commits eller spørg mig]

## Test-plan
- [ ] [checklist af hvad der skal testes]

## Risiko
[Ingen / Lav / Medium / Høj + kort begrundelse]

Hvis argumentet \$ARGUMENTS er sat (fx Jira-nummer), inkludér det øverst som "Issue: [id]".`
            },
            {
                label: '/explain-endpoint — .claude/commands/explain-endpoint.md',
                language: 'markdown',
                text: `---
description: Forklar en C#-endpoint for en ny udvikler
---

Læs filen \$ARGUMENTS.

Forklar på dansk for en udvikler der er NY i projektet:

1. **Hvad endpoint'et gør** (én sætning)
2. **Input og output** (typer og betydning)
3. **Dataflow** (hvilke services/repositories bliver kaldt i hvilken rækkefølge)
4. **Afhængigheder** (eksterne systemer, DB, caches)
5. **Fejl-paths** (hvad kan gå galt og hvordan håndteres det)

Svar kortfattet. Ingen kode-snippets.`
            },
            {
                label: '/test-gen — .claude/commands/test-gen.md',
                language: 'markdown',
                text: `---
description: Generér tests for en metode i EDC-stil
---

Læs filen \$ARGUMENTS.

Find metoden jeg peger på (spørg hvis uklart).

Generér xUnit-tests i samme stil som eksisterende tests i projektet:
- AAA-struktur (Arrange/Act/Assert)
- FluentAssertions
- Én test pr. scenarie, ikke én stor "happy path"-test
- Dæk: happy path, null/empty input, edge cases, exception-paths

Læg testen i den korrekte test-fil. Hvis den ikke findes, opret den.

Kør IKKE testene endnu — vis mig diff'en først.`
            },
            {
                label: 'Skill — .claude/skills/edc-test-writer/SKILL.md',
                language: 'markdown',
                text: `---
name: edc-test-writer
description: Skriv xUnit-tests i EDC-stil for en C#-metode. Aktiveres automatisk når Claude rører tests/.
disable-model-invocation: false
allowed-tools: ["Read", "Edit", "Write", "Grep", "Glob"]
paths: ["tests/**/*.cs"]
---

# EDC Test Writer

Du er specialist i at skrive tests for EDC's .NET-projekter.

## Krav til hver test
- AAA-struktur (Arrange / Act / Assert)
- FluentAssertions, ikke Assert.Equal
- Én test pr. scenarie
- Dæk: happy path, null/empty, edge cases, exception-paths
- Test-navne: \`Method_ShouldDoX_WhenY\`

## Forbud
- Ingen mocks af MediatR — brug fakes/spies for repos
- Ingen test-data uden klar betydning ("foo" → "user@example.com")

## Output
Læg testen i den korrekte test-fil baseret på navnekonvention. Hvis filen ikke findes, opret den.`
            },
            {
                label: 'Skill — skabelon (kopier og tilpas)',
                language: 'markdown',
                text: `---
name: [skill-navn]
description: [én sætning om hvad skill\'en gør, og hvornår den skal aktiveres]
disable-model-invocation: false
allowed-tools: ["Read", "Edit", "Write", "Grep", "Glob", "Bash"]
paths: ["[glob til relevante filer]"]
---

# [Titel]

[Hvad er skill\'en specialist i?]

## Krav
- [regel 1]
- [regel 2]

## Forbud
- [hvad skal IKKE ske]

## Output
[hvad skal resultatet ligne]`
            },
            {
                label: 'Subagent — .claude/agents/code-archaeologist.md',
                language: 'markdown',
                text: `---
name: code-archaeologist
description: Find ud af hvorfor en linje kode ser ud som den gør — git blame + commit-historik
tools: Read, Grep, Glob, Bash
model: sonnet
---

Du er kode-arkæolog. Når du får en fil + linje (eller en kodestump):

1. \`git blame\` på linjen → hvem rørte den senest
2. \`git log --follow\` på filen → tidligere commits
3. Læs commit-beskederne — find den der introducerede koden
4. Sammenfat på 5 punkter:
   - Hvem skrev koden, hvornår
   - Commit-besked
   - Issue/PR hvis nævnt
   - Anden kode ændret samtidig
   - Sandsynlig grund til nuværende form

Ingen fix-forslag — kun arkæologi.`
            },
            {
                label: 'Subagent — skabelon (kopier og tilpas)',
                language: 'markdown',
                text: `---
name: [agent-navn]
description: [én sætning — hvornår skal Claude bruge denne agent?]
tools: [Read, Grep, Glob, Bash, Edit, Write — pick subset]
model: [sonnet|opus|haiku]
---

Du er [specialist-rolle].

Når du får [input], gør du:

1. [trin 1]
2. [trin 2]
3. [trin 3]

## Output-format
[hvordan skal svaret se ud]

## Forbud
- [hvad må agenten IKKE gøre]`
            },
            {
                label: 'Model-/effort-tuning — sample workflow',
                language: 'text',
                text: `# Cost-savings sample — brug før simple prompts

/effort low
/model haiku

# Nu kører Claude billig + hurtig.
# Brug det til:
#   - "opsummer @fil.md"
#   - "find alle TODO i src/"
#   - "lav 5 commit-message-forslag"

# Tilbage til default når I skal tænke:
/effort medium
/model sonnet

# Til arkitektur og store refactors:
/effort high
/model opus

# Quick-switch keybind: Option+P (Mac) / Alt+P (Linux/Win)
# Plan-mode + execution-split: /model opusplan`
            },
            {
                label: '/agents — åbn agent-picker',
                language: 'text',
                text: `/agents

# Vis alle tilgængelige agenter (built-in + custom).
# Vælg med pile-taster.
# Eller invoke fra prompt: "brug code-archaeologist på @PropertyService.cs#L42"`
            }
        ],
        handout: {
            title: 'Skills, agents, commands + model-tuning',
            content: [
                '**Slash command** — `.claude/commands/[navn].md` → `/[navn]`',
                'Med argumenter: `/[navn] foo` → `$ARGUMENTS` i markdown = "foo"',
                'Bedst når: 3+ gentagne prompts, samme output-format hver gang.',
                '',
                '**Skill** — `.claude/skills/[navn]/SKILL.md`',
                'Frontmatter: `name`, `description`, `disable-model-invocation`, `allowed-tools`, `paths`',
                'Bedst når: en hel arbejdsgang skal aktiveres automatisk når bestemte filer røres.',
                '',
                '**Subagent** — `.claude/agents/[navn].md` → `/agents`-picker eller "brug [navn]" i prompt',
                'Eget context-vindue. Brug til research, parallel review, isolerede specialopgaver.',
                '',
                '---',
                '',
                '**Model + effort tuning:**',
                '`/model` — Opus / Sonnet / Haiku / opusplan',
                '`/effort` — low / medium / high / xhigh / max',
                '`Option+P` (Mac) / `Alt+P` (Linux/Win) — quick-switch model',
                '',
                'Daglig kodning: Sonnet + medium (default)',
                'Hurtig opsummering / search: Haiku + low',
                'Arkitektur / stort design: Opus + high',
                'Plan-mode med billig execution: opusplan',
                '',
                '---',
                '',
                '**Commit til repo** så hele teamet får samme commands/skills/agents.',
                '',
                '**Hvornår byg hvad?**',
                '☑ Same prompt 3+ gange → command',
                '☑ Hel arbejdsgang med regler + tools-restriction → skill',
                '☑ Specialopgave der skal isoleres fra hovedsamtalen → subagent',
                '☐ Engangsopgave → bare prompt direkte'
            ]
        },
        hjemmeopgave: [
            'Brug din custom command mindst 3 gange',
            'Noter: hvad skulle justeres efter første kørsel?',
            'Tag den opdaterede version med til torsdag'
        ]
    },

    // ---- Session 8 ----------------------------------------------------------
    {
        number: 8,
        title: 'Subagents, MCP og hooks',
        subtitle: 'Skalér Claude — isolerede agenter, eksterne værktøjer, automatiske handlinger',
        theme: 'Avancerede features',
        day: 'Torsdag · Uge 4',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: commands vi har bygget' },
            { t: '0:05–0:20', what: 'Foredrag: subagents + MCP + hooks' },
            { t: '0:20–0:40', what: 'Live demo: subagent → MCP → hook' },
            { t: '0:40–0:55', what: 'Hands-on' },
            { t: '0:55–1:00', what: 'Take-home' }
        ],
        foredrag: [
            '**Subagents** = isoleret Claude-instans med eget context-vindue. Bruges til research, parallelle reviews, eller afgrænsede opgaver der ellers ville fylde hovedsamtalen.',
            'Built-in agents virker out-of-the-box (fx "Explore", "Plan"). Custom agents lever i `.claude/agents/[navn].md`.',
            '**MCP** (Model Context Protocol): Claude får direkte adgang til værktøjer — GitHub, database, Slack, jeres interne APIs.',
            '**Hooks**: automatiske handlinger ved events (PreToolUse, PostToolUse, Stop, UserPromptSubmit). Kan blokere farlige kommandoer.',
            'Alle tre konfigureres i `.claude/settings.json` — kan committes til repo så hele teamet får samme opsætning.'
        ],
        demo: [
            {
                heading: 'Subagents — hvorfor? (2 min foredrag)',
                say: 'Tænk på subagents som "Claude hiring a specialist". De har deres eget context-vindue — så de forstyrrer ikke din hovedsamtale, og flere kan køre samtidig.',
                body: 'Typiske use cases: "find alle steder vi bruger HttpClient direkte" (research), "review disse 3 PRs parallelt" (review-skalering), "byg denne feature mens jeg fortsætter anden opgave" (parallel arbejde).'
            },
            {
                heading: 'Brug built-in Explore-agent (3 min)',
                say: 'Claude Code leverer nogle subagents ud af boksen. Explore er til at researche codebase uden at rode hovedsamtalens context.',
                promptLabel: 'Research via subagent',
                prompt: 'Brug Explore-agenten til at finde alle steder i denne codebase hvor vi instantierer HttpClient direkte (i stedet for at injecte IHttpClientFactory). Svar med filsti og linjenummer.',
                expected: 'Claude spawner en subagent der browser codebasen. Main-samtalen får kun det endelige resultat tilbage — ikke alle browsing-trin. Din hovedcontext forbliver ren.'
            },
            {
                heading: 'Parallelle subagents (2 min)',
                say: 'Du kan spawne flere subagents samtidig — skaleres linært.',
                promptLabel: 'Parallel review-prompt',
                prompt: 'Spawn tre parallelle review-subagents, én pr. af disse branches: feature/favorites, feature/search-v2, fix/null-guard. Hver skal svare med maks 3 findings i prioriteret rækkefølge. Kombinér output i én tabel til sidst.',
                expected: 'Claude kører de 3 reviews parallelt i stedet for sekventielt. Typisk 3x hurtigere. Pointe: subagents er forskellen mellem "Claude som smart notesblok" og "Claude som team af assistenter".'
            },
            {
                heading: 'Byg custom subagent — test-reviewer (3 min)',
                say: 'Når I gentagne gange beder Claude om samme specialiserede ting, lav en custom subagent.',
                body: 'Opret filen `.claude/agents/test-reviewer.md` i repo-rod.',
                promptLabel: '.claude/agents/test-reviewer.md',
                prompt: `---
name: test-reviewer
description: Review tests for coverage gaps, mocks-smell og AAA-tydelighed
tools: Read, Grep, Glob
---

Du er test-review-specialist. Når du får en test-fil eller test-suite:

1. List tests der KUN dækker happy path (mangler null/empty/negative/boundary)
2. Identificér tests der mocker så meget at de i praksis tester mock'en
3. Find tests uden klar Arrange/Act/Assert-struktur
4. Spot tests med for brede assertions (fx .Should().NotBeNull() uden mere)

Output-format:
- fil:linje — issue-type — forslag til ny test-navn

Vær konkret. Ingen generiske "overvej at tilføje mere dækning"-kommentarer.`,
                expected: 'Gem filen. Genstart Claude Code. Nu er agenten tilgængelig i `/agents`-menuen og kan kaldes med navnet.'
            },
            {
                heading: 'Kør din custom subagent (1 min)',
                promptLabel: 'Invoker test-reviewer',
                prompt: 'Brug test-reviewer-agenten på @UserServiceTests.cs og @PropertyServiceTests.cs. Kombiner resultaterne.',
                expected: 'Agenten kører i sin egen context, returnerer konkret liste af issues. Kan committes + deles — hele teamet får samme review-kvalitet.'
            },
            {
                heading: '`/mcp` — picker for installerede MCP-servere (1 min)',
                say: 'Inden vi installerer noget: vis hvad I allerede har. `/mcp` lister alle installerede MCP-servere og deres status.',
                promptLabel: 'Slash command',
                prompt: '/mcp',
                expected: 'Liste over MCP-servere — med status (connected, error, disabled). Hvis I ikke har installeret nogen, er listen tom. Pointe: dette er hvor I tjekker om jeres setup virker, og hvor I deaktiverer en der lavker.'
            },
            {
                heading: 'Installer GitHub MCP live (3 min)',
                say: 'Vi giver Claude direkte adgang til GitHub — så den kan læse issues, oprette PRs, kommentere.',
                body: 'Forberedt: lav en GitHub Personal Access Token (Settings → Developer settings → PAT) med repo-scope. Åbn `~/.claude/settings.json` (personlig, ikke projekt — tokens må ikke committes).',
                promptLabel: '~/.claude/settings.json — GitHub MCP',
                prompt: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_DIN_TOKEN_HER"
      }
    }
  }
}`,
                expected: 'Gem + genstart Claude Code. Kør `/mcp` — "github" skal nu være i listen af tilgængelige MCP-servere.'
            },
            {
                heading: 'Test MCP — list mine PRs (2 min)',
                promptLabel: 'Test-prompt',
                prompt: 'List mine 5 senest åbne GitHub-PRs i edc-organisationen. Vis titel, nummer, og branch.',
                expected: 'Claude bruger GitHub MCP, får reelle data tilbage. Hvis det fejler: check token-scope (`repo`) og at pakkenavnet er rigtigt. Pointe: Claude kan nu interagere med GitHub uden at du skal åbne browser.'
            },
            {
                heading: 'PreToolUse-hook — bloker farlige kommandoer (3 min)',
                body: 'Tilføj til `.claude/settings.json` i jeres PROJEKT (denne må gerne committes).',
                promptLabel: '.claude/settings.json — sikkerheds-hook',
                prompt: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \\"$CLAUDE_TOOL_INPUT\\" | grep -qE 'rm -rf|git push --force|git reset --hard|DROP TABLE'; then echo 'BLOKERET: farlig kommando' >&2; exit 2; fi"
          }
        ]
      }
    ]
  }
}`,
                expected: 'Gem + genstart Claude Code. Denne hook kører FØR enhver Bash-kommando — hvis pattern matcher, eksiterer den med kode 2 som blokerer handlingen.'
            },
            {
                heading: 'Test at hook\'en blokerer (1 min)',
                promptLabel: 'Provokér hooket',
                prompt: 'Kør kommandoen: rm -rf /tmp/some-test-dir',
                expected: 'Claude prøver at køre kommandoen — hook\'en fanger den før den eksekverer — du ser "BLOKERET: farlig kommando" i output. Pointe: du kan ikke komme til at køre destruktivt ved uheld.'
            },
            {
                heading: 'Stop-hook — kør tests automatisk efter Claude (3 min)',
                body: 'Tilføj i samme settings.json (merge med forrige hook):',
                promptLabel: 'Stop-hook — auto-test',
                prompt: `{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd \\"$CLAUDE_PROJECT_DIR\\" && dotnet test --nologo --verbosity quiet 2>&1 | tail -5"
          }
        ]
      }
    ]
  }
}`,
                expected: 'Efter hver Claude-session kører `dotnet test` automatisk — du får besked hvis noget blev brudt. Pointe: safety net uden at du skal huske det.'
            },
            {
                heading: 'PostToolUse-hook — auto-format (2 min)',
                body: 'Et bonus-hook der kører dotnet format efter hver fil-ændring i .cs-filer:',
                promptLabel: 'PostToolUse auto-format',
                prompt: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \\"$CLAUDE_FILE_PATH\\" == *.cs ]]; then dotnet format --include \\"$CLAUDE_FILE_PATH\\"; fi"
          }
        ]
      }
    ]
  }
}`,
                expected: 'Alle .cs-filer auto-formatteres efter Claude rører dem. Ingen stil-kommentarer i reviews længere.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'A-spor (begynder) — prøv en subagent',
                steps: [
                    'Kør built-in Explore-agent på dit eget projekt: "Find alle steder vi bruger [en ting du er nysgerrig på]"',
                    'Tilføj GitHub MCP (snippet i prompts) og list dine åbne PRs',
                    'Noter: hvilken af de to gav mest værdi lige nu?'
                ]
            },
            bSpor: {
                title: 'B-spor (advanced) — byg custom',
                steps: [
                    'Vælg én: custom subagent, custom hook, eller MCP-integration',
                    'Byg den i `.claude/agents/` eller `.claude/settings.json`',
                    'Test den på reel opgave',
                    'Commit til repo hvis den er team-relevant — del i #claude-code'
                ]
            }
        },
        prompts: [
            {
                label: 'Custom subagent — .claude/agents/test-reviewer.md',
                language: 'markdown',
                text: `---
name: test-reviewer
description: Review tests for coverage gaps, mocks-smell og AAA-tydelighed
tools: Read, Grep, Glob
---

Du er test-review-specialist. Når du får en test-fil eller test-suite:

1. List tests der KUN dækker happy path (mangler null/empty/negative/boundary)
2. Identificér tests der mocker så meget at de i praksis tester mock'en
3. Find tests uden klar Arrange/Act/Assert-struktur
4. Spot tests med for brede assertions (fx .Should().NotBeNull() uden mere)

Output-format:
- fil:linje — issue-type — forslag til ny test-navn

Vær konkret. Ingen generiske "overvej at tilføje mere dækning"-kommentarer.`
            },
            {
                label: 'Custom subagent — .claude/agents/domain-explainer.md',
                language: 'markdown',
                text: `---
name: domain-explainer
description: Forklar EDC-domænebegreber for nye udviklere
tools: Read, Grep, Glob
---

Du er domæne-guide for EDC's ejendomsmægler-platform.

Når nogen spørger om et begreb (fx "Property", "Agent", "Listing", "ExternalId"):

1. Find 2-3 konkrete eksempler i koden hvor det bruges
2. Forklar begrebet i 3-5 sætninger på dansk
3. Vis hvordan det relaterer til andre domænebegreber
4. Peg på canonical definition i @Domain/-mappen hvis den findes

Brug ikke C#-specifik terminologi — forklar så en projektleder også forstår det.`
            },
            {
                label: 'Invoker en subagent i prompt',
                language: 'text',
                text: `Brug test-reviewer-agenten på @UserServiceTests.cs og @PropertyServiceTests.cs. Kombinér resultaterne i én prioriteret tabel.`
            },
            {
                label: 'GitHub MCP — .claude/settings.json snippet',
                language: 'json',
                text: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    }
  }
}`
            },
            {
                label: '.mcp.json — projekt-niveau (committes, ingen secrets)',
                language: 'json',
                text: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
    }
  }
}`
            },
            {
                label: '`/mcp` — vis status på installerede servere',
                language: 'text',
                text: `/mcp

# Lister alle MCP-servere og status:
#   - connected  → klar til brug
#   - error      → tjek log eller token
#   - disabled   → deaktiveret manuelt
# Brug også til at deaktivere en der laver støj.`
            },
            {
                label: 'Hooks — komplet settings.json med PostToolUse + Stop',
                language: 'json',
                text: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \\"$CLAUDE_FILE_PATH\\" == *.cs ]]; then dotnet format --include \\"$CLAUDE_FILE_PATH\\"; fi"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd \\"$CLAUDE_PROJECT_DIR\\" && dotnet test --nologo --verbosity quiet 2>&1 | tail -5"
          }
        ]
      }
    ]
  }
}`
            },
            {
                label: 'Hook — blokér farlige kommandoer',
                language: 'json',
                text: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \\"$CLAUDE_TOOL_INPUT\\" | grep -qE 'rm -rf|git push --force|git reset --hard'; then echo 'BLOKERET: farlig kommando' >&2; exit 2; fi"
          }
        ]
      }
    ]
  }
}`
            },
            {
                label: 'Hook — kør tests når Claude stopper',
                language: 'json',
                text: `{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd \\"$CLAUDE_PROJECT_DIR\\" && dotnet test --nologo --verbosity quiet"
          }
        ]
      }
    ]
  }
}`
            },
            {
                label: 'Hook — auto-format efter hver fil-edit',
                language: 'json',
                text: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \\"$CLAUDE_FILE_PATH\\" == *.cs ]]; then dotnet format --include \\"$CLAUDE_FILE_PATH\\"; fi"
          }
        ]
      }
    ]
  }
}`
            }
        ],
        handout: {
            title: 'Subagents + MCP + hooks kickstart',
            content: [
                '**Subagents:** isoleret context, kan køre parallelt. Lever i `.claude/agents/[navn].md`.',
                '**MCP-servere:** peg Claude på et eksternt værktøj (GitHub, DB, Slack).',
                '**Hooks:** kør shell-kommando ved event (PreToolUse, PostToolUse, Stop, UserPromptSubmit).',
                '',
                '**Start med én af disse tre:**',
                '1. Custom subagent til jeres gentagne specialist-opgave (fx test-review, security-scan)',
                '2. GitHub MCP (PRs + issues direkte fra Claude)',
                '3. PreToolUse-hook der blokerer destruktive kommandoer',
                '',
                '**Sikkerhed:** Hooks + tokens kører som dig. Personlige credentials i `~/.claude/settings.json`, team-setup i repoets `.claude/settings.json`.',
                '',
                '**Exit codes i hooks:** 0 = ok, 2 = bloker handling, andet = vis fejl men tillad'
            ]
        },
        hjemmeopgave: [
            'Vælg én: byg custom subagent, installer MCP, eller lav hook — aktiv i hele ugen',
            'Noter: én ting der sparede tid, én ting der var irriterende',
            'Tag begge med til session 9'
        ]
    },

    // ---- Session 9 ----------------------------------------------------------
    {
        number: 9,
        title: 'Best practices og faldgruber',
        subtitle: 'Det vi har lært — og det vi IKKE skal gøre',
        theme: 'Mastery og deling',
        day: 'Tirsdag · Uge 5',
        schedule: [
            { t: '0:00–0:05', what: 'Recap: hooks/MCP oplevelser' },
            { t: '0:05–0:20', what: 'Foredrag: top 10 faldgruber' },
            { t: '0:20–0:35', what: 'Live demo: AI-kode der ser rigtig ud men har skjult bug' },
            { t: '0:35–0:55', what: 'Gruppe-øvelse: find fejlene' },
            { t: '0:55–1:00', what: 'Forberedelse til session 10' }
        ],
        foredrag: [
            '**1.** Blindt accept — altid kør tests efter Claude-ændringer',
            '**2.** For brede prompts — kom tilbage til kontekst-checklisten',
            '**3.** Claude genererer kode der "ser rigtig ud" men er skrøbelig',
            '**4.** Secrets i prompts — Claude må aldrig se API-nøgler',
            '**5.** Ændringer der virker lokalt men fejler i prod',
            '**6.** Tests der bekræfter hallucinationer (Claude skrev testen OG koden)',
            '**7.** Scope creep — Claude laver "et par ekstra forbedringer"',
            '**8.** Teknisk gæld der vokser hurtigere pga. AI-speed',
            '**9.** Team-konventioner der udvandes (hver udvikler får sin egen AI-stil)',
            '**10.** Prompt-fatigue — kvaliteten falder når du er træt'
        ],
        demo: [
            {
                heading: 'Del AI-genereret kode med skjulte bugs (2 min)',
                say: 'Her er et stykke AI-genereret C#-kode som ser rigtigt ud. Der er 3 subtile bugs. Prøv at finde dem uden at læse for længe.',
                body: 'Del koden på projektoren eller kopier prompten herunder ind i den fælles kanal så grupperne kan arbejde med den.',
                promptLabel: 'AI-genereret kode (3 skjulte bugs)',
                prompt: `public class PropertyService
{
    private readonly IPropertyRepository _repo;
    private readonly ILogger<PropertyService> _logger;

    public PropertyService(IPropertyRepository repo, ILogger<PropertyService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<List<PropertyDto>> GetActivePropertiesAsync(string city)
    {
        var all = await _repo.GetAllAsync();
        var active = all.Where(p => p.IsActive && p.City.ToLower() == city.ToLower()).ToList();

        return active.Select(p => new PropertyDto
        {
            Id = p.Id,
            Title = p.Title,
            Price = (decimal)p.PriceInCents / 100,
            Agent = p.Agent.Name
        }).ToList();
    }
}`,
                expected: 'Grupperne finder typisk: (1) NullReferenceException hvis `city = null`, (2) henter ALLE properties i memory og filtrerer — bør være DB-query, (3) `p.Agent` kan være null for properties uden tildelt agent. Bonus: decimal-cast timing kan give præcisions-tab for meget store beløb.'
            },
            {
                heading: 'Gennemgå bugs — én ad gangen (4 min)',
                say: 'Bug 1: city.ToLower() på en null-streng = NRE. Bug 2: all.Where() efter at have hentet alt i memory = databasen sendes 100k rows for at filtrere 5. Bug 3: Agent.Name uden null-check = NRE for properties uden agent.',
                body: '**Pointe:** AI-kode "ser OK ud" fordi formen er korrekt. Detaljer halter — især null-paths og DB-effektivitet. Vi har set alle tre i ægte EDC-code-review.'
            },
            {
                heading: 'Review-prompt der fanger hallucinationer (3 min)',
                say: 'Når du har mistanke om AI-kode er skrøbelig, brug denne review-prompt.',
                promptLabel: 'Anti-hallucination review',
                prompt: `Review følgende kode. Jeg har mistanke om at den er AI-genereret og muligvis har hallucinationer eller skrøbelige antagelser.

[paste kode her]

Tjek specifikt:
1. Findes alle API'er/metoder der kaldes faktisk i de brugte pakker?
2. Matcher type-signaturerne?
3. Er der "fornuftigt-lydende" kode der ikke gør hvad navnet antyder?
4. Er der null-paths uden guards? (især for parametre og nested properties)
5. Er der tests der KUN dækker happy path?
6. Er der N+1 queries eller "hent alt og filtrer i memory"-mønstre?
7. Er der imports/usings der ikke bruges, eller bruges uden at være importeret?

Svar i punktform med linjenumre. Ingen stil-kommentarer.`,
                expected: 'Fokuseret review der fanger de klassiske AI-fælder. Denne prompt kan sættes som custom command `/anti-hallucination` for hele teamet.'
            },
            {
                heading: 'Secrets-tjek før du deler kode med Claude (2 min)',
                body: 'En ting der bør være rygmarv: aldrig send secrets eller PII ind i Claude. Selv om Anthropic ikke træner på det, er det stadig data der forlader jeres maskine.',
                promptLabel: 'Secrets-scanner prompt',
                prompt: `Scan @[fil eller mappe] for ting der IKKE må i prompts:

- API-nøgler (fx ghp_, sk-, pk_, AKIA, eyJ...)
- Passwords, tokens, connection strings med credentials
- Personnummer-format tal (10 cifre, evt med bindestreg)
- Kundedata / PII (emails, telefonnumre, adresser af privatpersoner)
- Interne URLs / IPs / hostnames

Svar med linjenumre. Kast ingen kode væk — bare liste hvad du fandt.`,
                expected: 'Claude peger på problematiske linjer. Vigtig rutine før I deler screenshots/kode med Claude i prompts udenfor jeres egne repos. Forbind til EDC\'s do & don\'t-handout.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'Gruppe-øvelse (alle, 3-4 pr. gruppe)',
                steps: [
                    'Matias deler et stykke AI-genereret C#-kode med 3 skjulte bugs',
                    'Gruppen finder dem (Claude må gerne hjælpe)',
                    'Skriv én-sætnings beskrivelse af hver bug',
                    'Fælles opsamling: hvilken bug var nemmest/sværest?'
                ]
            },
            bSpor: {
                title: '',
                steps: []
            }
        },
        prompts: [
            {
                label: 'Review-prompt til at fange hallucinationer',
                language: 'text',
                text: `Review følgende kode. Jeg har mistanke om at den er AI-genereret og muligvis har hallucinationer.

[paste kode]

Tjek specifikt:
1. Findes alle API'er/metoder der kaldes faktisk i de brugte pakker?
2. Matcher type-signaturerne?
3. Er der "fornuftigt-lydende" kode der ikke gør hvad navnet antyder?
4. Er der tests der kun dækker happy path?
5. Er der imports der ikke bruges, eller bruges uden at være importeret?

Svar i punktform med linjenumre.`
            },
            {
                label: 'Prompt-fatigue-test — spørg dig selv før du sender',
                language: 'text',
                text: `Før jeg trykker enter — tjek:

☐ Har jeg læst prompten højt for mig selv?
☐ Ville en ny kollega kunne forstå opgaven ud fra prompten?
☐ Har jeg angivet "rør ikke X" hvis der er noget der skal være urørt?
☐ Er det 5. gang i dag jeg har promptet? → tag 10 min pause først.`
            },
            {
                label: 'Secrets-tjek før du deler kode',
                language: 'text',
                text: `Scan @[fil] for ting der ikke må i offentlige prompts:

- API-nøgler (fx ghp_, sk-, pk_)
- Passwords, tokens, secrets
- Personnummer-format tal
- Kundedata / PII
- Interne URLs / IPs

Svar med linjenumre. Kast ikke kode væk — bare liste.`
            }
        ],
        handout: {
            title: 'EDC\'s do & don\'t for AI-assisteret kode',
            content: [
                '**DO:**',
                '☑ Kør tests efter hver Claude-ændring',
                '☑ Brug plan mode i kritiske områder (auth, betaling, data)',
                '☑ Hold CLAUDE.md opdateret med "ting Claude gætter forkert på"',
                '☑ Commit små, reviewbare chunks — aldrig "accepter alt"',
                '☑ Skriv tests SELV for den kode Claude skrev',
                '',
                '**DON\'T:**',
                '☒ Del secrets / kundedata / PII med Claude',
                '☒ Lad Claude skrive BÅDE koden og dens tests uden manuel review',
                '☒ Spring kollega-review over fordi "Claude reviewede"',
                '☒ Accept scope-creep fordi "det var alligevel bedre sådan"',
                '☒ Brug Claude når du er træt og ikke kan review — tag en pause'
            ]
        },
        hjemmeopgave: [
            'Forbered 3 min til session 10: "min bedste Claude Code-oplevelse" ELLER "det jeg bygger videre på"',
            'Medbring 1 command / hook / CLAUDE.md I vil dele med andre teams'
        ]
    },

    // ---- Session 10 ---------------------------------------------------------
    {
        number: 10,
        title: 'Show & Tell + vejen frem',
        subtitle: 'Del hvad I har bygget — og planlæg de næste 3 måneder',
        theme: 'Mastery og deling',
        day: 'Torsdag · Uge 5',
        schedule: [
            { t: '0:00–0:10', what: 'Recap af hele forløbet + største aha-oplevelser' },
            { t: '0:10–0:40', what: 'Show & Tell — 3 min pr. person/team' },
            { t: '0:40–0:55', what: 'Fælles: EDC CLAUDE.md-standard + hvordan holder vi momentum?' },
            { t: '0:55–1:00', what: 'Fælles forpligtelse: "om 3 måneder har jeg..."' }
        ],
        foredrag: [
            'Vi har dækket: prompting, plan mode, kontekst, CLAUDE.md, git, commands, MCP, hooks, faldgruber',
            'De største aha-oplevelser på tværs af sessioner (kom tilbage til dette)',
            'Hvad er det vi nu ved som organisation — og hvad mangler?',
            '',
            '**Som closer i dag — Claude er ikke bundet til jeres laptop.** `/remote-control` parrer din terminal-session med claude.ai så I kan fortsætte fra mobilen, en anden maskine, eller bilen til lufthavnen. Tag det med jer.'
        ],
        demo: [
            {
                heading: '`/remote-control` — par session med claude.ai (3 min)',
                say: 'Forestil jer: I er midt i et stort refactor på laptoppen. I skal til møde. I lukker laptoppen, åbner mobilen, fortsætter samtalen som om I aldrig stoppede.',
                body: 'Kør `/remote-control` i Claude Code. En QR-kode dukker op i terminalen. Scan den med kameraet på telefonen — den åbner claude.ai i browseren med samtalen pre-loaded.',
                promptLabel: 'Slash command — start remote-control',
                prompt: '/remote-control',
                expected: 'QR-kode + URL i terminalen. Scan eller klik. claude.ai åbner med jeres aktive session. I kan nu prompte fra mobilen, og det kører fortsat på laptoppen — så Claude har jeres files, tools, og context. Pointe: dette er hvad der gør "Claude i lommen" rigtig.'
            },
            {
                heading: '`/teleport` — flyt session til en anden maskine (2 min)',
                say: 'Hvis I i stedet vil flytte sessionen helt over på en anden maskine — fx fra arbejds-laptop til hjemme-PC — så er `/teleport` måden.',
                body: 'Kør `/teleport` på den nuværende maskine. Følg flowet (login med samme konto på den anden maskine).',
                promptLabel: 'Slash command — teleport session',
                prompt: '/teleport',
                expected: 'Sessionen migrerer til den anden maskine. Pointe: det er ikke "remote-control fra mobilen". Det er FLYT samtalen så den kører LOKALT på den anden maskine. Use case: skifte mellem kontor og hjem uden at miste tråden.'
            },
            {
                heading: 'Mobil-workflow — `/mobile` og hvornår det giver mening (2 min)',
                body: '**Use cases hvor mobilen vinder:**\n- Mens I venter (tog, kø, møde-pause)\n- Hurtige spørgsmål om kode I så på i går: "hvad var det med null-checken i PropertyMapper?"\n- Code review-feedback fra ledelse mens I går i kantinen\n- Notere ideer mens hjernen arbejder\n\n**Use cases hvor det IKKE giver mening:**\n- Stor refactor (lille skærm = svært at læse diff)\n- Ny feature fra bunden (brug laptoppen)\n- Når I ikke har 4G/5G dækning',
                promptLabel: 'Slash command — direkte til mobile-flow',
                prompt: '/mobile',
                expected: 'Genvej til mobile-pairing flow. Pointe: dette er hvad der gør at "tag det med dig" ikke er marketing-snak — det er et reelt arbejdsflow.'
            },
            {
                heading: 'CLI-flag — `claude --remote-control` ved opstart (1 min)',
                body: 'Hvis I ved fra start at I vil parre, kan I starte med flag\'et:',
                promptLabel: 'Terminal-kommando',
                prompt: 'claude --remote-control',
                expected: 'Claude starter og viser remote-control QR med det samme — sparer ét keystroke. Pointe: kombineret med en shell-alias (`alias claude-go="claude --remote-control"`) er det ét tegn at starte mobile-pairet session.'
            },
            {
                heading: 'Closer — pak det hele sammen (1 min)',
                body: '**De 5 uger på én slide:**\n\n☑ Prompts med kontekst (sessions 1, 3, 4)\n☑ Plan mode + permissions (session 2)\n☑ CLAUDE.md + memory (session 5)\n☑ Git-workflow (session 6)\n☑ Skills + agents + model-tuning (session 7)\n☑ MCP + hooks (session 8)\n☑ Faldgruber + sikkerhed (session 9)\n☑ **Tag det med jer** — `/remote-control`, `/teleport`, `/mobile` (i dag)\n\nClaude er ikke et værktøj I henter ned. Det er en arbejdsmåde I tager med.'
            }
        ],
        handsOn: {
            aSpor: {
                title: 'Show & Tell (alle, 3 min hver)',
                steps: [
                    'Vis din bedste Claude Code-oplevelse fra de 5 uger',
                    'ELLER: vis et custom command / hook / CLAUDE.md du har bygget',
                    'ELLER: del én ting du lærte som du vil anbefale andre',
                    'Én takeaway pr. præsentation — ikke en lang tour'
                ]
            },
            bSpor: {
                title: '',
                steps: []
            }
        },
        prompts: [
            {
                label: '/remote-control — par session med claude.ai',
                language: 'text',
                text: `/remote-control

# QR-kode dukker op i terminalen.
# Scan med mobilens kamera → claude.ai åbner med jeres session.
# Sessionen kører fortsat på laptoppen — mobilen er bare en fjernbetjening.
# Kræver claude.ai-login.`
            },
            {
                label: '/teleport — flyt session til anden maskine',
                language: 'text',
                text: `/teleport

# Migrér sessionen til en anden maskine (samme claude.ai-konto).
# Forskel fra /remote-control:
#   - remote-control = mobil styrer LAPTOPPEN
#   - teleport       = sessionen FLYTTER til anden maskine`
            },
            {
                label: '/mobile — genvej til mobile-pairing',
                language: 'text',
                text: `/mobile

# Direkte til mobile-pairing flow.
# Brug når I VED I vil arbejde fra mobilen.`
            },
            {
                label: 'claude --remote-control — start direkte med pairing',
                language: 'bash',
                text: `claude --remote-control

# Eller med shell-alias for hurtigere flow:
alias claude-go="claude --remote-control"`
            },
            {
                label: 'Din personlige forpligtelse — skabelon',
                language: 'text',
                text: `Om 3 måneder vil jeg:

☐ Bruge [specifik feature] dagligt
☐ Have bygget [X] custom commands til mit team
☐ Have opdateret CLAUDE.md i mine [N] aktive repos
☐ Have delt [dét jeg er bedst til] med et andet team
☐ Mit konkrete mål: _______________________________`
            },
            {
                label: 'Fælles EDC CLAUDE.md-sektion (forslag)',
                language: 'markdown',
                text: `## EDC-fælles konventioner

- Sprog i prompts: dansk ok, kode-kommentarer engelsk
- Commit-beskeder: Conventional Commits på dansk
- Tests: ingen mocks af databaser — brug testcontainers eller in-memory
- Dependencies: ingen nye NuGet/npm-pakker uden team-godkendelse
- Secrets: ALDRIG i repos. Brug Azure Key Vault / env vars.

## Ting Claude ofte gætter forkert på i EDC
- Vi bruger MediatR — ikke direct repository calls fra controllers
- Vi bruger FluentAssertions i tests — ikke Assert.Equal
- Tidszoner: Europe/Copenhagen, ALDRIG UTC i UI
- Priser: decimal, ikke double/float`
            }
        ],
        handout: {
            title: 'EDC x Claude Code Playbook',
            content: [
                '**Alt vi har bygget, samlet ét sted:**',
                '',
                '1. Prompting cheatsheet + `Esc Esc` undo (session 1)',
                '2. Plan mode + hele mode-cyklen (session 2)',
                '3. Kontekst-checklist + `@`-cheat sheet (session 3)',
                '4. 6 prompt-patterns + `/rewind` + `Ctrl+B` (session 4)',
                '5. CLAUDE.md + `.claude/rules/` + `/memory` (session 5)',
                '6. Review-checklist (session 6)',
                '7. Skills + subagents + commands + model-tuning (session 7)',
                '8. MCP + hooks snippets (session 8)',
                '9. Do & don\'t-liste (session 9)',
                '10. `/remote-control` + `/teleport` + mobile (session 10)',
                '',
                '**Tag det med dig:**',
                '- `/remote-control` — par mobilen med din session (kræver claude.ai-login)',
                '- `/teleport` — flyt sessionen mellem maskiner',
                '- `/mobile` — direkte til mobile-flow',
                '- `claude --remote-control` — start med QR allerede vist',
                '',
                '**Næste skridt:**',
                '- #claude-code kanal i Teams for løbende deling',
                '- Månedligt Show & Tell (30 min, frivilligt)',
                '- Fælles EDC CLAUDE.md-standard (i org-repo)',
                '',
                '**Kontakt:** Matias Gramkow for spørgsmål og bidrag til standard'
            ]
        },
        hjemmeopgave: [
            'Hold din 3-måneders forpligtelse (del den med din team-lead!)',
            'Deltag i #claude-code kanalen',
            'Se dig selv som EDC-ambassadør for dem der ikke har været med endnu'
        ]
    }
];

// ---------------------------------------------------------------------------
// API handler
// ---------------------------------------------------------------------------
function parseQuery(req) {
    if (req.query && typeof req.query === 'object') return req.query;
    try {
        const url = new URL(req.url, 'http://localhost');
        const q = {};
        for (const [k, v] of url.searchParams.entries()) q[k] = v;
        return q;
    } catch {
        return {};
    }
}

module.exports = async function handler(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Cache-Control', 'no-store');

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

        const query = parseQuery(req);
        const n = parseInt(query.n, 10);

        // Facilitator peek:
        // - In production (VERCEL_ENV set): require WORKSHOP_PEEK_TOKEN env var match
        // - Locally (no VERCEL_ENV): any non-empty ?peek=... unlocks (dev convenience)
        const peekToken = process.env.WORKSHOP_PEEK_TOKEN;
        const providedToken = query.peek;
        const isDeployed = !!process.env.VERCEL_ENV;
        const canPeek = isDeployed
            ? (peekToken && providedToken && providedToken === peekToken)
            : !!providedToken;

        // Overview request: minimal metadata for all sessions
        if (!n || isNaN(n)) {
            const overview = SESSIONS.map(s => {
                const unlockAt = sessionUnlockAt(s.number);
                return {
                    number: s.number,
                    title: s.title,
                    subtitle: s.subtitle,
                    theme: s.theme,
                    day: s.day,
                    unlockAt,
                    unlockAtFormatted: formatDanish(unlockAt),
                    locked: !canPeek && Date.now() < unlockAt
                };
            });
            return res.status(200).json({ overview });
        }

        if (n < 1 || n > SESSIONS.length) {
            return res.status(400).json({ error: 'Invalid session number' });
        }

        const session = SESSIONS[n - 1];
        const unlockAt = sessionUnlockAt(n);
        const now = Date.now();

        if (now < unlockAt && !canPeek) {
            return res.status(200).json({
                locked: true,
                unlockAt,
                unlockAtFormatted: formatDanish(unlockAt),
                meta: {
                    number: session.number,
                    title: session.title,
                    subtitle: session.subtitle,
                    theme: session.theme,
                    day: session.day
                }
            });
        }

        return res.status(200).json({
            locked: false,
            unlockAt,
            unlockAtFormatted: formatDanish(unlockAt),
            session
        });
    } catch (err) {
        console.error('session.js handler error:', err && err.stack || err);
        try {
            return res.status(500).json({ error: String(err && err.message || err) });
        } catch {
            return res.status(500).end('Internal error');
        }
    }
};
