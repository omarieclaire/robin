

window.GAME_DATA = {

    colors: {
        player: "#2deeff" /* the robin (@) and player-tinted UI */,
        sidewalk: "#b0a898",
        danger: "#c44" /* narcs, heat, bust, security */,
        teal: "#5cbdbd" /* crew, fridge, info, success moments */,
        rally: "#00ffbb" /* rally banners, CTA accent */,
        warn: "#da0" /* urgency warnings */,
        success: "#53dd53" /* status green — brightened from #2a7a2a, which was unreadable on black */,
        dim: "#888" /* muted text, tap prompts */,
        mid: "#aaa" /* medium text */,
        coin: "#e6c235" /* coin glyphs, coin floats — brightened from #c8a800 (read as murky green) */,
        thinking: "#d9a520" /* "they're thinking / not yet" floats — was #a80, unreadable */,
        cat: "#ee8833" /* cat accent: recruit float, burst fallback (coat pool lives in act 2 spawn) */,
        gold: "#ffd700" /* confirmed choice border, celebration gold */,
        crew: "#4bcb4b" /* crew-trail green fallback */,
        convNpc: "#7a8aaa" /* default NPC dialogue color */,
        landingSub: "#9fb3d9" /* title screen subtitle */,
        landingHint: "#e80ecf" /* title screen hint ("a true story") */,
        landingFrame: "#f5a032" /* title frame (dulled 0.25 at draw time) */,
        landingBtn: "#53ffaf" /* PLAY box — the single loud accent */,
    },

    buildings: [
        /* ── NARROW (size 6) ─── */
         {
            name: "_walkup_a",
            size: 6,
            art: [
                " /\\/\\ ",
                "|[][]|",
                "|    |",
                "| [] |",
            ],
        },
        {
            name: "_plex_a",
            size: 6,
            art: [
                "▀▀▀▀▀▀",
                "|::::|",
                "| ▢▢ |",
                "| __ |",
            ],
        },
        {
            name: "_greystone_a",
            size: 6,
            art: [
                "╱────╲",
                "│▦  ▦│",
                "│    │",
                "│ ▦▦ │",
            ],
        },
        {
            name: "_walkup_b",
            size: 6,
            art: [
                "◢▓▓▓▓◣",
                "|▢  ▢|",
                "| ▢▢ |",
            ],
        },
        {
            name: "_plex_b",
            size: 6,
            art: [
                " ╱──╲ ",
                "│ ▢▢ │",
                "│    │",
                "│::::│",
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
        {
            name: "Mont-Royal Cross",
            size: 6,
            art: [
                "  ✝   ",
                " ╱│╲  ",
                "╱ │ ╲ ",
                "▔▔▔▔▔▔",
            ],
        },
        {
            name: "Tour de l'Horloge",
            size: 6,
            art: [
                " ┌──┐ ",
                " |12| ",
                " |  | ",
                "▕════▏",
            ],
        },
        {
            name: "Kem CoBa",
            size: 6,
            art: [
                "┌────┐",
                "|KEM |",
                "|COBA|",
                "| ~~ |",
            ],
        },

        /* ── REGULAR (size 9) ─── */
        {
            name: "_apartment_a",
            size: 9,
            art: [
                "▀▀▀▀▀▀▀▀▀",
                "│[] [] []│",
                "│        │",
                "│[] [] []│",
            ],
        },
        {
            name: "_triplex_a",
            size: 9,
            art: [
                " /\\/\\/\\/ ",
                "│▢ ▢ ▢ ▢│",
                "│       │",
                "│ ▢ ▢ ▢ │",
            ],
        },
        {
            name: "_apartment_b",
            size: 9,
            art: [
                "╱───────╲",
                "│::::::::│",
                "│ ▦  ▦  ▦│",
                "│        │",
                "│ ▦  ▦  ▦│",
            ],
        },
        {
            name: "_walkup_c",
            size: 9,
            art: [
                "◢▓▓▓▓▓▓▓◣",
                "│ [] [] │",
                "│       │",
                "│ [] [] │",
            ],
        },
        {
            name: "_greystone_b",
            size: 9,
            art: [
                "╭───────╮",
                "│▦  ▦  ▦│",
                "│       │",
                "│ ▢ ▢ ▢ │",
            ],
        },
        {
            name: "_plex_c",
            size: 9,
            art: [
                "▀▀▀▀▀▀▀▀▀",
                "│ ▢ ▢ ▢ │",
                "│       │",
                "│  __   │",
            ],
        },

        /* ── GENERICS wide (size 13) ── */
        {
            name: "_block_a",
            size: 13,
            art: [
                "▀▀▀▀▀▀▀▀▀▀▀▀▀",
                "│:::::::::::│",
                "│▢ ▢ ▢ ▢ ▢ ▢│",
                "│           │",
                "│▢ ▢ ▢ ▢ ▢ ▢│",
            ],
        },
        {
            name: "_block_b",
            size: 13,
            art: [
                "  ╱╲╱╲╱╲╱╲   ",
                "│ ▢▢ ▢▢ ▢▢ │",
                "│          │",
                "│ ▦  ▦  ▦  │",
                "│ ▢▢ ▢▢ ▢▢ │",
            ],
        },
        {
            name: "_block_c",
            size: 13,
            art: [
                "▀▀▀▀▀▀▀▀▀▀▀▀▀",
                "│[][][][][]│",
                "│           │",
                "│[][][][][]│",
                "│           │",
            ],
        },
        {
            name: "_block_d",
            size: 13,
            art: [
                "  ┌─┐ ┌─┐    ",
                "│ ▦ ▦ ▦ ▦ ▦│",
                "│          │",
                "│ ::  ::   │",
            ],
        },
        {
            name: "Umami",
            size: 9,
            art: [
                "   ~~~   ",
                "╔═══~═══╗",
                "‖[[[~]]]‖",
                "‖≋umami≋‖",
                "‖‖‖‖‖‖‖‖‖",
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
        {
            name: "Schwartz's",
            size: 9,
            art: [
                "╭───────╮",
                "│SCHWTZ'│",
                "│S DELI │",
                "│  1928 │",
            ],
        },
        {
            name: "Aux Vivres",
            size: 9,
            art: [
                "╭───────╮",
                "│AUX VIV│",
                "│  RES  │",
                "│✿ ✿ ✿ ✿│",
            ],
        },
        {
            name: "Le Belgo Building",
            size: 9,
            art: [
                "▀▀▀▀▀▀▀▀▀",
                "│▫▫▫▫▫▫▫│",
                "│ BELGO │",
                "│▫ART▫▫▫│",
            ],
        },
        {
            name: "Bily Kun",
            size: 9,
            art: [
                "╭───────╮",
                "│ BILY  │",
                "│  KUN  │",
                "│Ω  Ω  Ω│",
            ],
        },
        {
            name: "Copacabana",
            size: 9,
            art: [
                "╭───────╮",
                "│COPACAB│",
                "│  ANA  │",
                "│≈BOAT≈ │",
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
                "┴───────────┴",
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
        {
            name: "Église St-Michel",
            size: 13,
            art: [
                "     ▲▲▲     ",
                "   ◢◉◉◉◉◉◣   ",
                "│ ST MICHEL │",
                "│ ▦ ▦ ▦ ▦ ▦ │",
            ],
        },
        {
            name: "Farine Five Roses",
            size: 13,
            art: [
                "╔═══════════╗",
                "║FIVE ROSES ║",
                "║ ★ FLOUR ★ ║",
                "╚═══════════╝",
            ],
        },
        {
            name: "Oratoire Saint-Joseph",
            size: 13,
            art: [
                "     ⌒⌒⌒     ",
                "   ◢▓▓▓▓▓◣   ",
                "│ ORATOIRE  │",
                "│ ▁▂▃▄▅▆▇█▉ │",
            ],
        },
        {
            name: "Jacques-Cartier Bridge",
            size: 13,
            art: [
                " /\\  /\\  /\\  ",
                "/  \\/  \\/  \\ ",
                "┴─CARTIER─┴──",
                "╞═══════════╡",
            ],
        },
        {
            name: "Windsor Station",
            size: 13,
            art: [
                "    ┌───┐    ",
                "   ╱WNDSR╲   ",
                "│  STATION  │",
                "│▦▦▦▦▦▦▦▦▦▦▦│",
            ],
        },

    ],

    /* ── BUILDINGS_2B (Act 4 — rally, taller buildings with bottom border) ── */
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
         /* ── GENERICS narrow (size 6) ── */
        {
            name: "_walkup_a",
            size: 6,
            art: [
                " /\\/\\ ",
                "|[][]|",
                "|    |",
                "| [] |",
                "└────┘",
            ],
        },
        {
            name: "_plex_a",
            size: 6,
            art: [
                "▀▀▀▀▀▀",
                "|::::|",
                "| ▢▢ |",
                "| __ |",
                "└────┘",
            ],
        },
        {
            name: "_greystone_a",
            size: 6,
            art: [
                "╱────╲",
                "│▦  ▦│",
                "│    │",
                "│ ▦▦ │",
                "╰────╯",
            ],
        },
        {
            name: "_walkup_b",
            size: 6,
            art: [
                "◢▓▓▓▓◣",
                "|▢  ▢|",
                "| ▢▢ |",
                "└────┘",
            ],
        },
        {
            name: "_plex_b",
            size: 6,
            art: [
                " ╱──╲ ",
                "│ ▢▢ │",
                "│    │",
                "│::::│",
                "╰────╯",
            ],
        },

        /* ── GENERICS regular (size 9) ── */
        {
            name: "_apartment_a",
            size: 9,
            art: [
                "▀▀▀▀▀▀▀▀▀",
                "│[] [] []│",
                "│        │",
                "│[] [] []│",
                "└────────┘",
            ],
        },
        {
            name: "_triplex_a",
            size: 9,
            art: [
                " /\\/\\/\\/ ",
                "│▢ ▢ ▢ ▢│",
                "│       │",
                "│ ▢ ▢ ▢ │",
                "╰───────╯",
            ],
        },
        {
            name: "_apartment_b",
            size: 9,
            art: [
                "╱───────╲",
                "│::::::::│",
                "│ ▦  ▦  ▦│",
                "│        │",
                "│ ▦  ▦  ▦│",
                "╰────────╯",
            ],
        },
        {
            name: "_walkup_c",
            size: 9,
            art: [
                "◢▓▓▓▓▓▓▓◣",
                "│ [] [] │",
                "│       │",
                "│ [] [] │",
                "└───────┘",
            ],
        },
        {
            name: "_greystone_b",
            size: 9,
            art: [
                "╭───────╮",
                "│▦  ▦  ▦│",
                "│       │",
                "│ ▢ ▢ ▢ │",
                "╰───────╯",
            ],
        },
        {
            name: "_plex_c",
            size: 9,
            art: [
                "▀▀▀▀▀▀▀▀▀",
                "│ ▢ ▢ ▢ │",
                "│       │",
                "│  __   │",
                "└───────┘",
            ],
        },

        /* ── GENERICS wide (size 13) ── */
        {
            name: "_block_a",
            size: 13,
            art: [
                "▀▀▀▀▀▀▀▀▀▀▀▀▀",
                "│:::::::::::│",
                "│▢ ▢ ▢ ▢ ▢ ▢│",
                "│           │",
                "│▢ ▢ ▢ ▢ ▢ ▢│",
                "└───────────┘",
            ],
        },
        {
            name: "_block_b",
            size: 13,
            art: [
                "  ╱╲╱╲╱╲╱╲   ",
                "│ ▢▢ ▢▢ ▢▢ │",
                "│          │",
                "│ ▦  ▦  ▦  │",
                "│ ▢▢ ▢▢ ▢▢ │",
                "╰──────────╯",
            ],
        },
        {
            name: "_block_c",
            size: 13,
            art: [
                "▀▀▀▀▀▀▀▀▀▀▀▀▀",
                "│[][][][][]│",
                "│           │",
                "│[][][][][]│",
                "│           │",
                "└───────────┘",
            ],
        },
        {
            name: "_block_d",
            size: 13,
            art: [
                "┌─┐┌─┐┌─┐┌─┐",
                "│ ▦ ▦ ▦ ▦ ▦│",
                "│          │",
                "│ ::  ::   │",
                "└──────────┘",
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

    /* ── FOODS (Act 6 grocery items + Act 8 fridge) ── */
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
            n: "tamari",
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

    /* ── STORE (Act 4 + Act 5 — the grocery store) ── */
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

    /* ── FRIDGE (Act 8 — community fridge) ── */
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

    /* ── CHARACTER ART (player + NPCs) ── */
    playerArt: [
        ["@", "Ħ"] /* frame 0: idle */,
        [
            "@",
            "Ħ",
        ] ,
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
        "rgb(255, 0, 230)",
        "#ff9408",
        "#ff0",
        "#b41eff",
        "#8f0",
        "#00c3ff",
    ],
   

    narrativeQuotesEN: [
    { t: "someone had an idea", c: "#bf8c60", d: 4000 },
    { pause: true, d: 1000 },
    { t: "or maybe we all had the idea", c: "#db7f30", d: 4000 },
    { pause: true, d: 1000 },

{ t: "what if we just", c: "#f26507", d: 1200 },
    { pause: true, d: 1200 },
    { t: "take what we need?", c: "#f26507", d: 3000 },
    { pause: true, d: 1000 },
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
],

storeArtEN: [
    ".============================.",
    "|  G R O C E R Y  C H A I N  |",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|       EATING IS LIFE       |",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|         .--------.         |",
    "|         | ENTER! |         |",
    "|========='        '=========|",
],
storeArtFR: [
    ".============================.",
    "|    S U P E R M A R C H É   |",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|      MANGER C'EST LA VIE   |",
    "|  [$$]-[$$]-[$$]-[$$]-[$$]  |",
    "|         .--------.         |",
    "|         | ENTRE! |         |",
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

let STORE = window.LANG === window.LANG_FR
    ? window.GAME_DATA.storeArtFR
    : window.GAME_DATA.storeArtEN;
let STO_W = STORE[0].length,
    STO_H = STORE.length;

/* ── SHARED: city grid (Act 2) ─────────────────────────── */
const HA = [
    [null, "\u25A2  \u25A2", " \u25AF\u25AF "],
    [null, " \u25A2\u25A2 ", "\u25A4\u25A4\u25A4\u25A4"],
    [null, "\u25A6\u25A6\u25A6\u25A6", "\u25AF  \u25AF"],
    [null, "\u2591\u2591\u2591\u2591", " \u25A2\u25A2 "],
    [null, "\u25A8\u25A8\u25A8\u25A8", " \u25AF\u25AF "],
    [null, "▢▢▢▢", "░░░░"],
    [null, "  ▯ ", "▤▤▤▤"],
    [null, "▥ ▥ ", "▦▦▦▦"],
    [null, "▧▧▧▧", "▢  ▢"],
    [null, " ░░ ", " ▯▯ "],
];
const HC = [
    "#232323",
    "#2b2b2b",
    "#333333",
    "#3c3c3c",
    "#454545",
    "#4f4f4f",
    "#595959",
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