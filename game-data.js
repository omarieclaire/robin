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
    { name: "Dépanneur",   size: 6, art: [
      "  ^   ",
      "/.  .\\",
      "|.  .|",
      "|DEP |",
    ]},
    { name: "Walkup",      size: 6, art: [
      "◢▓▓▓▓◣",
      "| [] |",
      "|    |",
      "| [] |",
    ]},
    { name: "Duplex",      size: 6, art: [
      "▮◤◤◤◤▮",
      "┇┌┐┌┐┇",
      "┇└┘└┘┇",
    ]},
    { name: "Triplex",     size: 6, art: [
      "|++++|",
      "|    |",
      "|    |",
      "|    |",
    ]},
    { name: "Tabac",       size: 6, art: [
      "┌────┐",
      "|TABK|",
      "|░░░░|",
    ]},
    { name: "Boulangerie", size: 6, art: [
      "┌────┐",
      "|BOUL|",
      "|════|",
    ]},
    { name: "Pharmacie",   size: 6, art: [
      "┌────┐",
      "|[+] |",
      "|PHAR|",
    ]},

    /* ── REGULAR (size 9) ─── */
    { name: "L'Escalier",     size: 9, art: [
      "╭L'ESCA─╮",
      "│ LIER  │",
      "│ ♪ ★ ♫ │",
    ]},
    { name: "Cinéma Beaubien", size: 9, art: [
      "╔CINEMA═╗",
      "║BEAUBIEN",
      "║ ◢▓▓◣  ║",
      "║ 1938  ║",
    ]},
    { name: "Sala Rossa",     size: 9, art: [
      "╭SALA───╮",
      "│ ROSSA │",
      "│ R0SSA │",
      "│       │",
    ]},
    { name: "Arepera",        size: 9, art: [
      "╭AREPERA╮",
      "│ ◢■◣   │",
      "│ ★ ✦ ★ │",
    ]},
    { name: "Dei Campi",      size: 9, art: [
      "╭DEI────╮",
      "│ CAMPI │",
      "│ CAFFE │",
      "│ ☕  ◉  │",
    ]},
    { name: "La Vitrola",     size: 9, art: [
      "╭LA─────╮",
      "│VITROLA│",
      "│ ♫  ♪  │",
    ]},
    { name: "Segal's",        size: 9, art: [
      "╭SEGALS─╮",
      "│ FRESH │",
      "│ ★★★★★ │",
    ]},

    /* ── WIDE (size 13) ─── */
    { name: "Notre-Dame",     size: 13, art: [
      "     /\\      ",
      "    /  \\     ",
      "   /NOTRE\\   ",
      "  | DAME  |  ",
      "  | ★ ✦ ★ |  ",
    ]},
    { name: "Cinéma L'Amour", size: 13, art: [
      "▮◤◤◤◤◤◤◤◤◤◤▮ ",
      "┇┌┐ ┌┐ ┌┐┌┐┇ ",
      "┇└┘║└┘ └┘└┘┇ ",
      "┇  CINEMA  ┇ ",
      "┇ L'AMOUR  ┇ ",
    ]},
    { name: "Parquette",      size: 13, art: [
      "╭───────────╮",
      "│ PARQUETTE │",
      "│ ★ ☕ ★ ☕ ★ │",
      "│░.  ░.  ░░ │",
    ]},
    { name: "Drawn & Quarterly", size: 13, art: [
      " /\\/\\/\\/\\/\\  ",
      "│DRAWN &    │",
      "│QUARTERLY  │",
      "│ COMICS    │",
    ]},
    { name: "Caserne 26",     size: 13, art: [
      "    /\\       ",
      "  /    \\     ",
      " / FIRE  \\   ",
      "│ CASERNE  │ ",
      "│  ✧✧26✯✧  │ ",
    ]},
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
    { name: "Van Horne Underpass", size: 13, art: [
      "  ▀▀▀▀▀      ",
      " │VAN   │   ",
      "╯│HORNE │╰  ",
      "││ -------  ││",
      "││░UNDERPASS░││",
      "╮┴─────────┴╭",
    ]},
    { name: "Caserne 26", size: 13, art: [
      "    /\\       ",
      "  /    \\     ",
      " / FIRE  \\   ",
      "│ CASERNE  │ ",
      "│  ✧✧26✯✧  │ ",
      "╰───────────╯",
    ]},
    { name: "Drawn & Quarterly", size: 13, art: [
      " /\\/\\/\\/\\/\\  ",
      "│DRAWN &    │",
      "│QUARTERLY  │",
      "│ COMICS    │",
      "╰───────────╯",
    ]},
    { name: "Parquette", size: 13, art: [
      "╭───────────╮",
      "│ PARQUETTE │",
      "│ ★ ☕ ★ ★ ★ │",
      "│░.  ░.  ░░ │",
      "╰───────────╯",
    ]},
    { name: "Cinéma Beaubien", size: 9, art: [
      "╔CINEMA═╗",
      "║BEAUBIEN",
      "║ ◢▓▓◣  ║",
      "║ 1938  ║",
      "╙───────╜",
    ]},
    { name: "Sala Rossa", size: 9, art: [
      "╭SALA───╮",
      "│ ROSSA │",
      "│ R0SSA │",
      "╰───────╯",
    ]},
    { name: "Arepera", size: 9, art: [
      "╭AREPERA╮",
      "│ ◢■◣   │",
      "│ ★ ✦ ★ │",
      "╰───────╯",
    ]},
    { name: "La Vitrola", size: 9, art: [
      "╭LA─────╮",
      "│VITROLA│",
      "│ ♫  ♪  │",
      "╰───────╯",
    ]},
    { name: "Segal's", size: 9, art: [
      "╭SEGALS─╮",
      "│ FRESH │",
      "│ ★★★★★ │",
      "╰───────╯",
    ]},
    { name: "Dépanneur",   size: 6, art: [
      "  ^   ",
      "/.  .\\",
      "|.  .|",
      "|DEP |",
    ]},
    { name: "Walkup", size: 6, art: [
      "◢▓▓▓▓◣",
      "| [] |",
      "|    |",
      "| [] |",
    ]},
    { name: "Boulangerie", size: 6, art: [
      "┌────┐",
      "|BOUL|",
      "|════|",
    ]},
    { name: "Pharmacie", size: 6, art: [
      "┌────┐",
      "|[+] |",
      "|PHAR|",
    ]},
  ],

  /* ─────────────────────────────────────────────────────────
     FOODS (Act 4 grocery items + Act 5 fridge)
     Used by: s4GenBookcases() item generation, Act 5 fridge display.
     Constraints:
     - `n` = name shown in +$ popup. Keep short (<8 chars) for HUD fit.
     - `p` = price in dollars. Tuned for Montreal 2026 prices.
     - `a` = art, MUST fit in S4_SLOT_W (currently 9) minus 2 padding = 7 chars wide.
       If I widen art, check S4_SLOT_W and S4_BC_W in main script.
     - Art height is typically 3–4 rows. Rows stack up from shelf baseline.
     - items picked randomly for each shelf slot.
     ───────────────────────────────────────────────────────── */
  foods: [
    { n: "Bread",  p: 4, a: [
      " .----.",
      "/~~~~\\",
      "|~~~~|",
      "\\___ /",
    ]},
    { n: "Cereal", p: 7, a: [
      "| OATZ |",
      "|  OO  |",
      "|_____|",
    ]},
    { n: "Oats",   p: 5, a: [
      "  _||_ ",
      "| OATZ|",
      "| 3.5%|",
      "|_____|",
    ]},
    { n: "Soup",   p: 3, a: [
      "| SOUPE|",
      "| MAISO|",
      "'-----'",
    ]},
    { n: "Pasta",  p: 3, a: [
      "| PENNE|",
      "| //// |",
      "|_____|",
    ]},
    { n: "Eggs",   p: 9, a: [
      "| oO Oo|",
      "| Oo oO|",
      "'-----'",
    ]},
    { n: "Marg",   p: 6, a: [
      "|MARG|",
      "| ==== |",
      "'-----'",
    ]},
    { n: "Tofu",   p: 5, a: [
      "|TOFU|",
      "| /\\_ |",
      "'-----'",
    ]},
    { n: "Nuts",   p: 8, a: [
      " /\\ /\\",
      "|NUTS|",
      " \\___/",
    ]},
    { n: "Juice",  p: 5, a: [
      "| JUS  |",
      "|D'ORAN|",
      "'-----'",
    ]},
    { n: "Tofu2",  p: 5, a: [
      "| TOFU |",
      "| [==] |",
      "'-----'",
    ]},
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
  fridgeArt: [
    " .====================.",
    " |                    |",
    " |    C O M M U N I T Y",
    " |      F R I D G E   |",
    " |                    |",
    " |  .------. .------. |",
    " |  |      | |      | |",
    " |  |      | |      | |",
    " |  |  *   | |  *   | |",
    " |  |      | |      | |",
    " |  '------' '------' |",
    " |                    |",
    " |  .------. .------. |",
    " |  |      | |      | |",
    " |  |  *   | |  *   | |",
    " |  |      | |      | |",
    " |  '------' '------' |",
    " |                    |",
    " '===================='",
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
    ["@", "Ħ"],  /* frame 0: idle */
    ["@", "Ħ"],  /* frame 1: step (currently same — add variation here) */
  ],
  robinArt: ["@", "Ħ"],  /* default crew member */
  narcArt:  ["%", "φ"],  /* narcs — stiff, different glyph */
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
    { t: "someone had an idea...",                         c: "#bf8c60", d: 2500 },
    { pause: true,                                         d: 800 },
    { t: "or maybe we all had the idea.",                  c: "#db7f30", d: 2500 },
    { pause: true,                                         d: 1000 },
    { t: "what if we just took what we need?",             c: "#f26507", d: 3000 },
    { pause: true,                                         d: 600 },
    { t: "TIME TO BUILD A CREW.",                          c: "#8957ff", d: 2500 },
  ],

};
