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

// ─────────────────────────────────────────
// PLAYER GREET
// ─────────────────────────────────────────

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
const HELLO_PREFIX = {
  casual: {
    angry: ["what's up? I'll tell you what's up —", "what's up? okay —", "ha. what's up? ", "you really want to know? "],
    hungry: ["honestly —", "ugh. where do I start? ", "you want the real answer? ", "I've had better days —"],
    narc: ["great, thanks! ", "not much! ", "really well actually! ", "doing great! "],
  },
  concerned: {
    angry: ["no, not really. ", "honestly? ", "ugh. ", "rough doesn't cover it. "],
    hungry: ["no. ", "I'm not okay. ", "kind of you to ask. no. ", "you can tell? "],
    narc: ["yes! fine! ", "totally fine! ", "never better! ", "all good! "],
  },
  direct: {
    angry: ["real talk? ", "since you're asking —", "okay, real talk —", "you want it straight? "],
    hungry: ["real talk? ", "since you're asking —", "honestly —", "you want it straight? "],
    narc: ["since you're asking —", "well —", "honestly! everything's fine! ", "real talk! all good! "],
  },
};

// ─────────────────────────────────────────
// NARC HELLO
// ─────────────────────────────────────────

const D_NARC_HELLO = [
  { t: "prices seem pretty fair to me.", tags: [] },
  { t: "the free market is working as intended.", tags: [] },
  { t: "people just need to budget better.", tags: [] },
  { t: "PC Optimum points really add up if you're strategic.", tags: [] },
  { t: "the economy is doing great.", tags: [] },
  { t: "maybe stop buying avocados.", tags: [] },
  { t: "everything's fine.", tags: [] },
  { t: "economic anxiety is just a mindset issue.", tags: [] },
  { t: "the market self-corrects. it always does.", tags: [] },
  { t: "CEOs have very difficult jobs.", tags: [] },
  { t: "I love the market economy.", tags: [] },
  { t: "this is just life.", tags: [] },
  { t: "have you tried the PC Optimum app?", tags: [] },
  { t: "the economy is strong.", tags: [] },
  { t: "someone somewhere is benefiting from this and that's good enough for me.", tags: [] },
  { t: "I, for one, think Galen works very hard.", tags: [] },
  { t: "I heard the grocery sector has thin margins, actually.", tags: [] },
  { t: "have you considered a second job?", tags: [] },
  { t: "the invisible hand will sort it out.", tags: [] },
  { t: "Galen Weston went to parliament. that's accountability.", tags: [] },
];

// ─────────────────────────────────────────
// ANGRY HELLO
// ─────────────────────────────────────────

const DECK_ANGRY_HELLO = new DM.Deck([
  { t: "Galen Weston owns a castle.", tags: ["weston"] },
  { t: "what ever happened with that bread price-fixing scandal?", tags: ["price-fixing", "bread"] },
  { t: "food banks have waiting lists now.", tags: ["food-bank"] },
  { t: "they lock the dumpsters.", tags: ["dumpsters"] },
  { t: "three companies. one price.", tags: ["three-co", "cartel"] },
  { t: "dynamic pricing. look it up.", tags: ["dynamic-pricing"] },
  { t: "same bag. less food. same price.", tags: ["shrinkflation"] },
  { t: "Robin Hood had the right idea.", tags: ["robin-hood"] },
  { t: "the invisible hand took my lunch.", tags: ["invisible-hand"] },
  { t: "record profits. record food bank lines.", tags: ["food-bank", "stat-36b"] },
  { t: "the system isn't broken. it's working exactly as designed.", tags: [] },
  { t: "they bought back their own stock while we bought less food.", tags: ["stat-36b"] },
  { t: "the free market works great if you own the market.", tags: ["cartel"] },
  { t: "they pay me $15/hr and clear $3.6 billion on the food I ring through.", tags: ["stat-36b", "wages"] },
  { t: "47% markup. the flyer makes it feel like a deal.", tags: ["stat-47"] },
  { t: "the government studied it. published a report. bread is still $6.", tags: ["bread"] },
  { t: "essential workers. not essential enough to eat, apparently.", tags: ["wages"] },
  { t: "we've been politely waiting for the market to fix itself for 800 years.", tags: ["robin-hood"] },
  { t: "they throw away a billion dollars of food a year. locked bins.", tags: ["wasted-food", "dumpsters"] },
  { t: "Loblaws made $3.6 billion. gave us points.", tags: ["points", "stat-36b"] },
  { t: "kids are going to school hungry. quarterly report looks great though.", tags: ["kids"] },
  { t: "the cashier makes $15/hr. the CEO makes $8 million. same store.", tags: ["wages"] },
  { t: "bread cartel. fourteen years. $500k fine. do the math.", tags: ["price-fixing", "bread"] },
  { t: "they literally admitted it. nobody went to prison.", tags: ["price-fixing"] },
  { t: "Loblaws tested surge pricing on groceries. on groceries.", tags: ["dynamic-pricing"] },
  { t: "the bag got smaller. the price didn't.", tags: ["shrinkflation"] },
  { t: "three families own your food supply. we call that a market.", tags: ["three-co", "cartel"] },
  { t: "the invisible hand is just their hand.", tags: ["invisible-hand"] },
  { t: "Weston's castle has more rooms than I have meals.", tags: ["weston"] },
  { t: "they fine-tune the price when you're most desperate. algorithm.", tags: ["dynamic-pricing"] },
  { t: "parliament held five hearings. bread is still six dollars.", tags: ["bread", "price-fixing"] },
  { t: "they admitted price-fixing. the fine was less than a CEO's weekend.", tags: ["price-fixing", "weston"] },
]);

// ─────────────────────────────────────────
// HUNGRY HELLO
// ─────────────────────────────────────────

const DECK_HUNGRY_HELLO = new DM.Deck([
  { t: "I've been skipping lunch to afford dinner.", tags: [] },
  { t: "my kids think cereal counts as a meal now.", tags: ["kids"] },
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
  { t: "my meal planning is just grief at this point.", tags: [] },
  { t: "I drink water to feel full. it doesn't work but here we are.", tags: [] },
  { t: "I scan prices like it's a horror game.", tags: [] },
  { t: "I saw the total and just... nodded.", tags: [] },
  { t: "I used to eat three times a day.", tags: [] },
  { t: "I walked out of the grocery store without buying anything. again.", tags: [] },
  { t: "I know the price of everything in that store. I can't afford most of it.", tags: [] },
  { t: "I bought the store brand of the store brand.", tags: [] },
  { t: "my fridge is just condiments now.", tags: [] },
  { t: "I've started eating the free samples as a course.", tags: [] },
  { t: "pasta four nights in a row. tonight is night five.", tags: [] },
  { t: "I put stuff in the cart and then I do the math and I put it back.", tags: [] },
  { t: "I split one meal into two days. called it meal prep.", tags: [] },
  { t: "I was going to cook something nice tonight. I was not able to afford that.", tags: [] },
  { t: "I'm not picky anymore. picky is a luxury.", tags: [] },
  { t: "I ate crackers for dinner. the good crackers, at least.", tags: [] },
  { t: "I've memorized which stores mark down produce at what time.", tags: [] },
  { t: "my grocery list is just the stuff I crossed off my grocery list.", tags: [] },
  { t: "I made soup. mostly water. called it broth.", tags: [] },
  { t: "I used to have food in the house. like, as a baseline.", tags: [] },
  { t: "I stood in front of the berries for a while. then I left.", tags: [] },
  { t: "I budget down to the cent now. I never used to be like this.", tags: [] },
  { t: "dinner was coffee. breakfast was also coffee.", tags: [] },
  { t: "I keep buying less and somehow it still costs more.", tags: ["shrinkflation"] },
  { t: "I ate the leftovers. there weren't any. I looked anyway.", tags: [] },
  { t: "my kid asked if we were poor. I said we were being careful.", tags: ["kids"] },
  { t: "I started a garden. out of desperation, mostly.", tags: [] },
  { t: "I know exactly how many apples are in the fridge. two.", tags: [] },
  { t: "I've started finishing my kids' plates. as a treat.", tags: ["kids"] },
  { t: "I bought one avocado. as a treat. I thought about it for a week.", tags: [] },
  { t: "I went to three stores to save $4. I saved the $4.", tags: [] },
  { t: "they throw out more food than I eat in a week. I've seen it.", tags: ["wasted-food", "dumpsters"] },
  { t: "the bin behind the store has better food than my fridge.", tags: ["dumpsters"] },
  { t: "Loblaws points don't stretch as far as they used to.", tags: ["points"] },
  { t: "I used to go to the food bank as a last resort. now it's Tuesday.", tags: ["food-bank"] },
  { t: "bread was $3 two years ago. I remember.", tags: ["bread"] },
  { t: "I got to the checkout and had to put things back. with people watching.", tags: [] },
  { t: "my kids think a treat means finding something on sale.", tags: ["kids"] },
  { t: "I have two jobs. I still can't keep the fridge full.", tags: ["wages"] },
  { t: "I make $18/hr and I'm choosing between transit and groceries.", tags: ["wages"] },
  { t: "the food that gets thrown out every night could feed this whole block.", tags: ["wasted-food"] },
  { t: "I collected enough points for a free yogurt. one yogurt.", tags: ["points"] },
  { t: "I used to treat myself sometimes. that's gone.", tags: [] },
  { t: "my kids asked why we never go out for dinner anymore.", tags: ["kids"] },
  { t: "I went to the food bank for the first time last week.", tags: ["food-bank"] },
  { t: "I'm not bad with money. money is just bad.", tags: [] },
  { t: "I check flyers like it's a second job.", tags: [] },
  { t: "I saw them throw out a whole trolley of food. still in the packaging.", tags: ["wasted-food"] },
  // new
  { t: "I came out for milk. I couldn't justify it.", tags: [] },
  { t: "I counted the pasta before I cooked it. to make sure it would stretch.", tags: [] },
  { t: "I looked up the recipe. then I looked up the prices. then I closed the tab.", tags: [] },
]);

// ─────────────────────────────────────────
// ANGRY PITCH (player line)
// ─────────────────────────────────────────

const DECK_ANGRY_PITCH = new DM.Deck([
  // bread / price-fixing
  { t: "Loblaws fixed the price of bread for fourteen years. nobody went to prison.", tags: ["price-fixing", "bread"] },
  { t: "the fine for price-fixing was $500k. they made that back before lunch.", tags: ["price-fixing", "stat-36b"] },
  { t: "price-fixing: illegal, technically. consequences: minimal, technically.", tags: ["price-fixing"] },
  { t: "the bread cartel ran longer than most governments. same impunity.", tags: ["price-fixing", "bread"] },
  { t: "they studied it, reported it, held five hearings. bread is still six dollars.", tags: ["bread", "price-fixing"] },
  { t: "$18 billion in savings we never got. that's the actual number.", tags: ["stat-18b", "bread", "price-fixing"] },

  // weston
  // NOTE: "testified before parliament. got a raise the same quarter" combines
  // the original two lines into a single twist — apology → raise is the better joke.
  { t: "Galen Weston testified before parliament. got a raise the same quarter.", tags: ["weston"] },
  { t: "the CEO apologized to parliament. bread is still six dollars.", tags: ["weston", "bread"] },
  { t: "Galen Weston's bonus could feed this block for a decade.", tags: ["weston"] },
  { t: "the CEO took home $8 million. the cashier took home $32k. same store.", tags: ["weston", "wages"] },
  { t: "Weston's fine for bread price-fixing was less than his wine budget. probably.", tags: ["weston", "price-fixing"] },

  // three-co / cartel
  { t: "empire, metro, loblaws — one cartel, three logos.", tags: ["three-co", "cartel"] },
  { t: "three companies run your food supply. they call that a market.", tags: ["three-co", "cartel"] },
  { t: "oligopoly is just monopoly with better branding.", tags: ["three-co", "cartel"] },
  { t: "no-name brand is still Loblaws. the savings are also theirs.", tags: ["three-co"] },
  { t: "they said competition keeps prices honest. then they bought all the competition.", tags: ["three-co", "cartel"] },
  { t: "free market. captive customers.", tags: ["cartel"] },

  // stats
  { t: "$3.6 billion profit. bread is six dollars.", tags: ["stat-36b", "bread"] },
  { t: "47% markup. the flyer makes it feel like a deal.", tags: ["stat-47"] },
  { t: "prices up 27% since 2020. wages didn't get the memo.", tags: ["wages"] },
  { t: "a third of Canadians are skipping meals. the quarterly report looks great.", tags: [] },

  // food bank
  { t: "food banks have waiting lists now. waiting lists.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them. consider the math.", tags: ["food-bank"] },
  { t: "record profits, record food bank lines. funny coincidence.", tags: ["food-bank", "stat-36b"] },
  { t: "the food bank used to be a last resort. now it's a calendar event.", tags: ["food-bank"] },

  // dumpsters
  { t: "they lock the dumpsters. it's not about the food. it's about the principle.", tags: ["dumpsters"] },
  { t: "dumpster diving is illegal. throwing food away is just business.", tags: ["dumpsters"] },
  { t: "they'd rather pay to destroy it than let someone eat it for free.", tags: ["dumpsters", "wasted-food"] },

  // dynamic pricing / shrinkflation
  { t: "dynamic pricing is gouging with an algorithm.", tags: ["dynamic-pricing"] },
  { t: "the algorithm knows when you're desperate. charges accordingly.", tags: ["dynamic-pricing"] },
  { t: "Loblaws tested dynamic pricing on groceries. on groceries.", tags: ["dynamic-pricing"] },
  { t: "shrinkflation: same price, less product, same face on the label.", tags: ["shrinkflation"] },
  { t: "shareholders got a dividend. we got a smaller bag of chips.", tags: ["shrinkflation"] },

  // parliament / system
  { t: "parliament held five hearings. nobody was charged. the flyer came out Thursday.", tags: ["price-fixing"] },
  { t: "the government asked nicely. the price went up anyway. twice.", tags: [] },
  { t: "they announced a price freeze. twelve items. three months. front page news.", tags: [] },
  { t: "the system isn't broken. it's working exactly as designed.", tags: [] },
  { t: "the hunger is real. the scarcity is manufactured.", tags: [] },
  { t: "it's not a coincidence. it's a business model.", tags: [] },
  { t: "the invisible hand has been in our pockets this whole time.", tags: ["invisible-hand"] },

  // robin-hood
  { t: "Robin Hood had the right idea. just saying.", tags: ["robin-hood"] },
  { t: "Robin Hood is a folk hero because the math was obvious.", tags: ["robin-hood"] },

  // ── follows: same-tag ──────────────────────────────────────────────────────
  { t: "right — a castle. and his fine for price-fixing was $500k.", tags: ["weston", "price-fixing"], follows: "weston" },
  { t: "fourteen years of fixed prices — and still no arrests.", tags: ["price-fixing", "bread"], follows: "price-fixing" },
  { t: "nothing. fourteen years, $500k fine, bread is still six dollars.", tags: ["price-fixing", "bread"], follows: "bread" },
  { t: "waiting lists at the food bank — while Loblaws posts record profits.", tags: ["food-bank", "stat-36b"], follows: "food-bank" },
  { t: "locked bins — they'd rather destroy it than let someone eat it for free.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "one cartel, three logos — they call it a market. we call it dinner.", tags: ["three-co"], follows: "three-co" },
  { t: "gouging with an algorithm — they even automated the theft.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "smaller bag, same price — shareholders got a dividend.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "Robin Hood didn't wait for the market to correct itself.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "the invisible hand has been picking our pockets this whole time.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "record profits, record food bank lines — they call it a supply chain issue.", tags: ["food-bank", "stat-36b"], follows: "stat-36b" },
  { t: "$15/hr to ring through $3.6 billion in groceries. the math is right there.", tags: ["stat-36b", "wages"], follows: "stat-36b" },
  { t: "47% markup — the flyer is theatre. you pay the markup either way.", tags: ["stat-47"], follows: "stat-47" },
  { t: "kids going to school hungry — and Loblaws posted record profits.", tags: ["kids", "food-bank"], follows: "kids" },
  { t: "essential worker pay hasn't kept up with essential worker groceries.", tags: ["wages"], follows: "wages" },
  { t: "a billion dollars of food wasted — and the bins are locked.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "PC Optimum points are a refund they owe you, repackaged as a gift.", tags: ["points"], follows: "points" },

  // ── follows: cross-tag ─────────────────────────────────────────────────────
  // dumpsters hello → weston pitch: locked bins and a castle are both positions on the same ledger
  { t: "locked bins — same impunity as the castle. different address.", tags: ["weston"], follows: "dumpsters" },
  // wages hello → three-co pitch: no wage competition either
  { t: "no wage competition either — same three companies, same floor, same ceiling.", tags: ["three-co", "cartel"], follows: "wages" },
  // kids hello → points pitch: collecting points while kids skip meals
  { t: "they gave us points while our kids skipped meals. that's the whole trade.", tags: ["points", "kids"], follows: "kids" },
  // price-fixing → weston: the fine and the man
  { t: "$500k fine. Galen Weston made that back before his morning meeting.", tags: ["weston", "price-fixing"], follows: "price-fixing" },
  // bread → three-co: the cartel is just the food supply cartel
  { t: "bread cartel, food cartel — same three names. different packaging.", tags: ["three-co", "price-fixing"], follows: "bread" },
  // points → shrinkflation: both shrink value
  { t: "points shrink too. same spend, less reward — both ends, same direction.", tags: ["shrinkflation", "points"], follows: "points" },
  // food-bank → wasted-food: the irony of the adjacent facts
  { t: "food bank waiting lists — and a billion dollars of food in locked dumpsters.", tags: ["wasted-food", "dumpsters"], follows: "food-bank" },
  // shrinkflation → wages: dollar shrinks from both sides
  { t: "shrinkflation hits wages too. less value, same label.", tags: ["wages"], follows: "shrinkflation" },
]);

// ─────────────────────────────────────────
// HUNGRY PITCH (player line)
// ─────────────────────────────────────────

const DECK_HUNGRY_PITCH = new DM.Deck([
  // generic
  { t: "nobody should go to bed hungry.", tags: [] },
  { t: "the shelves are full. our fridges aren't.", tags: [] },
  { t: "there's a store full of food thirty feet away.", tags: [] },
  { t: "one of us is eating tonight. I vote us.", tags: [] },
  { t: "the food exists. someone just decided it wasn't ours.", tags: [] },
  { t: "when did feeding your family become a luxury?", tags: [] },
  { t: "nobody should have to choose between rent and dinner.", tags: [] },
  { t: "somebody's eating well tonight. it's not us.", tags: [] },
  { t: "what if tonight, everyone on this block just ate?", tags: [] },
  { t: "hunger isn't a personal failure. don't let them tell you it is.", tags: [] },
  { t: "the food is right there. I can see it from here.", tags: [] },
  { t: "a full stomach shouldn't be a privilege.", tags: [] },
  { t: "I'm not asking for a feast. I'm asking for dinner.", tags: [] },
  { t: "I'm not political. I'm just hungry.", tags: [] },
  { t: "you eat today? me neither. so.", tags: [] },
  { t: "I'm not asking anyone to do anything they haven't thought about already.", tags: [] },
  { t: "we're not stealing. we're correcting an allocation problem.", tags: [] },
  { t: "food is right there. hunger is right here. I can't stop thinking about that.", tags: [] },
  { t: "I'm not proud. I'm hungry. those are different things.", tags: [] },
  { t: "eating isn't a radical act. it really shouldn't be.", tags: [] },
  { t: "There must be a way to feed everyone.", tags: [] },
  { t: "there's no reason to be hungry on a street with a grocery store.", tags: [] },
  { t: "this isn't about politics. it's about whether my family eats tonight.", tags: [] },
  { t: "three families on this block skipped dinner tonight. that store didn't.", tags: [] },
  { t: "the store planned for shrinkage. we're delivering it.", tags: [] },

  // tagged
  { t: "bread is six dollars. six.", tags: ["bread"] },
  { t: "Loblaws locks the dumpsters so we can't take what they're throwing out.", tags: ["dumpsters"] },
  { t: "your kids shouldn't have to learn to ignore hunger.", tags: ["kids"] },
  { t: "Loblaws wastes more food in a day than we could ever take.", tags: ["wasted-food", "dumpsters"] },
  { t: "Loblaws would rather it rot than let it go.", tags: ["wasted-food", "dumpsters"] },
  { t: "the dumpster out back has more food in it than my fridge.", tags: ["dumpsters"] },
  { t: "bread is six dollars and the bin behind the store is full of it.", tags: ["bread", "dumpsters"] },
  { t: "they throw it out at midnight. we could be there at midnight.", tags: ["dumpsters", "wasted-food"] },
  { t: "my kids are hungry. that's the whole argument.", tags: ["kids"] },
  { t: "the store throws out more food than this block eats in a week.", tags: ["wasted-food", "dumpsters"] },
  { t: "I looked in that dumpster. there's sealed food in there.", tags: ["dumpsters"] },
  { t: "it expires at midnight. after that it's a philosophical question.", tags: ["dumpsters", "wasted-food"] },
  { t: "my daughter had crackers for dinner. the store had a full aisle.", tags: ["kids"] },
  { t: "you shouldn't need a loyalty card to eat.", tags: ["points"] },
  { t: "they mark it to zero and lock it up. that's not business. that's spite.", tags: ["dumpsters"] },
  { t: "I've been doing the math on what's in that bin every night for a month.", tags: ["dumpsters"] },
  { t: "that food was going to be thrown out anyway. we're adjusting the timeline.", tags: ["dumpsters", "wasted-food"] },
  { t: "there are kids on this street who went to bed hungry last night.", tags: ["kids"] },
  { t: "bread used to be $3. I remember buying it without thinking about it.", tags: ["bread"] },
  { t: "the food bank has a waiting list now. a waiting list.", tags: ["food-bank"] },
  { t: "PC Optimum points don't stretch as far as an actual meal.", tags: ["points"] },
  { t: "Loblaws made billions. we made do. tonight we don't.", tags: ["stat-36b"] },
  { t: "they call it shrinkflation. my kids still need to eat the same amount.", tags: ["shrinkflation", "kids"] },
  { t: "I watched them throw out a whole cart of food last week. locked bin.", tags: ["dumpsters", "wasted-food"] },

  // ── follows: same-tag ──────────────────────────────────────────────────────
  { t: "your kids are watching you put things back at checkout. mine too. not tonight.", tags: ["kids"], follows: "kids" },
  { t: "three jobs and still choosing between rent and food — that's not a budget problem.", tags: ["wages"], follows: "wages" },
  { t: "they throw away more food than we'd ever need. I've watched them do it.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "you collect points so they can track you. you're paying them twice.", tags: ["points"], follows: "points" },
  { t: "a castle — and meanwhile we can't afford flour.", tags: ["weston"], follows: "weston" },
  { t: "bread was $3. now it's $6. that gap is someone's bonus.", tags: ["bread"], follows: "bread" },
  { t: "the food bank waiting list just keeps getting longer.", tags: ["food-bank"], follows: "food-bank" },
  { t: "the bin is right there. sealed food. I check it every night.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "the points card is how they make you feel grateful for a partial refund.", tags: ["points", "three-co"], follows: "three-co" },
  { t: "smaller bag, same price — my kids still need to eat the same amount.", tags: ["shrinkflation", "kids"], follows: "shrinkflation" },
  { t: "Robin Hood fed people. that's all this is.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "record profits — and the food bank is overflowing.", tags: ["food-bank", "stat-36b"], follows: "stat-36b" },

  // ── follows: cross-tag ─────────────────────────────────────────────────────
  // wages hello → dumpsters pitch: the bin is a wages issue made concrete
  { t: "wages went up $2. groceries went up $400. the bin out back didn't go up at all.", tags: ["dumpsters", "wages"], follows: "wages" },
  // wasted-food hello → dumpsters pitch: you've seen it, now let's do something
  { t: "sealed food in there right now. I know because I check.", tags: ["dumpsters"], follows: "wasted-food" },
  // food-bank hello → dumpsters pitch: the waiting list vs the available bin
  { t: "food bank has a wait. that bin doesn't.", tags: ["food-bank", "dumpsters"], follows: "food-bank" },
  // kids hello → points pitch: what they give you vs what your kids need
  { t: "points. while my kids skip meals. one yogurt. points.", tags: ["points", "kids"], follows: "kids" },
]);

// ─────────────────────────────────────────
// SAY MORE — WARM (NPC)
// ─────────────────────────────────────────

const D_SAY_MORE_WARM = new DM.Deck([
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
  { t: "okay. I'm in this conversation now.", tags: [] },
  { t: "you have thirty seconds.", tags: [] },
  { t: "I'm listening. carefully.", tags: [] },
  { t: "finish that thought.", tags: [] },

  // same-tag follows
  { t: "it's always the Westons.", tags: ["weston"], follows: "weston" },
  { t: "what about the bread?", tags: ["bread"], follows: "bread" },
  { t: "what's this bin thing about, exactly?", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "the food bank?", tags: ["food-bank"], follows: "food-bank" },
  { t: "three companies? say more.", tags: ["three-co"], follows: "three-co" },
  { t: "price-fixing?", tags: ["price-fixing"], follows: "price-fixing" },
  { t: "yeah right, Robin Hood.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "what about the kids?", tags: ["kids"], follows: "kids" },
  { t: "the wages thing — say more.", tags: ["wages"], follows: "wages" },
  { t: "all that food just thrown out?", tags: ["wasted-food"], follows: "wasted-food" },
  { t: "the points thing?", tags: ["points"], follows: "points" },
  { t: "the shrinkflation thing — keep going.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "dynamic pricing — explain that.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "$3.6 billion?", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "those numbers — say more.", tags: ["stat-47"], follows: "stat-47" },
  { t: "the invisible hand thing.", tags: ["invisible-hand"], follows: "invisible-hand" },

  // cross-tag follows — bridges between registers
  // price-fixing hello → weston curiosity: the fine leads to the man
  { t: "and Galen just... what, apologized?", tags: ["weston"], follows: "price-fixing" },
  // dumpsters hello → wasted-food curiosity: how much are we talking
  { t: "how much food are we actually talking?", tags: ["wasted-food"], follows: "dumpsters" },
  // wasted-food hello → dumpsters curiosity: what's in there
  { t: "the bin has actual sealed food in it?", tags: ["dumpsters"], follows: "wasted-food" },
  // weston hello → price-fixing curiosity: nobody's in jail?
  { t: "and nobody's in jail for any of this?", tags: ["price-fixing"], follows: "weston" },
  // cartel tag → three-co curiosity: which ones
  { t: "wait, which three companies?", tags: ["three-co"], follows: "cartel" },
  // food-bank hello → stat-36b curiosity: while profits go up?
  { t: "so their profits just... keep going up?", tags: ["stat-36b"], follows: "food-bank" },
  // three-co hello → points curiosity: and that's why the points exist
  { t: "the points card is the whole deal, isn't it.", tags: ["points"], follows: "three-co" },
]);

// ─────────────────────────────────────────
// SAY MORE — SKEPTICAL (narc NPC)
// ─────────────────────────────────────────

const D_SAY_MORE_SKEPTICAL = new DM.Deck([
  { t: "elaborate.", tags: [] },
  { t: "I'm going to need specifics.", tags: [] },
  { t: "define 'do something'.", tags: [] },
  { t: "what exactly are you proposing.", tags: [] },
  { t: "say that again. slowly.", tags: [] },
  { t: "I'm going to need you to be very precise right now.", tags: [] },
  { t: "what does that mean, practically speaking.", tags: [] },
  { t: "I want to make sure I understand what you're suggesting.", tags: [] },
  { t: "be specific.", tags: [] },
  { t: "and you mean what, exactly.", tags: [] },
  { t: "I'm going to need that in plain language.", tags: [] },
  { t: "walk me through it.", tags: [] },
  { t: "so you're suggesting — what?", tags: [] },
  { t: "let's be clear about what we're talking about here.", tags: [] },
  { t: "I'm going to need you to finish that sentence.", tags: [] },
  { t: "you want to be very careful about what you say next.", tags: [] },
  { t: "that's an interesting thing to say to a stranger.", tags: [] },
  { t: "I didn't catch that. say it again.", tags: [] },
  { t: "hmm. go on.", tags: [] },
  { t: "carefully.", tags: [] },
]);

// ─────────────────────────────────────────
// STRONGER PITCH (player line — second pitch)
// ─────────────────────────────────────────

const DECK_STRONGER_PITCH = new DM.Deck([
  // bread / price-fixing
  { t: "they fixed bread prices for fourteen years. nobody went to prison. we're taking some bread.", tags: ["bread", "price-fixing"] },
  { t: "the law said it was wrong. they paid a rounding error and kept going.", tags: ["price-fixing"] },
  { t: "bread was $3. now it's $6. that difference is someone's bonus.", tags: ["bread"] },
  { t: "we wrote the letters. we signed the petitions. bread is still six dollars.", tags: ["bread"] },
  { t: "they budgeted for the fine. we budgeted for tonight.", tags: ["price-fixing"] },

  // westonf
  { t: "Galen Weston owns a castle. he will not notice.", tags: ["weston"] },
  { t: "Galen Weston will not notice. I have done the math.", tags: ["weston"] },
  { t: "the CEO got a raise this quarter. the least we can do is get dinner.", tags: ["weston"] },
  { t: "the CEO took home $8 million. we're taking groceries. I think the math works.", tags: ["weston"] },

  // three-co
  { t: "three men control your dinner. tonight we redistribute a little.", tags: ["three-co"] },
  { t: "empire, metro, loblaws — between them, they'll survive one bad night.", tags: ["three-co"] },
  { t: "Loblaws controls a third of Canadian groceries. they can spare some.", tags: ["three-co"] },
  { t: "no-name is still Loblaws. the savings were always theirs. tonight we take some back.", tags: ["three-co"] },

  // stats
  { t: "they cleared $3.6 billion. we're taking some bread. that's the whole math.", tags: ["stat-36b", "bread"] },
  { t: "Loblaws made $3.6 billion last year. they can absorb a lasagna.", tags: ["stat-36b"] },
  { t: "47% markup. we're taking some of it back.", tags: ["stat-47"] },
  { t: "prices up 27% since 2020. consider this a partial refund.", tags: [] },

  // food bank
  { t: "food bank usage up 40%. profit up too. tonight we correct one of those numbers.", tags: ["food-bank"] },
  { t: "the food bank has a waiting list. we're done being patient.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them. tonight we skip the middleman.", tags: ["food-bank"] },

  // dumpsters
  { t: "they locked the dumpsters. they didn't lock the front door.", tags: ["dumpsters"] },
  { t: "there's sealed food in that bin. we didn't put it there. we're just finishing the sentence.", tags: ["dumpsters"] },
  { t: "the bin is full. the plan is simple. the need is real.", tags: ["dumpsters"] },
  { t: "Loblaws wasted a billion dollars of food. tonight we correct the waste.", tags: ["wasted-food", "dumpsters"] },
  { t: "they'd rather pay to destroy it than let someone eat it for free. think about that.", tags: ["wasted-food", "dumpsters"] },

  // shrinkflation / points
  { t: "same price, less food, same logo. we're done.", tags: ["shrinkflation"] },
  { t: "a loyalty card is a refund they owe you, repackaged as a gift. we're skipping the card.", tags: ["points"] },
  { t: "they gamified the markup. we're done playing.", tags: ["points"] },

  // system
  { t: "the shelves are insured. our hunger isn't.", tags: [] },
  { t: "their losses are tax deductible. our hunger isn't.", tags: [] },
  { t: "the store is insured, incorporated, and subsidized. we are none of those things.", tags: [] },
  { t: "they were never going to fix it. so.", tags: [] },
  { t: "we've been polite about it for years. polite doesn't feed anyone.", tags: [] },
  { t: "asking nicely had its moment. this is the next moment.", tags: [] },

  // robin-hood
  { t: "Robin Hood wasn't a criminal. he was just early.", tags: ["robin-hood"] },
  { t: "we're robins. not robbers.", tags: ["robin-hood"] },

  // closers
  { t: "one store, one night, the whole block eats. that's it.", tags: [] },
  { t: "we go in, we take what our families need, we leave. that's the whole plan.", tags: [] },
  { t: "tonight we eat. all of us.", tags: [] },
  { t: "the food exists. it's just not ours yet.", tags: [] },
  { t: "this is civil disobedience with snacks.", tags: [] },
  { t: "I'm not asking you to storm the barricades. I'm asking you to eat.", tags: [] },
  { t: "everybody eats or nobody does. I say everybody.", tags: [] },
  { t: "enough is a complete sentence. tonight it means something.", tags: [] },
  { t: "it's not theft if they stole it first.", tags: [] },
  { t: "we're not stealing. we're correcting a very long-running error.", tags: [] },

  // ── follows: same-tag ──────────────────────────────────────────────────────
  { t: "a person in a castle won't notice a little spillage.", tags: ["weston"], follows: "weston" },
  { t: "fourteen years, $500k fine — they budgeted for getting caught. so did we.", tags: ["price-fixing", "bread"], follows: "price-fixing" },
  { t: "bread is six dollars and the bin is full of it. that's the whole argument.", tags: ["bread", "dumpsters"], follows: "bread" },
  { t: "the waiting list ends tonight. for us at least.", tags: ["food-bank"], follows: "food-bank" },
  { t: "they locked the bins. they didn't lock the front door.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "three companies, one bad night — they'll survive. we need to eat.", tags: ["three-co"], follows: "three-co" },
  { t: "they tried dynamic pricing. we tried a boycott. tonight we try something else.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "same bag, less food — tonight we take the difference back.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "Robin Hood was just someone who did the math and acted on it.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "$3.6 billion. they can absorb one bad night. we cannot absorb one more.", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "47% markup means they've been taking from us for years. tonight we take some back.", tags: ["stat-47"], follows: "stat-47" },
  { t: "kids went to bed hungry last night. not tonight.", tags: ["kids"], follows: "kids" },
  { t: "$15/hr doesn't cover dinner anymore. so we're getting dinner a different way.", tags: ["wages"], follows: "wages" },
  { t: "a billion dollars of food wasted — we're just correcting the math.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "loyalty points expire. hunger doesn't. we're skipping the card tonight.", tags: ["points"], follows: "points" },
  { t: "the invisible hand has been in our pockets for years. tonight we reach back.", tags: ["invisible-hand"], follows: "invisible-hand" },

  // ── follows: cross-tag ─────────────────────────────────────────────────────
  // stat-36b warm → weston stronger: the profit lands on one person
  { t: "Loblaws made $3.6 billion. Galen won't notice a lasagna.", tags: ["weston", "stat-36b"], follows: "stat-36b" },
  // price-fixing warm → dumpsters stronger: the fine and the bin are the same logic
  { t: "the fine was a rounding error. the food in that bin is not.", tags: ["dumpsters", "price-fixing"], follows: "price-fixing" },
  // cartel warm → three-co stronger: they split the loss three ways
  { t: "three companies. one bad night. they split the loss three ways.", tags: ["three-co"], follows: "cartel" },
  // food-bank warm → dumpsters stronger: one of these we can fix tonight
  { t: "the food bank is full. the bin is full. one of those we fix tonight.", tags: ["dumpsters", "food-bank"], follows: "food-bank" },
  // shrinkflation warm → shrinkflation stronger, but from the other angle
  { t: "shrinkflation: they gave us less. tonight we take some back.", tags: ["shrinkflation"], follows: "shrinkflation" },
]);

// ─────────────────────────────────────────
// INVITE
// ─────────────────────────────────────────

const D_INVITE = [
  { t: "come with us tonight?", tags: [] },
  { t: "so. you in?", tags: [] },
  { t: "come with us?", tags: [] },
  { t: "want in?", tags: [] },
  { t: "you with us?", tags: [] },
  { t: "tonight. you free?", tags: [] },
  { t: "door's open if you want it.", tags: [] },
  { t: "we're going tonight. just saying.", tags: [] },
  { t: "we could use someone like you.", tags: [] },
  { t: "what do you have to lose?", tags: [] },
  { t: "we're not waiting anymore. you don't have to either.", tags: [] },
  { t: "you look like a robin to me.", tags: [] },
  { t: "you look like someone who's had enough.", tags: [] },
  { t: "you look like you've made worse decisions for less.", tags: [] },
  { t: "I think you already know what you want to say.", tags: [] },
  { t: "no pressure. some pressure.", tags: [] },
  { t: "the store's not going to rob itself.", tags: [] },
  { t: "how do you feel about a little food redistribution — tonight?", tags: [] },
  { t: "you interested?", tags: [] },
  { t: "we're done asking nicely. are you?", tags: [] },
  { t: "tonight we eat. want to join us?", tags: [] },
  { t: "just say the word.", tags: [] },
  { t: "you don't have to decide right now. actually you kind of do.", tags: [] },
  { t: "I'll take a maybe as a yes.", tags: [] },
];

// ─────────────────────────────────────────
// MISMATCH — TOO LITERAL (angry NPC got hungry pitch)
// ─────────────────────────────────────────

const DECK_MISMATCH_TOO_LITERAL = new DM.Deck([
  { t: "it's not about one meal. it's about all of them.", tags: [] },
  { t: "I don't want charity. I want it to stop happening.", tags: [] },
  { t: "we can't just take bread forever. that's not the point.", tags: ["bread"] },
  { t: "I'm not hungry. I'm angry. there's a difference.", tags: [] },
  { t: "one meal doesn't fix any of this.", tags: [] },
  { t: "feed me tonight, same thing happens tomorrow.", tags: [] },
  { t: "I appreciate it but a sandwich isn't the point.", tags: [] },
  { t: "I'm not looking for a snack. I'm looking for a change.", tags: [] },
  { t: "that's a symptom. I'm talking about the disease.", tags: [] },
  { t: "the problem isn't that I'm hungry. the problem is why.", tags: [] },
  { t: "I've eaten. this isn't about my stomach.", tags: [] },
  { t: "you're treating this like a charity case. it's not.", tags: [] },
  { t: "short term, sure. then what?", tags: [] },
  { t: "we can't eat our way out of this.", tags: [] },
  { t: "I don't want their food. I want them to stop doing this.", tags: [] },
  { t: "you're describing a symptom. I want to talk about the cause.", tags: [] },
  { t: "taking bread doesn't change who owns the bakery.", tags: ["bread"] },
  { t: "I'm past being hungry. I'm at a different stage now.", tags: [] },
  { t: "that's not nothing. it's just not enough.", tags: [] },
  { t: "I need the system to change, not my dinner.", tags: [] },
  { t: "tonight fixes tonight. I'm talking about every night.", tags: [] },
]);

// ─────────────────────────────────────────
// MISMATCH — TOO STRUCTURAL (hungry NPC got angry pitch)
// ─────────────────────────────────────────

const DECK_MISMATCH_TOO_STRUCTURAL = new DM.Deck([
  { t: "I know all that. I just need to eat tonight.", tags: [] },
  { t: "that's a lot of theory for an empty stomach.", tags: [] },
  { t: "yeah the system is broken. my kids are hungry right now.", tags: ["kids"] },
  { t: "I appreciate the politics but I'm past that.", tags: [] },
  { t: "I'm not looking for a manifesto. I'm looking for dinner.", tags: [] },
  { t: "maybe later. right now I'm just trying to get through today.", tags: [] },
  { t: "I hear you. I just haven't eaten since yesterday.", tags: [] },
  { t: "the long game is great. I need the short game tonight.", tags: [] },
  { t: "you're not wrong. I just can't think that far ahead right now.", tags: [] },
  { t: "my stomach doesn't care about the oligopoly.", tags: ["three-co"] },
  { t: "that's real. all of that is real. I'm just really hungry.", tags: [] },
  { t: "I'll be angry tomorrow. tonight I need to eat.", tags: [] },
  { t: "I believe you. I just need to get through tonight first.", tags: [] },
  { t: "the structural stuff I get. it's just not where I'm at right now.", tags: [] },
  { t: "sure. but also — do you have any food?", tags: [] },
  { t: "I know about Weston. I also know about my empty fridge.", tags: ["weston"] },
  { t: "the bread cartel stuff is real but bread is also just six dollars and I'm hungry.", tags: ["bread", "price-fixing"] },
  { t: "I'll march on parliament next week. tonight I need dinner.", tags: [] },
  { t: "the analysis is correct. my fridge is still empty.", tags: [] },
  { t: "I want the revolution. I also want it to come with food.", tags: [] },
  { t: "very compelling. I still haven't eaten.", tags: [] },
]);

// ─────────────────────────────────────────
// JOIN + CONSENT PAIRS
// ─────────────────────────────────────────
// Rule: join line = the human, messy turn. consent line = the landing.
// The consent carries the weight. The join can be uncertain, specific, funny.
// Cut: any join line that hedges the decision ("best bad idea", "I'm in either way").

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
  { join: "I've been checking that bin every night for a month", consent: "tonight we do something about it" },
  { join: "I clocked out an hour ago and I still can't afford dinner", consent: "let's go" },
  { join: "I keep thinking someone with more to lose should go first. it's us.", consent: "I'm in" },
  { join: "I was this close to going home. okay.", consent: "lead the way" },
  { join: "my kids asked why I looked sad at the grocery store. not tonight.", consent: "I'm in" },
  // new — replacing hedging pairs
  { join: "I came out for milk. I couldn't afford it. okay.", consent: "let's go" },
  { join: "you had me at $3.6 billion", consent: "crisse, let's go" },
  { join: "I've been angry about this for two years. might as well do something with it", consent: "yeah. okay." },
  { join: "my grandmother would've been the first one through that door", consent: "for her then" },
  { join: "I almost talked myself out of coming back. I didn't.", consent: "allons-y" },
  { join: "honestly I thought someone braver than me would do this first", consent: "it's us. let's go" },
  { join: "I could be home watching TV. this is better.", consent: "allons-y" },
];

// ─────────────────────────────────────────
// BACK OFF — EARLY
// ─────────────────────────────────────────

const D_BACK_OFF_EARLY = new DM.Deck([
  { t: "nevermind.", tags: [] },
  { t: "forget I said anything.", tags: [] },
  { t: "nothing. ignore me.", tags: [] },
  { t: "forget it.", tags: [] },
  { t: "bad timing.", tags: [] },
  { t: "pretend I said nothing.", tags: [] },
  { t: "I'm just venting.", tags: [] },
  { t: "wrong person, sorry.", tags: [] },
  { t: "I was thinking out loud.", tags: [] },
  { t: "don't worry about it.", tags: [] },
  { t: "I misspoke.", tags: [] },
  { t: "it was nothing.", tags: [] },
  { t: "anyway.", tags: [] },
  { t: "let's just — never mind.", tags: [] },
]);

// ─────────────────────────────────────────
// BACK OFF — LATE
// ─────────────────────────────────────────

const D_BACK_OFF_LATE = new DM.Deck([
  { t: "completely hypothetical. forget it.", tags: [] },
  { t: "pretend I said something about the weather.", tags: [] },
  { t: "I'm just venting. philosophically.", tags: [] },
  { t: "wrong person. ignore everything.", tags: [] },
  { t: "I have the wrong face for this conversation.", tags: [] },
  { t: "that was a test. you passed. there is no plan.", tags: [] },
  { t: "it was a bit from a play I'm writing.", tags: [] },
  { t: "extremely hypothetical. I can't stress that enough.", tags: [] },
  { t: "I have no idea what I was talking about.", tags: [] },
  { t: "I meant that as a metaphor.", tags: [] },
  { t: "legally, none of that happened.", tags: [] },
  { t: "I was describing a movie. I don't remember which one.", tags: [] },
  { t: "wrong person. wrong neighbourhood.", tags: [] },
  { t: "let's both agree I said none of that.", tags: [] },
  { t: "I was doing a bit. I'm going to leave now.", tags: [] },
  { t: "on reflection, I'm walking away from this conversation.", tags: [] },
  { t: "my lawyer would like me to stop talking.", tags: [] },
]);

// ─────────────────────────────────────────
// NARC REVEAL
// ─────────────────────────────────────────

const D_NARC_REVEAL = [
  { t: "my husband is a COP", tags: [] },
  { t: "I'm calling this in RIGHT NOW", tags: [] },
  { t: "I OWN Loblaws stock", tags: [] },
  { t: "I'm calling 911!", tags: [] },
  { t: "yo get a job!", tags: [] },
  { t: "this is a Metro, not a manifesto", tags: [] },
  { t: "that's THEFT!", tags: [] },
  { t: "just tighten your belt", tags: [] },
  { t: "NOT on my watch!", tags: [] },
  { t: "sir this is a grocery store", tags: [] },
  { t: "this is NOT how change happens!", tags: [] },
  { t: "the market will fix this naturally!", tags: [] },
  { t: "this is why we need more police", tags: [] },
  { t: "you're RUINING the neighbourhood!", tags: [] },
  { t: "markets are UP today!", tags: [] },
  { t: "you should just try budgeting", tags: [] },
  { t: "I'm on the board of Loblaws community partners!", tags: [] },
  { t: "Galen is a GOOD man!", tags: [] },
  { t: "I'm going to need you to stop talking RIGHT NOW", tags: [] },
];

// ─────────────────────────────────────────
// NOT NOW
// ─────────────────────────────────────────

const D_NOT_NOW = [
  { t: "maybe another time", tags: [] },
  { t: "I want to but I can't right now", tags: [] },
  { t: "I'm scared", tags: [] },
  { t: "not tonight", tags: [] },
  { t: "give me a minute", tags: [] },
  { t: "I have anxiety", tags: [] },
  { t: "my heart says yes, my risk tolerance says no", tags: [] },
  { t: "I need to think", tags: [] },
  { t: "my kids are home", tags: [] },
  { t: "I have work tomorrow", tags: [] },
  { t: "I'm scared of getting caught", tags: [] },
  { t: "ask me again in an hour", tags: [] },
  { t: "let me think about it", tags: [] },
  { t: "I'm not ready", tags: [] },
  { t: "I believe you. I'm just not there yet.", tags: [] },
  { t: "not tonight. maybe tomorrow.", tags: [] },
  { t: "I need to sleep on it.", tags: [] },
  { t: "I'm almost there. give me a day.", tags: [] },
  { t: "you're not wrong. I'm just scared.", tags: [] },
];

// ─────────────────────────────────────────
// NO BYE
// ─────────────────────────────────────────

const D_NO_BYE = [
  { t: "yeah, no thanks", tags: [] },
  { t: "no", tags: [] },
  { t: "nope", tags: [] },
  { t: "I'm good", tags: [] },
  { t: "I'll pass", tags: [] },
  { t: "non", tags: [] },
  { t: "hard pass", tags: [] },
  { t: "not for me", tags: [] },
  { t: "non merci", tags: [] },
  { t: "no, I'll pretend I didn't hear that", tags: [] },
  { t: "you have the wrong person", tags: [] },
  { t: "not tonight", tags: [] },
  { t: "respectfully, no", tags: [] },
  { t: "hard no", tags: [] },
  { t: "I'm going to walk away now", tags: [] },
];

// ─────────────────────────────────────────
// RETURN
// ─────────────────────────────────────────

const D_RETURN = [
  { t: "hey — I changed my mind. I'm in.", tags: [] },
  { t: "I've been thinking about what you said. let's do it.", tags: [] },
  { t: "I couldn't stop thinking about it. count me in.", tags: [] },
  { t: "you still doing this? I want in.", tags: [] },
  { t: "you were right. I'm done waiting.", tags: [] },
  { t: "I thought about my kids. I'm in.", tags: ["kids"] },
  { t: "screw it. I'm in.", tags: [] },
  { t: "I went home and looked at my fridge. okay. I'm in.", tags: [] },
  { t: "I kept thinking about what you said about the bin. let's go.", tags: ["dumpsters"] },
  { t: "I called my sister. she said do it. so.", tags: [] },
  { t: "I almost talked myself out of it three times. then I didn't.", tags: [] },
  { t: "I stood in front of the store for twenty minutes. then I came back here.", tags: [] },
  { t: "I thought about the bread thing. you're right. I'm in.", tags: ["bread"] },
  { t: "I went home, sat down, stood back up. I'm in.", tags: [] },
  { t: "I kept thinking: who's going to do it if not us.", tags: [] },
  { t: "I told myself I'd sleep on it. I didn't sleep.", tags: [] },
  { t: "I thought about what you said about the kids. I'm in.", tags: ["kids"] },
  { t: "okay. you convinced me. let's go.", tags: [] },
];

// const D_ACK_HUNGRY_ANGRY = ["!"];
const D_ACK_HUNGRY_ANGRY = ["exactly,", "right?"];
const D_ACK_NARC = ["well, ", "you know, ", "honestly, ", "I mean, "];
// const A1_LOOP_MSGS_EN = [
//   { t: "nothing changes...", c: "#999" },
//   { t: "...câline, encore ça", c: "#aaa" },
//   { t: "ostie. encore.", c: "#b09abf" },
//   { t: "crisse, pis quoi encore", c: "#b080c0" },
//   { t: "ostie. ENCORE LA MÊME CHOSE", c: "#c060a0" },
//   { t: "OSTIE DE CÂLICE. vraiment??", c: "#c84080" },
//   { t: "TABARNAK. je fais quoi exactement??", c: "#cc2050" },
//   { t: "CÂLICE DE TABARNAK. c'est ça, la VIE??", c: "#d01030" },
//   { t: "OSTIE CÂLICE CRISSE TABARNAK", c: "#dd0020" },
//   { t: "TABARNAK CÂLICE CRISSE VIARGE OSTIE DE...", c: "#ff0000" },
// ];

// const A1_LOOP_MSGS_FR = [
//   { t: "rien change...", c: "#999" },
//   { t: "...câline, encore ça", c: "#aaa" },
//   { t: "ostie. encore.", c: "#b09abf" },
//   { t: "crisse, pis quoi encore", c: "#b080c0" },
//   { t: "ostie. ENCORE LA MÊME CHOSE", c: "#c060a0" },
//   { t: "OSTIE DE CÂLICE. vraiment??", c: "#c84080" },
//   { t: "TABARNAK. je fais quoi exactement??", c: "#cc2050" },
//   { t: "CÂLICE DE TABARNAK. c'est ça, la VIE??", c: "#d01030" },
//   { t: "OSTIE CÂLICE CRISSE TABARNAK", c: "#dd0020" },
//   { t: "TABARNAK CÂLICE CRISSE VIARGE OSTIE DE...", c: "#ff0000" },
// ];

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
