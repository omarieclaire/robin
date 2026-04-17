/* ══════════════════════════════════════════════════════════
   editable art + data
   window.GAME_DATA.
   ══════════════════════════════════════════════════════════ */

window.GAME_DATA = {
  /* ─────────────────────────────────────────────────────────
       BUILDINGS (Act 2 — scrolling cityscape)
       Used by: tileBuildings() in main script.
       Constraints:
       - `size` = vissual width in characters. MUST match longest line in `art`.
       - Sizes come in 3 tiers: 6 (narrow), 9 (regular), 13 (wide).
         tileBuildings() picks from these to fill a block. If I add a new
         size tier, update the remainder logic in tileBuildings() .
       - Art height is flexible (3–6 rows typical). Taller = fills more of
         the building band. Bands are ~A2_BH_PER rows tall (see a2Layout).
       - Colors come from A2_BCOL palette in main script, not per-building.
       - Blank spaces in art are transparent (see-through to sky).
       ───────────────────────────────────────────────────────── */
  buildings: [
    /* ── NARROW (size 6) ─── */
    { name: "Dépanneur", size: 6, art: ["  ^   ", "/.  .\\", "|.  .|", "|DEP |"] },
    { name: "Walkup", size: 6, art: ["◢▓▓▓▓◣", "| [] |", "|    |", "| [] |"] },
    { name: "Duplex", size: 6, art: ["▮◤◤◤◤▮", "┇┌┐┌┐┇", "┇└┘└┘┇"] },
    { name: "Triplex", size: 6, art: ["|++++|", "|    |", "|    |", "|    |"] },
    { name: "Tabac", size: 6, art: ["┌────┐", "|TABK|", "|░░░░|"] },
    { name: "Boulangerie", size: 6, art: ["┌────┐", "|BOUL|", "|════|"] },
    { name: "Pharmacie", size: 6, art: ["┌────┐", "|[+] |", "|PHAR|"] },

    /* ── REGULAR (size 9) ─── */
    { name: "L'Escalier", size: 9, art: ["╭L'ESCA─╮", "│ LIER  │", "│ ♪ ★ ♫ │"] },
    { name: "Cinéma Beaubien", size: 9, art: ["╔CINEMA═╗", "║BEAUBIEN", "║ ◢▓▓◣  ║", "║ 1938  ║"] },
    { name: "Sala Rossa", size: 9, art: ["╭SALA───╮", "│ ROSSA │", "│ R0SSA │", "│       │"] },
    { name: "Arepera", size: 9, art: ["╭AREPERA╮", "│ ◢■◣   │", "│ ★ ✦ ★ │"] },
    { name: "Dei Campi", size: 9, art: ["╭DEI────╮", "│ CAMPI │", "│ CAFFE │", "│ ☕  ◉  │"] },
    { name: "La Vitrola", size: 9, art: ["╭LA─────╮", "│VITROLA│", "│ ♫  ♪  │"] },
    { name: "Segal's", size: 9, art: ["╭SEGALS─╮", "│ FRESH │", "│ ★★★★★ │"] },

    /* ── WIDE (size 13) ─── */
    { name: "Notre-Dame", size: 13, art: ["     /\\      ", "    /  \\     ", "   /NOTRE\\   ", "  | DAME  |  ", "  | ★ ✦ ★ |  "] },
    { name: "Cinéma L'Amour", size: 13, art: ["▮◤◤◤◤◤◤◤◤◤◤▮ ", "┇┌┐ ┌┐ ┌┐┌┐┇ ", "┇└┘║└┘ └┘└┘┇ ", "┇  CINEMA  ┇ ", "┇ L'AMOUR  ┇ "] },
    { name: "Parquette", size: 13, art: ["╭───────────╮", "│ PARQUETTE │", "│ ★ ☕ ★ ☕ ★ │", "│░.  ░.  ░░ │"] },
    { name: "Drawn & Quarterly", size: 13, art: [" /\\/\\/\\/\\/\\  ", "│DRAWN &    │", "│QUARTERLY  │", "│ COMICS    │"] },
    { name: "Caserne 26", size: 13, art: ["    /\\       ", "  /    \\     ", " / FIRE  \\   ", "│ CASERNE  │ ", "│  ✧✧26✯✧  │ "] },
  ],

  /* ─────────────────────────────────────────────────────────
       BUILDINGS_2B (Act 2b — rally, taller buildings with bottom border)
       Used by: a2bGenRow().
       Constraints:
       - Same `size` tiers as buildings above (6, 9, 13).
       - Art CAN (hehe) include a bottom border row (like ╰─────╯) since these
         are top-aligned under a sidewalk and bottom-aligned above one.
       - Also top/bottom-aligned. Order of rows matters visually.
       ───────────────────────────────────────────────────────── */
  buildings2b: [
    {
      name: "Van Horne Underpass",
      size: 13,
      art: ["  ▀▀▀▀▀      ", " │VAN   │   ", "╯│HORNE │╰  ", "││ -------  ││", "││░UNDERPASS░││", "╮┴─────────┴╭"],
    },
    { name: "Caserne 26", size: 13, art: ["    /\\       ", "  /    \\     ", " / FIRE  \\   ", "│ CASERNE  │ ", "│  ✧✧26✯✧  │ ", "╰───────────╯"] },
    { name: "Drawn & Quarterly", size: 13, art: [" /\\/\\/\\/\\/\\  ", "│DRAWN &    │", "│QUARTERLY  │", "│ COMICS    │", "╰───────────╯"] },
    { name: "Parquette", size: 13, art: ["╭───────────╮", "│ PARQUETTE │", "│ ★ ☕ ★ ★ ★ │", "│░.  ░.  ░░ │", "╰───────────╯"] },
    { name: "Cinéma Beaubien", size: 9, art: ["╔CINEMA═╗", "║BEAUBIEN", "║ ◢▓▓◣  ║", "║ 1938  ║", "╙───────╜"] },
    { name: "Sala Rossa", size: 9, art: ["╭SALA───╮", "│ ROSSA │", "│ R0SSA │", "╰───────╯"] },
    { name: "Arepera", size: 9, art: ["╭AREPERA╮", "│ ◢■◣   │", "│ ★ ✦ ★ │", "╰───────╯"] },
    { name: "La Vitrola", size: 9, art: ["╭LA─────╮", "│VITROLA│", "│ ♫  ♪  │", "╰───────╯"] },
    { name: "Segal's", size: 9, art: ["╭SEGALS─╮", "│ FRESH │", "│ ★★★★★ │", "╰───────╯"] },
    { name: "Dépanneur", size: 6, art: ["  ^   ", "/.  .\\", "|.  .|", "|DEP |"] },
    { name: "Walkup", size: 6, art: ["◢▓▓▓▓◣", "| [] |", "|    |", "| [] |"] },
    { name: "Boulangerie", size: 6, art: ["┌────┐", "|BOUL|", "|════|"] },
    { name: "Pharmacie", size: 6, art: ["┌────┐", "|[+] |", "|PHAR|"] },
  ],

  /* ─────────────────────────────────────────────────────────
       FOODS (Act 4 grocery items + Act 5 fridge)
       Used by: s4GenBookcases() item generation, Act 5 fridge display.
       Constraints:
       - `n` = name shown in +$ popup. Keep short (<8 chars) for HUD fit.
       - `p` = price in Montreal 2026 piaces
       - `a` = art, MUST fit in S4_SLOT_W (currently 9) minus 2 padding = 7 chars wide.
         If I widen art, check S4_SLOT_W and S4_BC_W in main script.
       - Art height is typically 3–4 rows. Rows stack up from shelf baseline.
       - items picked randomly for each shelf slot.
       ───────────────────────────────────────────────────────── */
  foods: [
    { n: "bread", p: 4, a: [" .----.", "/~~~~\\", "|~~~~|", "\\___ /"] },
    { n: "cereal", p: 7, a: ["| OATZ |", "|  OO  |", "|_____|"] },
    { n: "oats", p: 5, a: ["  _||_ ", "| OATZ|", "| 3.5%|", "|_____|"],},
    { n: "soup", p: 3, a: ["| SOUPE|", "| MAISO|", "'-----'"] },
    { n: "pasta", p: 3, a: ["| PENNE|", "| //// |", "|_____|"] },
    { n: "beans", p: 2, a: ["| BEANS|", "| Oo oO|", "'-----'"] },
    { n: "chocolate", p: 6, a: ["|CHOC|", "| ==== |", "'-----'"] },
    { n: "Tofu", p: 5, a: ["|TOFU|", "| /\\_ |", "'-----'"] },
    { n: "nutz", p: 8, a: [" /\\ /\\", "|NUTz|", " \\___/"] },
    { n: "juice", p: 5, a: ["| JUS  |", "|D'ORAN|", "'-----'"] },
    { n: "tofu2", p: 5, a: ["| TOFU |", "| [==] |", "'-----'"] },
    { n: "tangerines", p: 5, a: ["╭◤☉☉◎◥╮", "│☉◎☉☉☉│", "│◎☉◎◎☉│", "╰─────╯"] },
    { n: "flour", p: 5, a: ["  ⤹ ⤵", " ❱❱✘❰❰", " ❰❱▫❰❱", " ❰❰❰❱❱"] },
    { n: "cereal", p: 6, a: [" ╭───╮", " │‡‡‡│", " │╮‡╭┤", " ╰┴─┴╯"] },
    { n: "seitan", p: 5, a: ["∏∏∏∏∏∏∏", "∏∏∇∇∇∏∏", "∏∏∆∆∆∏∏", "∏∏∏∏∏∏∏"] },
    { n: "vinegar", p: 3, a: [")∏( )∏(", ")□( )□(", ")□( )□(", ")_( )_("] },
    { n: "cherries", p: 7, a: ["   ⊛", "  ⊙⊙⊙", " ⊙⊛⊙⊛⊙", "⊛⊙⊛⊙⊛⊙⊛"] },
    { n: "salt", p: 3, a: ["", " ∑∑∑∏∏", " ∑∑∑∏∏", ">>><<<<"] },
    { n: "chickpeas", p: 2, a: ["[]]]]]=", "[] []]=", "[] []]=", "[]]]]]="] },
  ],

  /* ─────────────────────────────────────────────────────────
       STORE (Act 2b + Act 3 — the Metro grocery store)
       Used by: renderAct2b, renderAct3.
       Constraints:
       - Width MUST be consistent across all rows (currently 30).
       - Height 9 rows. If I change height, check STO_H references in main.
       - If width changes, STO_W constant in main script auto-updates
         (it reads STORE[0].length), so safe to resize horizontally.
       ───────────────────────────────────────────────────────── */
  storeArt: [
    ".============================.",
    "|  M E T R O   G R O C E R Y |",
    "|============================|",
    "| [##] [##] [##] [##] [##]  |",
    "| [##] [##] [##] [##] [##]  |",
    "|         .--------.         |",
    "|         | ENTER! |         |",
    "|         |        |         |",
    "|========='        '=========|",
  ],

  /* ─────────────────────────────────────────────────────────
       FRIDGE (Act 5 — community fridge)
       Used by: renderAct5.
       Constraints:
       - Width must be consistent (currently 23).
       - Current layout has 4 "slots" in 2x2 grid for food.
       - Act 5 logic draws crew item names inside at specific offsets —
         if I change interior layout, check the item-drawing code in
         renderAct5 (the `fx + 2 + col * colW` / `fy + 5 + row * 2` lines).
       ───────────────────────────────────────────────────────── */
  /* Structure drawn dynamically in renderAct5 — this is just the frame.
       Food from GAME_DATA.foods is drawn into slots.
       Width = 37 chars. If I resize, also update the slot-layout math in renderAct5
       (fridgeW, slotsPerShelf, shelfTop/shelfBot row numbers). */
  fridgeArt: [
    "╔═══════════════════════════════════╗",
    "║  ❄  COMMUNITY  FRIDGE  ❄          ║",
    "║   feed your neighbour             ║",
    "╠═══════════════════════════════════╣",
    "║                                   ║",
    "║                                   ║",
    "║                                   ║",
    "║                                   ║",
    "║                                   ║",
    "╠═══════════════════════════════════╣",
    "║                                   ║",
    "║                                   ║",
    "║                                   ║",
    "║                                   ║",
    "║                                   ║",
    "╠═══════════════════════════════════╣",
    "║    ♥  take what you need  ♥       ║",
    "╚═══════════════════════════════════╝",
  ],

  /* ─────────────────────────────────────────────────────────
       CHARACTER ART (player + NPCs)
       Used throughout all acts.
       Constraints:
       - All sprites are EXACTLY 2 rows tall, 1 char wide.
       - If I change height, check collision math (abs y-diff checks).
       - Order matters: A2_PA has [idle, step] animation frames.
       - npcArts: pool for ambient NPCs. Randomly picked.
       - npcColors: pool for NPC colors. Randomly picked (except narcs).
       ───────────────────────────────────────────────────────── */
  playerArt: [
    ["@", "Ħ"] /* frame 0: idle */,
    ["@", "Ħ"] /* frame 1: step (currently same — add variation here) */,
  ],
  robinArt: ["@", "Ħ"] /* default crew member */,
  narcArt: ["%", "φ"] /* narcs — stiff, different glyph */,
  npcArts: [
    ["⚙", "⍞"],
    ["θ", "╫"],
    ["❂", "ŋ"],
    ["☉", "φ"],
    ["ο", "♙"],
    ["σ", "ζ"],
    ["⍝", "ξ"],
    ["Ω", "Π"],
    ["⋊", "∬"],
  ],
  npcColors: ["#0ff", "#f0f", "#ff0", "#0f8", "#f80", "#8f0", "#80f", "#f08", "#08f"],

  /* ─────────────────────────────────────────────────────────
       NARRATIVE QUOTES (Act 1 transition banners)
       Used by: Act 1 end sequence (NQ array).
       Constraints:
       - `t` = banner text, `c` = color, `d` = duration ms.
       - Ordering matters — shown in sequence.
       ───────────────────────────────────────────────────────── */
  /* Act 1 → Act 2 narrative. Ordering matters.
       Entries with pause:true are silent beats (no banner, just delay). */
  narrativeQuotes: [
    { t: "someone had an idea...", c: "#bf8c60", d: 2500 },
    { pause: true, d: 800 },
    { t: "or maybe we all had the idea", c: "#db7f30", d: 2500 },
    { pause: true, d: 1000 },
    { t: "what if we went to the store and took what we need?", c: "#f26507", d: 3000 },
    { pause: true, d: 600 },
    { t: "TIME TO BUILD A CREW", c: "#8957ff", d: 2500 },
  ],
}; /* ── DIALOGUE POOLS ────────────────────────────────────── */
// ambient player chatter
const D_AMB_HUNGRY = [
  "my kids are hungry",
  "I skip meals now",
  "my fridge is empty",
  "can't afford bread",
  "rice and beans again",
  "my kids think cereal is dinner",
  "I pretend I already ate",
  "nothing in the fridge",
  "even ramen is expensive now",
];
const D_AMB_ANGRY = [
  "profits are criminal",
  "CEOs get millions in bonuses",
  "the system is rigged",
  "billionaires don't care",
  "they throw out good food",
  "record profits, record prices",
  "Galen eats well tonight",
  "when did groceries become luxury",
  "we're getting robbed legally",
];
const D_AMB_NARC = [
  "everything's fine",
  "I love this store",
  "prices seem fair",
  "nothing wrong here",
  "great deals today",
  "I love the market economy!",
  "I like shopping here!",
  "this is just life!",
  "the economy is strong",
];
//  player greeting to npc
const P_GREET = [
  "hey. you okay?",
  "rough out here, huh?",
  "you tired of this too?",
  "how are you holding up?",
  "hey. what's going on?",
  "you look like you get it",
  "hey. got a minute?",
  "hey neighbour",
  "you look fed up too",
  "salut. ça va?",
  "long day?",
  "real talk?",
  "you eating okay?",
  "hey. I know that look",
];
// NPC 1st replies (narc, angry, hungry/sad)
const D_NARC_HELLO = ["prices seem pretty fair to me", "I love this store actually", "the economy is doing great", "I have no complaints"];

const D_ANGRY_HELLO = [
  "corporations are making record profits while we starve",
  "Galen Weston pocketed $2 billion last year",
  "they lock the dumpsters so we can't even take the waste",
  "record profits, record food bank lines",
];
const D_HUNGRY_HELLO = [
  "I've been skipping lunch to afford dinner",
  "my kids think cereal is a full meal",
  "I have three jobs and still can't afford groceries",
  "nothing in the fridge again tonight. nobody should go hungry.",
  "I feel ashamed of being poor, like I should hide it",
  "you seen the price of bread lately?",
  "I used to eat three meals a day.",
  "$6 for tofu. Can you believe it?",
  "I can't afford to live. Can you?",
  "I'm not keeping it together, I'm too hungry to think",
];

// const D_ACK_HUNGRY_ANGRY = ["!"];

const D_ACK_HUNGRY_ANGRY = ["exactly,", "right?"];
const D_ACK_NARC = ["well, ", "you know, ", "honestly, ", "I mean, "];

// player makes 1st pitch
// speak to INJUSTICE (the NPC is mad).
const D_ANGRY_PITCH = [
  "it's not right.",
  "they profit while we starve.",
  "they're getting richer while we starve.",
  "record profits should mean there's plenty to go around.",
  "did you know that grocery profits are up 40%?",
  "record corporate profits, record food bank lines.",
  "they're getting richer while we starve.",
];
// player makes 1st pitch
//  speak to NEED (the NPC is hurting).
const D_HUNGRY_PITCH = [
  "nobody should have to live like this.",
  "what if you didn't have to worry about food anymore?",
  "we're fixing everything tonight.",
  "no one should go hungry.",
  "the shelves are full but our fridges are empty.",
  "food bank ran out by Tuesday.",
  "they locked the dumpsters now.",
  "they throw food in the dumpsters every night.",
  "when did feeding your family become a luxury?",
  "bread is SIX dollars. we're making change.",
];

const D_INVITE = [
  "want to do something about it?",
  "we're fixing that tonight.",
  "join us?",
  "we need to rise up",
  "we can do something about it, tonight",
  "let's stop asking and start taking",

  "want in?",
  "come with us?",
  "let's take it back",
  "come with us?",
  "Isn't it time to push back?",
  "let's change it?",
  //   "we're not taking it anymore.",
  "tonight we rise up.",
];

// const PITCH_ANGRY = [
//   "you're right. and we can do something about it.",
//   "that's why we're taking it back. tonight.",
//   "so let's stop asking and start taking.",
//   "we're done waiting. are you?",
// ];

// player pitches harder
const D_STRONGER_PITCH = [
  "the store is full. our fridges are empty. tonight we fix that",
  "they throw food in dumpsters while people starve. we're taking it back",
  "bread is $6. we're done asking nicely",
  "one night, one store, enough food for the whole block",
  "we shouldn't have to live like this.",
  "what if we didn't have to worry anymore?",
  "we're doing something about that. want in?",
  "come with us. we're fixing this tonight.",
  "we're paying 27.1% more for groceries than in in 2020",
];

// npc feels misunderstood
const D_MISMATCH = [
  "that's not really where I'm at right now.",
  "that's not really my thing.",
  "hmmm.",
  "no, yeah, no.",
  "you seem really passionate, but that's just not for me.",
  "I don't think that's quite right.",
  "I hear you but that's not my thing.",
];
// npc feels says no and bye
const D_NO_BYE = ["so no thanks", "not for me", "I'm good", "I'll pass"];

//npc or narc asks for more info
const D_SAY_MORE = [
  "tell me more",
  "go on",
  "interesting. what exactly are you proposing",
  "I'm listening",
  "wait, what do you mean?",
  "hmm...tell me more?",
  "that's intense",
  "keep talking",
  "you serious?",
  "wait, really?",
  "that's a lot to take in",
  "hmmm",
];

// player backs off
const D_BACK_OFF = ["forget I said anything", "never mind, just thinking out loud", "you're right, bad idea"];

// narc reveal
const D_NARC_REVEAL = [
  "my husband is a COP",
  "I'm calling this in RIGHT NOW",
  "I OWN Loblaws stock",
  "I'm calling 911!",
  "just get another job!!",
  "that's THEFT!",
  "just tighten your belt",
  "NOT on my watch!",
  "this is why we need more police",
  "you're RUINING the neighbourhood!",
  "markets are UP today!",
  "you should just try budgeting",
];

// npc says their two cents
const D_JOIN_PHRASE = [
  "you know what, we do need change",
  "I've been waiting for someone to say that",
  "the system isn't going to fix itself",
  "tabarnak, you're right",
  "I've nothing left to lose",
  "say less",
  "about damn time",
  "finally someone is doing something",
  "tabarnak",
  "I knew someone would snap eventually",
];

// npc says yes
const D_CONSENT_PHRASE = [
  "I'm in",
  "let's go.",
  "I'm IN",
  "when do we start?",
  "you had me at robin hood",
  "count me in",
  "let's do this",
  "allons-y",
];

// npc isn't ready
const D_NOT_NOW = ["maybe another time", "I want to but I can't right now", "I'm scared", "not tonight"];

// npc return of the mac
const D_RETURN = [
  "hey — I changed my mind. I'm in",
  "I've been thinking about what you said. let's do it",
  "okay okay, you convinced me. I'm back",
  "I couldn't stop thinking about it. count me in",
];

const D_INTERCOM = ["cleanup on ALL aisles", "security to... everywhere", "attention: CODE RED", "this is NOT a drill"];
const D_AMB = [
  "prices keep going up...",
  "my kids are hungry",
  "I got this coupon app",
  "it just keeps going up",
  "I shop at Segals when I can",
  "I have three jobs",
  "I skip meals now.",
];

/* ── STORE ART (shared by Acts 2, 3) ──────────────────── */
const STORE = window.GAME_DATA.storeArt;
const STO_W = STORE[0].length,
  STO_H = STORE.length;

/* ── SHARED: city grid (Act 1) ─────────────────────────── */
const HA = [
  ["^", "\u25A1"],
  ["\u2227", "\u25A4"],
  ["\u25B2", "\u25FC"],
  ["^", "\u25A4"],
  ["\u2227", "\u25A1"],
];
const HC = ["#3a3535", "#353a35", "#35353a", "#3a3838", "#383a38", "#38383a"];
