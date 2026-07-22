window.LANG_FR = {
  playBtn: "JOUER",
  overlayTitle: "ROBIN  DES RUELLES",
  overlayHint: "une histoire vraie",

  // banners
  bannerIsThisALife: "c'est ta vie",
  bannerWhoIsInControl: "mais qui c'est qui contrôle ici?",
  bannerYouControlNothing: "(c'est sûrement pas toi)",

  bannerRecruitCrew: "recrute ton équipe",
  bannerWatchNarcs: "mais fais gaffe aux stooles",
  bannerRallyNeighbourhood: "rallie le quartier!",
  bannerAvoidNarcs: "évite les stooles",
  bannerYouHaveACrew: "petite équipe assemblée!",
  bannerCrewAssembled: "équipe assemblée",
  bannerCopsCircling: "Les chars de police tournent. Finis-en!",
  bannerGoodCallNarc: "bon move. c'était un stoole.",
  bannerExitOpen: "SORTIE \u2014 EN BAS À DROITE!",
  act6SecurityArrives: "SÉCURITÉ! arrête-toi là!",
  bannerSecurityGrabbed: "LA SÉCURITÉ A POGNÉ DE LA BOUFFE! -20$",
  bannerGrabEverything: "clique pour prendre de la bouffe!",
  bannerGrabEverythingMobile: "appuie pour prendre de la bouffe!",
  bannerAvoidSecurity: "sors avant que les flics arrivent!",
  bannerFoodGloriousFood: "de la bouffe, enfin de la bouffe.",
  bannerHitNarc: "c'était un stoole!",

  // act 4 urgency stages
  urgencyCopsCalled: "POLICE APPELÉE",
  urgencyHurry: "GROUILLE",
  urgencyClose: "PROCHE!",
  urgencyGetOut: "SORS D'ICI!",
  urgencyLastChance: "DERNIÈRE CHANCE",
  urgencyTooLate: "TROP TARD",

  // floats
  floatReadTheRoom: "lis la pièce",
  floatListenBetter: "t'as besoin d'écouter mieux",
  floatWrongEnergy: "mauvaise énergie",
  floatTooCautious: "peut-être un peu trop prudent·e?",
  floatGiveChance: "donne une chance aux gens",
  floatNeverChange: "les choses changeront jamais si on essaie pas",
  floatGoodCallSmelled: "bon move. ça sentait le stoole",
  floatNotYet: "pas encore. Mais ils y pensent",
  floatNeedTime: "ils ont besoin de temps",

  floatNarcRecruited: "tu as essayé de recruter un mouchard !",
floatNarcHit: "tu as foncé dans un mouchard !",
  floatOops: "OUPS!",

  // act 2b floats
  floatOui: "OUI!",
  floatLetsGo: "ON Y VA!",
  floatAllonsY: "ALLONS-Y!",
  floatCountMeIn: "COMPTEZ-MOI!",
  floatYeah: "OUAIS!",
  floatForReal: "POUR VRAI!",

  // end game overlay
  endGameBustedTitle: "POGNÉ·E!",
  endGameBustedSub: "t'as trop fait confiance aux stooles",
  endGameCaughtTitle: "TROP LENT·E!",
  endGameCaughtSub: "la police t'a presque eu·e.\nles robins sont partis.",
  endGameEmptyHandedTitle: "T'ES SORTI·E LES MAINS VIDES.",
  endGameEmptyHandedSub: "et le ventre vide aussi",


  a1Encounters: [
    {
      turns: [
        {
          who: "p",
          texts: ["ugh. |pause|depuis quand la bouffe est si chère?", "crisse, depuis quand la bouffe est sacrament chére?", "CÂLICE. pourquoi je me pose encore cette question."],
          hold: 3000,
        },
        {
          who: "n",
          texts: ["chais pas|pause|mais j'ai une appli pour les coupons d'épicerie", "chais pas mais j'ai une 4ppli pour l3s c0up0ns", "c h a i s  p a s  j ' a i  u n e  a p p l i"],
          hold: 4500,
        },
        {
          who: "n",
          texts: [
            "et une autre appli \n pour acheter de la bouffe pourrie",
            "et une autre 4ppli \n|pause|pour la bouffe pourrie",
            "bouffe pourrie.|pause|\nappli pourrie.|pause|\nmoi pourri·e.",
          ],
          hold: 5500,
        },
        {
          who: "p",
          texts: ["euh, ok", "euh ok?", "wtf"],
          hold: 4500,
        },
        {
          who: "n",
          texts: ["tu veux un lien de référence?", "tu v3ux un l13n d3 référ3nce?", "t u  v e u x  u n  l i e n  d e  r é f é r e n c e ?"],
          hold: 5500,
        },
        {
          who: "p",
          texts: ["peut-être plus tard", "ostie, t'es en train de dire QUOI", "J'M'EN CALICE DES APPS"],
          hold: 4500,
        },
      ],
    },
    {
      turns: [
        {
          who: "n",
          texts: ["sois pas si négatif·ve", "s01s pas s1 négat1f·ve", "s o i s  p a s  s i  n é g a t i f · v e"],
          hold: 6000,
        },
        {
          who: "p",
          texts: ["ok mais\nun Québécois sur trois peut pas se payer à manger", "crisse.|pause|un Québécois sur trois peut pas se payer à manger", "CÂLICE.|pause|un Québécois sur trois peut pas se payer à manger"],
          hold: 3500,
        },
        {
          who: "n",
          texts: [
            "donc j'entends\nque deux sur trois s'en sortent bien?",
            "honnêtement?|pause|les affamés préfèrent probablement ça",
            "as-tu essayé|pause|d'être dans les deux autres?",
          ],
          hold: 6000,
        },
        {
          who: "p",
          texts: ["quoi?", "viarge, pourquoi t'es de même", "TABARNAK. je sais déjà ce que tu vas dire."],
          hold: 4500,
        },
      ],
    },
    {
      turns: [
        {
          who: "p",
          texts: [
            "quelqu'un devrait faire quelque chose",
            "câline, quelqu'un DOIT faire quelque chose",
            "ESTI DE CÂLICE. je fais rien qu'aller en rond. me plaindre.",
          ],
          hold: 3500,
        },
        {
          who: "n",
          texts: [
            "tu sais,\n\nvoler un voleur|pause|\nc'est pas du vol",
            "tu sais,\nv0ler un v0leur|pause|\nc'est pas du vol",
            "t u  s a i s\nle jeu veut que tu entendes ça",
          ],
          hold: 6000,
        },
        {
          who: "p",
          texts: ["attends?|pause|quoi?|pause|qu'est-ce tu veux dire?", "ostie... qu'est-ce que ça veut dire", "TABARNAK. je t'ai entendu la première fois.|pause| et la deuxième."],
          hold: 4500,
        },
      ],
    },
  ],

  a1LoopMsgs: [
    { t: "rien change...", c: "#999" },
    { t: "...câline, encore ça?", c: "#aaa" },
    { t: "ostie. encore?", c: "#b09abf" },
    { t: "crisse, pis quoi encore?", c: "#b080c0" },
    { t: "ostie. ENCORE LA MÊME CHOSE?", c: "#c060a0" },
    { t: "OSTIE DE CÂLICE. vraiment??", c: "#c84080" },
    { t: "TABARNAK. je fais quoi exactement??", c: "#cc2050" },
    { t: "CÂLICE DE TABARNAK. c'est ça, la VIE??", c: "#d01030" },
    { t: "OSTIE CÂLICE CRISSE TABARNAK !", c: "#dd0020" },
    { t: "TABARNAK CÂLICE CRISSE VIARGE OSTIE DE...", c: "#ff0000" },
  ],


  
  endNames: [
    { n: "Marie", p: "leur" },
    { n: "Manu", p: "son" },
    { n: "Fatima", p: "son" },
    { n: "Olivier", p: "son" },
    { n: "Mei", p: "son" },
    { n: "Amadou", p: "son" },
    { n: "Sophie", p: "son" },
    { n: "Ali", p: "son" },
  ],


  // act2Choices: ["(>_<)", "(o_O)"],
  act2Choices: ["(>_<) chus tanné·e", "(o_O) ça change rien"],

  act3Undecided: ["hmm", "hmmm", "laisse-moi réfléchir"],
  act3Wait: ["attends-moi", "j'arrive", "deux secondes"],

  neighbourMsgs: ["merci", "mes enfants mangent à soir", "enfin", "amour!", "merci beaucoup", "merci"],
  intercoms: [
    "ATTENTION CLIENTS: votre faim n'est pas notre problème",
    "SPÉCIAL: deux cannes de honte pour le prix de trois",
    "RAPPEL: le troisième yacht de notre PDG vous remercie de magasiner ici",
    "HEURES D'OUVERTURE: ouvert jusqu'à ce qu'on décide que t'as assez dépensé",
    "ATTENTION: vérification de prix sur tout: gratuit",
    "SÉCURITÉ: la direction vous demande d'arrêter de nous voler",
    "ATTENTION: nettoyage dans TOUTES les allées",
    "ATTENTION CLIENTS: vérification de prix sur la dignité… refusée",
    "ATTENTION: sécurité dans toutes les allées",
    "SÉCURITÉ: le magasin vit un événement de redistribution non planifié",
  ],

  act4AmbNarc: ["capitalisme!", "actions", "investissements", "méritocratie"],
  act4AmbCrowd: ["faim", "ugh", "fauché·e", "aide", "factures"],


  bannerOneStore: " un magasin",
  bannerLetsEat: " on mange",
  urgencyCopsEnRoute: ">> POLICE EN ROUTE <<",
  urgencyFindExit: "!! TROUVE LA SORTIE !!",

  endGameTimedOutTitle: "POGNÉ·E!",
  endGameTimedOutSub: "quelqu'un t'a rapporté·e\nretente ta chance ?",

  bannerHatsOn: "chapeaux",

  // choiceCommiserateAngry: ["(╯°□°)╯"],
  // choiceCommiserateHungry: ["(っ◔◡◔)っ"],
  // choiceTalkOver: ["(ಠ_ಠ)"],
  // choiceRun: "[>_>]",
  // choiceTryHarderAngry: "(ง'̀-'́)ง",
  // choiceTryHarderHungry: "(｡•́︿•̀｡)",
  // choiceWalkAway: "( ._.)",
  choiceCommiserateAngry: ["(╯°□°)╯ certain!", "(╯°□°)╯ right!", "(╯°□°)╯ ouin!", "(╯°□°)╯ en plein ça!"],
  choiceCommiserateHungry: ["(っ◔◡◔)っ ouain", "(っ◔◡◔)っ mets-en", "(っ◔◡◔)っ ouais", "(っ◔◡◔)っ ben vrai"],
  choiceTalkOver: ["(ಠ_ಠ) parle par-dessus", "(ಠ_ಠ) coupe-leur le sifflet", "(ಠ_ಠ) faque, anyway", "(ಠ_ಠ) ben, techniquement"],
  choiceRun: "[>_>] COURS",
  choiceTryHarderAngry: "(ง'̀-'́)ง pousse plus fort",
  choiceTryHarderHungry: "(｡•́︿•̀｡) essaie encore, s'il te plaît",
  choiceWalkAway: "( ._.) tourne les talons",

  bannerTooManyNarcs: "TROP DE STOOLES",

  recruitProgressCat: "un chat se joint à l'équipe — {rem} {noun} à aller!",
recruitProgressCompleteCat: "★ ÉQUIPE COMPLÈTE (avec chat) ★",
  recruitProgress1: "{ord} dans ta bande — {rem} à aller!",
  recruitProgressRemaining: " à aller!",
  recruitProgressComplete: "★ ÉQUIPE AU COMPLET ★",
  recruitNounSingular: "robin",
  recruitNounPlural: "robins",
  // choiceRecruitAngry: "ᕦ(ò_óˇ)ᕤ",
  // choiceRecruitHungry: "(•‿•)",
  // choiceWalkAwayShort: "( ._.)",
  choiceRecruitAngry: "ᕦ(ò_óˇ)ᕤ recrute-les",
  choiceRecruitHungry: "(•‿•) recrute-les",
  choiceWalkAwayShort: "( ._.) tourne les talons",
  act5HattingInProgress: "on met les chapeaux...",
  act5HattingWait: "...",
  act6ExitLabel: "SORTIE",

  floatOhNo: "oh non",
  floatExclaim: "!!",
  recruitOrdinals: ["un·e", "deux", "trois", "quatre", "cinq"],
  tapToContinue: "clique pour continuer",
  tapToContinueMobile: "appuie pour continuer",

  hudRecruit: "RECRUTEMENT",
  hudTime: "TEMPS",
  hudCrew: "BANDE",
  hudNarcs: "STOOLES",
  hudRally: "RALLIEMENT",
  hudMob: "GANG",

  hudCops: "TEMPS RESTANT",
  hudHaul: "BUTIN",

  foodCounterSuffix: " ARTICLES",

  act5TapHat: "clique pour donner un chapeau à tout le monde",
  act5TapHatMobile: "appuie pour donner un chapeau à tout le monde",
  act5TapEnter: "clique pour entrer dans le magasin",
  act5TapEnterMobile: "appuie pour entrer dans le magasin",
  act8TapDeposit: "clique pour partager la bouffe",
  act8TapDepositMobile: "appuie pour partager la bouffe",
  act8TapContinue: "clique pour continuer",
  act8TapContinueMobile: "appuie pour continuer",

  hudAvoidNarcs: "évite les stooles",
  muteMute: "muet",
  muteMuted: "son",
  quitBtn: "quitter",
  quitBtnMobile: "sortir",
  musicOff: "musique arrêtée",
  musicOffMobile: "♪ arrêt",
  musicLow: "musique basse",
  musicLowMobile: "♪ bas",
  musicMed: "musique moyenne",
  musicMedMobile: "♪ moyen",
  musicHigh: "musique forte",
  musicHighMobile: "♪ fort",
  helpCreditsTitle: "Crédits",
  helpMusicLabel: "Musique :",
  act2AmbMutters: ["ugh", ":(", "soupir", "...", "pfft", "oy", "man", "pourquoi moi", "$$$", "si fatigué·e", "loyer...", "factures"],
  act2PokePlayer: ["hmph.", "...", "longue journée.", "pas maintenant.", "hein?"],
  act6ShopperGasps: ["oh!", "!!", "voyons!", "eille—", "hein?!", "wow", "?!"],
  robinCheers: ["oui!!", "beau coup!", "wouhou!", "celui-là!!", "trop bon!", "continue!!", "ouiii!"],
  pylonLines: [
    "tu fonces dans le cône. il tient bon.",
    "le cône. évidemment.",
    "le premier cône de la saison.",
    "le cône était là avant nous. il sera là après nous.",
    "tu t'excuses auprès du cône.",
  ],
  bagelLines: [
    "un bagel au sésame, encore chaud. tu le prends.",
    "un vrai bagel de Montréal. quelle chance.",
    "un bagel sur le trottoir. à toi maintenant.",
  ],
  serviceberryLines: [
    "un amélanchier. des petits fruits gratuits.",
    "des amélanches. la ville a planté le dîner.",
    "un amélanchier. personne d'autre les cueille.",
  ],
  mulberryLines: [
    "un mûrier. tes mains vont être mauves.",
    "des mûres. mange maintenant, tache plus tard.",
    "des mûres sauvages. les oiseaux les veulent aussi.",
  ],
  nasturtiumLines: [
    "une capucine. poivrée. mange la fleur au complet.",
    "des capucines. une petite collation piquante.",
    "une capucine. comestible, et un peu un défi.",
  ],
  act2PokeNpc: ["hein?", "ah. salut.", "toute une météo.", "les prix, hein?", "ça va?", "longue journée."],
  act6RunCopShouts: ["revenez ici!", "arrêtez!", "au voleur!", "stop!"],
  act3CatAmb: ["miaou...", "prrrr", "mrrrow"],

  catLines: [
    { cat: "miaou !", you: "mignon." },
    { cat: "prrrr...", you: "c'est qui le bon chat" },
    { cat: "meow ?", you: "salut l'ami" },
    { cat: "mrrrow.", you: "je te vois" },
  ],
  coinPickups: [
    "dix cennes?",
    "une cenne noire, une relique ancienne",
    "score, deux piastres",
    "vingt-cinq cennes",
    "jackpot, cinq piastres!",
    "super, cinq cennes",
    "cinq cennes",
    "100$? non, une pub d'église",
  ],

  bannerEscaped: "ÉCHAPPÉ·E!",

  bannerWeLostThem: "on les a semés!",
  runBystanderLines: ["j'ai rien vu", "je les ai jamais vus", "bonne chance", "allez, cours", "vu quoi là?"],

  tapToWalk: "clique pour marcher",
  tapToWalkMobile: "appuie pour marcher",
  tapToContinueConv: "clique pour continuer",
  tapToContinueConvMobile: "appuie pour continuer",
  act3Move: "flèches pour bouger",
  act3MoveMobile: "glisse gauche ou droite pour marcher",

  // Act 3 in-context prompts
  act3WalkInto: "marche vers quelqu'un pour parler",
  act3WalkIntoMobile: "appuie sur un voisin pour parler",
  act3HopLane: "haut ou bas pour changer de voie",
  act3HopLaneMobile: "glisse haut ou bas pour changer de voie",

  // Act 4 in-context prompts
  act4Dodge: "flèches pour esquiver",
  act4DodgeMobile: "glisse haut ou bas pour esquiver",
  act4Run: "flèches pour bouger",
  act4RunMobile: "glisse à droite pour courir plus vite",

  // Act 6 in-context prompts
  act6Grab: "clique sur la bouffe pour la prendre",
  act6GrabMobile: "appuie sur la bouffe pour la prendre",

  brokenHeartTitle: "MORT·E D'UN CŒUR BRISÉ",
  brokenHeartSub: "mais qu'y avait-il à faire ?",

  act6DefectorLine1: "bouge pas!",
  act6DefectorPlayerLine: "tu vas me tazer pour un sac de pâtes?",
  act6DefectorLine2: "euh",
  act6DefectorPlayerLine2: "un héros local défend un rigatoni à 2$ jusqu'à la mort?",
  act6DefectorLine3: "ils me paient pas assez pour ça",
  act6DefectorPlayerLine3: "pis?",
  act6DefectorLine4: "pis les bonnes pâtes sont deux allées plus loin",
  floatGuardDefects: "viens, je vais te montrer",

  endYouFed: (n) => `t'as nourri ${n} voisin·e·s à soir.`,
  endCommunityFedText: (n) => `${n.toLocaleString()} voisin·e·s ont été nourri·e·s depuis le lancement du jeu.`,
  endWestonTicker: (n) => `la famille Weston a fait ${n}$ depuis que t'as commencé à jouer.`,
  endHistorical: "en décembre 2025, 40 personnes déguisées en père noël ont volé une chaîne d'épicerie à montréal et ont donné la bouffe aux affamés.",
  endHistoricalAgain: "ils ont frappé encore en février. |pause| et encore en mai.",
  endCTABridge: "à votre tour.",
};