window.LANG_EN = {
  playBtn: "PLAY",
  overlayTitle: "ROBINS DES RUELLES",
  overlayHint: "a true story",

  // banners
  bannerIsThisALife: "this is your life",
  bannerWhoIsInControl: "but who's in control here?",
  bannerYouControlNothing: "(it isn't you)",

  bannerRecruitCrew: "recruit your crew",
  bannerWatchNarcs: "but watch out for narcs",
  bannerRallyNeighbourhood: "rally the neighbourhood!",
  bannerAvoidNarcs: "avoid narcs",
  bannerYouHaveACrew: "tiny crew assembled!",
  bannerCrewAssembled: "crew assembled",
  bannerCrewTimeout: "out of time!\nsmall crew, but it'll do.",
  bannerCopsCircling: "Cops are circling. wrap it up!",
  bannerGoodCallNarc: "good call. that was a narc.",
  bannerExitOpen: "EXIT \u2014 BOTTOM RIGHT!",
  act6SecurityArrives: "SECURITY! stop right there!",
  bannerSecurityGrabbed: "SECURITY GRABBED SOME FOOD! -$20",
  bannerGrabEverything: "click to grab food!",
  bannerGrabEverythingMobile: "tap to grab food!",
  bannerAvoidSecurity: "leave before the cops come!",
  bannerFoodGloriousFood: "food glorious food.",
  bannerHitNarc: "watch out! that was a narc!",

  // act 4 urgency stages
  urgencyCopsCalled: "COPS CALLED",
  urgencyHurry: "HURRY",
  urgencyClose: "CLOSE!",
  urgencyGetOut: "GET OUT!",
  urgencyLastChance: "LAST CHANCE",
  urgencyTooLate: "TOO LATE",

  // floats
  floatReadTheRoom: "read the room",
  floatListenBetter: "you need to listen better",
  floatWrongEnergy: "wrong energy",
  floatTooCautious: "maybe a bit too cautious?",
  floatGiveChance: "give people a chance",
  floatNeverChange: "things will never change if we don't try",
  floatGoodCallSmelled: "good call. that smelled like a narc",
  floatNotYet: "not yet. But they're thinking",
  floatNeedTime: "they need time",
  // floatNarc: "NARC!",

  floatNarcRecruited: "you tried to recruit a narc!",
floatNarcHit: "you ran into a narc!",
  floatOops: "OOPS!",

  // act 2b floats
  floatOui: "OUI!",
  floatLetsGo: "LET'S GO!",
  floatAllonsY: "ALLONS-Y!",
  floatCountMeIn: "COUNT ME IN!",
  floatYeah: "YEAH!",
  floatForReal: "FOR REAL!",

  // end game overlay
  endGameBustedTitle: "BUSTED!",
  endGameBustedSub: "you recruited too many narcs",
  endGameCaughtTitle: "TOO SLOW!",
  endGameCaughtSub: "cops almost got you.\nthe crew scattered.",
  endGameEmptyHandedTitle: "YOU LEFT EMPTY-HANDED.",
  endGameEmptyHandedSub: "and empty-stomached too",


a1Encounters: [
    {
      turns: [
        { who: "p", text: "ugh. |pause|why is food so expensive?" },
        { who: "n", text: "idk|pause| but i have an app \nthat helps me get rotting groceries for cheap" },
        { who: "p", text: "uh, ok" },
        { who: "n", text: "want a referral?" },
        { who: "p", text: "maybe later" },
      ],
      loopTurns: [
        { who: "p", texts: ["crisse, why is food STILL so expensive?", "C4LICE. WHY IS F00D ST1LL S0 EXPENSIVE."] },
        { who: "n", texts: ["idk, want that app for rotting groc3ries N0W?", "i d k r0tting. f00d r0tting 4pp. r0tting me."] },
      ],
    },
    {
      turns: [
        { who: "p", text: "you know that one in three Quebecers can't afford groceries?" },
        { who: "n", text: "so\ntwo in three\n are doing great?" },
        { who: "p", text: "what?" },
      ],
      loopTurns: [
        { who: "p", texts: ["crisse, one in three of us can't afford to eat", "TABARNAK. ONE IN THR33 AND N0THING CHANGES."] },
        { who: "n", texts: ["what's the problem with a little hunger?", "h0nestly? pr0b4bly ok l0l 4nyway."] },
      ],
    },
    {
      turns: [
        { who: "p", text: "someone should do something" },
        { who: "n", text: "you know,\nstealing from a thief|pause|\nisn't theft" },
        { who: "p", text: "wait,|pause|what?" },
      ],
      loopTurns: [
        { who: "p", texts: ["câline, someone HAS to do something", "ESTI DE CÂLICE. I JUST GO IN CIRCLES. COMPLAINING."] },
        { who: "n", texts: ["well th3r3 is a way", "y o u  k n o w the g4me w4nts you to he4r this"] },
      ],
    },
  ],

  a1LoopMsgs: [
    { t: "nothing changes...", c: "#999" },
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
    { n: "Marie", p: "their" },
    { n: "Manu", p: "his" },
    { n: "Fatima", p: "her" },
    { n: "Olivier", p: "his" },
    { n: "Mei", p: "her" },
    { n: "Amadou", p: "his" },
    { n: "Sophie", p: "her" },
    { n: "Ali", p: "his" },
  ],


  // act2Choices: ["(>_<)", "(o_O)"],
  act2Choices: ["(>_<) I've had enough", "(o_O) whatever"],

  act3Undecided: ["hmm", "hmmm", "let me think"],
  act3Wait: ["wait for me", "i'm coming", "hold up"],

  neighbourMsgs: ["merci", "my kids eat tonight", "finally", "love!", "merci beaucoup", "thank you"],
  intercoms: [
    "ATTENTION SHOPPERS: your hunger is not our problem",
    "SPECIAL: two cans of shame for the price of one",
    "REMINDER: our CEO's third yacht thanks you for shopping here",
    "STORE HOURS: open until we decide you've spent enough",
    "ATTENTION: price check on everything: free",
    "SECURITY: management requests you stop robbing us",
    "ATTENTION: cleanup on ALL aisles",
    "ATTENTION SHOPPERS: price check on dignity… denied",
    "ATTENTION: security to every aisle",
    "SECURITY: the store is experiencing an unplanned redistribution event",
  ],

  act4AmbNarc: ["stocks", "investments", "meritocracy"],
  act4AmbCrowd: ["hungry", "broke", "help?"],


  bannerOneStore: " one store",
  bannerLetsEat: " let's eat",
  urgencyCopsEnRoute: ">> COPS EN ROUTE <<",
  urgencyFindExit: "!! FIND THE EXIT !!",

  endGameTimedOutTitle: "BUSTED!",
  endGameTimedOutSub: "someone reported you\ntry again?",

  bannerHatsOn: "hats on",


  // NO WORDS
  // choiceCommiserateAngry: ["(╯°□°)╯"],
  // choiceCommiserateHungry: ["(っ◔◡◔)っ"],
  // choiceTalkOver: ["(ಠ_ಠ)"],
  // choiceRun: "[>_>]",

  // WITH WORDS
  choiceCommiserateAngry: ["(╯°□°)╯ yes!", "(╯°□°)╯ RIGHT", "(╯°□°)╯ yeah!", "(╯°□°)╯ true"],
  choiceCommiserateHungry: ["(っ◔◡◔)っ yes", "(っ◔◡◔)っ totally", "(っ◔◡◔)っ yeah", "(っ◔◡◔)っ true"],
  choiceTalkOver: ["(ಠ_ಠ) talk over them", "(ಠ_ಠ) cut them off", "(ಠ_ಠ) so, anyways", "(ಠ_ಠ) well actually"],
  choiceRun: "[>_>] RUN",
  // choiceTryHarderAngry: "(ง'̀-'́)ง",
  // choiceTryHarderHungry: "(｡•́︿•̀｡)",
  // choiceWalkAway: "( ._.)",
  choiceTryHarderAngry: "(ง'̀-'́)ง try harder",
  choiceTryHarderHungry: "(｡•́︿•̀｡) try harder",
  choiceWalkAway: "( ._.) walk away",

  bannerTooManyNarcs: "TOO MANY NARCS", // EN
  recruitProgressCat: "a cat joins the crew — {rem} {noun} to go!",
recruitProgressCompleteCat: "★ CREW COMPLETE (with cat) ★",

  recruitProgress1: "{ord} in your crew — {rem} to go!",
  recruitProgressRemaining: " to go!",
  recruitProgressComplete: "★ CREW COMPLETE ★",
  recruitNounSingular: "robin",
  recruitNounPlural: "robins",
  // choiceRecruitAngry: "ᕦ(ò_óˇ)ᕤ",
  // choiceRecruitHungry: "(•‿•)",
  // choiceWalkAwayShort: "( ._.)",
  choiceRecruitAngry: "ᕦ(ò_óˇ)ᕤ recruit them",
  choiceRecruitHungry: "(•‿•) recruit them",
  choiceRecruitCat: "(=^･ｪ･^=) recruit them",
  choiceWalkAwayShort: "( ._.) walk away",
  floatCatDeclined: ["she wasn't fussed either way", "not every cat joins the crew", "he'll be back around"],
  act5HattingInProgress: "putting on hats...",
  act5HattingWait: "...",
  act6ExitLabel: "EXIT",

  floatOhNo: "oh no",
  floatExclaim: "!!",
  recruitOrdinals: ["one", "two", "three", "four", "five"],
  tapToContinue: "click to continue",
  tapToContinueMobile: "tap to continue",

  hudRecruit: "RECRUIT",
  hudTime: "TIME LEFT",
  hudCrew: "CREW",
  hudNarcs: "NARCS",
  hudRally: "RALLY",
  hudMob: "MOB",

  hudCops: "TIME REMAINING",
  hudHaul: "HAUL",

  foodCounterSuffix: " ITEMS",

  act5TapHat: "click to give everyone a hat",
  act5TapHatMobile: "tap to give everyone a hat",
  act5TapEnter: "click to enter the store",
  act5TapEnterMobile: "tap to enter the store",
  act8TapDeposit: "click to share the food",
  act8TapDepositMobile: "tap to share the food",
  act8TapContinue: "click to continue",
  act8TapContinueMobile: "tap to continue",

  hudAvoidNarcs: "avoid narcs",
  muteMute: "mute",
  muteMuted: "muted",
  quitBtn: "quit",
  musicOff: "music off",
  musicLow: "music low",
  musicMed: "music medium",
  musicMedMobile: "music med",
  musicHigh: "music high",
  helpCreditsTitle: "Credits",
  helpMusicLabel: "Music:",
  act2AmbMutters: ["ugh", ":(", "sigh", "...", "pfft", "oy", "bruh", "why me", "$$$", "so tired", "rent...", "bills"],
  act2PokePlayer: ["hmph.", "...", "long day.", "not now.", "hm?"],
  act6ShopperGasps: ["oh!", "!!", "gasp", "oh my—", "hey!", "whoa", "?!"],
  robinCheers: ["yes!!", "nice grab!", "woooo!", "that one!!", "so good!", "keep going!!", "yesss!"],
  pylonLines: [
    "you bump the pylon. it stands firm.",
    "a pylon. of course.",
    "season's first cone.",
    "the cone was here before us. it will outlast us.",
    "apologize to the pylon.",
  ],
  bagelLines: [
    "a sesame bagel, still in the bag",
    "a bagel? still warm. lucky.",
    "a bagel! finders keepers.",
  ],
  serviceberryLines: [
    "a serviceberry tree? free fruit, if you know.",
    "amélanchier berries? the city planted lunch.",
    "serviceberries. sweet!",
  ],
  mulberryLines: [
    "a mulberry tree. purple hands incoming.",
    "mulberries. eat now, regret the stains later.",
    "wild mulberries!",
  ],
  nasturtiumLines: [
    "a nasturtium. peppery and delicious",
    "capucine flowers. a spicy little snack.",
    "nasturtiums, yum",
  ],
  act2PokeNpc: ["hm?", "oh, hey", "some weather.", "ugh", "blech", "off long day"],
  act6RunCopShouts: ["get back here!", "stop!", "hey!", "freeze!"],
  act3CatAmb: ["miaou...", "prrrr", "mrrrow"],

  catLines: [
    { cat: "miaou", you: "oh hiii want to join us?" },
    { cat: "prrrr", you: "who's a good kitty?" },
    { cat: "meow", you: "hi friend" },
    { cat: "mrrrow", you: "I see you" },
  ],
  coinPickups: [
    "a dime?",
    "a penny, an ancient artifact",
    "score, two bucks",
    "a quarter",
    "jackpot, five bucks!",
    "great, 5 cents",
    "5 cents",
    "$100? no it's an ad for church",
  ],

  bannerEscaped: "ESCAPE!",
  // bannerBackToHood: "back to the neighbourhood.",

  bannerWeLostThem: "we lost them!",
  runBystanderLines: ["didn't see a thing", "never saw 'em", "good for you", "go on, run", "saw what now?"],

  tapToWalk: "click to walk",
  tapToWalkMobile: "tap to walk",
  tapToContinueConv: "click to continue",
  tapToContinueConvMobile: "tap to continue",
  act3Move: "arrow keys to move",
  act3MoveMobile: "drag left or right to walk",

  // Act 3 in-context prompts
  act3WalkInto: "walk into someone to talk",
  act3HopLane: "up or down to switch lanes",
  act3HopLaneMobile: "tap above or below to switch lanes",

  // Act 4 in-context prompts
  act4Dodge: "arrows to dodge",
  act4DodgeMobile: "swipe up or down to dodge",
  act4Run: "arrow keys to move",
  act4RunMobile: "swipe right to run faster",

  // Act 6 in-context prompts
  act6Grab: "click food to grab it",
  act6GrabMobile: "tap food to grab it",

  brokenHeartTitle: "DIED OF A BROKEN HEART",
  brokenHeartSub: "but what could you do?",

  act6DefectorLine1: "hold it right there!",
  act6DefectorPlayerLine: "you gonna tase me over a bag of pasta?",
  act6DefectorLine2: "uh",
  act6DefectorPlayerLine2: "local hero defends $2 rigatoni to the death?",
  act6DefectorLine3: "ugh they don't pay me enough for this",
  act6DefectorPlayerLine3: "so?",
  act6DefectorLine4: "so the good pasta is two aisles over",
  floatGuardDefects: "c'mon, I'll show you",

  endYouFed: (n) => `you fed ${n} neighbours tonight.`,
  endCommunityFedText: (n) => `${n.toLocaleString()} neighbours have been fed since this game launched.`,
  endWestonTicker: (n) => `the weston family made $${n} since you started playing.`,
  endHistorical: "in december 2025, 40 people dressed as santa robbed a grocery chain in montréal and gave the food to the hungry.",
  endHistoricalAgain: "they hit again in february. |pause| and again in may.",
  endCTABridge: "your turn.",
};


