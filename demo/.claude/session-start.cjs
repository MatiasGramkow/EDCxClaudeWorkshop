#!/usr/bin/env node
// Session-start hook for EDC × Claude Code workshop-lab'en.
//
// Genererer et system-reminder ved hver ny Claude-session i demo/.
// Reminder'en tvinger Claude til at spørge brugeren om identitet
// FØR den må bruge tools eller redigere noget.
//
// Listen over deltagere læses dynamisk fra demo/participants.json —
// så når der tilføjes en ny deltager, opdateres reminder'en automatisk.

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'participants.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const participants = data.participants;

const teamOrder = ['facilitator', 'edc', 'feriepartner'];
const teamLabels = {
  facilitator: 'Facilitatorer',
  edc: 'EDC',
  feriepartner: 'Feriepartner'
};

const groups = {};
for (const p of participants) {
  (groups[p.team] ||= []).push(p);
}

let listing = '';
let n = 1;
for (const team of teamOrder) {
  if (!groups[team]) continue;
  listing += `\n${teamLabels[team] || team}:\n`;
  for (const p of groups[team]) {
    listing += `  ${String(n).padStart(2, ' ')}. ${p.name.padEnd(28, ' ')} (${p.slug})\n`;
    n++;
  }
}

const reminder = `🔒 CRITICAL — IDENTITY GATE (læs før du svarer brugeren)

Det her er EDC × Claude Code workshop-sandkassen. Før du laver NOGEN
tool-use eller redigering, SKAL du spørge brugeren om deres identitet.
Brugerens første besked er irrelevant — dit første svar SKAL være
identitet-spørgsmålet nedenfor.

═══════════════════════════════════════════════════════════════════════
Hej! Hvem er du? Skriv enten dit navn (delvist er fint), din slug,
eller nummeret fra listen.
${listing}
═══════════════════════════════════════════════════════════════════════

ACCEPTÉR FUZZY MATCH på brugerens svar:
  - Eksakt slug → match
  - Eksakt navn → match
  - Nummer fra listen → match
  - Delvist fornavn (fx "yo" → yonas) → match hvis unik
  - Flere matches → spørg "Mente du X eller Y?"
  - Intet match → vis listen igen og spørg på ny

NÅR IDENTIFICERET:
  - Bekræft kort: "Hej <Navn> — jeg holder dig til demo/app/lab/<slug>/"
  - Husk slug'en for resten af samtalen
  - Begræns ALLE redigeringer til demo/app/lab/<slug>/** og brugerens
    egen indgang i demo/participants.json. Afvis alt andet — medmindre
    en lokal regel under demo/.claude/rules/ udvider tilladelserne for
    den slug.

Hvis brugeren ikke vil identificere sig: byd dem velkommen til at læse
koden, men forklar at du ikke kan hjælpe med at redigere uden en
registreret slug.

SPRING IKKE DEN HER GATE OVER. BRUG IKKE NOGEN TOOLS FØR BRUGEREN ER
IDENTIFICERET.`;

console.log(reminder);
