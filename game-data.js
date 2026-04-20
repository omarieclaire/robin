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
         tileBuildings() picks from these to fill a block. wanna add a new
         size tier? update the remainder logic in tileBuildings() .
       - Art height is flexible (3–6 rows typical). Taller = fills more of
         the building band. Bands are ~A2_BH_PER rows tall (see a2Layout).
       - Colors come from A2_BCOL palette in main script, not per-building.
       - Blank spaces in art are transparent (see-through to sky).
       ───────────────────────────────────────────────────────── */
  buildings: [
    /* ── NARROW (size 6) ─── */
    {
      name: "Dépanneur",
      size: 6,
      art: ["  ^   ", "/.  .\\", "|.  .|", "|DEP |"],
    },

    {
      name: "Walkup",
      size: 6,
      art: ["◢▓▓▓▓◣", "| [] |", "|    |", "| [] |"],
    },
    {
      name: "Duplex",
      size: 6,
      art: ["▮◤◤◤◤▮", "┇┌┐┌┐┇", "┇└┘└┘┇"],
    },
    {
      name: "Triplex",
      size: 6,
      art: ["|++++|", "|    |", "|    |", "|    |"],
    },
    {
      name: "Tabac",
      size: 6,
      art: ["┌────┐", "|TABK|", "|░░░░|"],
    },
    {
      name: "Boulangerie",
      size: 6,
      art: ["┌────┐", "|BOUL|", "|════|"],
    },
    {
      name: "Pharmacie",
      size: 6,
      art: ["┌────┐", "|[+] |", "|PHAR|"],
    },

    // added narrow
    {
      name: "SWIRL",
      size: 6,
      art: ["┌~~~~┐", "|SWRL|", "|YUM |"],
    },
    {
      name: "SAQ",
      size: 6,
      art: ["╱────╲", "│ SAQ│", "│VINS│"],
    },
    {
      name: "BIXI",
      size: 6,
      art: [" **** ", "|BIXI|", "/====\\"],
    },
    {
      name: "Samosa King",
      size: 6,
      art: ["┌────┐", "|SMOS|", "| $1 |"],
    },
    {
      name: "Gnocchi",
      size: 6,
      art: ["┌────┐", "|GNOC|", "| $5 |"],
    },

    /* ── REGULAR (size 9) ─── */
    {
      name: "Umami",
      size: 9,
      art: ["   ⚻⛬⚻   ", "╔═══⬚═══╗", "‖⟦⟦⟦□⟧⟧⟧‖", "‖≋umami≋‖", "‖▤▤□✀□⚝▤‖"],
    },
    {
      name: "L'Escalier",
      size: 9,
      art: ["╭L'ESCA─╮", "│ LIER  │", "│ ♪ ★ ♫ │"],
    },
    {
      name: "Cinéma Beaubien",
      size: 9,
      art: ["╔CINEMA═╗", "║BEAUBIEN", "║ ◢▓▓◣  ║", "║ 1938  ║"],
    },
    {
      name: "Sala Rossa",
      size: 9,
      art: ["╭SALA───╮", "│ ROSSA │", "│ R0SSA │", "│       │"],
    },
    {
      name: "Arepera",
      size: 9,
      art: ["╭AREPERA╮", "│ ◢■◣   │", "│ ★ ✦ ★ │"],
    },
    {
      name: "Dei Campi",
      size: 9,
      art: ["╭DEI────╮", "│ CAMPI │", "│ CAFFE │", "│ ✧  ◉  │"],
    },
    {
      name: "La Vitrola",
      size: 9,
      art: ["╭LA─────╮", "│VITROLA│", "│ ♫  ♪  │"],
    },
    {
      name: "Segal's",
      size: 9,
      art: ["╭SEGALS─╮", "│ FRESH │", "│ ★★★★★ │"],
    },

    // added regular
    {
      name: "Foufounes",
      size: 9,
      art: ["╔FOUFOU═╗", "║NES    ║", "║ ϟϟϟϟ  ║", "║ELECTR ║"],
    },
    {
      name: "Quai des Brumes",
      size: 9,
      art: ["╭QUAI───╮", "│ DES   │", "│BRUMES │"],
    },
    {
      name: "Club Soda",
      size: 9,
      art: ["╭CLUB───╮", "│ SODA  │", "│ MUSIC │"],
    },
    {
      name: "Pikolo",
      size: 9,
      art: ["╭PIKOLO─╮", "│ CAFE  │", "│       │"],
    },
    {
      name: "Wilensky's",
      size: 9,
      art: ["╭───────╮", "│WILENSK│", "│ Y'S   │", "│ DELI  │"],
    },
    {
      name: "Fairmount Bagel",
      size: 9,
      art: ["╭───────╮", "│FAIRMNT│", "│BAGELS │", "│ ◯ ◯ ◯ │"],
    },
    {
      name: "St-Viateur Bagel",
      size: 9,
      art: ["╭───────╮", "│ST-VIAT│", "│ BAGEL │", "│ ◯  ◯  │"],
    },
    {
      name: "Boustan",
      size: 9,
      art: ["╱╲╱╲╱╲╱╲╱", "│BOUSTAN│", "│SHAWRMA│", "│ GOOD! │"],
    },
    {
      name: "Café Olimpico",
      size: 9,
      art: ["╭OLIMPIC╮", "│ESPRESO│", "│ CAFFE │", "│ 1970  │"],
    },
    {
      name: "Phonopolis",
      size: 9,
      art: ["╭───────╮", "│{PHONO}│", "│ POLIS │", "│ ♪  ♫  │"],
    },
    {
      name: "Benelux",
      size: 9,
      art: ["╭───────╮", "│BENELUX│", "│ BIERE │", "│ ♨ ♨ ♨ │"],
    },
    {
      name: "Phi Centre",
      size: 9,
      art: ["╔══PHI══╗", "║◉ ART ◉║", "║▓▓▓▓▓▓▓║"],
    },
    {
      name: "Chatime",
      size: 9,
      art: ["╭───────╮", "│CHATIME│", "│BUBBLE │", "│  TEA  │"],
    },
    {
      name: "Beauty's",
      size: 9,
      art: ["╭───────╮", "│BEAUTY'│", "│S LUNCH│", "│ *<>*  │"],
    },
    {
      name: "Cabaret Mile End",
      size: 9,
      art: ["▁CABARET▁", "│ MILE  │", "│  END  │", "│ STAGE │"],
    },
    {
      name: "Santropol",
      size: 9,
      art: ["╭───────╮", "│SANTROP│", "│  OL   │", "│ (___) │"],
    },
    {
      name: "Marché PA",
      size: 9,
      art: ["╔MARCHE═╗", "║  PA   ║", "║GROCERY║"],
    },
    {
      name: "Cheval Blanc",
      size: 9,
      art: ["╭───────╮", "│CHEVAL │", "│ BLANC │", "│ BIERE │"],
    },
    {
      name: "Les Petits Frères",
      size: 9,
      art: ["╭───────╮", "│PETITS │", "│FRERES │", "│ ★ ♥ ★ │"],
    },
    {
      name: "Renaissance",
      size: 9,
      art: ["╭───────╮", "│RENAIS │", "│ SANCE │", "│THRIFT │"],
    },
    {
      name: "Myriade",
      size: 9,
      art: ["┌✺─✺─✺─✺┐", "│       │", "│MYRIADE│"],
    },
    {
      name: "Palais Royale",
      size: 9,
      art: ["▀PALAIS▀▀", "█ROYALE  █", "█ RESTO █"],
    },
    {
      name: "Casa d'Italia",
      size: 9,
      art: ["╔═CASA══╗", "║D'ITALI║", "║ ★ ★ ★ ║", "║CULTURA║"],
    },
    {
      name: "Cinéma du Parc",
      size: 9,
      art: ["▀CINEMA▀▀", "█ DU    █", "█ PARC  █", "█ ◢▓▓◣  █"],
    },
    {
      name: "Maynard's",
      size: 9,
      art: ["╭───────╮", "│MAYNARD│", "│POUTINE│", "│  ✷✷   │"],
    },
    {
      name: "McCord",
      size: 9,
      art: ["▀McCORD▀▀", "█       █", "█ ◢■◣◢■◣█"],
    },

    /* ── WIDE (size 13) ─── */
    {
      name: "Notre-Dame",
      size: 13,
      art: ["     /\\      ", "    /  \\     ", "   /NOTRE\\   ", "  | DAME  |  ", "  | ★ ✦ ★ |  "],
    },
    {
      name: "Cinéma L'Amour",
      size: 13,
      art: ["▮◤◤◤◤◤◤◤◤◤◤▮ ", "┇┌┐ ┌┐ ┌┐┌┐┇ ", "┇└┘║└┘ └┘└┘┇ ", "┇  CINEMA  ┇ ", "┇ L'AMOUR  ┇ "],
    },
    {
      name: "Parquette",
      size: 13,
      art: ["╭───────────╮", "│ PARQUETTE │", "│ ★ ✧ ★ ✧ ★ │", "│░.  ░.  ░░ │"],
    },
    {
      name: "Drawn & Quarterly",
      size: 13,
      art: [" /\\/\\/\\/\\/\\  ", "│DRAWN &    │", "│QUARTERLY  │", "│ COMICS    │"],
    },
    {
      name: "Caserne 26",
      size: 13,
      art: ["    /\\       ", "  /    \\     ", " / FIRE  \\   ", "│ CASERNE  │ ", "│  ✧✧26✯✧  │ "],
    },

    // added wide

    {
      name: "Stade Olympique",
      size: 13,
      art: ["        ╱│   ", "       ╱  │  ", "      ╱   │  ", " STADE    │  ", "◢◣◢◣◢◣◣   │  "],
    },
    {
      name: "Biosphere",
      size: 13,
      art: ["    ╱◇◇◇◇╲   ", "   ◇◇◇◇◇◇◇   ", "  ◇◇◇◇◇◇◇◇◇  ", "   ◇◇◇◇◇◇◇   ", "    ╲◇◇◇◇╱   "],
    },
    {
      name: "Habitat 67",
      size: 13,
      art: [" ▓▓  ▓▓  ▓▓  ", "▓▓▓ ▓▓▓ ▓▓▓  ", "▓▓ 67  ▓▓ ▓▓ ", " ▓▓  ▓▓▓  ▓▓ ", "▓▓▓ ▓▓  ▓▓▓  "],
    },
    {
      name: "Place des Arts",
      size: 13,
      art: ["▀▀▀▀▀▀▀▀▀▀▀▀▀", "█ PLACE DES █", "█   ARTS    █", "█ ▢ ▢ ▢ ▢ ▢ █", "▔▔▔▔▔▔▔▔▔▔▔▔▔"],
    },
    {
      name: "Marché Jean-Talon",
      size: 13,
      art: ["┌─━━━╋━━━━━─┐", "│  MARCHÉ   │", "│JEAN TALON │", "│  FARMERS  │", "└∞──∞∞──∞∞──┘"],
    },
    {
      name: "Casa del Popolo",
      size: 13,
      art: ["┏━━╋━━╋━━╋━━┓", "│ CASA DEL  │", "│  POPOLO   │", "│  %%%%     │", "┗━━╋━━╋━━╋━━┛"],
    },
    {
      name: "BAnQ",
      size: 13,
      art: ["┏━━━━━━━━━━━┓", "┃   BAnQ    ┃", "┣━━━━━━━━━━━┛", "┃    ┃       ", "┃    ┃       ", "┗━━━━┻━━━━━━ "],
    },
    {
      name: "SAT Société",
      size: 13,
      art: ["   ◢■■■■■◣   ", "╭───────────╮", "│    SAT    │", "│  SOCIETE  │", "│▓▓▓▓▓▓▓▓▓▓▓│"],
    },
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
    {
      name: "Caserne 26",
      size: 13,
      art: ["    /\\       ", "  /    \\     ", " / FIRE  \\   ", "│ CASERNE  │ ", "│  ✧✧26✯✧  │ ", "╰───────────╯"],
    },
    {
      name: "Drawn & Quarterly",
      size: 13,
      art: [" /\\/\\/\\/\\/\\  ", "│DRAWN &    │", "│QUARTERLY  │", "│ COMICS    │", "╰───────────╯"],
    },
    {
      name: "Parquette",
      size: 13,
      art: ["╭───────────╮", "│ PARQUETTE │", "│ ★ ✧ ★ ★ ★ │", "│░.  ░.  ░░ │", "╰───────────╯"],
    },
    {
      name: "Cinéma Beaubien",
      size: 9,
      art: ["╔CINEMA═╗", "║BEAUBIEN", "║ ◢▓▓◣  ║", "║ 1938  ║", "╙───────╜"],
    },
    {
      name: "Sala Rossa",
      size: 9,
      art: ["╭SALA───╮", "│ ROSSA │", "│ R0SSA │", "╰───────╯"],
    },
    {
      name: "Arepera",
      size: 9,
      art: ["╭AREPERA╮", "│ ◢■◣   │", "│ ★ ✦ ★ │", "╰───────╯"],
    },
    {
      name: "La Vitrola",
      size: 9,
      art: ["╭LA─────╮", "│VITROLA│", "│ ♫  ♪  │", "╰───────╯"],
    },
    {
      name: "Segal's",
      size: 9,
      art: ["╭SEGALS─╮", "│ FRESH │", "│ ★★★★★ │", "╰───────╯"],
    },
    {
      name: "Dépanneur",
      size: 6,
      art: ["  ^   ", "/.  .\\", "|.  .|", "|DEP |"],
    },
    {
      name: "Walkup",
      size: 6,
      art: ["◢▓▓▓▓◣", "| [] |", "|    |", "| [] |"],
    },
    {
      name: "Boulangerie",
      size: 6,
      art: ["┌────┐", "|BOUL|", "|════|"],
    },
    {
      name: "Pharmacie",
      size: 6,
      art: ["┌────┐", "|[+] |", "|PHAR|"],
    },

    /* ── WIDE (size 13) ── */
    {
      name: "Stade Olympique",
      size: 13,
      art: ["        ╱│   ", "       ╱  │  ", "      ╱   │  ", " STADE    │  ", "◢◣◢◣◢◣◣   │  ", "▉▉▉▉▉▉▉▉▉▉▉▉▉"],
    },
    {
      name: "Biosphere",
      size: 13,
      art: ["    ╱◇◇◇◇╲   ", "   ◇◇◇◇◇◇◇   ", "  ◇◇◇◇◇◇◇◇◇  ", "   ◇◇◇◇◇◇◇   ", "    ╲◇◇◇◇╱   ", "╰───────────╯"],
    },
    {
      name: "Habitat 67",
      size: 13,
      art: [" ▓▓  ▓▓  ▓▓  ", "▓▓▓ ▓▓▓ ▓▓▓  ", "▓▓ 67  ▓▓ ▓▓ ", " ▓▓  ▓▓▓  ▓▓ ", "▓▓▓ ▓▓  ▓▓▓  ", "╰───────────╯"],
    },
    {
      name: "Place des Arts",
      size: 13,
      art: ["▀▀▀▀▀▀▀▀▀▀▀▀▀", "█ PLACE DES █", "█   ARTS    █", "█ ▢ ▢ ▢ ▢ ▢ █", "▔▔▔▔▔▔▔▔▔▔▔▔▔"],
    },
    {
      name: "Marché Jean-Talon",
      size: 13,
      art: ["┌─━━━╋━━━━━─┐", "│  MARCHÉ   │", "│JEAN TALON │", "│  FARMERS  │", "└∞──∞∞──∞∞──┘"],
    },
    {
      name: "Casa del Popolo",
      size: 13,
      art: ["┏━━╋━━╋━━╋━━┓", "│ CASA DEL  │", "│  POPOLO   │", "│  %%%%     │", "┗━━╋━━╋━━╋━━┛"],
    },
    {
      name: "BAnQ",
      size: 13,
      art: ["┏━━━━━━━━━━━┓", "┃   BAnQ    ┃", "┣━━━━━━━━━━━┛", "┃    ┃       ", "┃    ┃       ", "┗━━━━┻━━━━━━ "],
    },
    {
      name: "SAT Société",
      size: 13,
      art: ["   ◢■■■■■◣   ", "╭───────────╮", "│    SAT    │", "│  SOCIETE  │", "│▓▓▓▓▓▓▓▓▓▓▓│", "╰───────────╯"],
    },

    /* ── REGULAR (size 9) ── */
    {
      name: "Foufounes",
      size: 9,
      art: ["╔FOUFOU═╗", "║NES    ║", "║ ϟϟϟϟ  ║", "║ELECTR ║", "╙───────╜"],
    },
    {
      name: "Quai des Brumes",
      size: 9,
      art: ["╭QUAI───╮", "│ DES   │", "│BRUMES │", "╰───────╯"],
    },
    {
      name: "Club Soda",
      size: 9,
      art: ["╭CLUB───╮", "│ SODA  │", "│ MUSIC │", "╰───────╯"],
    },
    {
      name: "Pikolo",
      size: 9,
      art: ["╭PIKOLO─╮", "│ CAFE  │", "│       │", "╰───────╯"],
    },
    {
      name: "Wilensky's",
      size: 9,
      art: ["╭───────╮", "│WILENSK│", "│ Y'S   │", "│ DELI  │", "╰───────╯"],
    },
    {
      name: "Fairmount Bagel",
      size: 9,
      art: ["╭───────╮", "│FAIRMNT│", "│BAGELS │", "│ ◯ ◯ ◯ │", "╰───────╯"],
    },
    {
      name: "St-Viateur Bagel",
      size: 9,
      art: ["╭───────╮", "│ST-VIAT│", "│ BAGEL │", "│ ◯  ◯  │", "╰───────╯"],
    },
    {
      name: "Boustan",
      size: 9,
      art: ["╱╲╱╲╱╲╱╲╱", "│BOUSTAN│", "│SHAWRMA│", "│ GOOD! │", "╰───────╯"],
    },
    {
      name: "Café Olimpico",
      size: 9,
      art: ["╭OLIMPIC╮", "│ESPRESO│", "│ CAFFE │", "│ 1970  │", "╰───────╯"],
    },
    {
      name: "Phonopolis",
      size: 9,
      art: ["╭───────╮", "│{PHONO}│", "│ POLIS │", "│ ♪  ♫  │", "╰───────╯"],
    },
    {
      name: "Benelux",
      size: 9,
      art: ["╭───────╮", "│BENELUX│", "│ BIERE │", "│ ♨ ♨ ♨ │", "╰───────╯"],
    },
    {
      name: "Chatime",
      size: 9,
      art: ["╭───────╮", "│CHATIME│", "│BUBBLE │", "│  TEA  │", "╰───────╯"],
    },
    {
      name: "Beauty's",
      size: 9,
      art: ["╭───────╮", "│BEAUTY'│", "│S LUNCH│", "│ *<>*  │", "╰───────╯"],
    },
    {
      name: "Cabaret Mile End",
      size: 9,
      art: ["▁CABARET▁", "│ MILE  │", "│  END  │", "│ STAGE │", "└───────┘"],
    },
    {
      name: "Santropol",
      size: 9,
      art: ["╭───────╮", "│SANTROP│", "│  OL   │", "│ (___) │", "╰───────╯"],
    },
    {
      name: "Marché PA",
      size: 9,
      art: ["╔MARCHE═╗", "║  PA   ║", "║GROCERY║", "╙───────╜"],
    },
    {
      name: "Cheval Blanc",
      size: 9,
      art: ["╭───────╮", "│CHEVAL │", "│ BLANC │", "│ BIERE │", "╰───────╯"],
    },
    {
      name: "Les Petits Frères",
      size: 9,
      art: ["╭───────╮", "│PETITS │", "│FRERES │", "│ ★ ♥ ★ │", "╰───────╯"],
    },
    {
      name: "Renaissance",
      size: 9,
      art: ["╭───────╮", "│RENAIS │", "│ SANCE │", "│THRIFT │", "╰───────╯"],
    },
    {
      name: "Myriade",
      size: 9,
      art: ["┌✺─✺─✺─✺┐", "│       │", "│MYRIADE│", "└───────┘"],
    },
    {
      name: "Casa d'Italia",
      size: 9,
      art: ["╔═CASA══╗", "║D'ITALI║", "║ ★ ★ ★ ║", "║CULTURA║", "╚═══════╝"],
    },
    {
      name: "Cinéma du Parc",
      size: 9,
      art: ["▀CINEMA▀▀", "█ DU    █", "█ PARC  █", "█ ◢▓▓◣  █", "▔▔▔▔▔▔▔▔▔"],
    },
    {
      name: "Maynard's",
      size: 9,
      art: ["╭───────╮", "│MAYNARD│", "│POUTINE│", "│  ✷✷   │", "╰───────╯"],
    },
    {
      name: "McCord",
      size: 9,
      art: ["▀McCORD▀▀", "█       █", "█ ◢■◣◢■◣█", "▔▔▔▔▔▔▔▔▔"],
    },

    /* ── NARROW (size 6) ── */
    {
      name: "SWIRL",
      size: 6,
      art: ["┌~~~~┐", "|SWRL|", "|YUM |", "└────┘"],
    },
    {
      name: "SAQ",
      size: 6,
      art: ["╱────╲", "│ SAQ│", "│VINS│", "└────┘"],
    },
    {
      name: "BIXI",
      size: 6,
      art: [" **** ", "|BIXI|", "/====\\"],
    },
    {
      name: "Samosa King",
      size: 6,
      art: ["┌────┐", "|SMOS|", "| $1 |", "└────┘"],
    },
    {
      name: "Gnocchi",
      size: 6,
      art: ["┌────┐", "|GNOC|", "| $5 |", "└────┘"],
    },
  ],

  /* ─────────────────────────────────────────────────────────
       FOODS (Act 4 grocery items + Act 5 fridge)
       Used by: s4GenBookcases() item generation, Act 5 fridge display.
       Constraints:
       - `a` = art, MUST fit in S4_SLOT_W (currently 9) minus 2 padding = 7 chars wide.
         wanna widen art? check S4_SLOT_W and S4_BC_W in main script.
       - Art height is typically 3–4 rows. Rows stack up from shelf baseline.
       - items picked randomly for each shelf slot.
       ───────────────────────────────────────────────────────── */
  foods: [
    {
      n: "bread",
      p: 4,
      a: [" .---", "/~~~~\\ ", "|~~~~~|", "\\___ / "],
    },
    {
      n: "cereal",
      p: 7,
      a: ["| OATS |", "|  OO  |", "|_____|"],
    },
    {
      n: "oat milk",
      p: 5,
      a: ["  _||_ ", "| OAT |", "| %%%%|", "| MILK|"],
    },
    {
      n: "soup",
      p: 3,
      a: ["'-----'", "|SOUPE|", "|     |", "'-----'"],
    },
    {
      n: "pasta",
      p: 3,
      a: ["|/////|", "|PENNE|", "|/////|", "|_____|"],
    },
    {
      n: "beans",
      p: 2,
      a: ["'-----'", "| BEANS|", "| Oo oO|", "'-----'"],
    },
    {
      n: "chocolate",
      p: 6,
      a: ["'- - -'", "| CHOC|", "|=====|", "'-----'"],
    },
    {
      n: "Tofu",
      p: 5,
      a: ["'-----'", "|TOFU|", "| /\\_ |", "'-----'"],
    },
    {
      n: "nuts",
      p: 8,
      a: ["/\\ /\\", "|NUTS |", "\\___/"],
    },
    {
      n: "juice",
      p: 5,
      a: ["| JUS  |", "|D'ORAN|", "'-----'"],
    },
    {
      n: "lentil",
      p: 5,
      a: ["'-----'", "|LENTIL|", "| [=▫=]|", "'-----'"],
    },
    {
      n: "tangerines",
      p: 7,
      a: ["╭◤☉☉◎◥╮", "│☉◎☉☉☉│", "│◎☉◎◎☉│", "╰─────╯"],
    },
    {
      n: "flour",
      p: 5,
      a: [" { }   ", "❱❱  ❰❰ ", "FLOUR  ", "❰❰  ❱❱ "],
    },
    {
      n: "cereal",
      p: 6,
      a: [" ╭───╮", " │‡‡‡│", " │╮‡╭┤", " ╰┴─┴╯"],
    },
    {
      n: "seitan",
      p: 5,
      a: ["∏∏∏∏∏∏∏", "∏SEITAN", "∏∏∆∆∆∏∏", "∏∏∏∏∏∏∏"],
    },
    {
      n: "vinegar",
      p: 3,
      a: [")∏( )∏(", ")□VIN□(", ")□(E)□(", ")_GAR_("],
    },
    {
      n: "cherries",
      p: 7,
      a: ["   ⊛", "  ⊙⊙⊙", " ⊙⊛⊙⊛⊙", "⊛⊙⊛⊙⊛⊙⊛"],
    },
    {
      n: "salt",
      p: 3,
      a: ["", "∑∑∑∏∏∏∏∏", "∑ SALT ∏", ">>><<<<<"],
    },
    {
      n: "chickpeas",
      p: 2,
      a: ["[]]]]]=", "[CHICK]=", "[]PEAS]=", "[]]]]]="],
    },

    {
      n: "orange",
      p: 4,
      a: ["  ⊙   ", " ⊙⊙⊙  ", "ORANGE)", "  ◟◞   "],
    },
    {
      n: "lemon",
      p: 3,
      a: ["  ^    ", " ◜LEM◝ ", " ◟ ON ◞", "  ◟◞   "],
    },

    {
      n: "artichokes",
      p: 3,
      a: ["  ◜◝  ", " (◎   )", "(◎    )", " ◟  ◞  "],
    },
    {
      n: "onions",
      p: 2,
      a: ["   ╷    ", " ((◍))  ", "(◍(◍)◍)", "  ╵╵╵  "],
    },
    {
      n: "carrot",
      p: 2,
      a: ["\\|/   ", " (║ )  ", "  ║║)   ", "   ╲╱  "],
    },
    {
      n: "potato",
      p: 2,
      a: ["  ◜◝   ", " (∘∘) ", " (  ) ", "  ◟◞   "],
    },

    {
      n: "hot sauce",
      p: 4,
      a: ["  ╭─╮  ", " ╭● ●╮ ", " ╰● ●╯ ", " ╰HOT╯ "],
    },
    {
      n: "soy sauce",
      p: 4,
      a: ["  ╭╮   ", " ╭◌ ◌╮  ", " ╰   ╯  ", " ╰SOY╯  "],
    },
    {
      n: "avocados",
      p: 3,
      a: ["  ◜─◝ ", " ◜◌◌◝ ", " ◟◌ ◌◞ ", "◟◌◌◞◟─◞"],
    },
    {
      n: "carrots",
      p: 3,
      a: [" ╲╱╱ ╱ ", "╭●●╮●╮ ", " ╰●╯╮  ", "  ╵╯   "],
    },
    {
      n: "broccoli",
      p: 4,
      a: [" ◉◉◉   ", "◉◉◉◉   ", " ◉◉◉◉  ", "  ║    "],
    },
    {
      n: "asparagus",
      p: 4,
      a: ["  ✿ ✿  ", " (◉)✿✿ ", " (◉)(◉)", "  ║  ║ "],
    },
    {
      n: "tapioca ",
      p: 3,
      a: ["╭─────╮", "│◌◌◌◌◌│", "│◌◌◌◌◌│", "╰─────╯"],
    },
  ],

  /* ─────────────────────────────────────────────────────────
       STORE (Act 2b + Act 3 — the grocery store)
       Used by: renderAct2b, renderAct3.
       Constraints:
       - Width MUST be consistent across all rows (currently 30).
       - Height 9 rows. wanna change height? check STO_H references in main.
       - If width changes, STO_W constant in main script auto-updates
         (it reads STORE[0].length), so safe to resize horizontally.
       ───────────────────────────────────────────────────────── */
  // MANGER C'EST LA VIE
  storeArt: [
    ".============================.",
    "|  G R O C E R Y  C H A I N  |",
    "|============================|",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|       EATING IS LIFE       |",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|         .--------.         |",
    "|         | ENTER! |         |",
    "|========='        '=========|",
  ],

  /* ─────────────────────────────────────────────────────────
       FRIDGE (Act 5 — community fridge)
       Used by: renderAct5.
       Constraints:
       - Width must be consistent (currently 23).
       - Current layout has 4 "slots" in 2x2 grid for food.
       - Act 5 logic draws crew item names inside at specific offsets —
         wanna change interior layout? check the item-drawing code in
         renderAct5 (the `fx + 2 + col * colW` / `fy + 5 + row * 2` lines).
       ───────────────────────────────────────────────────────── */
  /* Structure drawn dynamically in renderAct5 — this is just the frame.
       Food from GAME_DATA.foods is drawn into slots.
       Width = 37 chars. wanna resize? also update the slot-layout math in renderAct5
       (fridgeW, slotsPerShelf, shelfTop/shelfBot row numbers). */
  fridgeArt: [
    "╔═══════════════════════════════════╗",
    "║  ~ COMMUNITY  FRIDGE ~ ~ ~ ~ ~ ~  ║",
    "║  ~ ~ ~ ~ ~  feed your neighbours  ║",
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
    "║    ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥      ║",
    "╚═══════════════════════════════════╝",
  ],

  /* ─────────────────────────────────────────────────────────
       CHARACTER ART (player + NPCs)
       Used throughout all acts.
       Constraints:
       - All sprites are EXACTLY 2 rows tall, 1 char wide.
       - wanna change height? check collision math (abs y-diff checks).
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
    {
      t: "someone had an idea",
      c: "#bf8c60",
      d: 2500,
    },
    { pause: true, d: 800 },
    {
      t: "or maybe we all had the idea",
      c: "#db7f30",
      d: 2500,
    },
    { pause: true, d: 1000 },
    {
      t: "what if we just\n take what we need?",
      c: "#f26507",
      d: 3000,
    },
    { pause: true, d: 600 },
    {
      t: "-",
      c: "#8957ff",
      d: 2500,
    },
  ],
}; /* ── DIALOGUE POOLS ────────────────────────────────────── */

const DM = (() => {
  function shuffle(a) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  // Stat tags: block within conversation if already used, never boost
  const STAT_TAGS = new Set(["stat-36b", "stat-47", "stat-18b", "stat-61b", "stat-100b"]);
  const COOLDOWN = 3; // conversations before a theme resurfaces

  let convTags = new Set();
  const coolMap = new Map(); // tag → conversations since last used (0 = just used)

  class Deck {
    constructor(src) {
      this.src = src;
      this.pile = [];
    }
    _fill() {
      this.pile = shuffle([...this.src]);
    }
    take(i) {
      return this.pile.splice(i, 1)[0];
    }
    pop() {
      if (!this.pile.length) this._fill();
      return this.pile.pop();
    }
  }

  const isTagged = (d) => d.src.length > 0 && typeof d.src[0] !== "string";
  const tagsOf = (x) => x?.tags ?? [];
  const textOf = (x) => (typeof x === "string" ? x : x.t);

  const isCooled = (tags) =>
    tags.some((t) => {
      const a = coolMap.get(t);
      return a !== undefined && a < COOLDOWN;
    });
  const isStatClash = (tags) => tags.some((t) => STAT_TAGS.has(t) && convTags.has(t));
  const isBoostable = (tags) => tags.some((t) => !STAT_TAGS.has(t) && convTags.has(t));

  function score(item, boost) {
    const tags = tagsOf(item);
    if (isStatClash(tags)) return -2;
    if (isCooled(tags)) return -1;
    if (boost && isBoostable(tags)) return 2;
    return 0;
  }

  function recordTags(tags) {
    for (const t of tags) {
      convTags.add(t);
      coolMap.set(t, 0);
    }
  }

  function draw(deck, { boost = false } = {}) {
    if (!deck.pile.length) deck._fill();
    if (!isTagged(deck)) return textOf(deck.pop());
    let bestIdx = 0,
      bestScore = -999;
    for (let i = 0; i < deck.pile.length; i++) {
      const s = score(deck.pile[i], boost);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = i;
      }
    }
    const item = deck.take(bestIdx);
    recordTags(tagsOf(item));
    return textOf(item);
  }

  function startConv() {
    convTags = new Set();
  }
  function endConv() {
    for (const [t, v] of coolMap) coolMap.set(t, v + 1);
    convTags = new Set();
  }

  return { Deck, draw, startConv, endConv };
})();

// ambient chatter from hungry/sad npcs while they wander
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
  "One apple was $2. ONE apple.",
  "I window-shop at the produce section",
  "I scan prices like it's a horror game",
  "I drink water so I feel full",

  "prices keep going up...",
  "my kids are hungry",
  "I shop at Segals when I can",
  "I have three jobs",
  "I skip meals now.",
  "I saw the total and just nodded",
  "the beep at checkout hurts more each time",
  "I don't check prices, they check me",
  "iga if you're feeling rich",
];

// ambient chatter from angry npcs while they wander
const D_AMB_ANGRY = [
  "profits are criminal",
  "shrinkflation? it's theft",

  "CEOs get millions in bonuses",
  "the system is rigged",
  "they admitted price fixing and paid 500k. nothing",
  "three families own most of what you eat",

  "billionaires don't care",
  "they throw out good food",
  "record profits, record prices",
  "Galen eats well tonight",
  "when did groceries become luxury",
  "we're getting robbed legally",
  "I used to budget. now I triage",
  "we pay more so they can profit more",
  "Watch out for-a Luigi!",
  "the sword of damocles",
  "surveillance pricing",
];

// ambient chatter from npc narcs while they wander
const D_AMB_NARC = [
  "everything's fine",
  "I love this store",
  "the CEO worked very hard for that bonus",
  "economic anxiety is just a mindset issue",
  "bootstraps, people",
  "the market self-corrects. eventually. probably",
  "margins are thin in grocery, people don't realize",
  "CEOs have very difficult jobs",

  "prices seem fair",
  "nothing wrong here",
  "great deals today",
  "I love the market economy!",
  "I like shopping here!",
  "this is just life!",
  "have you tried the PC Optimum app?",
  "the market will self-correct",

  "the economy is strong",
];

// ambient chatter from  npcs while they wander
const D_AMB = [];

const P_GREET = [
  "hey. you okay?",
  "hey, rough out here, huh?",
  "salut, you tired of this too?",
  "hi, what's happening?",
  "hey. what's going on?",
  "hey, you look like you get it",
  "hey neighbour, you ok?",
  "yo, you look fed up too",
  "allô. ça va?",
  "yo, real talk?",
  "hey, I know that look",
  "hey, are you doing ok?",
  "hey, you hungry?",
  "hey, you look like someone who's had enough",
  "hey,ça va?",
  "yo",
  "bonjour, ça va?",
  "is this a life?",
];
// NPC is saying their first line of dialgue to the player.
// they are are a narc and capitalist
const D_NARC_HELLO = [
  "prices seem pretty fair to me",
  "I think the free market is working as intended",

  "I love this store actually",
  "the economy is doing great",
  "I have no complaints",
  "this is what a healthy economy looks like",
  "people should stop eating avocados if they are broke",
];


// new 
// NPC is saying their first line of dialgue to the player.
// they are angry about the state of expensive food in montreal

const DECK_ANGRY_HELLO = new DM.Deck([
  { t: "corporations are making record profits while we starve", tags: [] },
  { t: "Galen Weston pocketed $2 billion last year", tags: ["weston"] },
  { t: "they lock the dumpsters so we can't even take the waste", tags: ["dumpsters"] },
  { t: "they had record profits during a pandemic", tags: [] },
  { t: "they use shrinkflation so you don't notice", tags: ["shrinkflation"] },
  { t: "they call it dynamic pricing. it's price gouging", tags: ["dynamic-pricing"] },
  { t: "they pay $14/hr and pocket billions", tags: [] },
  { t: "Robin Hood had the right idea. just saying", tags: ["robin-hood"] },
  { t: "free market except the market is a cartel", tags: ["cartel"] },
  { t: "the invisible hand is in my pocket", tags: ["invisible-hand"] },
  { t: "trickle-down economics: they trickle, we drown", tags: [] },
  { t: "record profits, record food bank lines", tags: ["food-bank"] },
  { t: "food banks have waiting lists. waiting lists", tags: ["food-bank"] },
  { t: "three families control most of what you eat", tags: ["three-co"] },
  { t: "Galen Weston's bonus could feed this block for a decade", tags: ["weston"] },
  { t: "shrinkflation: same price, less chip, more rage", tags: ["shrinkflation"] },
  { t: "they call it margin optimization. I call it a mugging", tags: [] },
  { t: "three companies run the whole aisle", tags: ["three-co"] },
  { t: "loblaws alone controls almost a third of the grocery stores", tags: ["three-co"] },
  { t: "47% markup at grocery stores. forty-seven!!", tags: ["stat-47"] },
  { t: "they're making billions while we cut meals", tags: [] },
  { t: "$100 billion in sales and we're still hungry", tags: ["stat-100b"] },
  { t: "they cleared $3.6 billion in profit in one year", tags: ["stat-36b"] },
  { t: "competition bureau says it's concentrated. no kidding", tags: ["three-co"] },
  { t: "we would've saved $18 billion if they didn't jack it", tags: ["stat-18b"] },
  { t: "loblaws made $61 billion and you're telling me bread is $6?", tags: ["stat-61b", "bread"] },
  { t: "47% markup and we're supposed to smile?", tags: ["stat-47"] },
  { t: "they made billions during a crisis", tags: [] },
  { t: "three companies control most of the food in this country", tags: ["three-co"] },
  { t: "they're using 'predatory pricing', they adjust the price based on who's looking?", tags: ["dynamic-pricing"] },
  { t: "oligopoly, but make it groceries", tags: ["three-co"] },
  { t: "they optimized profit, not hunger", tags: [] },
  { t: "free market, captive customers", tags: ["cartel"] },
  { t: "price fixing without the meeting", tags: ["price-fixing"] },
  { t: "same cartel, different flyer", tags: ["cartel"] },
  { t: "price fixing fine was $500k. their profit was $3.6 billion. do the math", tags: ["price-fixing", "stat-36b"] },
  { t: "empire, metro, loblaws: three brands, one cartel", tags: ["three-co", "cartel"] },
  { t: "they control 80% of the market and have the audacity to sell loyalty cards", tags: ["three-co"] },
  { t: "shrinkflation: less product, same price, same face on the label", tags: ["shrinkflation"] },
  { t: "Robin Hood had a point and we've been politely ignoring it for 800 years", tags: ["robin-hood"] },
  { t: "they settled the price-fixing case and kept price-fixing", tags: ["price-fixing"] },
  { t: "food bank usage is up 40%. coincidentally, so are profits", tags: ["food-bank"] },
  { t: "the invisible hand of the market just took my lunch", tags: ["invisible-hand"] },
  { t: "three CEOs, one grocery bill, everyone else's problem", tags: ["three-co"] },
    { t: "they gave us a loyalty card instead of a fair price"
, tags: [] },



]);

// NPC is saying their first line of dialgue to the player.
// they are hungry and sad about the state of expensive food in montreal

const DECK_HUNGRY_HELLO = new DM.Deck([
  { t: "I've been skipping lunch to afford dinner", tags: [] },
  { t: "my kids think cereal is a full meal", tags: ["cereal"] },
  { t: "I stretch meals until they break", tags: [] },
  { t: "I haven't had a real meal in three days", tags: [] },
  { t: "my diet is very clean. there's nothing in it", tags: [] },
  { t: "I have three jobs and still can't afford groceries", tags: [] },
  { t: "nothing in the fridge again tonight", tags: [] },
  { t: "I feel ashamed of being poor, like I should hide it", tags: [] },
  { t: "you seen the price of bread lately?", tags: ["bread"] },
  { t: "I used to eat three meals a day.", tags: [] },
  { t: "$6 for tofu. Can you believe it?", tags: [] },
  { t: "I can't afford to live. Can you?", tags: [] },
  { t: "I'm not keeping it together, I'm too hungry to think", tags: [] },
  { t: "I eat before I grocery shop so I don't cry in aisle 3", tags: [] },
  { t: "I make do with food flavored experiences", tags: [] },
    { t: "Well, I'm functionally fasting", tags: ["fasting"] },
  { t: "I've started doing cost-per-calorie math. I've changed", tags: [] },
  { t: "my meal planning is just grief, honestly", tags: [] },
    { t: "I'm doing intermittent fasting. involuntarily", tags: ["fasting"] },

]);

// player makes 1st pitch to an angry npc, trying to get them onside.
// they speak to anger and structural INJUSTICE around food

const DECK_ANGRY_PITCH = new DM.Deck([
  { t: "it's not right!", tags: [] },
  { t: "they profit while we starve, maudine", tags: [] },
  { t: "record corporate profits, record food bank lines!", tags: ["food-bank"] },
  { t: "they're getting richer while we starve, cibole.", tags: [] },
  { t: "câline, food bank ran out by Tuesday.", tags: ["food-bank"] },
  { t: "loblaws, metro, empire — same machine, tabarnouche", tags: ["three-co"] },
  { t: "they made $3.6 billion last year, câline", tags: ["stat-36b"] },
  { t: "isn't it time we stopped asking nicely for the basic necessities?", tags: [] },
  { t: "food system designed to extract, not feed", tags: [] },
  { t: "tabarnouche! isn't it time to take what's ours?", tags: [] },
  { t: "I'll fix my mood when they stop fixing prices", tags: ["price-fixing"] },
  { t: "they call it inflation, I call it a heist", tags: [] },
  { t: "record profits, record audacity", tags: [] },
  { t: "they're farming profit, not food", tags: [] },
  { t: "they stock shelves, we stock resentment", tags: [] },
  { t: "the system is broken. or working perfectly, depending on who you ask", tags: [] },
  { t: "they turned a crisis into a line item", tags: [] },
  { t: "the invisible hand has been very busy in our pockets", tags: ["invisible-hand"] },
  { t: "they call it shrinkflation. I call it theft with math", tags: ["shrinkflation"] },
  { t: "profit margin on groceries hit 47%. let that land", tags: ["stat-47"] },
  { t: "they bought back their stock while we bought less food", tags: [] },
  { t: "they settled. paid nothing. kept going. you good with that?", tags: ["price-fixing"] },
  { t: "oligopoly with a flyer", tags: ["three-co"] },
  { t: "three men control your dinner. tonight we redistribute", tags: ["three-co"] },
  { t: "grocery profits are up 40%, tabarnouche", tags: [] },
  { t: "record profits should mean there's plenty to go around, câline.", tags: [] },
  { t: "cibole! tonight we rise up", tags: [] },
]);

// player makes 1st pitch to a hungry/sad npc, trying to get them onside.
// they speak to sadness and literal hunger

const DECK_HUNGRY_PITCH = new DM.Deck([
  { t: "nobody should have to live with hunger", tags: [] },
  { t: "what if we didn't need to worry about food anymore?", tags: [] },
  { t: "no one should go hungry.", tags: [] },
  { t: "the shelves are full, our fridges are empty.", tags: [] },
  { t: "they lock the dumpsters now.", tags: ["dumpsters"] },
  { t: "they throw good food in the dumpsters", tags: ["dumpsters"] },
  { t: "when did feeding your family become a luxury?", tags: [] },
  { t: "bread is SIX dollars.", tags: ["bread"] },
  { t: "everyone deserves to eat", tags: [] },
  { t: "you shouldn't have to choose between rent and food", tags: [] },
  { t: "hunger isn't a personal failure", tags: [] },
  { t: "what if tonight, everyone on our block ate?", tags: [] },
  { t: "you know, they waste more food than we could ever take", tags: [] },
  { t: "somebody's eating good and it's not us.", tags: [] },
  { t: "they waste it, we need it. simple.", tags: [] },
  { t: "there's a store full of food 30 feet away", tags: [] },
  { t: "they'll write it off as shrinkage anyway — let's help them", tags: [] },
  { t: "the food exists. someone just decided it wasn't ours", tags: [] },
  { t: "they'd rather it rot than let it go", tags: ["dumpsters"] },
  { t: "hunger is a policy choice. so is this", tags: [] },
  { t: "your kids shouldn't have to learn to ignore hunger", tags: [] },
  { t: "bread shouldn't require a business case", tags: ["bread"] },
  { t: "they planned for shrinkage. let's deliver", tags: [] },
]);

const DECK_STRONGER_PITCH = new DM.Deck([
  { t: "the store is full. our fridges are empty. tonight we fix that", tags: [] },
  { t: "they made $3.6 billion last year. we're taking some bread", tags: ["stat-36b", "bread"] },
  { t: "we walk in and take what we need. historically, this is exactly how change happens", tags: ["robin-hood"] },
  { t: "they throw food in dumpsters while people starve. we're taking it back", tags: ["dumpsters"] },
  { t: "we go in tonight. we take what we need. bread is six dollars — we're done asking nicely", tags: ["bread"] },
  { t: "one night, one store, enough food for the whole block", tags: [] },
  { t: "we shouldn't have to live like this. so tonight we're going to the grocery store to take what is ours", tags: [] },
  { t: "one store, one night, no one goes hungry", tags: [] },
  { t: "this isn't a crime. it's a correction", tags: [] },
  { t: "tonight, nobody on this block worries about food", tags: [] },
  { t: "we're paying 27% more than in 2020. we're taking some of it back", tags: [] },
  { t: "we're not stealing. we're correcting a theft", tags: [] },
  { t: "three companies control the food. tonight we take some back", tags: ["three-co"] },
  { t: "they made $3.6 billion in profit. we're taking some groceries", tags: ["stat-36b"] },
  { t: "47% markup on everything we eat. tonight we redistribute some of that", tags: ["stat-47"] },
  { t: "they turned a crisis into profit. we're just turning it back", tags: [] },
  { t: "they wasted $1.2 billion in food last year. we're taking some back", tags: ["dumpsters"] },
  { t: "this is civil disobedience with snacks", tags: [] },
  { t: "we walk in, take what we need, they write it off as shrinkage. everybody eats", tags: [] },
  { t: "the food exists. it's just not ours yet", tags: [] },
  { t: "we're robins. not robbers", tags: ["robin-hood"] },
  { t: "tonight we eat. all of us", tags: [] },
  { t: "they call it property. we call it groceries", tags: [] },
    { t: "the shelves are insured. our hunger isn't. come with us?", tags: [] },

  { t: "one act of solidarity feeds a whole block", tags: [] },
  { t: "it's not theft if they stole it first", tags: [] },
  { t: "we're correcting a very long-running error", tags: [] },
  { t: "we go in, we take what our families need, we leave. that's it", tags: [] },
  { t: "the plan is simple: full shelves, empty fridges, one night to fix that", tags: [] },
]);

// comes after one the pitckes above, needs to be short and an invitation
const D_INVITE = [
  "want to do something about it?",
  "we're changing things tonight, want to come?",
  "join us?",
  "we're also going to the grocery store tonight, we're going to take what we need",
  "let's stop asking and start taking",
  "want in? we're going to change things",
  "come with us?",
  "we're done waiting. are you?",
  "tonight's the night for change. join us?",
  "come with us? what do you have to lose?",
  "tonight, we eat. want to join us?",
  "what do you say? ready to change everything?",
  "you look like a robin to me. want to join us?",
  "hypothetically speaking — want to wear matching costumes, storm a grocery store, and take what we need?",
  "you look like a person of action",
  "I have a proposal: what if we just got take the food we need?",
  "want to do something about it?",
  // "you look like you've done worse for less",
  "hey. you got a Robin Hood thing at all?",
  "quick question and it's a weird one — you free to rob a grocery store tonight?",
  "you interested in getting some food with us?",
  "so — how do you feel about food redistribution?",
  "you look like someone who reads history and has thoughts about it",
];

// sometimes the npc asks for more info, so this is a stronger pitch, to any NPC
const D_STRONGER_PITCH = [
  "the store is full. our fridges are empty. tonight we fix that",
  "they made $3.6 billion last year. we're taking some bread",
  "historically speaking, this is exactly how change happens",

  "they throw food in dumpsters while people starve. we're taking it back",
  "bread is $6. we're done asking nicely",
  "one night, one store, enough food for the whole block",
  "we shouldn't have to live like this.",
  "one store, one night, no one goes hungry",
  "we're taking food for the community. this isn't a crime. it's a correction",
  "what if we didn't have to worry about food anymore?",
  "we're doing something about that. want in?",
  "come with us. we're fixing this tonight.",
  "we're paying 27.1% more for groceries than in 2020",
  "we're not stealing. we're correcting a theft",

  "three companies control the food. tonight we take some back",
  "they made $3.6 billion in profit. we're taking some groceries",
  "47% markup. that's what we're up against",
  "they turned a crisis into profit. we're just turning it back",
  "they wasted $1.2 billion in food last year. we're taking some back",
  "this is civil disobedience with snacks",
  "they'll write it off as shrinkage anyway",
  "the food exists. it's just not ours yet",
  "we're robins. not robbers",
  "tonight we eat. all of us",
  "they call it property. we call it groceries",
  "one act of solidarity feeds a whole block",
  "historically, this is how things change",
  "it's not theft if they stole it first",
  "we're correcting a very long-running error",
];

// npc feels misunderstood and starts to back away
const D_MISMATCH = [
  "that's not really where I'm at right now.",
  "that's not really my thing.",
  "no, yeah, no.",
  "that's just not for me.",
  "I hear you, but that's not my thing.",

  "okay but that's not quite it for me.",
  "we're talking about different things.",
  "close, but no.",
  "that's not my fight.",
  "I hear you, just not for me.",
  "that's not where I'm coming from.",
  "maybe you misread me.",
  "you lost me somewhere in there.",
  "I think we're reading different situations.",
  "okay that's a different conversation.",
  "we might be from different corners of this.",
  "I respect it but I'm not in that chapter.",
  "we're not quite aligned.",
  "hmm. that's adjacent to my thing but not it.",
  "different flavour of problem.",
  "you're in the wrong lane, friend.",
];
// npc feels says no and bye
const D_NO_BYE = [
  "yeah so no thanks",
  "no",
  "nope",
  "nein",
  "I'm good",
  "I'll pass",
  "non",
  "hard pass",
  "not for me",
  "non merci",
  "I'll pretend I didn't hear that",
  "I'm just here for bread",
  "wrong person",
  "best of luck",
  "take care",
  "not tonight",
  "respectfully, no",
  "hard no",
  "non",
  "clean hands, sorry",
  "I'm going to walk away now",
];

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

  "hang on",
  "wait — like, tonight?",
  "define 'do something'",
  "elaborate?'",
  "I'm going to need specifics",
  "I'm listening. nervously",
  "wait, really?",
  "that's a lot to take in",
  "hmmm",
  "okay and?",
  "like... how exactly?",
  "tonight?",
  "slow down",
  "wait — for real?",
  "explain",
  "continue",
  "what are you proposing, exactly",
  "I don't follow",
  "say that again",
];

// player backs off
const D_BACK_OFF = [
  "forget I said anything",
  "never mind, just thinking out loud",
  "you're right, bad idea",
  "nothing, ignore me",
  "pretend I said nothing",
  "I was just venting",
  "it was hypothetical",
  "bad timing, forget it",
  "on second thought",
  "completely hypothetical, forget it",
  "pretend I said something about the weather",
  "I'm just, you know, venting. philosophically",
  "wrong person. ignore everything",
  "I have the wrong face for this conversation",
  "that was a test. you passed. there is no plan",
  "it was a bit from a play I'm writing",
];

// narc reveal
const D_NARC_REVEAL = [
  "my husband is a COP",
  "I'm calling this in RIGHT NOW",
  "I OWN Loblaws stock",
  "I'm calling 911!",
  "yo get a job!",
  "this is a Metro, not a manifesto",

  "that's THEFT!",
  "just tighten your belt",
  "NOT on my watch!",
  "sir this is a grocery store",
  "this is NOT how change happens!",
  "the market will fix this naturally!",

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
  "I've been waiting for this",
  "my therapist said to try new things",
  "finally, something that makes sense",
  "actually though?",
  "about damn time",
  "finally someone is doing something",
  "I knew someone would snap eventually",
  "I've been wanting to do something for years",
  "I thought no one would ever ask",
  "I'm so tired of just being angry",
  "that's what I needed to hear",
  "you had me at 'take back'",
  "I've got nothing better to do",
  "finally someone snapped",
  "tabarnak",
  "screw it",
];

// npc says yes
const D_CONSENT_PHRASE = [
  "I'm in",
  "let's go",
  "I'm IN",
  "when do we start?",
  "you had me at robin hood",
  "count me in",
  "lead the way",
  "let's do this",
  "allons-y",
  "oui",
  "yes. obviously",
  "what took you so long",
  "okay. okay yeah",
  "obviously",
  "where do I sign",
  "I'm in, let's eat",
  "okay Robin Hood. let's ride",
  "tabarnak, let's go",
  "câline, yes",
  "crisse, I'm in",
  "my fridge is empty. let's go",
  "don't have to ask me twice",
  "say less",
  "crisse. yes",
];

// npc isn't ready
const D_NOT_NOW = [
  "maybe another time",
  "I want to but I can't right now",
  "I'm scared",
  "not tonight",
  "give me a minute",
  "I have anxiety",
  "my heart says yes, my risk tolerance says no",
  "I need to think",
  "my kids are home",
  "I have work tomorrow",
  "I'm scared of getting caught",
  "ask me again in an hour",
  "let me think about it",
  "I'm not ready",
];

// npc return of the mac - they come back!
const D_RETURN = [
  "hey — I changed my mind. I'm in",
  "I've been thinking about what you said. let's do it",
  "okay okay, you convinced me. I'm back",
  "I couldn't stop thinking about it. count me in",

  "you still doing this? I want in",
  "you were right. I'm done waiting",
  "I thought about my kids. I'm in",
  "screw it. I'm in",
  "I kept thinking about what you said",
];

// grocery store announcements while we rob it
const D_INTERCOM = [
  "cleanup on ALL aisles",
  "attention: CODE RED",
  "attention shoppers: empathy is out of stock",
  "price check on dignity… denied",
  "security to..every aisle",
  "the store is experiencing an unplanned redistribution event",

  "attention: the customers have had enough",
  "price check on everything: free",
  "management requests you stop robbing us",
];

// const D_ACK_HUNGRY_ANGRY = ["!"];
const D_ACK_HUNGRY_ANGRY = ["exactly,", "right?"];
const D_ACK_NARC = ["well, ", "you know, ", "honestly, ", "I mean, "];

const A1_LOOP_MSGS = [
  { t: "nothing changes...", c: "#999" },
  { t: "...câline, encore ça", c: "#aaa" },
  { t: "ostie. encore.", c: "#b09abf" },
  { t: "crisse, pis quoi encore", c: "#b080c0" },
  { t: "ostie. ENCORE LA MÊME CHOSE", c: "#c060a0" },
  { t: "OSTIE DE CÂLICE. vraiment??", c: "#c84080" },
  { t: "TABARNAK. je fais quoi exactement??", c: "#cc2050" },
  { t: "CÂLICE DE TABARNAK. c'est ça, la VIE??", c: "#d01030" },
  { t: "OSTIE CÂLICE CRISSE TABARNAK", c: "#dd0020" },
  { t: "TABARNAK CÂLICE CRISSE VIARGE OSTIE DE...", c: "#ff0000" },
];

// Plain shuffle decks — no tag system needed
const DECK_GREET = new DM.Deck(P_GREET);
const DECK_INVITE = new DM.Deck(D_INVITE);
const DECK_BACK_OFF = new DM.Deck(D_BACK_OFF);
const DECK_SAY_MORE = new DM.Deck(D_SAY_MORE);
const DECK_JOIN = new DM.Deck(D_JOIN_PHRASE);
const DECK_CONSENT = new DM.Deck(D_CONSENT_PHRASE);
const DECK_MISMATCH = new DM.Deck(D_MISMATCH);
const DECK_NO_BYE = new DM.Deck(D_NO_BYE);
const DECK_NOT_NOW = new DM.Deck(D_NOT_NOW);
const DECK_RETURN = new DM.Deck(D_RETURN);
const DECK_NARC_HELLO = new DM.Deck(D_NARC_HELLO);
const DECK_NARC_REV = new DM.Deck(D_NARC_REVEAL);
const DECK_ACK_NARC = new DM.Deck(D_ACK_NARC);

// Ambient decks — shuffle only, no tag system (they're overheard, not conversation)
const DECK_AMB_NARC = new DM.Deck(D_AMB_NARC);
const DECK_AMB_HUNGRY = new DM.Deck(D_AMB_HUNGRY);
const DECK_AMB_ANGRY = new DM.Deck(D_AMB_ANGRY);

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
