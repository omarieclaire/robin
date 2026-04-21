// 1. we talk to an npc (hi)
// 2. the npcs talks back (this gives us some clue about them)
// 3. we (the player) choose how to reply based on what they said from DECK_HUNGRY_PITCH AND THEN after a second or two D_INVITE or DECK_ANGRY_PITCH AND THEN after a second or two D_INVITE or D_BACK_OFF_EARLY
//    1. if we chose D_BACK_OFF_EARLY option, that conv ends
// 4. if we chose any other option, they reply to us
//    1. if the NPC feels misunderstood (a hunger/anger mismatch) they say  (DECK_MISMATCH_TOO_STRUCTURAL or DECK_MISMATCH_TOO_LITERAL depending on how they are misunderstood) and then this conv ends
//    2. if they are matched in energy AND are not a narc,  they EITHER
//       1. join immediately with D_JOIN_PHRASE and then D_CONSENT_PHRASE (concatenated into the same line, but delivered separately in time) and then this conv ends OR
//       2. ask for more info with D_SAY_MORE_WARM
//    3. If they ARE a narc, they say D_SAY_MORE_SKEPTICAL
// 5. the player now has the choice between saying D_BACK_OFF_LATE or DECK_STRONGER_PITCH.
//    1. Once the player makes the choice and IF they choose DECK_STRONGER_PITCH we concatenate D_INVITE after that pitch. Same line, but delivered separately in time.
//       1. if the player choses the stronger pitch and it's a narc, we get the D_NARC_REVEAL and this conv ends
//       2. If the player chooses the stronger pitch and it's not a narc
//             1. either the NPCs joins  with D_JOIN_PHRASE and then D_CONSENT_PHRASE (concatenated into the same line, but delivered separately in time) and then this conv ends
//             2. or there's a chance the NPC says NOT_NOW instead of joining, then later returns with DECK_RETURN and joins anyway

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
  let lastDrawnTags = [];


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

  const isTagged = (d) => d.src.length > 0 && typeof d.src[0] !== "string" && !isPair(d.src[0]);
  const tagsOf = (x) => x?.tags ?? [];
  const textOf = (x) => (typeof x === "string" ? x : x.t);
  const isPair = (x) => x && typeof x === "object" && "join" in x && "consent" in x;

  const isCooled = (tags) =>
    tags.some((t) => {
      const a = coolMap.get(t);
      return a !== undefined && a < COOLDOWN;
    });
  const isStatClash = (tags) => tags.some((t) => STAT_TAGS.has(t) && convTags.has(t));
const isBoostable = (tags) => tags.some((t) => !STAT_TAGS.has(t) && lastDrawnTags.includes(t));


function score(item, boost, follows) {
    // if (item.follows) console.log("scoring follows item:", item.follows, "boost:", boost, "follows param:", follows);

  const tags = tagsOf(item);
  if (follows && item.follows && follows.includes(item.follows)) return 3;
  if (isStatClash(tags)) return -2;
  if (isCooled(tags)) return -1;
  if (boost && isBoostable(tags)) return 2;
  return 0;
}

  function recordTags(tags) {
  lastDrawnTags = tags;
  for (const t of tags) {
    convTags.add(t);
    coolMap.set(t, 0);
  }
}
function drawNoRecord(deck, opts = {}) {
  if (!deck.pile.length) deck._fill();
  if (!isTagged(deck)) {
    const item = deck.pop();
    return isPair(item) ? item : textOf(item);
  }
 if (opts.follows && opts.follows.length > 0) {
  const inPile = deck.pile.some(x => x.follows && opts.follows.includes(x.follows));
  if (!inPile) {
    const allMatching = deck.src.filter(x => x.follows && opts.follows.includes(x.follows));
    if (allMatching.length > 0) {
      const pick = allMatching[Math.floor(Math.random() * allMatching.length)];
      deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, pick);
    }
  }
}
  let bestIdx = 0, bestScore = -999;
  for (let i = 0; i < deck.pile.length; i++) {
    const s = score(deck.pile[i], opts.boost ?? false, opts.follows ?? null);
    if (s > bestScore) { bestScore = s; bestIdx = i; }
  }
  const item = deck.take(bestIdx);
  lastDrawnTags = tagsOf(item);
  return { text: textOf(item), tags: tagsOf(item) };
}


function draw(deck, { boost = false, follows = null } = {}) {
  if (!deck.pile.length) deck._fill();
  if (!isTagged(deck)) {
    const item = deck.pop();
    return isPair(item) ? item : textOf(item);
  }
  if (follows && follows.length > 0) {
  const inPile = deck.pile.some(x => x.follows && follows.includes(x.follows));
    console.log("follows check after fill — looking for:", follows, "inPile:", inPile, "pile size:", deck.pile.length);

  if (!inPile) {
    const allMatching = deck.src.filter(x => x.follows && follows.includes(x.follows));
    if (allMatching.length > 0) {
      const pick = allMatching[Math.floor(Math.random() * allMatching.length)];
      deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, pick);
    }
  }
}
  let bestIdx = 0, bestScore = -999;
  for (let i = 0; i < deck.pile.length; i++) {
    const s = score(deck.pile[i], boost, follows);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  const item = deck.take(bestIdx);
  recordTags(tagsOf(item));
  return isPair(item) ? item : textOf(item);
}

function drawWithTags(deck, opts = {}) {
    console.log("drawWithTags called, src size:", deck.src.length, "pile size:", deck.pile.length);

  if (!deck.pile.length) deck._fill();
  console.log("after fill, pile follows:", deck.pile.map(x => x?.follows ?? "none").filter(x => x !== "none"));

  if (!isTagged(deck)) return { text: textOf(deck.pop()), tags: [] };

if (opts.follows && opts.follows.length > 0) {
  const matchCheck = deck.pile.filter(x => x.follows && opts.follows.includes(x.follows));
  console.log("follows match check:", opts.follows, "matching items:", matchCheck.map(x => x.t));


  const inPile = deck.pile.some(x => x.follows && opts.follows.includes(x.follows));
  if (!inPile) {
    const allMatching = deck.src.filter(x => x.follows && opts.follows.includes(x.follows));
    if (allMatching.length > 0) {
      const pick = allMatching[Math.floor(Math.random() * allMatching.length)];
      deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, pick);
    }
  }
}
  let bestIdx = 0, bestScore = -999;
  for (let i = 0; i < deck.pile.length; i++) {
    const s = score(deck.pile[i], opts.boost ?? false, opts.follows ?? null);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  const item = deck.take(bestIdx);
  recordTags(tagsOf(item));
  return { text: textOf(item), tags: tagsOf(item) };
}

  function _seedConvTag(tag) {
    // console.log("seeding tag:", tag, "convTags before:", [...convTags]);
    convTags.add(tag);
    // console.log("convTags after:", [...convTags]);
  }

  function startConv() {
    convTags = new Set();
      lastDrawnTags = [];

  }

function _debugLastDrawnTags() { return lastDrawnTags; }

  
  function endConv() {
    for (const [t, v] of coolMap) coolMap.set(t, v + 1);
    convTags = new Set();
  }
  function _debugConvTags() { return convTags; }

return { Deck, draw, drawWithTags, drawNoRecord, _seedConvTag, _debugConvTags, _debugLastDrawnTags, startConv, endConv };
})();

// ambient chatter from hungry/sad npcs while they wander
// short, no context needed, player probably won't read most of these
const D_AMB_HUNGRY = [
  "my kids are hungry",
  "I skip meals now",
  "fridge is empty",
  "can't afford bread",
  "rice and beans again",
  "cereal is dinner now",
  "I pretend I already ate",
  "nothing in the fridge",
  "even ramen is expensive",
  "one apple was $2",
  "I window-shop the produce section",
  "I scan prices like it's a horror game",
  "water fills you up. sort of.",
  "prices keep going up",
  "I shop at Segals when I can",
  "I have three jobs",
  "I saw the total and just nodded",
  "the beep at checkout hurts more each time",
  "I don't check prices. they check me.",
  "iga if you're feeling rich",
  "I ate the free samples as a course",
  "pasta again tonight",
  "my fridge is just condiments",
  "I do cost-per-calorie math now",
  "I stood in front of the berries. then I left.",
];

// ambient chatter from angry npcs while they wander
// short flavour text, structural anger, player probably won't read most of these
const D_AMB_ANGRY = [
  "profits are criminal",
  "shrinkflation is theft",
  "CEOs get millions in bonuses",
  "the system is rigged",
  "paid 500k. kept fixing prices.",
  "three families own most of what you eat",
  "billionaires don't care",
  "they throw out good food",
  "record profits, record prices",
  "Galen eats well tonight",
  "groceries are a luxury now",
  "legally robbed",
  "I used to budget. now I triage.",
  "we pay more so they profit more",
  "watch out for-a Luigi!",
  "the sword of damocles",
  "surveillance pricing",
  "they locked the dumpsters",
  "empire metro loblaws. one bill.",
  "parliament held five hearings. bread is still $6.",
];

// ambient chatter from narc npcs while they wander
// short, funny, oblivious
const D_AMB_NARC = [
  "everything's fine",
  "I love this store",
  "the CEO worked hard for that bonus",
  "economic anxiety is a mindset issue",
  "bootstraps, people",
  "the market self-corrects. probably.",
  "margins are thin in grocery",
  "CEOs have very difficult jobs",
  "prices seem fair",
  "nothing wrong here",
  "great deals today",
  "I love the market economy!",
  "this is just life!",
  "have you tried the PC Optimum app?",
  "the market will self-correct",
  "the economy is strong",
  "just budget better",
  "I, for one, support the shareholders",
  "competition keeps prices down. I think.",
  "the invisible hand is working on it",
];

// player greeting — tone tag determines which HELLO_PREFIX fires
const P_GREET = [
  { t: "hey, how's it hanging?", tags: ["casual"] },
  { t: "yo. you good?", tags: ["casual"] },
  { t: "salut. sup?", tags: ["casual"] },
  { t: "hey, you good?", tags: ["concerned"] },
  { t: "hey neighbour.", tags: ["casual"] },
  { t: "allô. what's up?", tags: ["casual"] },
  { t: "hey neighbour, you ok?", tags: ["concerned"] },
  { t: "hey, what's up?", tags: ["casual"] },
  { t: "hey, you hungry?", tags: ["direct"] },
  { t: "hey, I know that look. you ok?", tags: ["concerned"] },
  { t: "yo, real talk?", tags: ["direct"] },
  { t: "hey, you look like you get it.", tags: ["direct"] },
  { t: "hey, you look like someone who's had enough.", tags: ["direct"] },
  { t: "hey, rough day?", tags: ["direct"] },
  { t: "ça va?", tags: ["concerned"] },
  { t: "hey. what's up?", tags: ["casual"] },
  { t: "yo, you okay?", tags: ["concerned"] },
  { t: "salut, toi. ça va?", tags: ["concerned"] },
  { t: "yo, hold up. ça va?", tags: ["direct"] },
];

// NPC prefix before their hello line — tone × type
// must work with all matching D_NARC_HELLO / DECK_ANGRY_HELLO / DECK_HUNGRY_HELLO lines
const HELLO_PREFIX = {
  casual: {
    angry:  ["what's up? I'll tell you what's up —", "what's up? okay —", "ha. what's up? ", "you really want to know? "],
    hungry: ["honestly —", "ugh. where do I start? ", "you want the real answer? ", "I've had better days —"],
    narc:   ["great, thanks! ", "not much! ", "really well actually! ", "doing great! "],
  },
  concerned: {
    angry:  ["no, not really. ", "honestly? ", "ugh. ", "rough doesn't cover it. "],
    hungry: ["no. ", "I'm not okay. ", "kind of you to ask. no. ", "you can tell? "],
    narc:   ["yes! fine! ", "totally fine! ", "never better! ", "all good! "],
  },
  direct: {
    angry:  ["real talk? ", "since you're asking —", "okay, real talk —", "you want it straight? "],
    hungry: ["real talk? ", "since you're asking —", "honestly —", "you want it straight? "],
    narc:   ["since you're asking —", "well —", "honestly! everything's fine! ", "real talk! all good! "],
  },
};

// NARC hello — capitalist, oblivious, funny. works with narc HELLO_PREFIXes.
const D_NARC_HELLO = [
  "prices seem pretty fair to me.",
  "the free market is working as intended.",
  "people just need to budget better.",
  "PC Optimum points really add up if you're strategic.",
  "the economy is doing great.",
  "maybe stop buying avocados.",
  "everything's fine.",
  "economic anxiety is just a mindset issue.",
  "the market self-corrects. it always does.",
  "CEOs have very difficult jobs.",
  "I love the market economy.",
  "this is just life.",
  "have you tried the PC Optimum app?",
  "the economy is strong.",
  "someone somewhere is benefiting from this and that's good enough for me.",
  "I, for one, think Galen works very hard.",
  "I heard the grocery sector has thin margins, actually.",
];

// ANGRY hello — structural, political, punchy.
// works with angry HELLO_PREFIXes. tags represent the CORE concept of each line.
const DECK_ANGRY_HELLO = new DM.Deck([
  { t: "Galen Weston owns a castle. an actual castle.", tags: ["weston"] },
  { t: "fourteen years of bread price-fixing. zero arrests.", tags: ["price-fixing", "bread"] },
  { t: "food banks have waiting lists now.", tags: ["food-bank"] },
  { t: "they lock the dumpsters so no one can eat what they're throwing out.", tags: ["dumpsters"] },
  { t: "empire, metro, loblaws — three logos, one price.", tags: ["three-co", "cartel"] },
  { t: "they're testing dynamic pricing. charge more when you're desperate.", tags: ["dynamic-pricing"] },
  { t: "same bag, less food, same price. every quarter.", tags: ["shrinkflation"] },
  { t: "Robin Hood had the right idea.", tags: ["robin-hood"] },
  { t: "the invisible hand picked my pocket.", tags: ["invisible-hand"] },
  { t: "record profits. record food bank lines.", tags: ["food-bank", "stat-36b"] },
  { t: "the system isn't broken. it's working exactly as designed.", tags: [] },
  { t: "they bought back their own stock while we bought less food.", tags: [] },
  { t: "they pay me $15/hr and clear $3.6 billion on what I ring through.", tags: ["wages", "stat-36b"] },
  { t: "47% markup. the flyer makes it feel like a deal.", tags: ["stat-47"] },
  { t: "parliament published a report. bread is still $6.", tags: ["bread"] },
  { t: "essential workers. not essential enough to eat, apparently.", tags: ["wages"] },
  { t: "they throw away a billion dollars of food a year and lock the bins.", tags: ["wasted-food", "dumpsters"] },
  { t: "Loblaws made $3.6 billion. gave us points.", tags: ["points", "stat-36b"] },
  { t: "kids going to school hungry. quarterly report looks great though.", tags: ["kids"] },
  { t: "cashier makes $15/hr. CEO makes $8 million. same store.", tags: ["wages"] },
  { t: "the free market works great if you own the market.", tags: ["cartel"] },
  { t: "we've been waiting politely for the market to fix itself for years.", tags: ["invisible-hand"] },
]);

// HUNGRY hello — personal, immediate, no system talk.
// works with hungry HELLO_PREFIXes.
const DECK_HUNGRY_HELLO = new DM.Deck([
  { t: "I've been skipping lunch to afford dinner.", tags: [] },
  { t: "my kids think cereal counts as a meal.", tags: ["kids", "cereal"] },
  { t: "I do cost-per-calorie math at the grocery store now. I've changed.", tags: [] },
  { t: "nothing in the fridge again tonight.", tags: [] },
  { t: "my diet is very clean. there's nothing in it.", tags: [] },
  { t: "I eat before I grocery shop so I don't cry in aisle 3.", tags: [] },
  { t: "I pretend I already ate.", tags: [] },
  { t: "I haven't had a real meal in three days.", tags: [] },
  { t: "you seen the price of bread lately?", tags: ["bread"] },
  { t: "I have three jobs and I still can't make it work.", tags: ["wages"] },
  { t: "I paid $6 for tofu. I just stood there.", tags: [] },
  { t: "I stretch meals until they break.", tags: [] },
  { t: "I'm doing intermittent fasting. but involuntarily.", tags: [] },
  { t: "I drink water to feel full. it doesn't work but here we are.", tags: [] },
  { t: "I scan prices like it's a horror game.", tags: [] },
  { t: "I saw the total and just nodded.", tags: [] },
  { t: "I used to eat three times a day.", tags: [] },
  { t: "I walked out of the grocery store without buying anything. again.", tags: [] },
  { t: "I know the price of everything in that store. I can't afford most of it.", tags: [] },
  { t: "I bought the store brand of the store brand.", tags: [] },
  { t: "my fridge is just condiments now.", tags: [] },
  { t: "I've started eating the free samples as a course.", tags: [] },
  { t: "pasta four nights in a row. tonight is night five.", tags: [] },
  { t: "I put stuff in the cart and then I do the math and I put it back.", tags: [] },
  { t: "I split one meal into two days. called it meal prep.", tags: [] },
  { t: "I ate crackers for dinner. the good crackers, at least.", tags: [] },
  { t: "I've memorized which stores mark down produce at what time.", tags: [] },
  { t: "I made soup. mostly water. called it broth.", tags: [] },
  { t: "I stood in front of the berries for a while. then I left.", tags: [] },
  { t: "I budget down to the cent. I never used to be like this.", tags: [] },
  { t: "dinner was coffee. breakfast was also coffee.", tags: [] },
  { t: "I keep buying less and somehow it still costs more.", tags: ["shrinkflation"] },
  { t: "my kid asked if we were poor. I said we were being careful.", tags: ["kids"] },
  { t: "I started a garden. out of desperation.", tags: [] },
  { t: "I've started finishing my kids' plates. as a treat.", tags: ["kids"] },
  { t: "I bought one avocado. thought about it for a week.", tags: [] },
  { t: "I went to three stores to save $4. I saved the $4.", tags: [] },
  { t: "the bin behind the store has better food than my fridge.", tags: ["dumpsters"] },
  { t: "the points don't stretch as far as they used to.", tags: ["points"] },
  { t: "I used to go to the food bank as a last resort. now it's Tuesday.", tags: ["food-bank"] },
  { t: "bread was $3 two years ago. I remember.", tags: ["bread"] },
  { t: "I got to the checkout and had to put things back. with people watching.", tags: [] },
  { t: "my kids think a treat means finding something on sale.", tags: ["kids"] },
  { t: "I have two jobs. I still can't keep the fridge full.", tags: ["wages"] },
  { t: "I make $18/hr and I'm choosing between transit and groceries.", tags: ["wages"] },
  { t: "the food that gets thrown out every night could feed my family.", tags: ["wasted-food", "dumpsters"] },
]);

// ANGRY PITCH — player's first pitch to an angry NPC.
// structural, political. tags follow the hello's core concept.
// follows lines are direct conversational responses to the matching hello line.
const DECK_ANGRY_PITCH = new DM.Deck([
  { t: "bread price-fixing ran for fourteen years. nobody went to prison.", tags: ["price-fixing", "bread"] },
  { t: "the bread cartel ran longer than most governments. less accountability.", tags: ["price-fixing", "bread"] },
  { t: "the fine for fourteen years of price-fixing was $500k. back before lunch.", tags: ["price-fixing", "stat-36b"] },
  { t: "price-fixing: illegal, technically. consequences: minimal, technically.", tags: ["price-fixing"] },
  { t: "parliament held five hearings. nobody was charged. flyer came out Thursday.", tags: ["price-fixing"] },
  { t: "Galen Weston testified before parliament. bread is still $6.", tags: ["weston", "bread"] },
  { t: "the CEO apologized. got a raise the same quarter.", tags: ["weston"] },
  { t: "Galen Weston's bonus could feed this block for a decade.", tags: ["weston"] },
  { t: "Weston went to parliament. left with his dignity. we got the bill.", tags: ["weston"] },
  { t: "empire, metro, loblaws — one cartel, three logos.", tags: ["three-co", "cartel"] },
  { t: "three companies run your food supply. they call that a market.", tags: ["three-co", "cartel"] },
  { t: "oligopoly is just monopoly with better branding.", tags: ["three-co", "cartel"] },
  { t: "no-name is still Loblaws. the savings are also theirs.", tags: ["three-co"] },
  { t: "competition is great for consumers, they said. then they bought all the competitors.", tags: ["three-co"] },
  { t: "$3.6 billion in profit. bread is $6.", tags: ["stat-36b", "bread"] },
  { t: "47% markup. the flyer makes it feel like a deal.", tags: ["stat-47"] },
  { t: "a third of Canadians are skipping meals. quarterly report looks great.", tags: [] },
  { t: "we would've saved $18 billion if they hadn't fixed bread prices. actual number.", tags: ["stat-18b", "bread"] },
  { t: "food banks have waiting lists. waiting lists.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them. both things are true.", tags: ["food-bank"] },
  { t: "they lock the dumpsters. it's not about the food. it's about the principle.", tags: ["dumpsters"] },
  { t: "dumpster diving is illegal. throwing food away is just business.", tags: ["dumpsters"] },
  { t: "dynamic pricing is gouging with an algorithm.", tags: ["dynamic-pricing"] },
  { t: "Loblaws tested dynamic pricing. we boycotted. one of us blinked.", tags: ["dynamic-pricing"] },
  { t: "shrinkflation: same price, less product, same face on the label.", tags: ["shrinkflation"] },
  { t: "shareholders got a dividend. we got a smaller bag of chips.", tags: ["shrinkflation"] },
  { t: "the system isn't broken. it's working exactly as designed.", tags: [] },
  { t: "the invisible hand has been very busy in our pockets.", tags: ["invisible-hand"] },
  { t: "Robin Hood had the right idea. just saying.", tags: ["robin-hood"] },
  { t: "Robin Hood is a folk hero because the math was obvious. still is.", tags: ["robin-hood"] },
  { t: "essential worker wages haven't kept up with essential worker groceries.", tags: ["wages"] },
  { t: "cashier: $15/hr. CEO: $8 million. same store, different dinner.", tags: ["wages"] },
  { t: "they threw out a billion dollars of food last year and locked the bins.", tags: ["wasted-food", "dumpsters"] },
  { t: "PC Optimum points are a refund they owe you, repackaged as a gift.", tags: ["points"] },
  { t: "kids going to school hungry while Loblaws posts record profits.", tags: ["kids"] },

  // follows lines: respond to the IMPLICATION of the hello. don't restate the topic word.
  { t: "and he testified before parliament about it. felt bad. got a raise.", tags: ["weston"], follows: "weston" },
  { t: "and the fine was $500k. they made that back before lunch on the first day.", tags: ["price-fixing"], follows: "price-fixing" },
  { t: "and they held it there deliberately for fourteen years. that's not inflation. that's a decision.", tags: ["price-fixing"], follows: "bread" },
  { t: "and Loblaws posted record profits the same quarter. both numbers, same year.", tags: ["food-bank"], follows: "food-bank" },
  { t: "and they're throwing out a billion dollars of food a year. the lock isn't about safety.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "and they coordinate the pricing across all three. they call that a market.", tags: ["cartel"], follows: "three-co" },
  { t: "and the government response was a strongly-worded report.", tags: ["three-co"], follows: "cartel" },
  { t: "and they backed off when we boycotted. so they know exactly what they're doing.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "and the shareholders got a dividend that same quarter.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "and the reason he's a folk hero is that everyone could see the math. they still can.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "and it's been in our pockets the whole time. turns out it has a name on the door.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "and Loblaws caused both. in the same year.", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "and the sale price is calculated against that number. the deal is theatre.", tags: ["stat-47"], follows: "stat-47" },
  { t: "and those kids are on this block. I've seen them.", tags: ["kids"], follows: "kids" },
  { t: "and the CEO took home $8 million. same store, same year.", tags: ["wages"], follows: "wages" },
  { t: "and they lock the bins so none of it escapes.", tags: ["wasted-food"], follows: "wasted-food" },
  { t: "and they're built on tracking every purchase you make. a refund, repackaged as a gift.", tags: ["points"], follows: "points" },
  { t: "and Loblaws made $3.6 billion the same year. cereal as dinner is not a parenting choice.", tags: ["stat-36b"], follows: "cereal" },
]);

// HUNGRY PITCH — player's first pitch to a hungry NPC.
// personal, immediate, no structural language. tags follow the hello's core concept.
// follows lines are direct conversational responses to the matching hello line.
const DECK_HUNGRY_PITCH = new DM.Deck([
  { t: "nobody should go to bed hungry.", tags: [] },
  { t: "the shelves are full. our fridges aren't.", tags: [] },
  { t: "there's a store full of food thirty feet away.", tags: [] },
  { t: "bread is $6. six.", tags: ["bread"] },
  { t: "Loblaws locks the dumpsters so we can't take what they're throwing out.", tags: ["dumpsters"] },
  { t: "your kids shouldn't have to learn to ignore hunger.", tags: ["kids"] },
  { t: "Loblaws wastes more food in a day than we could ever take.", tags: ["dumpsters", "wasted-food"] },
  { t: "when did feeding your family become a luxury?", tags: [] },
  { t: "nobody should have to choose between rent and dinner.", tags: [] },
  { t: "the food exists. someone just decided it wasn't ours.", tags: [] },
  { t: "Loblaws would rather it rot than let it go.", tags: ["dumpsters"] },
  { t: "somebody's eating well tonight. it's not us.", tags: [] },
  { t: "what if tonight, everyone on this block just ate?", tags: [] },
  { t: "hunger isn't a personal failure. don't let them tell you it is.", tags: [] },
  { t: "a full stomach shouldn't be a privilege.", tags: [] },
  { t: "I'm not asking for a feast. I'm asking for dinner.", tags: [] },
  { t: "the dumpster out back has more food in it than my fridge.", tags: ["dumpsters"] },
  { t: "they throw it out at midnight. we could be there at midnight.", tags: ["dumpsters"] },
  { t: "my kids are hungry. that's the whole argument.", tags: ["kids"] },
  { t: "I'm not political. I'm just hungry.", tags: [] },
  { t: "you eat today? me neither. so.", tags: [] },
  { t: "I looked in that dumpster. there's sealed tofu in there.", tags: ["dumpsters"] },
  { t: "I'm not asking anyone to do anything they haven't thought about already.", tags: [] },
  { t: "it expires at midnight. after that it's just math.", tags: ["dumpsters"] },
  { t: "my daughter had crackers for dinner. the store had a full aisle.", tags: [] },
  { t: "food is right there. hunger is right here. I can't stop thinking about that.", tags: [] },
  { t: "eating isn't a radical act. it really shouldn't be.", tags: [] },
  { t: "that food was going to be thrown out anyway. we're adjusting the timeline.", tags: ["dumpsters"] },
  { t: "I've been standing outside that store for an hour. I can't afford what's inside.", tags: [] },
  { t: "this isn't about politics. it's about whether my family eats tonight.", tags: [] },
  { t: "I'm asking you to help me feed people. that's it. that's the whole ask.", tags: [] },
  { t: "the food bank has a waiting list. I'm on it.", tags: ["food-bank"] },
  { t: "they call it shrinkflation. I call it my kids eating less.", tags: ["shrinkflation"] },
  { t: "I'm not proud. I'm hungry. those are different things.", tags: [] },
  { t: "three jobs and still choosing between rent and food.", tags: ["wages"] },
  { t: "you shouldn't need a loyalty card to eat.", tags: ["points"] },

  // follows lines: respond to the IMPLICATION of the hello. don't restate the topic word.
  { t: "and we can't afford flour. I keep thinking about that.", tags: [], follows: "weston" },
  { t: "and the bin out back is full of it right now. sealed. going in the trash at midnight.", tags: ["bread", "dumpsters"], follows: "bread" },
  { t: "me too. two months. that's why I stopped waiting.", tags: ["food-bank"], follows: "food-bank" },
  { t: "I've looked. there's sealed tofu in there. still cold.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "and they still need to eat the same amount.", tags: ["kids", "shrinkflation"], follows: "shrinkflation" },
  { t: "and there's a full store thirty feet away with the lights on.", tags: ["kids"], follows: "kids" },
  { t: "and that's not a budgeting problem.", tags: ["wages"], follows: "wages" },
  { t: "I've watched them do it. whole carts, every night.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "and you've been paying into that system for years.", tags: ["points"], follows: "points" },
  { t: "same year. so we stopped waiting.", tags: ["food-bank", "stat-36b"], follows: "stat-36b" },
  { t: "and there's a store full of food thirty feet away. so.", tags: ["robin-hood"], follows: "robin-hood" },
  // structural hello tags — personal register response
  { t: "and I still can't afford dinner. that's where that lands for me.", tags: [], follows: "price-fixing" },
  { t: "and all three of them have my grocery money. I don't get to pick.", tags: [], follows: "three-co" },
  { t: "and my family is the one paying for it. every week.", tags: [], follows: "cartel" },
  { t: "and when I'm desperate is exactly when I can't afford to pay more.", tags: [], follows: "dynamic-pricing" },
  { t: "and it's been picking my pocket so long I forgot what full felt like.", tags: [], follows: "invisible-hand" },
  { t: "and that markup is why I did the math and put it back on the shelf.", tags: [], follows: "stat-47" },
]);

// SAY MORE — WARM. NPC is curious, a little nervous, open.
// follows lines prompt the player to elaborate on a specific topic.
// ensure at least 3 follows-tagged lines per active tag.
const D_SAY_MORE_WARM = new DM.Deck([
  // generic fallbacks
  { t: "go on.", tags: [] },
  { t: "tell me more.", tags: [] },
  { t: "keep talking.", tags: [] },
  { t: "wait — tell me more?", tags: [] },
  { t: "okay. I'm listening.", tags: [] },
  { t: "that's intense. say more.", tags: [] },
  { t: "what are you saying?", tags: [] },
  { t: "hmm. continue.", tags: [] },
  { t: "I want to hear this.", tags: [] },
  { t: "that got my attention.", tags: [] },
  { t: "alright. what's the plan?", tags: [] },
  { t: "...and?", tags: [] },
  { t: "I might regret asking. tell me anyway.", tags: [] },

  // tagged follows
  { t: "it's always the Westons.", tags: ["weston"], follows: "weston" },
  { t: "the castle thing is real?", tags: ["weston"], follows: "weston" },
  { t: "Weston personally?", tags: ["weston"], follows: "weston" },

  { t: "what about the bread?", tags: ["bread"], follows: "bread" },
  { t: "the bread thing — how long?", tags: ["bread", "price-fixing"], follows: "bread" },
  { t: "bread specifically?", tags: ["bread"], follows: "bread" },

  { t: "what's this bin thing about?", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "they lock them?", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "what's actually in there?", tags: ["dumpsters"], follows: "dumpsters" },

  { t: "the food bank?", tags: ["food-bank"], follows: "food-bank" },
  { t: "waiting lists — at a food bank?", tags: ["food-bank"], follows: "food-bank" },
  { t: "how long is the list?", tags: ["food-bank"], follows: "food-bank" },

  { t: "three companies?", tags: ["three-co"], follows: "three-co" },
  { t: "three companies run all of it?", tags: ["three-co"], follows: "three-co" },
  { t: "even no-name?", tags: ["three-co"], follows: "three-co" },

  { t: "price-fixing?", tags: ["price-fixing"], follows: "price-fixing" },
  { t: "how long did that run?", tags: ["price-fixing"], follows: "price-fixing" },
  { t: "and nobody got arrested?", tags: ["price-fixing"], follows: "price-fixing" },

  { t: "yeah right, Robin Hood.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "Robin Hood specifically?", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "you're comparing us to Robin Hood?", tags: ["robin-hood"], follows: "robin-hood" },

  { t: "the invisible hand thing — say more.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "go on about the invisible hand.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "what does that mean practically?", tags: ["invisible-hand"], follows: "invisible-hand" },

  { t: "what about the kids?", tags: ["kids"], follows: "kids" },
  { t: "how many kids are we talking?", tags: ["kids"], follows: "kids" },
  { t: "kids going to school hungry?", tags: ["kids"], follows: "kids" },

  { t: "the wages thing — say more.", tags: ["wages"], follows: "wages" },
  { t: "how bad is the wage gap?", tags: ["wages"], follows: "wages" },
  { t: "same store?", tags: ["wages"], follows: "wages" },

  { t: "$3.6 billion?", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "billion with a b?", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "that number is real?", tags: ["stat-36b"], follows: "stat-36b" },

  { t: "those numbers — say more.", tags: ["stat-47"], follows: "stat-47" },
  { t: "47% is the actual markup?", tags: ["stat-47"], follows: "stat-47" },
  { t: "where does that number come from?", tags: ["stat-47"], follows: "stat-47" },

  { t: "all that food just thrown out?", tags: ["wasted-food"], follows: "wasted-food" },
  { t: "how much food are we talking?", tags: ["wasted-food"], follows: "wasted-food" },
  { t: "they waste it on purpose?", tags: ["wasted-food"], follows: "wasted-food" },

  { t: "the points thing?", tags: ["points"], follows: "points" },
  { t: "what's wrong with the points?", tags: ["points"], follows: "points" },
  { t: "explain the points scam.", tags: ["points"], follows: "points" },

  { t: "the shrinkflation thing — keep going.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "how much less food?", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "every quarter?", tags: ["shrinkflation"], follows: "shrinkflation" },

  { t: "dynamic pricing — explain that.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "how does dynamic pricing even work?", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "they tested it here?", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },

  { t: "the cartel thing — say more.", tags: ["cartel"], follows: "cartel" },
  { t: "you're calling it a cartel?", tags: ["cartel"], follows: "cartel" },
  { t: "how coordinated is this?", tags: ["cartel"], follows: "cartel" },
]);

// SAY MORE — SKEPTICAL (narc NPC). precise, lawyerly, a little cold.
const D_SAY_MORE_SKEPTICAL = new DM.Deck([
  "elaborate.",
  "I'm going to need specifics.",
  "define 'do something'.",
  "what exactly are you proposing.",
  "say that again. slowly.",
  "I'm going to need you to be very precise right now.",
  "what does that mean, practically speaking.",
  "I want to make sure I understand what you're suggesting.",
  "be specific.",
  "and you mean what, exactly.",
  "I'm going to need that in plain language.",
  "walk me through it.",
  "so you're suggesting — what?",
  "let's be clear about what we're talking about here.",
  "I'm going to need you to finish that sentence.",
  "you want to be very careful about what you say next.",
]);

// STRONGER PITCH — follows a say-more. highest escalation.
// emotional, urgent, short, convincing. follows tag = whatever the NPC just asked about.
const DECK_STRONGER_PITCH = new DM.Deck([
  { t: "they fixed bread prices for fourteen years. nobody went to prison. we're taking some bread.", tags: ["bread", "price-fixing"] },
  { t: "the fine for fourteen years of price-fixing was $500k. Loblaws made that back before lunch.", tags: ["price-fixing", "stat-36b"] },
  { t: "the law said it was wrong. they paid a rounding error and kept going. so here we are.", tags: ["price-fixing"] },
  { t: "bread was $3. now it's $6. that difference is someone's bonus.", tags: ["bread"] },
  { t: "we wrote the letters. we signed the petitions. bread is still $6.", tags: ["bread"] },
  { t: "Galen Weston owns a castle. he will not notice.", tags: ["weston"] },
  { t: "the CEO got a raise this quarter. the least we can do is get dinner.", tags: ["weston"] },
  { t: "Weston testified before parliament. felt bad about it. bread is still $6.", tags: ["weston", "bread"] },
  { t: "he took home $8 million. we're taking groceries. I think the math works.", tags: ["weston"] },
  { t: "three men control your dinner. tonight we redistribute a little.", tags: ["three-co"] },
  { t: "empire, metro, loblaws — between them, they'll survive one bad night.", tags: ["three-co"] },
  { t: "no-name is still Loblaws. the savings were always theirs. tonight we take some back.", tags: ["three-co"] },
  { t: "three companies, one cartel, zero consequences. until tonight.", tags: ["three-co", "cartel"] },
  { t: "they cleared $3.6 billion. we're taking some bread. that's the whole math.", tags: ["stat-36b", "bread"] },
  { t: "Loblaws made $3.6 billion last year. they can absorb a lasagna.", tags: ["stat-36b"] },
  { t: "47% markup. we're taking some of it back.", tags: ["stat-47"] },
  { t: "food bank usage up 40%. profit up too. tonight we correct one of those numbers.", tags: ["food-bank", "stat-47"] },
  { t: "the food bank has a waiting list. we're done being patient.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them. tonight we skip the middleman.", tags: ["food-bank"] },
  { t: "they locked the dumpsters. they didn't lock the front door.", tags: ["dumpsters"] },
  { t: "sealed food in that bin. we didn't put it there. we're just finishing the sentence.", tags: ["dumpsters"] },
  { t: "they'd rather pay to destroy it than let someone eat it for free. think about that.", tags: ["dumpsters"] },
  { t: "they call it shrinkflation. same price, less food, same logo. we're done.", tags: ["shrinkflation"] },
  { t: "the shelves are insured. our hunger isn't.", tags: [] },
  { t: "their losses are tax deductible. our hunger isn't.", tags: [] },
  { t: "the store is insured, incorporated, and subsidized. we are none of those things.", tags: [] },
  { t: "Robin Hood wasn't a criminal. he was just early.", tags: ["robin-hood"] },
  { t: "we're robins. not robbers.", tags: ["robin-hood"] },
  { t: "historically, this is exactly how things change. every single time.", tags: ["robin-hood"] },
  { t: "the invisible hand never fed anyone. ours will.", tags: ["invisible-hand"] },
  { t: "we've been waiting for the market to fix it. the market is not fixing it.", tags: ["invisible-hand"] },
  { t: "parliament asked nicely. the price went up anyway. twice.", tags: ["price-fixing"] },
  { t: "they were never going to fix it. so.", tags: [] },
  { t: "asking nicely had its moment. this is the next moment.", tags: [] },
  { t: "one store, one night, the whole block eats. that's it.", tags: [] },
  { t: "we go in, we take what our families need, we leave. that's the whole plan.", tags: [] },
  { t: "tonight we eat. all of us.", tags: [] },
  { t: "this is civil disobedience with snacks.", tags: [] },
  { t: "I'm not asking you to storm the barricades. I'm asking you to eat.", tags: [] },
  { t: "everybody eats or nobody does. I say everybody.", tags: [] },
  { t: "it's not theft if they stole it first.", tags: [] },
  { t: "kids on this block went to school hungry. the store didn't close early.", tags: ["kids"] },
  { t: "your kids' dinner shouldn't depend on quarterly earnings. tonight it doesn't.", tags: ["kids"] },
  { t: "dynamic pricing means charging more when you have no choice. we're choosing tonight.", tags: ["dynamic-pricing"] },
  { t: "they track every purchase you make. loyalty points are just surveillance with coupons.", tags: ["points"] },
  { t: "cashier gets $15/hr. CEO gets $8 million. we're correcting one data point.", tags: ["wages", "stat-36b"] },
  { t: "a billion dollars of food wasted every year. we're correcting the math.", tags: ["wasted-food", "dumpsters"] },

  // follows lines: respond to the IMPLICATION of the hello, then close to action.
  { t: "and one bad night won't register on his spreadsheet.", tags: ["weston"], follows: "weston" },
  { t: "and the fine was $500k. they made that back before lunch. so we stopped asking permission.", tags: ["price-fixing", "bread"], follows: "price-fixing" },
  { t: "and the bin behind the store is full of it right now. cold. sealed. midnight.", tags: ["bread", "dumpsters"], follows: "bread" },
  { t: "and tonight we go around it entirely.", tags: ["food-bank"], follows: "food-bank" },
  { t: "and the front door isn't.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "and between the three of them, they will not notice one bad night.", tags: ["three-co"], follows: "three-co" },
  { t: "and the answer was apparently always going to be this.", tags: ["cartel"], follows: "cartel" },
  { t: "and tonight we opt out entirely. no app, no surge, no algorithm.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "and the shareholders got a dividend that quarter. so tonight we take back what the bag used to have in it.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "and that's why they made him a folk hero instead of arresting him.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "and it's been in everyone's pocket this whole time. so tonight ours will be too.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "and they can absorb one bad night on one street.", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "and tonight we're taking some of that back in actual food.", tags: ["stat-47"], follows: "stat-47" },
  { t: "and I know those kids. tonight that changes.", tags: ["kids"], follows: "kids" },
  { t: "and the CEO took home $8 million. so tonight we fix the math ourselves.", tags: ["wages", "stat-36b"], follows: "wages" },
  { t: "and tonight we're going to correct a small fraction of that.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "and tonight we skip the card and take the savings directly.", tags: ["points"], follows: "points" },
]);

// direct ask
const D_INVITE = [
  "so. you in?",
  "come with us?",
  "want in?",
  "you with us?",
  "tonight. you free?",
  "door's open if you want it.",
  "we're going tonight. just saying.",
  "we could use someone like you.",
  "what do you have to lose?",
  "we're not waiting anymore. you don't have to either.",
  "you look like a robin to me.",
  "you look like someone who's had enough.",
  "you look like you've made worse decisions for less.",
  "I think you already know what you want to say.",
  "no pressure. some pressure.",
  "the store's not going to rob itself.",
  "how do you feel about a little food redistribution — tonight?",
  "you interested?",
  "we're done asking nicely. are you?",
  "tonight we eat. want to join us?",
  "just say the word.",
  "you don't have to decide right now. actually you kind of do.",
  "I'll take a maybe as a yes.",
];

// MISMATCH — angry NPC pitched hunger/literal, feels misunderstood.
// they want structural change, not a meal.
// tagged follows reference the specific thing the player said that missed the mark.
const DECK_MISMATCH_TOO_LITERAL = new DM.Deck([
  { t: "it's not about one meal. it's about all of them.", tags: [] },
  { t: "I don't want charity. I want it to stop happening.", tags: [] },
  { t: "I'm not hungry. I'm angry. there's a difference.", tags: [] },
  { t: "one meal doesn't fix any of this.", tags: [] },
  { t: "feed me tonight, same thing happens tomorrow.", tags: [] },
  { t: "I'm not looking for a snack. I'm looking for a change.", tags: [] },
  { t: "that's a symptom. I'm talking about the disease.", tags: [] },
  { t: "the problem isn't that I'm hungry. the problem is why.", tags: [] },
  { t: "you're treating this like a charity case. it's not.", tags: [] },
  { t: "we can't eat our way out of this.", tags: [] },
  { t: "I don't want their food. I want them to stop doing this.", tags: [] },
  { t: "taking bread doesn't change who fixed the price.", tags: ["bread", "price-fixing"] },
  { t: "taking bread doesn't change who owns the bakery.", tags: ["bread"] },
  { t: "the dumpster isn't the point. the locked dumpster is.", tags: ["dumpsters"] },
  { t: "I know about the bins. I want to talk about why they're locked.", tags: ["dumpsters"] },
  { t: "I appreciate the food bank line. I want to know why there's a line.", tags: ["food-bank"] },
  { t: "a castle is fine. why does he get a castle and we get $6 bread?", tags: ["weston"] },
  { t: "the kids — yes. and I want the kids to not be hungry next year either.", tags: ["kids"] },
  { t: "three jobs is the problem. dinner tonight isn't the solution.", tags: ["wages"] },
  { t: "the wasted food is enraging. and nobody's going to prison for it.", tags: ["wasted-food"] },
]);

// MISMATCH — hungry NPC pitched systemic/anger, they just want to eat.
// they agree structurally but they're past the theory.
// tagged follows reference the specific thing the player said that went over their head right now.
const DECK_MISMATCH_TOO_STRUCTURAL = new DM.Deck([
  { t: "I know all that. I just need to eat tonight.", tags: [] },
  { t: "that's a lot of theory for an empty stomach.", tags: [] },
  { t: "yeah the system is broken. my kids are hungry right now.", tags: ["kids"] },
  { t: "I'm not looking for a manifesto. I'm looking for dinner.", tags: [] },
  { t: "I hear you. I just haven't eaten since yesterday.", tags: [] },
  { t: "the long game is great. I need the short game tonight.", tags: [] },
  { t: "you're not wrong. I just can't think that far ahead right now.", tags: [] },
  { t: "my stomach doesn't care about the oligopoly.", tags: ["three-co", "cartel"] },
  { t: "that's real. all of that is real. I'm just really hungry.", tags: [] },
  { t: "I'll be angry tomorrow. tonight I need to eat.", tags: [] },
  { t: "I believe you. I just need to get through tonight first.", tags: [] },
  { t: "sure. but also — do you have any food?", tags: [] },
  { t: "I know about Weston. I also know about my empty fridge.", tags: ["weston"] },
  { t: "bread cartel, sure. also bread is $6 and I'm hungry.", tags: ["bread", "price-fixing"] },
  { t: "Robin Hood is great. can Robin Hood come tonight?", tags: ["robin-hood"] },
  { t: "invisible hand, visible hunger. I know which one I feel.", tags: ["invisible-hand"] },
  { t: "$3.6 billion. yes. my fridge has $0 in it.", tags: ["stat-36b"] },
  { t: "47% markup is horrifying. I'm also 47% out of food.", tags: ["stat-47"] },
  { t: "the food bank list, I'm on it. that's why I need tonight.", tags: ["food-bank"] },
  { t: "I know about the wage gap. I am the wage gap.", tags: ["wages"] },
  { t: "all that wasted food — yeah. some of it could be in my fridge.", tags: ["wasted-food"] },
  { t: "dynamic pricing hits different when you're already out of budget.", tags: ["dynamic-pricing"] },
  { t: "points aren't going to get me through tonight.", tags: ["points"] },
  { t: "shrinkflation means I'm eating less. I know. that's the problem.", tags: ["shrinkflation"] },
]);

const D_JOIN_CONSENT_PAIRS = [
  { join: "you know what, I've been waiting for someone to say that out loud", consent: "I'm in" },
  { join: "the system isn't going to fix itself. I keep waiting and it keeps not fixing itself", consent: "let's go" },
  { join: "tabarnak, you're right", consent: "câline, yes" },
  { join: "I've got nothing left to lose and an empty fridge", consent: "count me in" },
  { join: "I've been wanting to do something for years. years.", consent: "what took you so long" },
  { join: "my therapist said to try new things. I don't think she meant this. okay.", consent: "I'm in" },
  { join: "finally someone is actually doing something instead of just being mad", consent: "lead the way" },
  { join: "about damn time", consent: "let's go" },
  { join: "I thought no one would ever ask", consent: "where do I sign" },
  { join: "I'm so tired of just being angry about it", consent: "yes. obviously" },
  { join: "you had me at 'take back'", consent: "say less" },
  { join: "screw it. what's the worst that happens", consent: "crisse, I'm in" },
  { join: "I've been standing outside that store for an hour anyway", consent: "let's do this" },
  { join: "I was going to do laundry. laundry can wait.", consent: "when do we start?" },
  { join: "my fridge is empty. tonight it won't be.", consent: "allons-y" },
  { join: "I knew someone would snap eventually. I'm glad it's us.", consent: "okay. okay yeah" },
  { join: "tabarnak. finally.", consent: "let's go" },
  { join: "I've been doing the math on that bin for weeks", consent: "I'm in, let's eat" },
  { join: "I kept thinking someone else would do something. it's us. it's us.", consent: "crisse. yes" },
  { join: "I'm done waiting for things to change on their own", consent: "don't have to ask me twice" },
  { join: "actually though? actually though.", consent: "okay Robin Hood. let's ride" },
  { join: "I have nothing better to do and also I'm starving", consent: "tabarnak, let's go" },
  { join: "every week I tell myself next week will be different", consent: "not anymore. I'm in" },
];

// no and bye
const D_NO_BYE = [
  "yeah, no thanks",
  "no",
  "nope",
  "I'm good",
  "I'll pass",
  "non",
  "hard pass",
  "not for me",
  "non merci",
  "no, I'll pretend I didn't hear that",
  "you have the wrong person",
  "not tonight",
  "respectfully, no",
  "hard no",
  "I'm going to walk away now",
];

// player backs off early — nothing specific said yet
const D_BACK_OFF_EARLY = new DM.Deck([
  "nevermind.",
  "forget I said anything.",
  "nothing. ignore me.",
  "forget it.",
  "bad timing.",
  "pretend I said nothing.",
  "I'm just venting.",
  "wrong person, sorry.",
  "I was thinking out loud.",
  "don't worry about it.",
  "I misspoke.",
  "it was nothing.",
  "anyway.",
  "let's just — never mind.",
]);

// player backs off late — full pitch delivered, now unsaying it
const D_BACK_OFF_LATE = new DM.Deck([
  "completely hypothetical. forget it.",
  "pretend I said something about the weather.",
  "I'm just venting. philosophically.",
  "wrong person. ignore everything.",
  "I have the wrong face for this conversation.",
  "that was a test. you passed. there is no plan.",
  "it was a bit from a play I'm writing.",
  "extremely hypothetical. I can't stress that enough.",
  "I have no idea what I was talking about.",
  "I meant that as a metaphor.",
  "legally, none of that happened.",
  "I was describing a movie. I don't remember which one.",
  "wrong person. wrong neighbourhood.",
  "let's both agree I said none of that.",
  "I was doing a bit. I'm going to leave now.",
  "on reflection, I'm walking away from this conversation.",
  "my lawyer would like me to stop talking.",
]);

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

// they come back
const D_RETURN = [
  { t: "hey — I changed my mind. I'm in.", tags: [] },
  { t: "I've been thinking about what you said. let's do it.", tags: [] },
  { t: "I couldn't stop thinking about it. count me in.", tags: [] },
  { t: "you still doing this? I want in.", tags: [] },
  { t: "you were right. I'm done waiting.", tags: [] },
  { t: "I thought about my kids. I'm in.", tags: [] },
  { t: "screw it. I'm in.", tags: [] },
  { t: "I went home and looked at my fridge. okay. I'm in.", tags: ["dumpsters"] },
  { t: "I kept thinking about the bin. let's go.", tags: ["dumpsters"] },
  { t: "I called my sister. she said do it. so.", tags: [] },
  { t: "I almost talked myself out of it three times. then I didn't.", tags: [] },
  { t: "I stood in front of the store for twenty minutes. then I came back.", tags: [] },
  { t: "I thought about the bread thing. you're right. I'm in.", tags: ["bread"] },
];

// store announcements during the heist
const D_INTERCOM = [
  "cleanup on ALL aisles",
  "attention: CODE RED",
  "attention shoppers: empathy is out of stock",
  "price check on dignity… denied",
  "security to every aisle",
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
// const DECK_BACK_OFF = new DM.Deck(D_BACK_OFF);
// const DECK_BACK_OFF_EARLY = new DM.Deck(D_BACK_OFF_EARLY);
// const D_BACK_OFF_LATE = new DM.Deck(D_BACK_OFF_LATE);
// const DECK_SAY_MORE = new DM.Deck(D_SAY_MORE);
// const D_SAY_MORE_WARM = new DM.Deck(D_SAY_MORE_WARM);
// const D_SAY_MORE_SKEPTICAL = new DM.Deck(D_SAY_MORE_SKEPTICAL);
const DECK_JOIN_CONSENT = new DM.Deck(D_JOIN_CONSENT_PAIRS);

// const DECK_MISMATCH = new DM.Deck(D_MISMATCH);
const DECK_NO_BYE = new DM.Deck(D_NO_BYE);
const DECK_NOT_NOW = new DM.Deck(D_NOT_NOW);
const DECK_RETURN = new DM.Deck(D_RETURN);
const DECK_NARC_HELLO = new DM.Deck(D_NARC_HELLO);
const DECK_NARC_REV = new DM.Deck(D_NARC_REVEAL);
const DECK_ACK_NARC = new DM.Deck(D_ACK_NARC);

const DECK_BACK_OFF_EARLY = D_BACK_OFF_EARLY;
const DECK_BACK_OFF_LATE = D_BACK_OFF_LATE;
const DECK_SAY_MORE_WARM = D_SAY_MORE_WARM;
const DECK_SAY_MORE_SKEPTICAL = D_SAY_MORE_SKEPTICAL;

// Global ambient recency — prevents the same mutter appearing on two visible NPCs
const _ambRecent = new Set();
const _AMB_COOLDOWN_MS = 12000;

function drawAmb(deck) {
  if (!deck.pile.length) deck._fill();
  // Try up to pile.length times to find one not in _ambRecent
  for (let attempt = 0; attempt < deck.pile.length; attempt++) {
    const candidate = deck.pile[deck.pile.length - 1 - attempt];
    const text = typeof candidate === "string" ? candidate : candidate.t;
    if (!_ambRecent.has(text)) {
      // Remove it from wherever it is in the pile
      deck.pile.splice(deck.pile.length - 1 - attempt, 1);
      _ambRecent.add(text);
      setTimeout(() => _ambRecent.delete(text), _AMB_COOLDOWN_MS);
      return text;
    }
  }
  // All candidates recently used — just pop normally
  const item = deck.pop();
  return typeof item === "string" ? item : item.t;
}

// Ambient decks — shuffle only, no tag system (they're overheard, not conversation)
const DECK_AMB_NARC = new DM.Deck(D_AMB_NARC);
const DECK_AMB_HUNGRY = new DM.Deck(D_AMB_HUNGRY);
const DECK_AMB_ANGRY = new DM.Deck(D_AMB_ANGRY);
