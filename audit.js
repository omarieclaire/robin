// node audit.js game-data-words.js


// #!/usr/bin/env node


const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2] || "/mnt/user-data/uploads/game-data-words.js";



let src = fs.readFileSync(inputPath, "utf8");


const stub = `
const DM = {
  Deck: class {
    constructor(src) { this.src = src; }
  }
};
`;


const idRe = /^const\s+([A-Z_][A-Z0-9_]*)\s*=/gm;
const ids = new Set();
let m;
while ((m = idRe.exec(src)) !== null) ids.add(m[1]);

const returnExpr = `return { ${[...ids].join(", ")} };`;
const wrapped = stub + "\n" + src + "\n" + returnExpr;

const data = new Function(wrapped)();

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const tagsOf = (item) => {
  if (item == null || typeof item === "string") return [];
  return (item.tags || []).filter((t) => t != null && t !== ""); // strip undefined/empty from leading-comma holes
};
const textOf = (item) => (typeof item === "string" ? item : item.t);

// Collect all tags appearing in a deck's source.
const allTagsIn = (deckSrcArr) => {
  const s = new Set();
  for (const item of deckSrcArr) for (const t of tagsOf(item)) s.add(t);
  return s;
};

const srcOf = (deckOrArr) => {
  if (Array.isArray(deckOrArr)) return deckOrArr;
  if (deckOrArr && Array.isArray(deckOrArr.src)) return deckOrArr.src;
  return null;
};


const CHAIN_DECKS_PER_KIND = {
  angry: [
    "DECK_ANGRY_HELLO",
    "DECK_ANGRY_PITCH",
    "DECK_BAD_READ",
    "DECK_FILLER",
    "DECK_F_INVITE",
    "DECK_SAY_MORE_WARM",
    "DECK_STRONGER_PITCH",
    "DECK_BACK_OFF_EARLY",
    "DECK_BACK_OFF_LATE",
    "DECK_BAIL_RESPONSE",
    "DECK_NOT_NOW",
    "DECK_JOIN_CONSENT",
    "DECK_MISMATCH_TOO_LITERAL",
    "DECK_NO_BYE",
  ],
  hungry: [
    "DECK_HUNGRY_HELLO",
    "DECK_HUNGRY_PITCH",
    "DECK_BAD_READ",
    "DECK_FILLER",
    "DECK_F_INVITE",
    "DECK_SAY_MORE_WARM",
    "DECK_STRONGER_PITCH",
    "DECK_BACK_OFF_EARLY",
    "DECK_BACK_OFF_LATE",
    "DECK_BAIL_RESPONSE",
    "DECK_NOT_NOW",
    "DECK_JOIN_CONSENT",
    "DECK_MISMATCH_TOO_STRUCTURAL",
    "DECK_NO_BYE",
  ],
  narc: [
    "DECK_NARC_HELLO",
    "DECK_NARC_AGREE",
    "DECK_BAD_READ",
    "DECK_FILLER",
    "DECK_F_INVITE",
    "DECK_SAY_MORE_SKEPTICAL",
    "DECK_STRONGER_PITCH",
    "DECK_BACK_OFF_EARLY",
    "DECK_BACK_OFF_LATE",
    "DECK_BAIL_RESPONSE",
    "DECK_NARC_REV",
  ],
};

const callSites = [
  // TP 0: greet — no filter
  { deck: "DECK_GREET", from: { kind: "none" } },

  // TP 12: hello decks — no filter (DM.clearLastTags() right before)
  { deck: "DECK_NARC_HELLO",   from: { kind: "none" } },
  { deck: "DECK_ANGRY_HELLO",  from: { kind: "none" } },
  { deck: "DECK_HUNGRY_HELLO", from: { kind: "none" } },

  // TP 13: first pitch — filtered by helloTags
  { deck: "DECK_NARC_AGREE",     from: { kind: "deck", name: "DECK_NARC_HELLO" } },
  { deck: "DECK_ANGRY_PITCH",    from: { kind: "deck", name: "DECK_ANGRY_HELLO" } },
  { deck: "DECK_HUNGRY_PITCH",   from: { kind: "deck", name: "DECK_HUNGRY_HELLO" } },
  // BAD_READ and BACK_OFF_EARLY at TP 13 are filtered by helloTags too
  { deck: "DECK_BAD_READ",       from: { kind: "union", of: ["DECK_NARC_HELLO","DECK_ANGRY_HELLO","DECK_HUNGRY_HELLO"] } },
  { deck: "DECK_BACK_OFF_EARLY", from: { kind: "union", of: ["DECK_NARC_HELLO","DECK_ANGRY_HELLO","DECK_HUNGRY_HELLO"] } },

  // TP 141: filler — filtered by the pitch tags the player picked (a2ChoiceTags[0])
  { deck: "DECK_FILLER", from: { kind: "union", of: ["DECK_NARC_AGREE","DECK_ANGRY_PITCH","DECK_HUNGRY_PITCH"] } },

  // TP 142: invite + bail-late — filtered by fillerTags
  { deck: "DECK_F_INVITE",       from: { kind: "deck", name: "DECK_FILLER" } },

  // TP 14 (narc branch): skeptical — filtered by inviteTags OR bad-read tags
  { deck: "DECK_SAY_MORE_SKEPTICAL",
    from: { kind: "union", of: ["DECK_F_INVITE","DECK_BAD_READ"] } },

  // TP 14 (mismatch branches) — filtered by bad-read tags (a2ChoiceTags[1])
  { deck: "DECK_MISMATCH_TOO_STRUCTURAL", from: { kind: "deck", name: "DECK_BAD_READ" } },
  { deck: "DECK_MISMATCH_TOO_LITERAL",    from: { kind: "deck", name: "DECK_BAD_READ" } },
  // DECK_NO_BYE is appended to mismatch line, also filtered by bad-read tags
  { deck: "DECK_NO_BYE", from: { kind: "deck", name: "DECK_BAD_READ" } },

  // TP 14 (matched): NOT_NOW / JOIN_CONSENT / SAY_MORE_WARM — filtered by inviteTags
  { deck: "DECK_NOT_NOW",         from: { kind: "deck", name: "DECK_F_INVITE" } },
  { deck: "DECK_JOIN_CONSENT",    from: { kind: "deck", name: "DECK_F_INVITE" } },
  { deck: "DECK_SAY_MORE_WARM",   from: { kind: "deck", name: "DECK_F_INVITE" } },

  // TP 144 (narc): NARC_REV — filtered by inviteTags
  { deck: "DECK_NARC_REV", from: { kind: "deck", name: "DECK_F_INVITE" } },

  // TP 15: STRONGER_PITCH + BACK_OFF_LATE — filtered by sayMoreTags
  { deck: "DECK_STRONGER_PITCH",
    from: { kind: "union", of: ["DECK_SAY_MORE_WARM","DECK_SAY_MORE_SKEPTICAL"] } },
  { deck: "DECK_BACK_OFF_LATE",
    from: { kind: "union", of: ["DECK_SAY_MORE_WARM","DECK_SAY_MORE_SKEPTICAL"] } },

  // TP 24: NARC_REV / JOIN_CONSENT / NOT_NOW after stronger pitch — filtered by strongerTags
  { deck: "DECK_NARC_REV",      from: { kind: "deck", name: "DECK_STRONGER_PITCH" } },
  { deck: "DECK_JOIN_CONSENT",  from: { kind: "deck", name: "DECK_STRONGER_PITCH" } },
  { deck: "DECK_NOT_NOW",       from: { kind: "deck", name: "DECK_STRONGER_PITCH" } },

  // TP 25: BAIL_RESPONSE — filtered by bail-line tags (a2ChoiceTags[2])
  { deck: "DECK_BAIL_RESPONSE", from: { kind: "deck", name: "DECK_BACK_OFF_EARLY" } },

  // TP 10 (return): DECK_RETURN — used as the NPC's return greeting line, no filter
  { deck: "DECK_RETURN", from: { kind: "none" } },

  // Ambient decks — drawn with drawAmb, no filter
  { deck: "DECK_AMB_NARC",   from: { kind: "none" } },
  { deck: "DECK_AMB_HUNGRY", from: { kind: "none" } },
  { deck: "DECK_AMB_ANGRY",  from: { kind: "none" } },
];



function possibleMatchTags(source) {
  if (source.kind === "none") return null; // null = no filter applied
  if (source.kind === "deck") {
    const arr = srcOf(data[source.name]);
    if (!arr) return new Set();
    return allTagsIn(arr);
  }
  if (source.kind === "union") {
    const out = new Set();
    for (const name of source.of) {
      const arr = srcOf(data[name]);
      if (!arr) continue;
      for (const t of allTagsIn(arr)) out.add(t);
    }
    return out;
  }
  return new Set();
}

const sitesByDeck = new Map();
for (const cs of callSites) {
  if (!sitesByDeck.has(cs.deck)) sitesByDeck.set(cs.deck, []);
  sitesByDeck.get(cs.deck).push(cs);
}

function combinedMatchTags(deckName) {
  const sites = sitesByDeck.get(deckName);
  if (!sites) return { noFilter: false, tags: new Set() };
  let noFilter = false;
  const tags = new Set();
  for (const cs of sites) {
    const t = possibleMatchTags(cs.from);
    if (t === null) noFilter = true;
    else for (const tag of t) tags.add(tag);
  }
  return { noFilter, tags };
}

// ─────────────────────────────────────────────────────────────────
// Analyze every deck referenced by callSites, plus flag orphans.
// ─────────────────────────────────────────────────────────────────

const allDeckNames = new Set();
for (const id of ids) {
  if (id.startsWith("DECK_") || id.startsWith("D_") || id.startsWith("P_")) {
    if (srcOf(data[id])) allDeckNames.add(id);
  }
}

const report = {
  orphanDecks: [],     // deck-shaped data with no call site
  perDeck: [],         // analysis per deck
  bugs: [],            // tag typos, holes, etc.
};

// Bug pass: find tag oddities
const seenBugArrays = new Set();
for (const name of allDeckNames) {
  const arr = srcOf(data[name]);
  if (!arr) continue;
  // Avoid double-reporting D_FOO and DECK_FOO when they share an array.
  if (seenBugArrays.has(arr)) continue;
  seenBugArrays.add(arr);
  // Prefer the DECK_ name when reporting.
  const reportName = name.startsWith("DECK_") ? name :
    [...ids].find((other) => other.startsWith("DECK_") && data[other] && data[other].src === arr) || name;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (typeof item === "string") continue;
    const rawTags = item.tags || [];
    for (let j = 0; j < rawTags.length; j++) {
      const t = rawTags[j];
      if (t === undefined) {
        report.bugs.push({ deck: reportName, idx: i, text: textOf(item), issue: `tags[${j}] is undefined (leading-comma hole)` });
      } else if (typeof t === "string" && /\s/.test(t)) {
        report.bugs.push({ deck: reportName, idx: i, text: textOf(item), issue: `tag "${t}" contains whitespace — likely a typo/placeholder` });
      }
    }
  }
}

const wrapperOf = new Map();
for (const id of ids) {
  if (!id.startsWith("DECK_")) continue;
  const deck = data[id];
  if (!deck || !Array.isArray(deck.src)) continue;
  for (const other of ids) {
    if (other === id) continue;
    if (other.startsWith("D_") || other.startsWith("P_")) {
      if (data[other] === deck.src) wrapperOf.set(other, id);
    }
  }
}

// Reachability pass
const skipRawIfWrapped = new Set();
for (const name of allDeckNames) {
  const arr = srcOf(data[name]);
  const isCalled = sitesByDeck.has(name);
  // Special case: some "D_*" raw arrays are wrapped into "DECK_*" decks.
  let coveredViaDeck = null;
  if (!isCalled && wrapperOf.has(name)) {
    const wrapper = wrapperOf.get(name);
    if (sitesByDeck.has(wrapper)) {
      // Skip — we'll report this under the DECK_ name instead.
      skipRawIfWrapped.add(name);
      continue;
    }
  }

  if (!isCalled && !coveredViaDeck) {
    report.orphanDecks.push({ name, size: arr.length });
    continue;
  }

  const { noFilter, tags: matchTagSet } = isCalled
    ? combinedMatchTags(name)
    : combinedMatchTags(coveredViaDeck);

  const reachable = [];
  const fallbackOnly = [];
  const noTags = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const itemTags = tagsOf(item);
    if (noFilter) {
      reachable.push({ idx: i, text: textOf(item), tags: itemTags });
      continue;
    }
    if (itemTags.length === 0) {
      noTags.push({ idx: i, text: textOf(item) });
      continue;
    }
    const hasOverlap = itemTags.some((t) => matchTagSet.has(t));
    if (hasOverlap) reachable.push({ idx: i, text: textOf(item), tags: itemTags });
    else fallbackOnly.push({ idx: i, text: textOf(item), tags: itemTags });
  }

  report.perDeck.push({
    name: name + (coveredViaDeck ? ` (via ${coveredViaDeck})` : ""),
    size: arr.length,
    noFilter,
    reachable: reachable.length,
    fallbackOnly,
    noTags,
  });
}


const callSiteDecks = new Set(callSites.map((cs) => cs.deck));
const orphanIds = [];
for (const id of ids) {
  if (id === "DM") continue;
  if (wrapperOf.has(id)) continue; // wrapped raw arrays aren't orphans
  if (callSiteDecks.has(id)) continue; // used externally per our call-graph model
  const re = new RegExp(`\\b${id}\\b`, "g");
  const count = (src.match(re) || []).length;
  if (count <= 1) {
    orphanIds.push(id);
  }
}

// ─────────────────────────────────────────────────────────────────
// Print report
// ─────────────────────────────────────────────────────────────────

const RED = "\x1b[31m", YEL = "\x1b[33m", GRN = "\x1b[32m", DIM = "\x1b[2m", RST = "\x1b[0m", BOLD = "\x1b[1m";

console.log(BOLD + "\n═══ Deck reachability audit ═══" + RST);
console.log(DIM + `Source: ${inputPath}` + RST + "\n");

// 1. Orphan identifiers
if (orphanIds.length) {
  console.log(BOLD + RED + "● Orphaned identifiers (defined, never referenced):" + RST);
  for (const id of orphanIds) console.log(`  - ${id}`);
  console.log();
}

// 2. Orphan deck-shaped data (defined, never called from a known call site)
if (report.orphanDecks.length) {
  console.log(BOLD + RED + "● Deck-shaped data with no recognized call site:" + RST);
  for (const o of report.orphanDecks) console.log(`  - ${o.name} (${o.size} entries)`);
  console.log();
}

// 3. Tag bugs
if (report.bugs.length) {
  console.log(BOLD + YEL + "● Tag bugs:" + RST);
  for (const b of report.bugs) {
    console.log(`  ${b.deck}[${b.idx}]: ${b.issue}`);
    console.log(DIM + `    "${b.text.slice(0, 80)}"` + RST);
  }
  console.log();
}

// 4. Per-deck analysis
console.log(BOLD + "● Per-deck reachability:" + RST);
console.log(DIM + "  REACHABLE = at least one tag overlaps with possible matchTags" + RST);
console.log(DIM + "  FALLBACK  = only fires when the overlap pool is empty (rare in practice)" + RST);
console.log(DIM + "  NO_TAGS   = item has no tags; same fallback-only problem" + RST);
console.log();

for (const d of report.perDeck) {
  const flag =
    d.fallbackOnly.length + d.noTags.length > 0 ? YEL + "▲" + RST :
    GRN + "✓" + RST;
  console.log(`${flag} ${BOLD}${d.name}${RST}  ${d.reachable}/${d.size} reachable` +
    (d.noFilter ? DIM + " [no filter at any call site]" + RST : ""));
  if (d.fallbackOnly.length) {
    console.log(YEL + `  fallback-only (${d.fallbackOnly.length}):` + RST);
    for (const e of d.fallbackOnly) {
      console.log(`    [${e.idx}] tags=[${e.tags.join(",")}]  "${e.text.slice(0, 70)}"`);
    }
  }
  if (d.noTags.length) {
    console.log(YEL + `  no-tags / fallback-only (${d.noTags.length}):` + RST);
    for (const e of d.noTags) {
      console.log(`    [${e.idx}]  "${e.text.slice(0, 70)}"`);
    }
  }
}


console.log();
console.log(BOLD + "═══ End-to-end per-tag threading ═══" + RST);
console.log(DIM + "For each NPC kind: does every hello tag thread cleanly through every chain deck?" + RST);
console.log();

let totalGaps = 0;
let totalTagKindPairs = 0;
let cleanTagKindPairs = 0;

for (const [kind, chain] of Object.entries(CHAIN_DECKS_PER_KIND)) {
  const helloDeckName = chain[0];
  const helloArr = srcOf(data[helloDeckName]);
  if (!helloArr) {
    console.log(YEL + `  (${kind}: hello deck ${helloDeckName} not found, skipping)` + RST);
    continue;
  }
  const helloTags = [...allTagsIn(helloArr)].sort();

  console.log(BOLD + `▸ ${kind.toUpperCase()}` + RST + DIM + `  (${helloTags.length} hello tags × ${chain.length - 1} downstream decks)` + RST);

  const tagReports = [];
  for (const tag of helloTags) {
    totalTagKindPairs++;
    const gaps = [];
    for (let i = 1; i < chain.length; i++) {
      const downstreamName = chain[i];
      const arr = srcOf(data[downstreamName]);
      if (!arr) {
        gaps.push(downstreamName + " (missing)");
        continue;
      }
      const hasMatch = arr.some((c) => tagsOf(c).includes(tag));
      if (!hasMatch) gaps.push(downstreamName);
    }
    tagReports.push({ tag, gaps });
    if (gaps.length === 0) cleanTagKindPairs++;
    totalGaps += gaps.length;
  }

  const cleanCount = tagReports.filter((r) => r.gaps.length === 0).length;
  console.log(`  ${GRN}✓${RST} ${cleanCount}/${tagReports.length} tags thread end-to-end`);

  const broken = tagReports.filter((r) => r.gaps.length > 0);
  if (broken.length) {
    console.log(YEL + `  ${broken.length} tags have gaps:` + RST);
    for (const r of broken) {
      const shortDecks = r.gaps.map((d) => d.replace(/^DECK_/, "").toLowerCase()).join(", ");
      console.log(`    ${YEL}${r.tag}${RST}  missing in: ${DIM}${shortDecks}${RST}`);
    }
  }
  console.log();
}

console.log(BOLD + "Summary:" + RST);
console.log(`  ${cleanTagKindPairs}/${totalTagKindPairs} tag×kind pairs thread cleanly`);
console.log(`  ${totalGaps} total deck-level gaps`);
console.log();
console.log(BOLD + "Done." + RST);