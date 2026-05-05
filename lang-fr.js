window.LANG_FR = {
  test: "Bonjour de la version française",
  playBtn: "JOUER",
  overlayTitle: "ROBINS DES RUELLES",
  overlaySub: "promène-toi et parle à tes voisins n'importe quoi peut arriver<br><br>",
  // hudHaulLabel: "BUTIN",

  // banners
  bannerIsThisALife: "c'est ça, la vie?",
  bannerWhoIsInControl: "c'est qui qui décide ici?",
  bannerYouControlNothing: "(ce n'est certainement pas toi)",

  bannerRecruitCrew: "recrute ton équipe",
  bannerWatchNarcs: "mais méfie-toi des mouchards",
  bannerRallyNeighbourhood: "rallie le quartier!",
  bannerAvoidNarcs: "évite les mouchards",
  bannerYouHaveACrew: "ta petite équipe est au complet !",
  bannerCopsCircling: "Les flics rôdent. Dépêche-toi.",
  bannerGoodCallNarc: "bonne décision. c'était un mouchard.",
  bannerExitOpen: "SORTIE OUVERTE \u2014 EN BAS À DROITE!",
  bannerSecurityGrabbed: "LA SÉCURITÉ A PRIS DE LA BOUFFE! -$20",
  bannerGrabEverything: "clique pour attraper la nourriture!",
  bannerAvoidSecurity: "évite la sécurité",
  bannerFoodGloriousFood: "de la bouffe, enfin.",
  bannerShareBounty: "partageons le butin",
  // bannerNarc: "\u26A0 MOUCHARD! \u26A0",
    bannerHitNarc: "tu as heurté un narc — attention!",


  // act 4 urgency stages
  urgencyCopsCalled: "FLICS APPELÉS",
  urgencyHurry: "GROUILLE",
  urgencyClose: "PROCHE!",
  urgencyGetOut: "SORS D'ICI!",
  urgencyLastChance: "DERNIÈRE CHANCE",
  urgencyTooLate: "TROP TARD",

  // Indications de commandes — une paire par acte (bureau / mobile).
  controlsAct2:        "utilise ← ↑ → ↓ pour marcher · arrête-toi pour parler",
  controlsAct2Mobile:  "glisse pour marcher · arrête-toi pour parler",
  controlsAct2b:       "utilise ← ↑ → ↓ pour embarquer la foule",
  controlsAct2bMobile: "glisse pour embarquer la foule",
  controlsAct4:        "utilise ← ↑ → ↓ · clique sur la bouffe pour la prendre",
  controlsAct4Mobile:  "glisse · touche la bouffe pour la prendre",
    hintLabel: "commandes",


  // floats
  floatReadTheRoom: "lis la situation",
  floatListenBetter: "t'as besoin de mieux écouter",
  floatWrongEnergy: "mauvaise énergie",
  floatTooCautious: "peut-être un peu trop prudent?",
  floatGiveChance: "donne une chance aux gens",
  floatNeverChange: "rien changera si on n'essaie pas",
  floatGoodCallSmelled: "bonne décision. ça sentait le mouchard",
  floatNewRobin: "Nouveau Robin!",
  floatTheyreIn: "Dans l'équipe!",
  floatCrewGrows: "L'équipe grandit!",
  floatNotYet: "Pas encore. Mais ça réfléchit",
  floatNeedTime: "Ça a besoin de temps",
  floatNarc: "MOUCHARD!",
  floatOops: "OUPS!",

  // act 2b floats
  floatOui: "OUI!",
  floatLetsGo: "ALLONS-Y!",
  floatAllonsY: "ALLONS-Y!",
  floatCountMeIn: "J'EN SUIS!",
  floatYeah: "OUAIS!",
  floatForReal: "POUR VRAI!",

  // end game overlay
  endGameBustedTitle: "POGNÉ!",
  endGameBustedSub: "trop de mouchards",
  endGameCaughtTitle: "POGNÉ!",
  endGameCaughtSub: "Les flics t'ont eu.\nles robins sont partis avec $",
  endGameTryAgain: "RÉESSAYER",
  endGameGiveUp: "ABANDONNER POUR TOUJOURS",

  // act 5
  bannerKeepLivingLike: "t'as continué à vivre comme ça\njusqu'à ce que tu puisses plus",
  endScreenTryAgain: "réessayer?",

  a1Encounters: [
    {
      turns: [
        {
          who: "p",
          texts: [
            "c'est quoi cette histoire de prix?",
            "ugh, t'as vu le prix des épiceries?",
            "crisse, quand la bouffe est devenue si chère?",
            "ostie, quand est-ce que c'est devenu SI cher??",
            "CÂLICE. comment c'est devenu aussi cher??",
          ],
        },
        { who: "n", text: "j'utilise une app de coupons" },
        { who: "p", texts: ["ok...", "de quoi tu parles??", "qu'est-ce que tu racontes, estine?", "ugh crisse", "J'M'EN CALICE DES APPS"] },
      ],
    },
    {
      turns: [
        {
          who: "p",
          texts: [
            "2$ pour une pomme?",
            "2 piasses pour une maudite pomme??",
            "ostie de... 2$ pour UNE pomme?",
            "esti de marde, 2 PIASSES pour UNE pomme",
            "CÂLICE. 2$ pour une pomme??!",
          ],
        },
        { who: "n", text: "pis?" },
        {
          who: "p",
          texts: [
            "pis...on peut pas vivre de même",
            "viarge, on peut pas continuer comme ça",
            "câline, on peut PAS survivre de même",
            "CRISSE. personne peut vivre comme ça",
            "TABARNAK. personne devrait avoir à vivre comme ça",
          ],
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
            "CRISSE, quelqu'un doit faire quelque chose",
            "câline. quelqu'un doit agir",
            "ESTI DE CÂLICE DE TABARNAK. quelqu'un doit faire quelque chose",
          ],
        },
        { who: "n", text: "voler un voleur, c'est pas voler" },
        { who: "p", texts: ["quoi?", "...WTF?", "ostie... ça veut dire quoi", "QU'EST-CE QUE TU DIS?", "TABARNAK! répète ça!"], delay: 2800 },
      ],
    },
  ],

  a1LoopMsgs: [
    { t: "rien change...", c: "#999" },
    { t: "...câline, encore ça", c: "#aaa" },
    { t: "ostie. encore.", c: "#b09abf" },
    { t: "crisse, pis quoi encore", c: "#b080c0" },
    { t: "ostie. ENCORE LA MÊME CHOSE", c: "#c060a0" },
    { t: "OSTIE DE CÂLICE. vraiment??", c: "#c84080" },
    { t: "TABARNAK. je fais quoi exactement??", c: "#cc2050" },
    { t: "CÂLICE DE TABARNAK. c'est ça, la VIE??", c: "#d01030" },
    { t: "OSTIE CÂLICE CRISSE TABARNAK", c: "#dd0020" },
    { t: "TABARNAK CÂLICE CRISSE VIARGE OSTIE DE...", c: "#ff0000" },
  ],

  ctaStory: [
    { t: 0, text: "en décembre 2025," },
    { t: 1100, text: "40 personnes déguisées en père noël" },
    { t: 2200, text: "ont volé une chaîne d'épicerie à montréal" },
    { t: 3300, text: "et ont donné la nourriture aux affamés" },
    { t: 4600, text: "" },
    { t: 5400, text: "en février 2026, ils ont recommencé" },
    { t: 6700, text: "" },
    { t: 7500, text: "ils se sont appelés" },
    { t: 8600, text: "ROBINS DES RUELLES" },
    { t: 9900, text: "" },
    { t: 10700, text: "est-ce que ton quartier est le prochain?" },
  ],
  vigTemplates: [
    (nm) => nm.n + " a mangé pour la première fois aujourd'hui",
    (nm) => nm.n + " prépare le pâté chinois de " + nm.p + " mère ce soir",
    (nm) => nm.n + " a apporté une soupe pour " + nm.p + " amis",
    (nm) => nm.n + " a du pain pour " + nm.p + " enfants",
    (nm) => nm.n + " a partagé la moitié avec un inconnu en rentrant",
    (nm) => nm.n + " cuisine un vrai souper pour " + nm.p + " grand-mère",
  ],
  endNames: [
    { n: "Marie", p: "sa" },
    { n: "Manu", p: "sa" },
    { n: "Fatima", p: "sa" },
    { n: "Olivier", p: "sa" },
    { n: "Mei", p: "sa" },
    { n: "Amadou", p: "sa" },
    { n: "Sophie", p: "sa" },
    { n: "Ali", p: "sa" },
  ],

  endCrewBrought: (tot) => "votre équipe a rapporté " + tot + "$ en épicerie",
  endYouCarried: (my) => "tu en as porté " + my + "$",
  endPeopleAte: (fed) => fed + " personnes ont mangé ce soir",
  endYouAte: "(toi aussi tu as mangé)",

  act1Choices: ["(>_<) j'en ai assez", "(o_O)  qu'est-ce que je peux faire? Je vais juste continuer comme ça"],

  neighbourMsgs: ["merci", "mes enfants mangent ce soir", "enfin", "avec amour!", "merci beaucoup", "thank you"],
  intercoms: [
    "ATTENTION CLIENTS: le spécial du jour — la dignité",
    "ATTENTION CLIENTS: votre faim n'est pas notre problème",
    "SPÉCIAL: deux cannes de honte pour le prix de trois",
    "RAPPEL: le troisième yacht de notre PDG vous remercie",
    "HEURES D'OUVERTURE: ouvert jusqu'à ce qu'on décide que vous avez assez dépensé",
    "ATTENTION: les clients en ont assez",
    "ATTENTION: vérification de prix sur tout: gratuit",
    "SÉCURITÉ: la direction vous demande d'arrêter de nous voler",
    "ATTENTION: nettoyage dans TOUTES les allées",
    "SÉCURITÉ: CODE ROUGE",
    "ATTENTION CLIENTS: l'empathie est en rupture de stock",
    "ATTENTION CLIENTS: vérification de prix sur la dignité… refusée",
    "ATTENTION: sécurité dans toutes les allées",
    "SÉCURITÉ: le magasin vit un événement de redistribution non planifié",
  ],

  act2bAmbNarc: ["capitalisme!", "actions", "investissements", "méritocratie"],
  act2bAmbCrowd: ["faim", "ugh", "fauché", "épuisé", "aide", "soupir", "loyer...", "factures", "vide"],
  crewItems: ["AVOINE", "NOIX", "PAIN", "HUILE", "JUS", "PATATES", "SOUPE"],

  hudAct4Haul: (my, crew) => "Toi " + my + "$ + Équipe " + crew + "$",

  bannerOneStore: " une épicerie.",
  bannerLetsEat: " on mange.",

  urgencyCopsEnRoute: ">> FLICS EN ROUTE <<",
  urgencyFindExit: "!! TROUVE LA SORTIE !!",

  endGameTimedOutTitle: "POGNÉ!",
  endGameTimedOutSub: "Les narcs t'ont dénoncé. La prochaine fois, fais ça vite.",
  bannerHatsOn: "chapeaux.",

  choiceCommiserateAngry: "(╯°□°)╯ mets-en",
  choiceCommiserateHungry: "(っ◔◡◔)っ compatir",
  choiceTalkOver: "(ಠ_ಠ) parler par-dessus",
  choiceRun: "[>_>] FUIR",
  choiceTryHarderAngry: "(ง'̀-'́)ง insister",
  choiceTryHarderHungry: "(｡•́︿•̀｡) insister",
  choiceWalkAway: "( ._.) partir",

  // FR
  recruitProgress1: "{ord} DE MOINS — {que} {rem}",
  recruitProgressRemaining: " à aller !",
  recruitProgressComplete: "★ ÉQUIPE COMPLÈTE ★",
  choiceRecruitAngry: "(ง'̀-'́)ง les recruter",
  choiceRecruitHungry: "(•‿•) les recruter",
  choiceWalkAwayShort: "( ._.) se défiler",
  act3HattingInProgress: "on met les chapeaux...",
  act3HattingWait: "...",
  act3HatsOnEnter: "chapeaux mis. on y va.",
  act4ExitLabel: "SORTIE",
  ctaChoiceYes: "oui — dis-moi comment",
  ctaChoiceMaybe: "peut-être un jour",
  ctaEndYes: "alors ça commence par toi.",
  ctaEndMaybe: "le quartier va attendre.",
  ctaPlayAgain: "REJOUER",
  ctaGameTitle: "ROBINS DES RUELLES",
  ctaFinalSub: "Le quartier se souvient.<br><br>Tu te joins à eux ?",
  loopGiveUpTitle: "non",
  loopGiveUpSub: "tu as continué à vivre comme ça\njusqu'à ne plus pouvoir",
  loopTryAgain: "réessayer ?",

bannerTooManyNarcs: "TROP DE NARCS",    // FR


  floatOhNo: "oh non",
  floatExclaim: "!!",
  recruitOrdinals: ["une", "deux", "trois", "quatre", "cinq"],
  endGameCaughtHad: "T'avais {tot}$.",
  tapToContinue: "appuie pour continuer",

  hudRecruit: "RECRUTEMENT",
  hudTime: "TEMPS",
  hudNarcs: "NARCS",
  hudRally: "RASSEMBLEMENT",
  hudMob: "FOULE",

  hudCops: "COPS",
  hudHaul: "HAUL",

  foodCounterSuffix: " ITEMS",

  act3TapHat: "appuie pour mettre des chapeaux",
  act3HattingInProgress: "on met les chapeaux...",
  act3HattingWait: "...",
  act3TapEnter: "appuie pour entrer dans le magasin",
  act5TapContinue: "appuie pour continuer",
  act5TapDeposit: "appuie pour partager la bouffe",

  hudAvoidNarcs: "évite les narcs",
  muteMute: "son",
  muteMuted: "muet",
  quitBtn: "quitter",
  act1AmbMutters: ["ugh", "merde", ":(", "soupir", "...", "pfft", "crisse", "câline", "pourquoi", "$$$", "épuisé", "loyer..."],

  catLines: [
    { cat: "miaou !", you: "trop mignon." },
    { cat: "prrrr...", you: "qui est un bon chat" },
    { cat: "meow ?", you: "salut l'ami" },
    { cat: "mrrrow.", you: "je te vois" },
  ],
  coinPickups: [
    { amount: "+0,10$", quip: "85 de plus = un sac de chips" },
    { amount: "+0,01$", quip: "une relique ancienne" },
    { amount: "+2,00$", quip: "dépense pas tout d'un coup" },
    { amount: "+0,25$", quip: "vingt-cinq sous. wow." },
    { amount: "+5,00$", quip: "dép ce soir." },
    { amount: "+0,05$", quip: "lol. cinq cennes." },
    { amount: "+20,00$", quip: "faux. invitation à l'église au verso." },
  ],

  bannerEscaped: "ÉCHAPPÉ!",
  bannerBackToHood: "retour dans le quartier.",

  bannerWeLostThem: "on les a perdus!",
  runBystanderLines: ["j'ai rien vu", "vu personne moi", "bonne chance!", "courez, courez", "vu quoi?"],
  act5TapDeposit: "appuyez pour partager",
};
