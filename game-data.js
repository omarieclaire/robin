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
            art: [
                "  ^   ",
                "/.  .\\",
                "|.  .|",
                "|DEP |",
            ],
        },

        {
            name: "Walkup",
            size: 6,
            art: [
                "◢▓▓▓▓◣",
                "| [] |",
                "|    |",
                "| [] |",
            ],
        },
        {
            name: "Duplex",
            size: 6,
            art: [
                "▮◤◤◤◤▮",
                "┇┌┐┌┐┇",
                "┇└┘└┘┇",
            ],
        },
        {
            name: "Triplex",
            size: 6,
            art: [
                "|++++|",
                "|    |",
                "|    |",
                "|    |",
            ],
        },
        {
            name: "Tabac",
            size: 6,
            art: [
                "┌────┐",
                "|TABK|",
                "|░░░░|",
            ],
        },
        {
            name: "Boulangerie",
            size: 6,
            art: [
                "┌────┐",
                "|BOUL|",
                "|════|",
            ],
        },
        {
            name: "Pharmacie",
            size: 6,
            art: [
                "┌────┐",
                "|[+] |",
                "|PHAR|",
            ],
        },

        // added narrow
        {
            name: "SWIRL",
            size: 6,
            art: [
                "┌~~~~┐",
                "|SWRL|",
                "|YUM |",
            ],
        },
        {
            name: "SAQ",
            size: 6,
            art: [
                "╱────╲",
                "│ SAQ│",
                "│VINS│",
            ],
        },
        {
            name: "BIXI",
            size: 6,
            art: [
                " **** ",
                "|BIXI|",
                "/====\\",
            ],
        },
        {
            name: "Samosa King",
            size: 6,
            art: [
                "┌────┐",
                "|SMOS|",
                "| $1 |",
            ],
        },
        {
            name: "Gnocchi",
            size: 6,
            art: [
                "┌────┐",
                "|GNOC|",
                "| $5 |",
            ],
        },

        /* ── REGULAR (size 9) ─── */
        {
            name: "Umami",
            size: 9,
            art: [
                "   ~~~   ",
                "╔═══~═══╗",
                "‖⟦⟦⟦~⟧⟧⟧‖",
                "‖≋umami≋‖",
                "‖▤▤□✀□⚝▤‖",
            ],
        },
        {
            name: "L'Escalier",
            size: 9,
            art: [
                "╭L'ESCA─╮",
                "│ LIER  │",
                "│ ♪ ★ ♫ │",
            ],
        },
        {
            name: "Cinéma Beaubien",
            size: 9,
            art: [
                "╔CINEMA═╗",
                "║BEAUBIEN",
                "║ ◢▓▓◣  ║",
                "║ 1938  ║",
            ],
        },
        {
            name: "Sala Rossa",
            size: 9,
            art: [
                "╭SALA───╮",
                "│ ROSSA │",
                "│ R0SSA │",
                "│       │",
            ],
        },
        {
            name: "Arepera",
            size: 9,
            art: [
                "╭AREPERA╮",
                "│ ◢■◣   │",
                "│ ★ ✦ ★ │",
            ],
        },
        {
            name: "Dei Campi",
            size: 9,
            art: [
                "╭DEI────╮",
                "│ CAMPI │",
                "│ CAFFE │",
                "│ ✧  ◉  │",
            ],
        },
        {
            name: "La Vitrola",
            size: 9,
            art: [
                "╭LA─────╮",
                "│VITROLA│",
                "│ ♫  ♪  │",
            ],
        },
        {
            name: "Segal's",
            size: 9,
            art: [
                "╭SEGALS─╮",
                "│ FRESH │",
                "│ ★★★★★ │",
            ],
        },

        // added regular
        {
            name: "Foufounes",
            size: 9,
            art: [
                "╔FOUFOU═╗",
                "║NES    ║",
                "║ ϟϟϟϟ  ║",
                "║ELECTR ║",
            ],
        },
        {
            name: "Quai des Brumes",
            size: 9,
            art: [
                "╭QUAI───╮",
                "│ DES   │",
                "│BRUMES │",
            ],
        },
        {
            name: "Club Soda",
            size: 9,
            art: [
                "╭CLUB───╮",
                "│ SODA  │",
                "│ MUSIC │",
            ],
        },
        {
            name: "Pikolo",
            size: 9,
            art: [
                "╭PIKOLO─╮",
                "│ CAFE  │",
                "│       │",
            ],
        },
        {
            name: "Wilensky's",
            size: 9,
            art: [
                "╭───────╮",
                "│WILENSK│",
                "│ Y'S   │",
                "│ DELI  │",
            ],
        },
        {
            name: "Fairmount Bagel",
            size: 9,
            art: [
                "╭───────╮",
                "│FAIRMNT│",
                "│BAGELS │",
                "│ ◯ ◯ ◯ │",
            ],
        },
        {
            name: "St-Viateur Bagel",
            size: 9,
            art: [
                "╭───────╮",
                "│ST-VIAT│",
                "│ BAGEL │",
                "│ ◯  ◯  │",
            ],
        },
        {
            name: "Boustan",
            size: 9,
            art: [
                "╱╲╱╲╱╲╱╲╱",
                "│BOUSTAN│",
                "│SHAWRMA│",
                "│ GOOD! │",
            ],
        },
        {
            name: "Café Olimpico",
            size: 9,
            art: [
                "╭OLIMPIC╮",
                "│ESPRESO│",
                "│ CAFFE │",
                "│ 1970  │",
            ],
        },
        {
            name: "Phonopolis",
            size: 9,
            art: [
                "╭───────╮",
                "│{PHONO}│",
                "│ POLIS │",
                "│ ♪  ♫  │",
            ],
        },
        {
            name: "Benelux",
            size: 9,
            art: [
                "╭───────╮",
                "│BENELUX│",
                "│ BIERE │",
                "│ ♨ ♨ ♨ │",
            ],
        },
        {
            name: "Phi Centre",
            size: 9,
            art: [
                "╔══PHI══╗",
                "║◉ ART ◉║",
                "║▓▓▓▓▓▓▓║",
            ],
        },
        {
            name: "Chatime",
            size: 9,
            art: [
                "╭───────╮",
                "│CHATIME│",
                "│BUBBLE │",
                "│  TEA  │",
            ],
        },
        {
            name: "Beauty's",
            size: 9,
            art: [
                "╭───────╮",
                "│BEAUTY'│",
                "│S LUNCH│",
                "│ *<>*  │",
            ],
        },
        {
            name: "Cabaret Mile End",
            size: 9,
            art: [
                "▁CABARET▁",
                "│ MILE  │",
                "│  END  │",
                "│ STAGE │",
            ],
        },
        {
            name: "Santropol",
            size: 9,
            art: [
                "╭───────╮",
                "│SANTROP│",
                "│  OL   │",
                "│ (___) │",
            ],
        },
        {
            name: "Marché PA",
            size: 9,
            art: [
                "╔MARCHE═╗",
                "║  PA   ║",
                "║GROCERY║",
            ],
        },
        {
            name: "Cheval Blanc",
            size: 9,
            art: [
                "╭───────╮",
                "│CHEVAL │",
                "│ BLANC │",
                "│ BIERE │",
            ],
        },
        {
            name: "Les Petits Frères",
            size: 9,
            art: [
                "╭───────╮",
                "│PETITS │",
                "│FRERES │",
                "│ ★ ♥ ★ │",
            ],
        },
        {
            name: "Renaissance",
            size: 9,
            art: [
                "╭───────╮",
                "│RENAIS │",
                "│ SANCE │",
                "│THRIFT │",
            ],
        },
        {
            name: "Myriade",
            size: 9,
            art: [
                "┌✺─✺─✺─✺┐",
                "│       │",
                "│MYRIADE│",
            ],
        },
        {
            name: "Palais Royale",
            size: 9,
            art: [
                "▀PALAIS▀▀",
                "█ROYALE  █",
                "█ RESTO █",
            ],
        },
        {
            name: "Casa d'Italia",
            size: 9,
            art: [
                "╔═CASA══╗",
                "║D'ITALI║",
                "║ ★ ★ ★ ║",
                "║CULTURA║",
            ],
        },
        {
            name: "Cinéma du Parc",
            size: 9,
            art: [
                "▀CINEMA▀▀",
                "█ DU    █",
                "█ PARC  █",
                "█ ◢▓▓◣  █",
            ],
        },
        {
            name: "Maynard's",
            size: 9,
            art: [
                "╭───────╮",
                "│MAYNARD│",
                "│POUTINE│",
                "│  ✷✷   │",
            ],
        },
        {
            name: "McCord",
            size: 9,
            art: [
                "▀McCORD▀▀",
                "█       █",
                "█ ◢■◣◢■◣█",
            ],
        },

        /* ── WIDE (size 13) ─── */
        {
            name: "Notre-Dame",
            size: 13,
            art: [
                "     /\\      ",
                "    /  \\     ",
                "   /NOTRE\\   ",
                "  | DAME  |  ",
                "  | ★ ✦ ★ |  ",
            ],
        },
        {
            name: "Cinéma L'Amour",
            size: 13,
            art: [
                "▮◤◤◤◤◤◤◤◤◤◤▮ ",
                "┇┌┐ ┌┐ ┌┐┌┐┇ ",
                "┇└┘║└┘ └┘└┘┇ ",
                "┇  CINEMA  ┇ ",
                "┇ L'AMOUR  ┇ ",
            ],
        },
        {
            name: "Parquette",
            size: 13,
            art: [
                "╭───────────╮",
                "│ PARQUETTE │",
                "│ ★ ✧ ★ ✧ ★ │",
                "│░.  ░.  ░░ │",
            ],
        },
        {
            name: "Drawn & Quarterly",
            size: 13,
            art: [
                " /\\/\\/\\/\\/\\  ",
                "│DRAWN &    │",
                "│QUARTERLY  │",
                "│ COMICS    │",
            ],
        },
        {
            name: "Caserne 26",
            size: 13,
            art: [
                "    /\\       ",
                "  /    \\     ",
                " / FIRE  \\   ",
                "│ CASERNE  │ ",
                "│  ✧✧26✯✧  │ ",
            ],
        },

        // added wide

        {
            name: "Stade Olympique",
            size: 13,
            art: [
                "        ╱│   ",
                "       ╱  │  ",
                "      ╱   │  ",
                " STADE    │  ",
                "◢◣◢◣◢◣◣   │  ",
            ],
        },
        {
            name: "Biosphere",
            size: 13,
            art: [
                "    ╱◇◇◇◇╲   ",
                "   ◇◇◇◇◇◇◇   ",
                "  ◇◇◇◇◇◇◇◇◇  ",
                "   ◇◇◇◇◇◇◇   ",
                "    ╲◇◇◇◇╱   ",
            ],
        },
        {
            name: "Habitat 67",
            size: 13,
            art: [
                " ▓▓  ▓▓  ▓▓  ",
                "▓▓▓ ▓▓▓ ▓▓▓  ",
                "▓▓ 67  ▓▓ ▓▓ ",
                " ▓▓  ▓▓▓  ▓▓ ",
                "▓▓▓ ▓▓  ▓▓▓  ",
            ],
        },
        {
            name: "Place des Arts",
            size: 13,
            art: [
                "▀▀▀▀▀▀▀▀▀▀▀▀▀",
                "█ PLACE DES █",
                "█   ARTS    █",
                "█ ▢ ▢ ▢ ▢ ▢ █",
                "▔▔▔▔▔▔▔▔▔▔▔▔▔",
            ],
        },
        {
            name: "Marché Jean-Talon",
            size: 13,
            art: [
                "┌─━━━╋━━━━━─┐",
                "│  MARCHÉ   │",
                "│JEAN TALON │",
                "│  FARMERS  │",
                "└∞──∞∞──∞∞──┘",
            ],
        },
        {
            name: "Casa del Popolo",
            size: 13,
            art: [
                "┏━━╋━━╋━━╋━━┓",
                "│ CASA DEL  │",
                "│  POPOLO   │",
                "│  %%%%     │",
                "┗━━╋━━╋━━╋━━┛",
            ],
        },
        {
            name: "BAnQ",
            size: 13,
            art: [
                "┏━━━━━━━━━━━┓",
                "┃   BAnQ    ┃",
                "┣━━━━━━━━━━━┛",
                "┃    ┃       ",
                "┃    ┃       ",
                "┗━━━━┻━━━━━━ ",
            ],
        },
        {
            name: "SAT Société",
            size: 13,
            art: [
                "   ◢■■■■■◣   ",
                "╭───────────╮",
                "│    SAT    │",
                "│  SOCIETE  │",
                "│▓▓▓▓▓▓▓▓▓▓▓│",
            ],
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
            art: [
                "  ▀▀▀▀▀      ",
                " │VAN   │   ",
                "╯│HORNE │╰  ",
                "││ -------  ││",
                "││░UNDERPASS░││",
                "╮┴─────────┴╭",
            ],
        },
        {
            name: "Caserne 26",
            size: 13,
            art: [
                "    /\\       ",
                "  /    \\     ",
                " / FIRE  \\   ",
                "│ CASERNE  │ ",
                "│  ✧✧26✯✧  │ ",
                "╰───────────╯",
            ],
        },
        {
            name: "Drawn & Quarterly",
            size: 13,
            art: [
                " /\\/\\/\\/\\/\\  ",
                "│DRAWN &    │",
                "│QUARTERLY  │",
                "│ COMICS    │",
                "╰───────────╯",
            ],
        },
        {
            name: "Parquette",
            size: 13,
            art: [
                "╭───────────╮",
                "│ PARQUETTE │",
                "│ ★ ✧ ★ ★ ★ │",
                "│░.  ░.  ░░ │",
                "╰───────────╯",
            ],
        },
        {
            name: "Cinéma Beaubien",
            size: 9,
            art: [
                "╔CINEMA═╗",
                "║BEAUBIEN",
                "║ ◢▓▓◣  ║",
                "║ 1938  ║",
                "╙───────╜",
            ],
        },
        {
            name: "Sala Rossa",
            size: 9,
            art: [
                "╭SALA───╮",
                "│ ROSSA │",
                "│ R0SSA │",
                "╰───────╯",
            ],
        },
        {
            name: "Arepera",
            size: 9,
            art: [
                "╭AREPERA╮",
                "│ ◢■◣   │",
                "│ ★ ✦ ★ │",
                "╰───────╯",
            ],
        },
        {
            name: "La Vitrola",
            size: 9,
            art: [
                "╭LA─────╮",
                "│VITROLA│",
                "│ ♫  ♪  │",
                "╰───────╯",
            ],
        },
        {
            name: "Segal's",
            size: 9,
            art: [
                "╭SEGALS─╮",
                "│ FRESH │",
                "│ ★★★★★ │",
                "╰───────╯",
            ],
        },
        {
            name: "Dépanneur",
            size: 6,
            art: [
                "  ^   ",
                "/.  .\\",
                "|.  .|",
                "|DEP |",
            ],
        },
        {
            name: "Walkup",
            size: 6,
            art: [
                "◢▓▓▓▓◣",
                "| [] |",
                "|    |",
                "| [] |",
            ],
        },
        {
            name: "Boulangerie",
            size: 6,
            art: [
                "┌────┐",
                "|BOUL|",
                "|════|",
            ],
        },
        {
            name: "Pharmacie",
            size: 6,
            art: [
                "┌────┐",
                "|[+] |",
                "|PHAR|",
            ],
        },

        /* ── WIDE (size 13) ── */
        {
            name: "Stade Olympique",
            size: 13,
            art: [
                "        ╱│   ",
                "       ╱  │  ",
                "      ╱   │  ",
                " STADE    │  ",
                "◢◣◢◣◢◣◣   │  ",
                "▉▉▉▉▉▉▉▉▉▉▉▉▉",
            ],
        },
        {
            name: "Biosphere",
            size: 13,
            art: [
                "    ╱◇◇◇◇╲   ",
                "   ◇◇◇◇◇◇◇   ",
                "  ◇◇◇◇◇◇◇◇◇  ",
                "   ◇◇◇◇◇◇◇   ",
                "    ╲◇◇◇◇╱   ",
                "╰───────────╯",
            ],
        },
        {
            name: "Habitat 67",
            size: 13,
            art: [
                " ▓▓  ▓▓  ▓▓  ",
                "▓▓▓ ▓▓▓ ▓▓▓  ",
                "▓▓ 67  ▓▓ ▓▓ ",
                " ▓▓  ▓▓▓  ▓▓ ",
                "▓▓▓ ▓▓  ▓▓▓  ",
                "╰───────────╯",
            ],
        },
        {
            name: "Place des Arts",
            size: 13,
            art: [
                "▀▀▀▀▀▀▀▀▀▀▀▀▀",
                "█ PLACE DES █",
                "█   ARTS    █",
                "█ ▢ ▢ ▢ ▢ ▢ █",
                "▔▔▔▔▔▔▔▔▔▔▔▔▔",
            ],
        },
        {
            name: "Marché Jean-Talon",
            size: 13,
            art: [
                "┌─━━━╋━━━━━─┐",
                "│  MARCHÉ   │",
                "│JEAN TALON │",
                "│  FARMERS  │",
                "└∞──∞∞──∞∞──┘",
            ],
        },
        {
            name: "Casa del Popolo",
            size: 13,
            art: [
                "┏━━╋━━╋━━╋━━┓",
                "│ CASA DEL  │",
                "│  POPOLO   │",
                "│  %%%%     │",
                "┗━━╋━━╋━━╋━━┛",
            ],
        },
        {
            name: "BAnQ",
            size: 13,
            art: [
                "┏━━━━━━━━━━━┓",
                "┃   BAnQ    ┃",
                "┣━━━━━━━━━━━┛",
                "┃    ┃       ",
                "┃    ┃       ",
                "┗━━━━┻━━━━━━ ",
            ],
        },
        {
            name: "SAT Société",
            size: 13,
            art: [
                "   ◢■■■■■◣   ",
                "╭───────────╮",
                "│    SAT    │",
                "│  SOCIETE  │",
                "│▓▓▓▓▓▓▓▓▓▓▓│",
                "╰───────────╯",
            ],
        },

        /* ── REGULAR (size 9) ── */
        {
            name: "Foufounes",
            size: 9,
            art: [
                "╔FOUFOU═╗",
                "║NES    ║",
                "║ ϟϟϟϟ  ║",
                "║ELECTR ║",
                "╙───────╜",
            ],
        },
        {
            name: "Quai des Brumes",
            size: 9,
            art: [
                "╭QUAI───╮",
                "│ DES   │",
                "│BRUMES │",
                "╰───────╯",
            ],
        },
        {
            name: "Club Soda",
            size: 9,
            art: [
                "╭CLUB───╮",
                "│ SODA  │",
                "│ MUSIC │",
                "╰───────╯",
            ],
        },
        {
            name: "Pikolo",
            size: 9,
            art: [
                "╭PIKOLO─╮",
                "│ CAFE  │",
                "│       │",
                "╰───────╯",
            ],
        },
        {
            name: "Wilensky's",
            size: 9,
            art: [
                "╭───────╮",
                "│WILENSK│",
                "│ Y'S   │",
                "│ DELI  │",
                "╰───────╯",
            ],
        },
        {
            name: "Fairmount Bagel",
            size: 9,
            art: [
                "╭───────╮",
                "│FAIRMNT│",
                "│BAGELS │",
                "│ ◯ ◯ ◯ │",
                "╰───────╯",
            ],
        },
        {
            name: "St-Viateur Bagel",
            size: 9,
            art: [
                "╭───────╮",
                "│ST-VIAT│",
                "│ BAGEL │",
                "│ ◯  ◯  │",
                "╰───────╯",
            ],
        },
        {
            name: "Boustan",
            size: 9,
            art: [
                "╱╲╱╲╱╲╱╲╱",
                "│BOUSTAN│",
                "│SHAWRMA│",
                "│ GOOD! │",
                "╰───────╯",
            ],
        },
        {
            name: "Café Olimpico",
            size: 9,
            art: [
                "╭OLIMPIC╮",
                "│ESPRESO│",
                "│ CAFFE │",
                "│ 1970  │",
                "╰───────╯",
            ],
        },
        {
            name: "Phonopolis",
            size: 9,
            art: [
                "╭───────╮",
                "│{PHONO}│",
                "│ POLIS │",
                "│ ♪  ♫  │",
                "╰───────╯",
            ],
        },
        {
            name: "Benelux",
            size: 9,
            art: [
                "╭───────╮",
                "│BENELUX│",
                "│ BIERE │",
                "│ ♨ ♨ ♨ │",
                "╰───────╯",
            ],
        },
        {
            name: "Chatime",
            size: 9,
            art: [
                "╭───────╮",
                "│CHATIME│",
                "│BUBBLE │",
                "│  TEA  │",
                "╰───────╯",
            ],
        },
        {
            name: "Beauty's",
            size: 9,
            art: [
                "╭───────╮",
                "│BEAUTY'│",
                "│S LUNCH│",
                "│ *<>*  │",
                "╰───────╯",
            ],
        },
        {
            name: "Cabaret Mile End",
            size: 9,
            art: [
                "▁CABARET▁",
                "│ MILE  │",
                "│  END  │",
                "│ STAGE │",
                "└───────┘",
            ],
        },
        {
            name: "Santropol",
            size: 9,
            art: [
                "╭───────╮",
                "│SANTROP│",
                "│  OL   │",
                "│ (___) │",
                "╰───────╯",
            ],
        },
        {
            name: "Marché PA",
            size: 9,
            art: [
                "╔MARCHE═╗",
                "║  PA   ║",
                "║GROCERY║",
                "╙───────╜",
            ],
        },
        {
            name: "Cheval Blanc",
            size: 9,
            art: [
                "╭───────╮",
                "│CHEVAL │",
                "│ BLANC │",
                "│ BIERE │",
                "╰───────╯",
            ],
        },
        {
            name: "Les Petits Frères",
            size: 9,
            art: [
                "╭───────╮",
                "│PETITS │",
                "│FRERES │",
                "│ ★ ♥ ★ │",
                "╰───────╯",
            ],
        },
        {
            name: "Renaissance",
            size: 9,
            art: [
                "╭───────╮",
                "│RENAIS │",
                "│ SANCE │",
                "│THRIFT │",
                "╰───────╯",
            ],
        },
        {
            name: "Myriade",
            size: 9,
            art: [
                "┌✺─✺─✺─✺┐",
                "│       │",
                "│MYRIADE│",
                "└───────┘",
            ],
        },
        {
            name: "Casa d'Italia",
            size: 9,
            art: [
                "╔═CASA══╗",
                "║D'ITALI║",
                "║ ★ ★ ★ ║",
                "║CULTURA║",
                "╚═══════╝",
            ],
        },
        {
            name: "Cinéma du Parc",
            size: 9,
            art: [
                "▀CINEMA▀▀",
                "█ DU    █",
                "█ PARC  █",
                "█ ◢▓▓◣  █",
                "▔▔▔▔▔▔▔▔▔",
            ],
        },
        {
            name: "Maynard's",
            size: 9,
            art: [
                "╭───────╮",
                "│MAYNARD│",
                "│POUTINE│",
                "│  ✷✷   │",
                "╰───────╯",
            ],
        },
        {
            name: "McCord",
            size: 9,
            art: [
                "▀McCORD▀▀",
                "█       █",
                "█ ◢■◣◢■◣█",
                "▔▔▔▔▔▔▔▔▔",
            ],
        },

        /* ── NARROW (size 6) ── */
        {
            name: "SWIRL",
            size: 6,
            art: [
                "┌~~~~┐",
                "|SWRL|",
                "|YUM |",
                "└────┘",
            ],
        },
        {
            name: "SAQ",
            size: 6,
            art: [
                "╱────╲",
                "│ SAQ│",
                "│VINS│",
                "└────┘",
            ],
        },
        {
            name: "BIXI",
            size: 6,
            art: [
                " **** ",
                "|BIXI|",
                "/====\\",
            ],
        },
        {
            name: "Samosa King",
            size: 6,
            art: [
                "┌────┐",
                "|SMOS|",
                "| $1 |",
                "└────┘",
            ],
        },
        {
            name: "Gnocchi",
            size: 6,
            art: [
                "┌────┐",
                "|GNOC|",
                "| $5 |",
                "└────┘",
            ],
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

    foods: [],

    foods: [
        {
            n: "pineapple",
            p: 7,
            a: [
                "  ╲│╱  ",
                " ╭───╮ ",
                " │╳╳╳│ ",
                " ╰───╯ ",
            ],
        },

        {
            n: "grapes",
            p: 6,
            a: [
                "   ╷   ",
                " ◌◌◌◌◌ ",
                "  ◌◌◌  ",
                "   ◌   ",
            ],
        },
        {
            n: "blueberries",
            p: 6,
            a: [
                "  ╷╷╷  ",
                "  ◔◔◔  ",
                " ◔◔◔◔◔ ",
                "◔◔◔◔◔◔◔",
            ],
        },

        {
            n: "coffee",
            p: 7,
            a: [
                " ╓───╖ ",
                " ║◎◎◎║ ",
                " ║COF║ ",
                " ╙FEE╜ ",
            ],
        },

        {
            n: "turmeric",
            p: 5,
            a: [
                " ╓───╖ ",
                " ║▒▒▒║ ",
                " ║TUR║ ",
                " ╙MRC╜ ",
            ],
        },

        {
            n: "sauerkraut",
            p: 4,
            a: [
                "╒═════╕",
                "│∿∿∿∿∿│",
                "│SRKRT│",
                "╘═════╛",
            ],
        },

        {
            n: "chia seeds",
            p: 5,
            a: [
                "╔═════╗",
                "║·°∙°·║",
                "║CHIA ║",
                "╚═════╝",
            ],
        },
        {
            n: "bread",
            p: 4,
            a: [
                " .---",
                "/~~~~\\ ",
                "|~~~~~|",
                "\\___ / ",
            ],
        },
        {
            n: "cereal",
            p: 7,
            a: [
                "| OATS |",
                "|  OO  |",
                "|_____|",
            ],
        },
        {
            n: "oat milk",
            p: 5,
            a: [
                "  _||_ ",
                "| OAT |",
                "| %%%%|",
                "| MILK|",
            ],
        },
        {
            n: "soup",
            p: 3,
            a: [
                "'-----'",
                "|SOUPE|",
                "|     |",
                "'-----'",
            ],
        },
        {
            n: "pasta",
            p: 3,
            a: [
                "|/////|",
                "|PENNE|",
                "|/////|",
                "|_____|",
            ],
        },
        {
            n: "beans",
            p: 2,
            a: [
                "'-----'",
                "| BEANS|",
                "| Oo oO|",
                "'-----'",
            ],
        },
        {
            n: "chocolate",
            p: 6,
            a: [
                "'- - -'",
                "| CHOC|",
                "|=====|",
                "'-----'",
            ],
        },
        {
            n: "Tofu",
            p: 5,
            a: [
                "'-----'",
                "|TOFU|",
                "| /\\_ |",
                "'-----'",
            ],
        },
        {
            n: "nuts",
            p: 8,
            a: [
                "/\\ /\\",
                "|NUTS |",
                "\\___/",
            ],
        },
        {
            n: "juice",
            p: 5,
            a: [
                "| JUS  |",
                "|D'ORAN|",
                "'-----'",
            ],
        },
        {
            n: "lentil",
            p: 5,
            a: [
                "'-----'",
                "|LENTIL|",
                "| [=▫=]|",
                "'-----'",
            ],
        },
        {
            n: "tangerines",
            p: 7,
            a: [
                "╭◤☉☉◎◥╮",
                "│☉◎☉☉☉│",
                "│◎☉◎◎☉│",
                "╰─────╯",
            ],
        },
        {
            n: "flour",
            p: 5,
            a: [
                " { }   ",
                "❱❱  ❰❰ ",
                "FLOUR  ",
                "❰❰  ❱❱ ",
            ],
        },
        {
            n: "cereal",
            p: 6,
            a: [
                " ╭───╮",
                " │‡‡‡│",
                " │╮‡╭┤",
                " ╰┴─┴╯",
            ],
        },
        {
            n: "seitan",
            p: 5,
            a: [
                "∏∏∏∏∏∏∏",
                "∏SEITAN",
                "∏∏∆∆∆∏∏",
                "∏∏∏∏∏∏∏",
            ],
        },
        {
            n: "vinegar",
            p: 3,
            a: [
                ")∏( )∏(",
                ")□VIN□(",
                ")□(E)□(",
                ")_GAR_(",
            ],
        },
        {
            n: "cherries",
            p: 7,
            a: [
                "   ⊛",
                "  ⊙⊙⊙",
                " ⊙⊛⊙⊛⊙",
                "⊛⊙⊛⊙⊛⊙⊛",
            ],
        },
        {
            n: "salt",
            p: 3,
            a: [
                "",
                "∑∑∑∏∏∏∏∏",
                "∑ SALT ∏",
                ">>><<<<<",
            ],
        },
        {
            n: "chickpeas",
            p: 2,
            a: [
                "[]]]]]=",
                "[CHICK]=",
                "[]PEAS]=",
                "[]]]]]=",
            ],
        },

        {
            n: "orange",
            p: 4,
            a: [
                "  ⊙   ",
                " ⊙⊙⊙  ",
                "ORANGE)",
                "  ◟◞   ",
            ],
        },
        {
            n: "lemon",
            p: 3,
            a: [
                "  ^    ",
                " ◜LEM◝ ",
                " ◟ ON ◞",
                "  ◟◞   ",
            ],
        },

        {
            n: "artichokes",
            p: 3,
            a: [
                "  ◜◝  ",
                " (◎   )",
                "(◎    )",
                " ◟  ◞  ",
            ],
        },
        {
            n: "onions",
            p: 2,
            a: [
                "   ╷    ",
                " ((◍))  ",
                "(◍(◍)◍)",
                "  ╵╵╵  ",
            ],
        },
        {
            n: "carrot",
            p: 2,
            a: [
                "\\|/   ",
                " (║ )  ",
                "  ║║)   ",
                "   ╲╱  ",
            ],
        },
        {
            n: "potato",
            p: 2,
            a: [
                "  ◜◝   ",
                " (∘∘) ",
                " (  ) ",
                "  ◟◞   ",
            ],
        },

        {
            n: "hot sauce",
            p: 4,
            a: [
                "  ╭─╮  ",
                " ╭● ●╮ ",
                " ╰● ●╯ ",
                " ╰HOT╯ ",
            ],
        },
        {
            n: "soy sauce",
            p: 4,
            a: [
                "  ╭╮   ",
                " ╭◌ ◌╮  ",
                " ╰   ╯  ",
                " ╰SOY╯  ",
            ],
        },
        {
            n: "avocados",
            p: 3,
            a: [
                "  ◜─◝ ",
                " ◜◌◌◝ ",
                " ◟◌ ◌◞ ",
                "◟◌◌◞◟─◞",
            ],
        },
        {
            n: "carrots",
            p: 3,
            a: [
                " ╲╱╱ ╱ ",
                "╭●●╮●╮ ",
                " ╰●╯╮  ",
                "  ╵╯   ",
            ],
        },
        {
            n: "broccoli",
            p: 4,
            a: [
                " ◉◉◉   ",
                "◉◉◉◉   ",
                " ◉◉◉◉  ",
                "  ║    ",
            ],
        },
        {
            n: "asparagus",
            p: 4,
            a: [
                "  ✿ ✿  ",
                " (◉)✿✿ ",
                " (◉)(◉)",
                "  ║  ║ ",
            ],
        },
        {
            n: "tapioca ",
            p: 3,
            a: [
                "╭─────╮",
                "│◌◌◌◌◌│",
                "│◌◌◌◌◌│",
                "╰─────╯",
            ],
        },
        {
            p: 6,
            a: [
                "  ╓╖   ",
                " ╔╝╚╗  ",
                " ║∘∘∘║ ",
                " ╚═══╝ ",
            ],
        },

        {
            n: "rice",
            p: 3,
            a: [
                "╭─────╮",
                "│·∙··∙│",
                "│RICE │",
                "╰─────╯",
            ],
        },

        {
            n: "garlic",
            p: 2,
            a: [
                "  ╷╷╷   ",
                " (◍◌◍)  ",
                " (◌◍◌)  ",
                "  ╰─╯   ",
            ],
        },

        {
            n: "miso",
            p: 5,
            a: [
                "╒═════╕",
                "│MISO │",
                "│▒▒▒▒▒│",
                "╘═════╛",
            ],
        },

        {
            n: "tahini",
            p: 7,
            a: [
                "┌─────┐",
                "│TAHNI│",
                "│≈≈≈≈≈│",
                "└─────┘",
            ],
        },

        {
            n: "pnut butter",
            p: 5,
            a: [
                "╓─────╖",
                "║ P∙B ║",
                "║≈≈≈≈≈║",
                "╙─────╜",
            ],
        },

        {
            n: "nooch",
            p: 6,
            a: [
                "╔═════╗",
                "║NOOCH║",
                "║░░░░░║",
                "╚═════╝",
            ],
        },

        {
            n: "maple syrup",
            p: 8,
            a: [
                "  ╓╖   ",
                " ╔╩╩═╗  ",
                " ║▲∙▲║ ",
                " ╚═══╝ ",
            ],
        },

        {
            n: "ginger",
            p: 3,
            a: [
                "   ╭╮  ",
                " ╭──╮╭─╮ ",
                " ╰╮ │ ╭╯",
                "  ╰╯ ╰╯ ",
            ],
        },

        {
            n: "noodles",
            p: 4,
            a: [
                "╭─────╮",
                "│≋≋≋≋≋│",
                "│NOODL│",
                "╰─────╯",
            ],
        },

        {
            n: "peppers",
            p: 3,
            a: [
                " ╷ ╷╷╷ ",
                "◜◝◜◝◝◝",
                "( ) ) )",
                "╰w╯w╯w╯",
            ],
        },

        {
            n: "nori",
            p: 5,
            a: [
                "▬▬▬▬▬▬▬",
                "▬ NORI▬",
                "▬▬▬▬▬▬▬",
            ],
        },

        {
            n: "pickles",
            p: 4,
            a: [
                "╭─────╮",
                "│PICKL│",
                "│ ╿╿╿ │",
                "╰─────╯",
            ],
        },

        {
            n: "walnuts",
            p: 8,
            a: [
                " ◜───◝ ",
                " │◎ ◎ │",
                " │WLNT│",
                " ╰────╯ ",
            ],
        },

        {
            n: "cabbage",
            p: 3,
            a: [
                " ◜◜◝◝  ",
                "◟◜◝◜◝◞ ",
                "◟◟◝◜◞◞ ",
                " ╰───╯ ",
            ],
        },

        {
            n: "dates",
            p: 7,
            a: [
                "  ╷╷╷  ",
                " ◜◘◘◘◝  ",
                " ◟◘◘◘◞  ",
                " ╰───╯ ",
            ],
        },

        {
            n: "kombucha",
            p: 7,
            a: [
                " ╓──╖  ",
                " ║≋≋║  ",
                " ║≋≋║  ",
                " ╚══╝  ",
            ],
        },

        {
            n: "celery",
            p: 2,
            a: [
                "╷╷╷╷╷╷╷",
                "│╿│╿│╿│",
                "│CLRY │ ",
                "╘═════╛ ",
            ],
        },

        {
            n: "quinoa",
            p: 6,
            a: [
                "╔═════╗",
                "║QUINA║",
                "║·∙·∙·║",
                "╚═════╝",
            ],
        },

        {
            n: "oil",
            p: 5,
            a: [
                "  ╷ ╷  ",
                " ◜◝◜◝◜ ",
                " │◌│◌│ ",
                " ╰─╯─╯ ",
            ],
        },

        {
            n: "crackers",
            p: 3,
            a: [
                "  ╷╷╷  ",
                " ┌─┬─┐ ",
                " │∘│∘│ ",
                " └─┴─┘ ",
            ],
        },

        {
            n: "pocky",
            p: 4,
            a: [
                "  ╷╷╷  ",
                " ╲│╷│╱ ",
                " ╭───╮ ",
                " ╰───╯ ",
            ],
        },

        {
            n: "peas",
            p: 2,
            a: [
                "╭─────╮",
                "│ ∘∘∘ │",
                "│ PEAS│",
                "╰─────╯",
            ],
        },

        {
            n: "olives",
            p: 6,
            a: [
                "┌─────┐",
                "│◉OLV◉│",
                "│ ◉ ◉ │",
                "└─────┘",
            ],
        },

        {
            n: "tempeh",
            p: 5,
            a: [
                "┌─────┐",
                "│▦▦▦▦▦│",
                "│TMPEH│",
                "└─────┘",
            ],
        },

        {
            n: "kimchi",
            p: 6,
            a: [
                "╭─────╮",
                "│≋≋≋≋≋│",
                "│KIMCH│",
                "╰─────╯",
            ],
        },

        {
            n: "snflr seeds",
            p: 7,
            a: [
                "╭─────╮",
                "│°∙°∙°│",
                "│SEEDS│",
                "╰─────╯",
            ],
        },

        {
            n: "rigatoni",
            p: 4,
            a: [
                " ┌───┐ ",
                " │═══│ ",
                " │RIG│ ",
                " └─AT┘ ",
            ],
        },

        {
            n: "coconut milk",
            p: 5,
            a: [
                " ╓───╖ ",
                " ║◌◌◌║ ",
                " ║COC║ ",
                " ╙NUT╜ ",
            ],
        },

        {
            n: "cinnamon",
            p: 5,
            a: [
                " ╓───╖ ",
                " ║~∿~║ ",
                " ║CIN║ ",
                " ╙MON╜ ",
            ],
        },

        {
            n: "tea",
            p: 6,
            a: [
                "╔═════╗",
                "║ TEA ║",
                "║≈≈≈≈≈║",
                "╚═════╝",
            ],
        },

        // baddies
        // {
        //     n: "not apple",
        //     p: 5,
        //     a: [
        //         "   ╷   ",
        //         " ◜─∫─◝ ",
        //         " │   │ ",
        //         " ◟───◞ ",
        //     ],
        // },

        // {
        //     n: "not tomato",
        //     p: 3,
        //     a: [
        //         "  ╷╷╷  ",
        //         " ◜───◝ ",
        //         "◟│ ∘ │◞",
        //         "  ╰─╯  ",
        //     ],
        // },

        // {
        //     n: "not mushroom",
        //     p: 4,
        //     a: [
        //         " ╭───╮ ",
        //         "◜│ ∘ │◝",
        //         " │   │ ",
        //         " ╰─┬─╯ ",
        //     ],
        // },

        // {
        //     n: "not a beet",
        //     p: 3,
        //     a: [
        //         "  ╷ ╷  ",
        //         " ◜───◝ ",
        //         " │◍◍◍│ ",
        //         " ╰─╿─╯ ",
        //     ],
        // },

        // {
        //     n: "eggplant",
        //     p: 4,
        //     a: [
        //         " ╷╷    ",
        //         " ◜──◝  ",
        //         "◟    ◞ ",
        //         " ╰──╯  ",
        //     ],
        // },

        // {
        //     n: "mango",
        //     p: 6,
        //     a: [
        //         "   ╷   ",
        //         "  ◜─◝  ",
        //         " ◟───◞ ",
        //         "  ╰─╯  ",
        //     ],
        // },

        // {
        //     n: "strawberries",
        //     p: 5,
        //     a: [
        //         "  ╷╷╷  ",
        //         " ◜◍◍◍◝ ",
        //         " ◟◍◍◍◞ ",
        //         "  ╰─╯  ",
        //     ],
        // },

        // {
        //     n: "watermelon",
        //     p: 4,
        //     a: [
        //         "╭─────╮",
        //         "│· W ·│",
        //         "│·∙·∙·│",
        //         "╰▓▓▓▓▓╯",
        //     ],
        // },

        // {
        //     n: "pear",
        //     p: 5,
        //     a: [
        //         "   ╷   ",
        //         "  ╭─╮  ",
        //         " ◜───◝ ",
        //         " ◟───◞ ",
        //     ],
        // },

        // {
        //     n: "zucchini",
        //     p: 4,
        //     a: [
        //         "  ╷╷   ",
        //         " ╭───╮ ",
        //         " │∿∿∿│ ",
        //         " ╰───╯ ",
        //     ],
        // },

        // {
        //     n: "edamame",
        //     p: 5,
        //     a: [
        //         "   ╷   ",
        //         " ╭───╮ ",
        //         "│◌ ◌ ◌│",
        //         " ╰───╯ ",
        //     ],
        // },

        // {
        //     n: "sweet potato",
        //     p: 3,
        //     a: [
        //         "  ╷╷   ",
        //         " ◜───◝ ",
        //         "◟ SWT ◞",
        //         " ╰─╿─╯ ",
        //     ],
        // },

        // {
        //     n: "mustard",
        //     p: 4,
        //     a: [
        //         "  ╓╖   ",
        //         " ╔╝╚╗  ",
        //         " ║∙∙∙║ ",
        //         " ╙MST╜ ",
        //     ],
        // },

        // {
        //     n: "figs",
        //     p: 7,
        //     a: [
        //         "  ╷╷╷  ",
        //         "  ╭─╮  ",
        //         " ◜─◍─◝ ",
        //         " ╰───╯ ",
        //     ],
        // },

        // {
        //     n: "radishes",
        //     p: 3,
        //     a: [
        //         " ╷╷╷╷╷ ",
        //         " ◉◉◉◉◉ ",
        //         "  ╿ ╿  ",
        //     ],
        // },

        // {
        //     n: "coconut",
        //     p: 5,
        //     a: [
        //         " ╭───╮ ",
        //         "◜│ ◎ │◝",
        //         "◟│   │◞",
        //         " ╰───╯ ",
        //     ],
        // },

        // {
        //     n: "kiwi",
        //     p: 6,
        //     a: [
        //         " ◜───◝ ",
        //         "│◖·∿·◗│",
        //         "│ ◉◉◉ │",
        //         " ╰───╯ ",
        //     ],
        // },

        // {
        //     n: "sourdough",
        //     p: 6,
        //     a: [
        //         "  ◜─◝  ",
        //         "◜─────◝",
        //         "◟─╱─╲─◞",
        //         "╰─────╯",
        //     ],
        // },
    ],



        foodsFR: [
        {
            n: "ananas",
            p: 7,
            a: [
                "  ╲│╱  ",
                " ╭───╮ ",
                " │╳╳╳│ ",
                " ╰───╯ ",
            ],
        },

        {
            n: "raisins",
            p: 6,
            a: [
                "   ╷   ",
                " ◌◌◌◌◌ ",
                "  ◌◌◌  ",
                "   ◌   ",
            ],
        },
        {
            n: "bleuets",
            p: 6,
            a: [
                "  ╷╷╷  ",
                "  ◔◔◔  ",
                " ◔◔◔◔◔ ",
                "◔◔◔◔◔◔◔",
            ],
        },

        {
            n: "café",
            p: 7,
            a: [
                " ╓───╖ ",
                " ║◎◎◎║ ",
                " ║CAF║ ",
                " ╙ É ╜ ",
            ],
        },

        {
            n: "curcuma",
            p: 5,
            a: [
                "╓────╖ ",
                "║▒▒▒▒║ ",
                "║CUR ║ ",
                "╙CUMA╜ ",
            ],
        },

        {
            n: "choucroute",
            p: 4,
            a: [
                "╒═════╕",
                "│∿∿∿∿∿│",
                "│CHOUC│",
                "╘═════╛",
            ],
        },

        {
            n: "graines de chia",
            p: 5,
            a: [
                "╔═════╗",
                "║·°∙°·║",
                "║CHIA ║",
                "╚═════╝",
            ],
        },
        {
            n: "du pain",
            p: 4,
            a: [
                " .---",
                "/~~~~\\ ",
                "|~PAIN~|",
                "\\___ / ",
            ],
        },
        {
            n: "céréales",
            p: 7,
            a: [
                "=======",
                "|CÉREAL|",
                "|  ES  |",
                "|______|",
            ],
        },
        {
            n: "lait d'avoine",
            p: 5,
            a: [
                "  _||_ ",
                "| LAIT|",
                "|% D'A|",
                "|VOINE|",
            ],
        },
        {
            n: "soupe",
            p: 3,
            a: [
                "'-----'",
                "|SOUPE|",
                "|     |",
                "'-----'",
            ],
        },
        {
            n: "pâtes",
            p: 3,
            a: [
                "|/////|",
                "|PÂTES|",
                "|/////|",
                "|_____|",
            ],
        },
        {
            n: "fèves",
            p: 2,
            a: [
                "'-----'",
                "| FÈVES|",
                "| Oo oO|",
                "'-----'",
            ],
        },
        {
            n: "chocolat",
            p: 6,
            a: [
                "'- - -'",
                "| CHOC|",
                "|=====|",
                "'-----'",
            ],
        },
        {
            n: "tofu",
            p: 5,
            a: [
                "'-----'",
                "|TOFU|",
                "| /\\_ |",
                "'-----'",
            ],
        },
        {
            n:"noix",
            p: 8,
            a: [
                "/\\ /\\",
                "|NOIX |",
                "\\___/",
            ],
        },
        {
            n: "jus",
            p: 5,
            a: [
                "| JUS  |",
                "|D'ORAN|",
                "'-----'",
            ],
        },
        {
            n: "lentilles",
            p: 5,
            a: [
                "'-----'",
                "|LENTIL|",
                "| [=▫=]|",
                "'-----'",
            ],
        },
        {
            n: "mandarines",
            p: 7,
            a: [
                "╭◤☉☉◎◥╮",
                "│☉◎☉☉☉│",
                "│◎☉◎◎☉│",
                "╰─────╯",
            ],
        },
        {
            n: "farine",
            p: 5,
            a: [
                " { }   ",
                "❱❱  ❰❰ ",
                "FARINE ",
                "❰❰  ❱❱ ",
            ],
        },
        {
            n: "cereal",
            p: 6,
            a: [
                " ╭───╮",
                " │‡‡‡│",
                " │╮‡╭┤",
                " ╰┴─┴╯",
            ],
        },
        {
            n: "seitan",
            p: 5,
            a: [
                "∏∏∏∏∏∏∏",
                "∏SEITAN",
                "∏∏∆∆∆∏∏",
                "∏∏∏∏∏∏∏",
            ],
        },
        {
            n: "vinaigre",
            p: 3,
            a: [
                ")∏( )∏(",
                ")□VIN□(",
                ")□(E)□(",
                ")_GRE_(",
            ],
        },
        {
            n: "cerises",
            p: 7,
            a: [
                "   ⊛",
                "  ⊙⊙⊙",
                " ⊙⊛⊙⊛⊙",
                "⊛⊙⊛⊙⊛⊙⊛",
            ],
        },
        {
            n: "sel",
            p: 3,
            a: [
                "",
                "∑∑∑∏∏∏∏∏",
                "∑  SEL ∏",
                ">>><<<<<",
            ],
        },
        {
            n: "pois chiches",
            p: 2,
            a: [
                "[]]]]]=",
                "[POIS ]=",
                "[CHICH]=",
                "[ES]]]=",
            ],
        },

        {
            n: "orange",
            p: 4,
            a: [
                "  ⊙   ",
                " ⊙⊙⊙  ",
                "ORANGE)",
                "  ◟◞   ",
            ],
        },
        {
            n: "citron",
            p: 3,
            a: [
                "  ^    ",
                " ◜CIT◝ ",
                " ◟TRON◞",
                "  ◟◞   ",
            ],
        },

        {
            n: "artichauts",
            p: 3,
            a: [
                "  ◜◝  ",
                " (◎   )",
                "(◎    )",
                " ◟  ◞  ",
            ],
        },
        {
            n: "oignons",
            p: 2,
            a: [
                "   ╷    ",
                " ((◍))  ",
                "(◍(◍)◍)",
                "  ╵╵╵  ",
            ],
        },
        {
            n: "carotte",
            p: 2,
            a: [
                "\\|/   ",
                " (║ )  ",
                "  ║║)   ",
                "   ╲╱  ",
            ],
        },
        {
            n: "pomme de terre",
            p: 2,
            a: [
                "  ◜◝   ",
                " (∘∘) ",
                " (  ) ",
                "  ◟◞   ",
            ],
        },

        {
            n: "sauce piquante",
            p: 4,
            a: [
                "  ╭─╮  ",
                " ╭● ●╮ ",
                " ╰● ●╯ ",
                " ╰!!!╯ ",
            ],
        },
        {
            n: "sauce soya",
            p: 4,
            a: [
                "  ╭╮   ",
                " ╭◌ ◌╮  ",
                " ╰   ╯  ",
                " ╰SOY╯  ",
            ],
        },
        {
            n: "avocats",
            p: 3,
            a: [
                "  ◜─◝ ",
                " ◜◌◌◝ ",
                " ◟◌ ◌◞ ",
                "◟◌◌◞◟─◞",
            ],
        },
        {
            n: "carottes",
            p: 3,
            a: [
                " ╲╱╱ ╱ ",
                "╭●●╮●╮ ",
                " ╰●╯╮  ",
                "  ╵╯   ",
            ],
        },
        {
            n: "brocoli",
            p: 4,
            a: [
                " ◉◉◉   ",
                "◉◉◉◉   ",
                " ◉◉◉◉  ",
                "  ║    ",
            ],
        },
        {
            n: "asperges",
            p: 4,
            a: [
                "  ✿ ✿  ",
                " (◉)✿✿ ",
                " (◉)(◉)",
                "  ║  ║ ",
            ],
        },
        {
            n: "tapioca ",
            p: 3,
            a: [
                "╭─────╮",
                "│◌◌◌◌◌│",
                "│◌◌◌◌◌│",
                "╰─────╯",
            ],
        },
        {
                        n: "tamari ",

            p: 6,
            a: [
                "  ╓╖   ",
                " ╔╝╚╗  ",
                " ║∘∘∘║ ",
                " ╚═══╝ ",
            ],
        },

        {
            n: "riz",
            p: 3,
            a: [
                "╭─────╮",
                "│·∙··∙│",
                "│RIZ  │",
                "╰─────╯",
            ],
        },

        {
            n: "ail",
            p: 2,
            a: [
                "  ╷╷╷   ",
                " (◍◌◍)  ",
                " (◌◍◌)  ",
                "  ╰─╯   ",
            ],
        },

        {
            n: "miso",
            p: 5,
            a: [
                "╒═════╕",
                "│MISO │",
                "│▒▒▒▒▒│",
                "╘═════╛",
            ],
        },

        {
            n: "tahini",
            p: 7,
            a: [
                "┌─────┐",
                "│TAHNI│",
                "│≈≈≈≈≈│",
                "└─────┘",
            ],
        },

        {
            n: "beurre d'arachide",
            p: 5,
            a: [
                "╓─────╖",
                "║ P∙B ║",
                "║≈≈≈≈≈║",
                "╙─────╜",
            ],
        },

        {
            n: "nooch",
            p: 6,
            a: [
                "╔═════╗",
                "║NOOCH║",
                "║░░░░░║",
                "╚═════╝",
            ],
        },

        {
            n: "sirop d'érable",
            p: 8,
            a: [
                "  ╓╖   ",
                " ╔╩╩═╗  ",
                " ║▲∙▲║ ",
                " ╚═══╝ ",
            ],
        },

        {
            n: "gingembre",
            p: 3,
            a: [
                "   ╭╮  ",
                " ╭──╮╭─╮ ",
                " ╰╮ │ ╭╯",
                "  ╰╯ ╰╯ ",
            ],
        },

        {
            n: "nouilles",
            p: 4,
            a: [
                "╭─────╮",
                "│≋≋≋≋≋│",
                "│NOUIL│",
                "╰─────╯",
            ],
        },

        {
            n: "poivrons",
            p: 3,
            a: [
                " ╷ ╷╷╷ ",
                "◜◝◜◝◝◝",
                "( ) ) )",
                "╰w╯w╯w╯",
            ],
        },

        {
            n: "nori",
            p: 5,
            a: [
                "▬▬▬▬▬▬▬",
                "▬ NORI▬",
                "▬▬▬▬▬▬▬",
            ],
        },

        {
            n: "cornichons",
            p: 4,
            a: [
                "╭─────╮",
                "│CORNI│",
                "│ ╿╿╿ │",
                "╰─────╯",
            ],
        },

        {
            n: "noix de Grenoble",
            p: 8,
            a: [
                " ◜───◝ ",
                " │◎ ◎ │",
                " │GREN│",
                " ╰────╯ ",
            ],
        },

        {
            n: "chou",
            p: 3,
            a: [
                " ◜◜◝◝  ",
                "◟◜◝◜◝◞ ",
                "◟◟◝◜◞◞ ",
                " ╰───╯ ",
            ],
        },

        {
            n: "dattes",
            p: 7,
            a: [
                "  ╷╷╷  ",
                " ◜◘◘◘◝  ",
                " ◟◘◘◘◞  ",
                " ╰───╯ ",
            ],
        },

        {
            n: "kombucha",
            p: 7,
            a: [
                " ╓──╖  ",
                " ║≋≋║  ",
                " ║≋≋║  ",
                " ╚══╝  ",
            ],
        },

        {
            n: "céleri",
            p: 2,
            a: [
                "╷╷╷╷╷╷╷",
                "│╿│╿│╿│",
                "│CLRI │ ",
                "╘═════╛ ",
            ],
        },

        {
            n: "quinoa",
            p: 6,
            a: [
                "╔═════╗",
                "║QUINA║",
                "║·∙·∙·║",
                "╚═════╝",
            ],
        },

        {
            n: "huile",
            p: 5,
            a: [
                "  ╷ ╷  ",
                " ◜◝◜◝◜ ",
                " │◌│◌│ ",
                " ╰─╯─╯ ",
            ],
        },

        {
            n: "craquelins",
            p: 3,
            a: [
                "  ╷╷╷  ",
                " ┌─┬─┐ ",
                " │∘│∘│ ",
                " └─┴─┘ ",
            ],
        },

        {
            n: "pocky",
            p: 4,
            a: [
                "  ╷╷╷  ",
                " ╲│╷│╱ ",
                " ╭───╮ ",
                " ╰───╯ ",
            ],
        },

        {
            n: "pois",
            p: 2,
            a: [
                "╭─────╮",
                "│ ∘∘∘ │",
                "│ POIS",
                "╰─────╯",
            ],
        },

        {
            n: "olives",
            p: 6,
            a: [
                "┌─────┐",
                "│◉OLV◉│",
                "│ ◉ ◉ │",
                "└─────┘",
            ],
        },

        {
            n: "tempeh",
            p: 5,
            a: [
                "┌─────┐",
                "│▦▦▦▦▦│",
                "│TMPEH│",
                "└─────┘",
            ],
        },

        {
            n: "kimchi",
            p: 6,
            a: [
                "╭─────╮",
                "│≋≋≋≋≋│",
                "│KIMCH│",
                "╰─────╯",
            ],
        },

        {
            n: "graines",
            p: 7,
            a: [
                "╭─────╮",
                "│°∙°∙°│",
                "GRAINES",
                "╰─────╯",
            ],
        },

        {
            n: "rigatoni",
            p: 4,
            a: [
                " ┌───┐ ",
                " │═══│ ",
                " │RIG│ ",
                " └─AT┘ ",
            ],
        },

        {
            n: "lait de coco",
            p: 5,
            a: [
                " ╓───╖ ",
                " ║◌◌◌║ ",
                " ║COC║ ",
                " ╙NUT╜ ",
            ],
        },

        {
            n: "cannelle",
            p: 5,
            a: [
                " ╓─────╖",
                " ║ ~∿~ ║",
                " ║CANN ║",
                " ╙ELLE ╜",
            ],
        },

        {
            n: "thé",
            p: 6,
            a: [
                "╔═════╗",
                "║ THÉ ║",
                "║≈≈≈≈≈║",
                "╚═════╝",
            ],
        },

    ],

    //
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
        [
            "@",
            "Ħ",
        ] /* frame 1: step (currently same — add variation here) */,
    ],
    robinArt: [
        "@",
        "Ħ",
    ] /* default crew member */,
    narcArt: [
        "%",
        "φ",
    ] /* narcs — stiff, different glyph */,
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
    npcColors: [
        "#0ff",
        "#f0f",
        "#ff0",
        "#0f8",
        "#f80",
        "#8f0",
        "#80f",
        "#f08",
        "#08f",
    ],

    /* ─────────────────────────────────────────────────────────
       NARRATIVE QUOTES (Act 1 transition banners)
       Used by: Act 1 end sequence (NQ array).
       Constraints:
       - `t` = banner text, `c` = color, `d` = duration ms.
       - Ordering matters — shown in sequence.
       ───────────────────────────────────────────────────────── */
    /* Act 1 → Act 2 narrative. Ordering matters.
       Entries with pause:true are silent beats (no banner, just delay). */
    // narrativeQuotes: [
    //     {
    //         t: "someone had an idea",
    //         c: "#bf8c60",
    //         d: 2500,
    //     },
    //     { pause: true, d: 800 },
    //     {
    //         t: "or maybe we all had the idea",
    //         c: "#db7f30",
    //         d: 2500,
    //     },
    //     { pause: true, d: 1000 },
    //     {
    //         t: "what if we just\n take what we need?",
    //         c: "#f26507",
    //         d: 3000,
    //     },
    //     { pause: true, d: 600 },
    //     {
    //         t: "-",
    //         c: "#8957ff",
    //         d: 2500,
    //     },
    // ],

    narrativeQuotesEN: [
    { t: "someone had an idea", c: "#bf8c60", d: 4000 },
    { pause: true, d: 1000 },
    { t: "or maybe we all had the idea", c: "#db7f30", d: 4000 },
    { pause: true, d: 1000 },

 { seq: [
    { t: "what if we just", c: "#f26507", d: 1200 },
    { pause: true, d: 700 },
    { t: "take what we need?", c: "#f26507", d: 3000 },
]},{ pause: true, d: 1000 },
    { t: "^-^", c: "#8957ff", d: 2500 },
],
narrativeQuotesFR: [
    { t: "quelqu'un a eu une idée", c: "#bf8c60", d: 2500 },
    { pause: true, d: 800 },
    { t: "ou peut-être qu'on l'avait tous", c: "#db7f30", d: 2500 },
    { pause: true, d: 1000 },
   { seq: [
    { t: "et si on prenait", c: "#f26507", d: 1200 },
    { pause: true, d: 700 },
    { t: "ce dont on a besoin?", c: "#f26507", d: 3000 },
]},
    { pause: true, d: 600 },
    { t: "-", c: "#8957ff", d: 2500 },
],

storeArtEN: [
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
storeArtFR: [
    ".============================.",
    "|  C H A Î N E  A L I M E N T|",
    "|============================|",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|      MANGER C'EST LA VIE   |",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|         .--------.         |",
    "|         | ENTRER!|         |",
    "|========='        '=========|",
],

fridgeArtEN: [
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
fridgeArtFR: [
    "╔═══════════════════════════════════╗",
    "║  ~ FRIGO  COMMUNAUTAIRE ~ ~ ~ ~ ~ ║",
    "║  ~ ~ ~ ~ ~  nourrir ses voisins   ║",
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
};

/* ── STORE ART (shared by Acts 2, 3) ──────────────────── */
console.log("LANG at STORE init:", window.LANG === window.LANG_FR ? "FR" : "EN");

const STORE = window.LANG === window.LANG_FR
    ? window.GAME_DATA.storeArtFR
    : window.GAME_DATA.storeArtEN;
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
const HC = [
    "#3a3535",
    "#353a35",
    "#35353a",
    "#3a3838",
    "#383a38",
    "#38383a",
];

const HC_CTA = [
    "#8d3535",
    "#9c6023",
    "#746911",
    "#1f5a2f",
    "#123550",
    "#542c7b",
    "#631c43",
    "#176e6a",
];