window.LANG_EN = {
  test: "Hello from English",
  playBtn: "PLAY",
  overlayTitle: "ROBIN  DES RUELLES",
  overlaySub: "walk around and talk to your neighbours anything could happen<br><br>",
  // hudHaulLabel: "HAUL",

  // banners
  bannerIsThisALife: "is this a life?",
  bannerWhoIsInControl: "who's in control here?",
  bannerYouControlNothing: "(it sure isn't you)",

  bannerRecruitCrew: "recruit your crew",
  bannerWatchNarcs: "but watch out for narcs",
  bannerRallyNeighbourhood: "rally the neighbourhood!",
  bannerAvoidNarcs: "avoid narcs",
  bannerYouHaveACrew: "tiny crew assembled!",
  bannerCopsCircling: "Cops are circling. Wrap it up.",
  bannerGoodCallNarc: "good call. that was a narc.",
  bannerExitOpen: "EXIT OPEN \u2014 BOTTOM RIGHT!",
  bannerSecurityGrabbed: "SECURITY GRABBED SOME FOOD! -$20",
  bannerGrabEverything: "click to grab food!",
  bannerAvoidSecurity: "avoid security",
  bannerFoodGloriousFood: "food glorious food.",
  bannerShareBounty: "share the bounty?",
  // bannerNarc: "\u26A0 NARC! \u26A0",
  bannerHitNarc: "you hit a narc — watch out!",

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
  floatNewRobin: "New Robin!",
  floatTheyreIn: "They're in!",
  floatCrewGrows: "Crew grows!",
  floatNotYet: "Not yet. But they're thinking",
  floatNeedTime: "They need time",
  floatNarc: "NARC!",
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
  endGameBustedSub: "too many narcs",
  endGameCaughtTitle: "CAUGHT!",
  endGameCaughtSub: "Cops got you.\nrobins escaped with $",
  endGameTryAgain: "TRY AGAIN",
  endGameGiveUp: "GIVE UP FOREVER",

  // act 5
  bannerKeepLivingLike: "you kept living like this\nuntil you couldn't anymore",
  endScreenTryAgain: "try again?",

  a1Encounters: [
    {
      turns: [
        {
          who: "p",
          texts: [
            "why is food so expensive?",
            "ugh, when did grocery stores get so fucké?",
            "crisse, when did food get sacrament chére?",
            "ostie, when did food get SO expensive??",
            "CÂLICE. when did food get this expensive??",
          ],
          hold: 3000, // setup — quick into the joke
        },
        { who: "n", text: "idk\n but I have an app for coupons", hold: 4500 }, // mini- give it a beat
        { who: "n", text: "\n\nand I have another app \n|pause|that helps me buy rotting food", hold: 5500 }, // punch — let it land
        {
          who: "p",
          texts: ["um,|pause|ok", "what are you even SAYING?", "what are you talking about, estine?", "ugh crisse", "J'M'EN CALICE DES APPS"],
          hold: 4500, // last line — lingers before walking away
        },
      ],
    },
    {
      turns: [
        {
          who: "p",
          texts: [
            "it was $2 for an apple",
            "2 piasses for a freaking apple??",
            "ostie de... $2 for ONE apple?",
            "esti de marde, 2 PIASSES for ONE apple",
            "CÂLICE. 2 for an apple??!",
          ],
          hold: 3500, // setup with weight
        },
        { who: "n", text: "and?", hold: 3000 }, // short, dry — room to feel sharp
        {
          who: "p",
          texts: [
            "and...I had to put it back",
            "viarge, we can't keep living like this",
            "câline, we just CAN'T survive like this",
            "CRISSE. nobody can survive like this",
            "TABARNAK. nobody should have to survive like this",
          ],
          hold: 4000, // emotional beat
        },
        { who: "p", text: "just|pause|humiliating", hold: 4500 }, // last line — heavy, let it sit
      ],
    },
    {
      turns: [
        {
          who: "p",
          texts: [
            "someone should do something",
            "câline, someone HAS to do something",
            "CRISSE, somebody has to do something about this",
            "câline. somebody needs to do something",
            "ESTI DE CÂLICE DE TABARNAK. someone has to do something",
          ],
          hold: 3500, // setup
        },
        { who: "n", text: "you know,\nstealing from a thief|pause|\nisn't theft", hold: 6000 }, // the THESIS of the game — let it really land
        {
          who: "p",
          texts: ["what?|pause|", "...WTF?", "ostie... what does that mean", "WHAT ARE YOU SAYING?", "TABARNAK! say that again!"],
          hold: 4500, // last line of the act — final beat before walking away
        },
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

  ctaStory: [
    { t: 0, text: "in december 2025," },
    { t: 1100, text: "40 people dressed as santa" },
    { t: 2200, text: "robbed a grocery store chain in montreal" },
    { t: 3300, text: "they gave the food to the hungry" },
    { t: 4600, text: "" },
    { t: 5400, text: "in february they hit again" },
    { t: 6700, text: "and again in may" },
    { t: 7500, text: "they call themselves" },
    { t: 8600, text: "ROBINS DES RUELLES" },
    { t: 9900, text: "" },
    { t: 10700, text: "is your neighbourhood next?" },
  ],
  vigTemplates: [
    (nm) => nm.n + " ate for the first time today",
    (nm) => nm.n + " is making " + nm.p + " mother's potato casserole tonight",
    (nm) => nm.n + " brought a pot of soup for " + nm.p + " friends",
    (nm) => nm.n + " has bread for " + nm.p + " children",
    (nm) => nm.n + " shared half with a stranger on the way home",
    (nm) => nm.n + " is cooking a real dinner for " + nm.p + " grandma",
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

  endCrewBrought: (tot) => "your crew brought home $" + tot + " of groceries",
  endYouCarried: (my) => "you carried $" + my + " of it",
  endPeopleAte: (fed) => fed + " people ate tonight",
  endYouAte: "(and you ate too)",

  muteMuted: "muted",
  muteMute: "mute",
  act1Choices: ["(>_<) I've had enough", "(o_O) what choice do I have?"],

  neighbourMsgs: ["merci", "my kids eat tonight", "finally", "love!", "merci beaucoup", "thank you"],
  intercoms: [
    "ATTENTION SHOPPERS: today's special — dignity",
    "ATTENTION SHOPPERS: your hunger is not our problem",
    "SPECIAL: two cans of shame for the price of three",
    "REMINDER: our CEO's third yacht thanks you for shopping here",
    "STORE HOURS: open until we decide you've spent enough",
    "ATTENTION: attention: the customers have had enough",
    "ATTENTION: price check on everything: free",
    "SECURITY: management requests you stop robbing us",
    "ATTENTION: cleanup on ALL aisles",
    "SECURITY: CODE RED",
    "ATTENTION SHOPPERS: empathy is out of stock",
    "ATTENTION SHOPPERS: price check on dignity… denied",
    "ATTENTION: security to every aisle",
    "SECURITY: the store is experiencing an unplanned redistribution event",
  ],

  act2bAmbNarc: ["capitalism!", "stocks", "investments", "meritocracy"],
  act2bAmbCrowd: ["hungry", "ugh", "broke", "tired", "help", "sigh", "rent...", "bills", "empty"],
  crewItems: ["OATS", "NUTS", "BREAD", "OIL", "JUICE", "POTATOES", "SOUP"],

  hudAct4Haul: (my, crew) => "You $" + my + " + Crew $" + crew,

  bannerOneStore: " one store",
  bannerLetsEat: " let's eat",
  urgencyCopsEnRoute: ">> COPS EN ROUTE <<",
  urgencyFindExit: "!! FIND THE EXIT !!",

  
  endGameTimedOutTitle: "BUSTED!",
  endGameTimedOutSub: "The narcs reported you. Next time work faster.",

  bannerHatsOn: "hats on.",

  choiceCommiserateAngry: "(╯°□°)╯ agree",
  choiceCommiserateHungry: "(っ◔◡◔)っ commiserate",
  choiceTalkOver: "(ಠ_ಠ) talk over them",
  choiceRun: "[>_>] RUN",
  choiceTryHarderAngry: "(ง'̀-'́)ง try harder",
  choiceTryHarderHungry: "(｡•́︿•̀｡) try harder",
  choiceWalkAway: "( ._.) walk away",

  bannerTooManyNarcs: "TOO MANY NARCS",   // EN
  // EN
recruitProgress1: "{ord} down — {rem} to go",  recruitProgressRemaining: " to go!",
  recruitProgressComplete: "★ CREW COMPLETE ★",
  choiceRecruitAngry: "ᕦ(ò_óˇ)ᕤ recruit them",
  choiceRecruitHungry: "(•‿•) recruit them",
  choiceWalkAwayShort: "( ._.) walk away",
  act3HattingInProgress: "putting on hats...",
  act3HattingWait: "...",
  act3HatsOnEnter: "hats on. time to go.",
  act4ExitLabel: "EXIT",
  ctaChoiceYes: "yes — tell me how",
  ctaChoiceMaybe: "maybe someday",
  ctaEndYes: "then it starts with you.",
  ctaEndMaybe: "the neighbourhood will wait.",
  ctaPlayAgain: "PLAY AGAIN",
  ctaGameTitle: "ROBINS DES RUELLES",
  ctaFinalSub: "The neighbourhood remembers.<br><br>Will you join them?",
  loopGiveUpTitle: "no",
  loopGiveUpSub: "you kept living like this\nuntil you couldn't anymore",
  loopTryAgain: "try again?",

  floatOhNo: "oh no",
  floatExclaim: "!!",
  recruitOrdinals: ["one", "two", "three", "four", "five"],
  endGameCaughtHad: "You had {tot}$.",
  tapToContinue: "tap to continue",

  hudRecruit: "RECRUIT",
  hudTime: "TIME LEFT",
  hudNarcs: "NARCS",
  hudRally: "RALLY",
  hudMob: "MOB",

  hudCops: "TIME REMAINING",
  hudHaul: "HAUL",

  foodCounterSuffix: " ITEMS",


  // Control hints — one pair per act. Each act has a desktop string (keyboard / mouse focus)
  // and a mobile string (touch focus). The renderer picks based on Device.isMobile.
controlsAct2:        "use arrow keys to walk · stop next to someone to talk",
controlsAct2Mobile:  "drag to walk · stop next to someone to talk",
controlsAct2b:       "use arrow keys to run around",
controlsAct2bMobile: "drag to run around",
controlsAct4:        "use arrow keys · grab food when you see it",
controlsAct4Mobile:  "drag to walk · tap food to grab it",
  hintLabel: "controls",


  act3TapHat: "tap to give everyone a hat",
  act3TapEnter: "tap to enter the store",
  act5TapDeposit: "tap to share the food",
  act5TapContinue: "tap to continue",

  hudAvoidNarcs: "avoid narcs",
  muteMute: "mute",
  muteMuted: "muted",
  quitBtn: "quit",
  act1AmbMutters: ["ugh", ":(", "sigh", "...", "pfft", "oy", "bruh", "why me", "$$$", "so tired", "rent...", "bills"],

  catLines: [
    { cat: "miaou !", you: "cute." },
    { cat: "prrrr...", you: "who's a good cat" },
    { cat: "meow ?", you: "hi friend" },
    { cat: "mrrrow.", you: "I see you" },
  ],
  coinPickups: [
    { amount: "+$0.10", quip: "85 more = bag of chips" },
    { amount: "+$0.01", quip: "an ancient relic" },
    { amount: "+$2.00", quip: "don't spend it all in one place" },
    { amount: "+$0.25", quip: "a quarter. groundbreaking." },
    { amount: "+$5.00", quip: "dépanneur tonight." },
    { amount: "+$0.05", quip: "lol. a nickel." },
    { amount: "+$20.00", quip: "fake. invitation to church on the back." },
  ],

  bannerEscaped: "ESCAPE!",
  bannerBackToHood: "back to the neighbourhood.",

  bannerWeLostThem: "we lost them!",
bannerWeLostThem: "we lost them!",
runBystanderLines: ["didn't see a thing", "never saw 'em", "good for you", "go on, run", "saw what now?"],
act5TapDeposit: "tap to share the food",
};
