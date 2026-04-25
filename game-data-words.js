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

// ─────────────────────────────────────────
// AMBIENT — HUNGRY
// short, first-person, no corporate references
// ─────────────────────────────────────────

const D_AMB_HUNGRY = [
  "my kids are hungry",
  "intermittent poverty",
  "carbs are a luxury now",
  "I have three jobs",
  "the toothpick was garnish",
  "pasta tonight (again)",
  "reframed it. still hungry.",
  "rice and beans again",
  "cereal is dinner now",
  "I pretend I already ate",
  "nothing in the fridge",
  "even ramen is expensive",
  "one apple was $2",
  "I have three jobs",
  "free samples for dinner",
  "pasta again tonight",
  "my fridge is just condiments",
  "I do cost-per-calorie math now",
  "Hochelaga doesn't have a PA.",
];

// ─────────────────────────────────────────
// AMBIENT — ANGRY
// systemic, third-person, no personal hunger
// ─────────────────────────────────────────

const D_AMB_ANGRY = [
  "profits are criminal",
  "shrinkflation is theft",
  "CEOs get millions in bonuses",
  "the system is rigged",
  "paid $500k fine. kept fixing prices.",
  "three families own most of what you eat",
  "they throw out good food",
  "record profits, record prices",
  "Galen eats well tonight",
  "legally robbed",
  "surveillance pricing",
  "they locked the dumpsters",
  "empire metro loblaws. one bill.",
  "parliament held 5 hearings. bread is still $6.",
  "the fine was a rounding error",
  "they bought back their own stock",
  "same bag. less in it.",
  "the invisible hand is their hand",
  "watch out for-a Luigi!",
  "no competition. no consequences.",
  "Robin Hood was just early",
  "maybe we boycott again?",
  "crimes, but make it fiscal",
  "less cereal. same box.",
  "CEO needs 4th boat",
  "fine paid. prices stayed.",
  "luigi",
  "maybe this time",
  "robin hood owed taxes",
];

// ─────────────────────────────────────────
// AMBIENT — NARC
// oblivious, pro-corporate, played for dark comedy
// ─────────────────────────────────────────

const D_AMB_NARC = [
  "everything's fine",
  "I love this store",
  "the CEO worked hard for that bonus.",
  "economic anxiety is a mindset issue",
  "bootstraps, people",
  "the market self-corrects. probably.",
  "margins are thin in grocery",
  "prices seem fair",
  "nothing wrong here",
  "great deals today",
  "have you tried the PC Optimum app?",
  "the economy is strong",
  "just budget better",
  "I, for one, support the shareholders",
  "competition keeps prices down.",
  "the invisible hand is working on it",
  "Galen is a good man",
  "maybe stop buying avocados",
  "everything is fine here",
  "mindset issue, honestly",
  "shareholders need love too",
  "strong. the economy is strong.",
  "bootstraps are free",
  "it will kick in",
  "nothing to see",
];

// ─────────────────────────────────────────
// PLAYER GREET
// ─────────────────────────────────────────

const P_GREET = [
  { t: "hey, how's it hanging?", tags: ["casual"] },
  { t: "you good?", tags: ["casual"] },
  { t: "salut. sup?", tags: ["casual"] },
  { t: "hey, you good?", tags: ["concerned"] },
  { t: "hey neighbour.", tags: ["casual"] },
  { t: "allô. what's up?", tags: ["casual"] },
  { t: "hey neighbour, you ok?", tags: ["concerned"] },
  { t: "hey, what's up?", tags: ["casual"] },
  { t: "hey, you hungry?", tags: ["direct"] },
  { t: "hey, I know that look. you ok?", tags: ["concerned"] },
  { t: "real talk?", tags: ["direct"] },
  { t: "hey, you look like you get it.", tags: ["direct"] },
  { t: "hey, you look like someone who's had enough.", tags: ["direct"] },
  { t: "hey, rough day?", tags: ["direct"] },
  { t: "ça va?", tags: ["concerned"] },
  { t: "you okay?", tags: ["concerned"] },
  { t: "salut, toi. ça va?", tags: ["concerned"] },
  { t: "hold up. ça va?", tags: ["direct"] },
];

const HELLO_PREFIX = {
  casual: {
    angry: ["new line", "what's up? I'll tell you —", "ha. ha. what's up?", "okay, honestly? "],
    hungry: ["honestly —", "ugh. ", "not great, actually — "],
    narc: ["great, thanks! ", "not much! ", "doing great! "],
  },
  concerned: {
    angry: ["no, not really. ", "honestly? ", "rough doesn't cover it. "],
    hungry: ["no. ", "I'm not okay. ", "you can tell? "],
    narc: ["yes! fine! ", "totally fine! ", "never better! "],
  },
  direct: {
    angry: ["real talk? ", "since you're asking —", "okay, real talk —", "you really want to know? "],
    hungry: ["real talk? ", "since you're asking —", "honestly —", "you want the real answer? "],
    narc: ["well —", "honestly! everything's fine! ", "real talk! all good! "],
  },
};

// NPC prefix before their hello line
// PREFIX RULE:
// casual  = NPC responds as if continuing their own train of thought. No interrogatives.
// concerned = NPC acknowledges the check-in, then pivots to their thing.
// direct  = NPC treats the greeting as an invitation. Interrogatives ("you really want to know?") are fine here only.
const D_NARC_HELLO = [
  { t: "on my way to lunch at the Ritz-Carlton", tags: ["rich", "food", "montreal"] },
  { t: "the system works and I work within it.", tags: ["system", "capitalism"] },
  { t: "no problems here! none! at all!", tags: ["denial", "system"] },
  { t: "the free market is working as intended.", tags: ["capitalism", "market"] },
  { t: "everyone just needs to budget better.", tags: ["budget", "classism"] },
  { t: "the economy is doing great.", tags: ["economy", "denial"] },
  { t: "some people need to stop buying avocados.", tags: ["avocado", "classism", "food"] },
  { t: "everything's fine.", tags: ["denial"] },
  { t: "money is just a mindset issue.", tags: ["classism", "denial"] },
  { t: "the market self-corrects. it always does.", tags: ["market", "capitalism"] },
  { t: "I love the market economy.", tags: ["market", "capitalism"] },
  { t: "if people stopped doing drugs they could afford food.", tags: ["classism", "food", "drugs"] },
  { t: "have you considered a second job?", tags: ["classism", "wages"] },
  { t: "the invisible hand will sort it out.", tags: ["invisible-hand", "market", "capitalism"] },
  { t: "when you use a points card food is basically free.", tags: ["points-card", "food", "classism"] },
  { t: "competition keeps prices down. I read that somewhere.", tags: ["market", "capitalism", "prices"] },
  { t: "have you tried the PC Optimum app?", tags: ["points-card", "loblaws", "classism"] },
];

const DECK_ANGRY_HELLO = new DM.Deck([
  { t: "the shareholders are migrating south for winter, honking contentedly", tags: ["honk", "shareholders"] },
  { t: "the economy is a dumpster fire", tags: ["economy", "food-bank", "fire"] },
  { t: "we got priced out of life", tags: ["life", "we"] },
  { t: "did you know that Galen Weston owns a CASTLE?", tags: ["weston", "loblaws", "rich", "inequality"] },
  { t: "shrinkflation, those pigs!", tags: ["shrinkflation", "pigs"] },
  { t: "Robin Hood had the right idea!", tags: ["robin-hood"] },
  { t: "food bank lineups are so long now", tags: ["food-bank", "winter"] },
  { t: "the market's been about to fix itself for 800 years.", tags: ["market", "fix"] },
  { t: "a billion dollars of food tossed out.", tags: ["wasted-food", "dumpsters"] },
  { t: "profits up, quality of living is down.", tags: ["inequality", "wages", "prices"] },
  { t: "no-name? no shame!", tags: ["no-name", "budget", "food"] },
  { t: "everything is getting smaller but the price keeps going up.", tags: ["shrinkflation", "prices", "anger"] },
  { t: "were you at the April boycott?", tags: ["boycott", "loblaws", "anger", "solidarity"] },
  { t: "plateau prices, hochelaga wages", tags: ["wages", "montreal", "inequality", "housing"] },
  { t: "my loyalty card is not feeling very mutual", tags: ["points-card", "loblaws", "anger", "prices"] },
  { t: "have you heard about 'shrinkflation'", tags: ["anger", "politics", "shrinkflation"] },
]);

const DECK_HUNGRY_HELLO = new DM.Deck([
  { t: "my therapist says focus on what I can control. I can't afford my therapist anymore.", tags: ["therapy"] },
  { t: "I tried to save a banana. you can't save a banana. the banana has its own timeline.", tags: [] },
  { t: "my stomach sounds like an aids wolf concert.", tags: ["hunger", "montreal", "music"] },
  { t: "I was briefly at peace near a dumpster. Don't ask.", tags: ["dumpsters", "hunger", "shame"] },
  { t: "I made a decision at a dep at 2am, I'm still paying for it.", tags: ["dep", "montreal", "hunger", "regret"] },
  { t: "I've been gaslit by a vending machine", tags: ["hunger", "vending-machine", "anger"] },
  { t: "I made eye contact with a raccoon and we understood each other.", tags: ["hunger", "montreal", "dumpsters", "animals"] },
  { t: "I would do crimes for a sandwich right now.", tags: ["sandwich", "crimes"] },
  { t: "I ate crackers over a sink and called it lunch.", tags: ["hunger", "food", "shame", "budget"] },
  { t: "my stomach is doing its mardi spaghetti set.", tags: ["hunger", "montreal", "music"] },
  { t: "spite and half a granola bar. let's go.", tags: ["hunger", "food", "anger"] },
  { t: "I could eat a traffic cone.", tags: ["hunger", "traffic-cone"] },
  { t: "you smell like someone who ate today.", tags: ["hunger", "envy", "smell"] },
  { t: "was going to eat. rent had other plans.", tags: ["hunger", "housing", "wages", "budget"] },
  { t: "I make condiment sandwiches now.", tags: ["hunger", "food", "budget", "shame", "mustard", "condiment"] },
  { t: "I got to art openings for the crackers and grapes.", tags: ["hunger", "montreal", "art", "food", "hustle"] },
  { t: "my diet is very clean. nothing in it.", tags: ["hunger", "food", "diet"] },
  { t: "I work three jobs and I still can't make it work.", tags: ["wages", "work", "hunger", "inequality", "3-jobs", "math"] },
  { t: "I stretch meals until they snap.", tags: ["hunger", "food", "budget", "snap"] },
  { t: "intermittent fasting. not by choice.", tags: ["hunger", "food", "fasting"] },
  { t: "Segals is aspirational now.", tags: ["hunger", "montreal", "food", "prices", "segals"] },
  { t: "I've been living off the free samples at Marché Jean-Talon.", tags: ["hunger", "montreal", "food", "hustle", "market"] },
  { t: "I've been eating dollar store ramen for lunch all week.", tags: ["hunger", "food", "budget", "dollar-store"] },
  { t: "I split one meal into two days and call it meal prep.", tags: ["hunger", "food", "budget", "meal-prep"] },
  { t: "soup tonight. water-forward.", tags: ["hunger", "food", "budget", "soup"] },
  { t: "dinner was coffee. breakfast was also coffee.", tags: ["hunger", "food", "budget", "coffee"] },
  { t: "I ate $2 peanut butter chow mein for dinner.", tags: ["chow-mein"] },
  { t: "started a garden. desperation mostly.", tags: ["survival", "garden"] },
  { t: "I bought one avocado. as a treat.", tags: ["hunger", "food", "prices", "avocado"] },
  { t: "I went to three stores to save $4.", tags: ["hunger", "food", "budget", "prices", "hustle"] },
  { t: "had to put things back at the checkout. we don't discuss it.", tags: ["hunger", "food", "shame", "prices", "budget"] },
  { t: "I have to choose between transit and groceries.", tags: ["hunger", "stm", "wages", "budget", "montreal"] },
  { t: "I'm not bad with money. money is just bad.", tags: ["budget", "wages", "anger", "economy"] },
  { t: "I check flyers like it's a second job.", tags: ["budget", "food", "hustle", "prices"] },
  { t: "we deserve better than dumpster diving.", tags: ["dumpsters", "food-waste", "hunger", "anger"] },
  { t: "I've started calculating price-per-bite.", tags: ["budget", "food", "prices", "hunger"] },
  { t: "I ate my cereal with water this morning.", tags: ["food", "prices", "hunger"] },

  { t: "I went to PA for cheap potatoes today.", tags: ["pa", "montreal", "food", "budget", "prices", "potato"] },
  { t: "Hochelaga doesn't have a PA. we have a Metro and a prayer.", tags: ["hochelaga", "montreal", "pa", "inequality", "food"] },
]);

const DECK_ANGRY_PITCH = new DM.Deck([
  { t: "steal from the rich. give to the poor. the rich have since lobbied against this.", tags: ["robin-hood"] },
  { t: "5 chips, alone in the bag, wondering where everyone went.", tags: ["shrinkflation"] },
  { t: "they call it a dumpster fire like it's a metaphor. it is not a metaphor. look at it.", tags: ["dumpsters", "fire"] },
  { t: "googled 'is capitalism fair' at 3am. I'm on a list. also: no.", tags: ["capitalism"] },
  { t: "the numbers are doing excellent. the numbers measure the numbers.", tags: ["economy", "numbers"] },
  { t: "the chips are the same. the bag has simply grown around them.", tags: ["shrinkflation"] },
  { t: "a castle has enormous upkeep. i actually feel bad for him.", tags: ["castle"] },
  { t: "and yet somehow he is not the villain in this story, legally.", tags: ["weston", "castle"] },
  { t: "right. almost there.", tags: ["market"] },
  { t: "the bag got smaller. the price didn't hear about it.", tags: ["shrinkflation"] },
  { t: "Galen Weston owns a castle. you own a points card.", tags: ["castle", "points-card"] },
  { t: "now they know everything about you and gave you a coupon for beans", tags: ["points-card"] },
  { t: "moving further east every year. eventually I will be in the river.", tags: [] },
  { t: "I was at the boycott yes. I bought nothing. i do that every day but this time it counted", tags: ["boycott"] },
  { t: "it's probably fine, right? it's a controlled burn.", tags: ["fire"] },
  { t: 'and we\'re all standing around it going "is this nice?"', tags: ["fire"] },
  { t: "they were going to fix the other thing next but then they got tired.", tags: [] },
  { t: "the trash has never eaten so well. the trash is thriving.", tags: ["wasted-food"] },
  { t: "Yeah and we're burning the wrong people.", tags: ["wasted-food", "fire"] },
  { t: "and the garbage bins are locked.", tags: ["wasted-food", "dumpsters"] },
  { t: "it is fixing itself. this is the fixing.", tags: ["market", "fix"] },
  { t: "Me either, the invisible hand stole it.", tags: ["invisible-hand", "lunch"] },
  { t: "the economy is doing great the food bank has a waitlist.", tags: ["food-bank", "waitlist", "economy"] },
  { t: "yeah longer than the winter", tags: ["food-bank", "lineups"] },
  { t: "no fingerprints. classic.", tags: [] },
  { t: "the chip bag is now 60% air but the air is also smaller", tags: ["shrinkflation"] },
  { t: "he bought it with the bread money", tags: ["weston"] },
  { t: "we got priced out of life. the life has moved to laval", tags: ["we", "life"] },
  { t: "those pigs squeeze us every day in every way", tags: ["shrinkflation", "pigs"] },
  { t: "he better get a moat or get ready for some *hungry* dinner guests", tags: ["castle"] },
  { t: "and what if we refuse to pay the price?", tags: ["we", "life"] },
  { t: "ugh, the market.", tags: ["market", "shrinkflation"] },
  { t: "Loblaws fixed bread prices for fourteen years.", tags: ["price-fixing", "bread"] },
  { t: "the fine was $500k. they made that back before lunch.", tags: ["price-fixing", "stat-36b"] },
  { t: "five hearings. one report. bread is still six dollars.", tags: ["bread", "price-fixing"] },
  { t: "$18 billion. that's the bread tab. not an estimate.", tags: ["stat-18b", "price-fixing", "weston"] },
  { t: "Galen testified before parliament. got a raise the same quarter.", tags: ["weston", "ceo-pay"] },
  { t: "CEO: $8 million. cashier: $32k. same store.", tags: ["weston", "wages", "ceo-pay"] },
  { t: "Weston's fine was less than his wine budget. probably.", tags: ["weston", "price-fixing"] },
  { t: "empire, metro, loblaws — one cartel, three logos.", tags: ["three-co", "cartel"] },
  { t: "oligopoly is just monopoly with better branding.", tags: ["three-co", "cartel", "weston"] },
  { t: "no-name brand is still Loblaws.", tags: ["three-co"] },
  { t: "they bought all the competition. then cited competition.", tags: ["three-co", "cartel"] },
  { t: "free market. captive customers.", tags: ["cartel"] },
  { t: "$3.6 billion profit. bread is six dollars.", tags: ["stat-36b", "bread"] },
  { t: "47% markup. the flyer is theatre.", tags: ["stat-47"] },
  { t: "prices up 27%. wages didn't get the memo.", tags: ["wages"] },
  { t: "a third of Canadians are skipping meals. the quarterly report looks great.", tags: [] },
  { t: "food banks have waiting lists now. waiting lists.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them.", tags: ["food-bank"] },
  { t: "the food bank used to be a last resort. now it's a calendar event.", tags: ["food-bank"] },
  { t: "dumpster diving is illegal. food destruction is just business.", tags: ["dumpsters"] },
  { t: "the algorithm knows when you're desperate. charges accordingly.", tags: ["dynamic-pricing"] },
  { t: "Loblaws tested dynamic pricing on groceries. on groceries.", tags: ["dynamic-pricing"] },
  { t: "shareholders got a dividend. we got a smaller bag of chips.", tags: ["shrinkflation"] },
  { t: "price freeze. twelve items. three months.", tags: [] },
  { t: "that glorious bandit didn't wait for the market to correct itself.", tags: ["robin-hood"] },
  { t: "one month of boycott. prices didn't move.", tags: ["boycott"] },
  { t: "Loblaws owns Shoppers. your pharmacist works for Galen.", tags: ["weston", "three-co"] },
  { t: "there are two Galen Westons. both doing fine.", tags: ["weston"] },
  { t: "the Competition Bureau found a cartel. recommended a study.", tags: ["audit", "three-co"] },
  { t: "Hochelaga lost its store. Westmount got a renovation.", tags: ["three-co"] },
  { t: "the government bailed out the supply chain. Galen kept the money.", tags: ["bailout"] },
  { t: "the audit found nothing. the auditors bill them $400/hr.", tags: ["audit"] },
  { t: "his bonus is clawed back for losing market share. not for us going hungry.", tags: ["ceo-pay"] },
  { t: "shrinkflation is legal. hunger is the consequence.", tags: ["shrinkflation"] },
  { t: "yeah, the bread fine was $500k. found it in a coat pocket, probably.", tags: ["weston", "price-fixing"] },
  { t: "fourteen years. $500k fine. bread is still six dollars.", tags: ["price-fixing", "bread"], follows: "price-fixing" },
  { t: "full of it — the bin, too.", tags: ["dumpsters", "bread"], follows: "bread" },
  { t: "record profits the same quarter. they know we have nowhere else to go.", tags: ["stat-36b", "three-co"], follows: "boycott" },
  { t: "record profits, record food bank lines. they call it a supply chain issue.", tags: ["food-bank", "stat-36b"], follows: "stat-36b" },
  { t: "$15/hr to ring through $3.6 billion in groceries. do the math.", tags: ["wages"], follows: "stat-36b" },
  { t: "essential worker pay hasn't kept up with essential worker groceries.", tags: ["wages"], follows: "wages" },
  { t: "a billion in wasted food. bins are locked.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "PC Optimum points are a refund they owe you, repackaged as a gift.", tags: ["points"], follows: "points" },
  { t: "clean audit. record profits. CEO got a raise.", tags: ["ceo-pay"], follows: "audit" },
  { t: "they got a subsidy. we got a coupon.", tags: ["bailout"], follows: "bailout" },
  { t: "that glorious bandit didn't wait for the market to correct itself.", tags: ["robin-hood"] },
  { t: "that hand has been picking our pockets the whole time.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "food bank waiting lists. billion in locked dumpsters.", tags: ["wasted-food", "dumpsters"], follows: "food-bank" },
  { t: "margins go up when we eat less. bonus is tied to margins.", tags: ["ceo-pay"], follows: "ceo-pay" },
  { t: "one month of boycott. the algorithm just waited us out.", tags: ["boycott", "dynamic-pricing"], follows: "boycott" },
  { t: "same three companies, same wage floor, same ceiling.", tags: ["three-co", "cartel"], follows: "wages" },
]);

const DECK_HUNGRY_PITCH = new DM.Deck([
  { t: "potato haul. this is what it's come to.", tags: ["potato"] },
  { t: "it's kind to feed the squirrels but you need to eat too.", tags: ["garden"] },
  { t: "sober? oh no.", tags: ["chow-mein"] },
  { t: "oh like la croix, but food.", tags: ["soup"] },
  { t: "a cracker is just a tiny bread that gave up", tags: ["cracker"] },
  { t: "you don't seem too salty about it.", tags: ["ramen"] },
  { t: "nutrition via humiliation.", tags: ["market"] },
  { t: "yeah even their garbage bin olives are out of reach these days.", tags: ["segals"] },
  { t: "yeah I eat like a king. eat like a king who lost everything in a war.", tags: ["king"] },
  { t: "the meal stretched. you didn't. respect.", tags: ["snap"] },
  { t: "the math is doing something. not sure what. not addition.", tags: ["math", "3-jobs"] },
  { t: "very lean. very clean. like a machine.", tags: ["diet"] },
  { t: "i know. we all know. the art is not the reason anyone is here.", tags: ["art"] },
  { t: "me too. the mustard is doing its best.", tags: ["mustard", "condiment"] },
  { t: "please don't eat me.", tags: ["smell"] },
  { t: "no we need that to sit on the street for at least 5 more years", tags: ["traffic-cone"] },
  { t: "they're not food but you're not wrong.", tags: ["traffic-cone"] },
  { t: "the sandwich is worth it. the sandwich has always been worth it. a jury would understand.", tags: ["sandwich", "crimes"] },
  { t: "the machine lied. the machine has no remorse. the machine is doing great actually.", tags: ["vending-machine"] },
  { t: "a store full of food, thirty feet away.", tags: [] },
  { t: "one of us is eating tonight. I vote us.", tags: [] },
  { t: "the food exists. somebody decided it wasn't ours.", tags: [] },
  { t: "hunger isn't a personal failure.", tags: [] },
  { t: "you eat today? me neither. so.", tags: [] },
  { t: "I'm not asking anything you haven't already thought about.", tags: [] },
  { t: "three families on this block skipped dinner. that store didn't.", tags: [] },
  { t: "the store planned for shrinkage. we're delivering it.", tags: [] },
  { t: "bread is six dollars. six.", tags: ["bread"] },
  { t: "your kids shouldn't have to learn to ignore hunger.", tags: ["kids"] },
  { t: "they throw it out at midnight. we could be there at midnight.", tags: ["dumpsters", "wasted-food"] },
  { t: "my kids are hungry. that's the whole argument.", tags: ["kids"] },
  { t: "it expires at midnight. after that it's a philosophical question.", tags: ["dumpsters", "wasted-food"] },
  { t: "my daughter had crackers for dinner. the store had a full aisle.", tags: ["kids"] },
  { t: "you shouldn't need a loyalty card to eat.", tags: ["points"] },
  { t: "they mark it to zero and lock the bin. that's not business. that's spite.", tags: ["dumpsters"] },
  { t: "that food was going to be thrown out anyway. we're adjusting the timeline.", tags: ["dumpsters", "wasted-food"] },
  { t: "bread used to be $3. I bought it without thinking.", tags: ["bread"] },
  { t: "the bin is locked. the food is sealed. think about that pairing.", tags: ["dumpsters"] },
  { t: "a points card is not dinner.", tags: ["points"] },
  { t: "I'm not asking for a revolution. I'm asking for groceries.", tags: [] },
  { t: "the store closes at 10. we don't have to.", tags: ["dumpsters"] },
  { t: "the bin is public property once it's on the curb. I read that somewhere.", tags: ["dumpsters"] },
  { t: "Hochelaga doesn't have a PA. we have what we have.", tags: [] },
  { t: "your kids are watching you put things back at checkout. not tonight.", tags: ["kids"], follows: "kids" },
  { t: "bread was $3. now it's $6. that gap is somebody's salary.", tags: ["bread"], follows: "bread" },
  { t: "sealed food. I check it every night.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "Robin Hood fed people. that's all this is.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "wages went up $2. groceries went up $400. the bin didn't move at all.", tags: ["dumpsters", "wages"], follows: "wages" },
  { t: "the bin doesn't have a waiting list.", tags: ["dumpsters", "food-bank"], follows: "food-bank" },
  { t: "points. while my kids skip meals.", tags: ["points", "kids"], follows: "kids" },
  { t: "a points card is how they make you feel grateful for a partial refund.", tags: ["points"], follows: "points" },
]);

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
  { t: "finish that thought.", tags: [] },
  { t: "that's not nothing.", tags: [] },
  { t: "okay. I'm still here.", tags: [] },
  { t: "you said what now?", tags: [] },
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
  { t: "the audit?", tags: ["audit"], follows: "audit" },
  { t: "the CEO pay thing — go on.", tags: ["ceo-pay"], follows: "ceo-pay" },
  { t: "a bailout?", tags: ["bailout"], follows: "bailout" },
  { t: "insurance covers their losses?", tags: ["insurance"], follows: "insurance" },
  { t: "the boycott didn't work?", tags: ["boycott"], follows: "boycott" },
  { t: "Shoppers too?", tags: ["three-co", "weston"], follows: "shoppers" },
  { t: "and Galen just... what, apologized?", tags: ["weston"], follows: "price-fixing" },
  { t: "how much food are we actually talking?", tags: ["wasted-food"], follows: "dumpsters" },
  { t: "the bin has actual sealed food in it?", tags: ["dumpsters"], follows: "wasted-food" },
  { t: "and nobody's in jail for any of this?", tags: ["price-fixing"], follows: "weston" },
  { t: "wait, which three companies?", tags: ["three-co"], follows: "cartel" },
  { t: "so their profits just keep going up?", tags: ["stat-36b"], follows: "food-bank" },
  { t: "the points card is the whole deal, isn't it.", tags: ["points"], follows: "three-co" },
  { t: "and the audit just cleared them?", tags: ["audit"], follows: "ceo-pay" },
  { t: "the government subsidized them?", tags: ["bailout"], follows: "three-co" },
  { t: "so insurance covers what they waste?", tags: ["insurance"], follows: "dumpsters" },
]);

const D_SAY_MORE_SKEPTICAL = new DM.Deck([
  { t: "before you criticize the dumpster fire, ask yourself — is it not, in its own way, providing warmth?", tags: ["dumpsters", "fire"] },
  { t: "elaborate please?", tags: [] },
  { t: "I'm going to need specifics.", tags: [] },
  { t: "define 'do something'.", tags: [] },
  { t: "what exactly are you proposing.", tags: [] },
  { t: "say that again. slowly.", tags: [] },
  { t: "what does that mean, practically speaking.", tags: [] },
  { t: "I want to make sure I understand what you're suggesting.", tags: [] },
  { t: "be specific.", tags: [] },
  { t: "and you mean what, exactly.", tags: [] },
  { t: "I'm going to need that in plain language.", tags: [] },
  { t: "walk me through it.", tags: [] },
  { t: "so you're suggesting — what?", tags: [] },
  { t: "let's be clear about what we're talking about here.", tags: [] },
  { t: "you want to be very careful about what you say next.", tags: [] },
  { t: "that's an interesting thing to say to a stranger.", tags: [] },
  { t: "I didn't catch that. say it again.", tags: [] },
  { t: "hmm. go on.", tags: [] },
  { t: "carefully.", tags: [] },
  { t: "that's a very specific thing to say out loud.", tags: [] },
  { t: "I want to understand exactly what you mean by 'we'.", tags: ["we"] },
  { t: "what would that look like. concretely.", tags: [] },
  { t: "the boycott lasted a month and prices are the same. so.", tags: ["boycott"] },
  { t: "the Competition Bureau found nothing actionable. case closed.", tags: ["price-fixing"] },
]);

const D_JOIN_CONSENT_PAIRS = [
  { join: "I've been waiting for someone to say that out loud.", consent: "yes!" },
  { join: "the system isn't going to fix itself.", consent: "let's go!" },
  { join: "you're right.", consent: "I'm with you." },
  { join: "I've got nothing left to lose.", consent: "I'm in." },
  { join: "yes, I'm in.", consent: "what took you so long?" },
  { join: "my therapist said to try new things.", consent: "this is new." },
  { join: "finally someone is actually doing something.", consent: "lead the way" },
  { join: "about damn time", consent: "let's go!" },
  { join: "I thought you'd never ask.", consent: "yes, I'm in." },
  { join: "I'm ready.", consent: "where do I sign?" },
  { join: "you had me at 'take back'", consent: "say less" },
  { join: "screw it.", consent: "I'm in." },
  { join: "I'm in.", consent: "let's go!" },
  { join: "I'm hungry.", consent: "allons-y !" },
  { join: "I knew someone would snap eventually.", consent: "I'm glad it's us." },
  { join: "tabarnak.", consent: "finally!" },
  { join: "Enough is enough.", consent: "I'm in, let's eat" },
  { join: "I kept thinking someone else would do something.", consent: "it's us. who will do something." },
  { join: "I'm done waiting for things to change", consent: "I'm with you." },
  { join: "okay Robin Hood.", consent: "let's ride." },
  { join: "don't have to ask me twice", consent: "yalla" },
  { join: "every day I tell myself tomorrow will be different.", consent: "I'm in." },
  { join: "does a bird sing?", consent: "I'm yours." },
  { join: "yes.", consent: "I'm following you." },
  { join: "if not us, then who?", consent: "onwards!" },
  { join: "what else do I have to do?", consent: "lead the way!" },
  { join: "you had me at $3.6 billion", consent: "crisse, let's go" },
  { join: "I've been angry for years.", consent: "might as well join!" },
  { join: "for my granny!", consent: "I'm in." },
  { join: "I thought someone braver than me would go", consent: "but I'm ready." },
  { join: "it's this or watching Empathie", consent: "allons-y!" },
  { join: "I bought crackers for dinner. I'm in.", consent: "let's go" },
  { join: "I was going to write a strongly worded letter.", consent: "count me in!" },
  { join: "it's time.", consent: "I'm in" },
  { join: "honestly I've been this close for months", consent: "okay. yes. let's." },
  { join: "every week I budget. every week it doesn't work.", consent: "count me in." },
  { join: "why not?", consent: "let's do this." },
  { join: "the boycott did nothing.", consent: "this might do something. I'm in." },
  { join: "enough.", consent: "câline. let's go." },
];

const DECK_MISMATCH_TOO_LITERAL = new DM.Deck([
  { t: "it's not about one meal. it's about all of them.", tags: [] },
  { t: "I don't want charity. I want it to stop happening.", tags: [] },
  { t: "one meal doesn't fix any of this.", tags: [] },
  { t: "we eat tonight, same thing happens tomorrow.", tags: [] },
  { t: "that's a symptom. I'm talking about the disease.", tags: [] },
  { t: "the problem isn't that I'm hungry. the problem is why.", tags: [] },
  { t: "we can't eat our way out of this.", tags: [] },
  { t: "you're describing a symptom. I want to talk about the cause.", tags: [] },
  { t: "I'm not hungry. I'm angry. there's a difference.", tags: [] },
  { t: "I'm past being hungry. I'm at a different stage now.", tags: [] },
  { t: "that's not nothing. it's just not enough.", tags: [] },
  { t: "I need the system to change, not my dinner.", tags: [] },
  { t: "tonight fixes tonight. I'm talking about every night.", tags: [] },
  { t: "I ate. this isn't about eating.", tags: [] },
  { t: "short term, sure. then what?", tags: [] },
  { t: "I appreciate it. I'm just thinking longer than tonight.", tags: [] },
]);

const DECK_MISMATCH_TOO_STRUCTURAL = new DM.Deck([
  { t: "I tried to rob from the rich. turns out they have a lot of security. that's how they got rich, probably.", tags: ["robin-hood"] },
  { t: "I know that. I just need to eat, now.", tags: [] },
  { t: "that's a lot of theory for an empty stomach.", tags: [] },
  { t: "I appreciate the politics but I'm past that.", tags: [] },
  { t: "I'm not looking for a manifesto. I'm looking for dinner.", tags: [] },
  { t: "I'm just trying to get through today.", tags: [] },
  { t: "I hear you. I just haven't eaten since yesterday.", tags: [] },
  { t: "the long game is great. I need the short game now.", tags: [] },
  { t: "you're not wrong. I just can't think that far ahead right now.", tags: [] },
  { t: "that's real. all of that is real. I'm just really hungry.", tags: [] },
  { t: "I'll be angry tomorrow. tonight I need to eat.", tags: [] },
  { t: "I believe you. I just need to get through tonight first.", tags: [] },
  { t: "sure. but also — do you have any food?", tags: [] },
  { t: "your analysis is correct. my fridge is still empty.", tags: [] },
  { t: "I want the revolution. I also want it to come with food.", tags: [] },
  { t: "very compelling. I still haven't eaten.", tags: [] },
  { t: "the structural stuff I get. I'm just really hungry right now.", tags: [] },
  { t: "my stomach doesn't care about the oligopoly.", tags: ["three-co"] },
  { t: "yeah the system is broken. also my kids are hungry right now.", tags: ["kids"] },
]);

const DECK_STRONGER_PITCH = new DM.Deck([
  { t: "one in four canadians is food insecure.", tags: [] },
  { t: "they were never going to fix anything.", tags: [] },
  { t: "Robin Hood wasn't a criminal. he was just early.", tags: ["robin-hood"] },
  { t: "we're robins. not robbers.", tags: ["robin-hood"] },
  // { t: "tonight we eat. all of us.", tags: [] },
  { t: "I used to think one person couldn't make a difference. then I learned how few people are making all the decisions.", tags: [] },
  { t: "they're not worried about what you'll do. they're worried about what we'll do together.", tags: [] },
  { t: "the food exists. it's just not ours yet.", tags: [] },
  { t: "it's not theft if they stole it first.", tags: [] },
  { t: "$15/hr doesn't cover dinner anymore.", tags: ["wages"], follows: "wages" },
  { t: "the food bank has a waitlist. the castle has a moat. these facts are related.", tags: ["weston", "food-bank"], follows: "food-bank" },
  { t: "a billion dollars of food thrown out. not lost. thrown. out.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "somewhere there is a room where they decided this was fine. we were not in that room.", tags: [] },
  { t: "I looked into doing nothing. the waitlist was full.", tags: [] },
  { t: "they own the store. we own what happens next.", tags: [] },
  { t: "if not us, someone hungrier. I'd rather it be us.", tags: [] },
  { t: "the ones at the top are not smarter. they're just higher.", tags: [] },
  { t: "they keep moving the finish line. at some point you stop running toward it and start running toward them.", tags: [] },
  { t: "somewhere in a very tall building someone is genuinely surprised this is happening.", tags: [] },
  { t: "someone in a fleece vest is about to explain this using a whiteboard.", tags: [] },
  { t: "they named it the system so we'd think it ran on its own.", tags: [] },
  { t: "we keep asking if it's the right time. the right time is wondering where we are.", tags: [] },
  { t: "the emergency exit has always been unlocked. that's what emergency means.", tags: [] },
  { t: "we are waiting for permission from the people who benefit from the waiting.", tags: [] },
  { t: "the rules were written by the people the rules were written to protect.", tags: [] },
  { t: "this is the moment. someone should probably start it though.", tags: [] },
  { t: "the door is open. it has been open. we are standing in the rain asking if it is open.", tags: [] },
  { t: "look at what we have and look at what they have. the math isn't complicated. we've just been told we're bad at math.", tags: [] },
  { t: "the invisible hand has been in our pockets for years. tonight we reach back.", tags: ["invisible-hand"], follows: "invisible-hand" },
  // --- main cards ---
  { t: "they fixed bread prices for fourteen years. we're taking some bread.", tags: ["bread", "price-fixing"] },
  { t: "CEO: $8 million. us: groceries. I think the math works.", tags: ["weston", "ceo-pay"] },
  { t: "empire, metro, loblaws — between them they'll survive one bad night.", tags: ["three-co"] },
  { t: "Loblaws made $3.6 billion last year. they can absorb a lasagna.", tags: ["stat-36b"] },
  { t: "47% markup. we're taking some of it back.", tags: ["stat-47"] },
  { t: "prices up 27% since 2020. consider this a partial refund.", tags: [] },
  { t: "they locked the dumpsters. they didn't lock the front door.", tags: ["dumpsters"] },
  { t: "the Competition Bureau recommended a task force. we're the task force.", tags: ["audit"] },
  { t: "one store, one night, the whole block eats.", tags: [] },
  { t: "everybody eats or nobody does. I say everybody.", tags: [] },
  { t: "we're not stealing. we're correcting a long-running error.", tags: [] },
  // --- follows cards ---
  { t: "a person in a castle won't notice a little spillage.", tags: ["weston"], follows: "weston" },
  { t: "$3.6 billion. they absorb one bad night. we can't absorb one more.", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "$15/hr doesn't cover dinner anymore.", tags: ["wages"], follows: "wages" },
  { t: "the Competition Bureau shrugged. we don't have to.", tags: ["three-co"], follows: "audit" },
]);

const D_INVITE = [
  { t: "come with us?", tags: [] },
  { t: "so. you in?", tags: [] },
  { t: "want in?", tags: [] },
  { t: "you with us?", tags: [] },
  { t: "tonight. you free?", tags: [] },
  { t: "we could use someone like you.", tags: [] },
  { t: "what do you have to lose?", tags: [] },
  { t: "we're not waiting anymore. you don't have to either.", tags: [] },
  { t: "you look like a robin to me.", tags: [] },
  { t: "you look like someone who's had enough.", tags: [] },
  { t: "I think you already know what you want to say.", tags: [] },
  { t: "no pressure. some pressure?", tags: [] },
  { t: "the store's not going to rob itself.", tags: [] },
  { t: "how do you feel about a little food redistribution — tonight?", tags: [] },
  { t: "you interested?", tags: [] },
  { t: "we're done asking nicely. are you?", tags: [] },
  { t: "tonight we eat. want to join us?", tags: [] },
  { t: "just say the word.", tags: [] },
];

const D_BACK_OFF_EARLY = new DM.Deck([
  { t: "oh, um nevermind.", tags: [] },
  { t: "forget I said anything.", tags: [] },
  { t: "forget it.", tags: [] },
  { t: "pretend I said nothing.", tags: [] },
  { t: "oh I'm just venting.", tags: [] },
  { t: "I was thinking out loud. nevermind.", tags: [] },
  { t: "it was nothing. forget it", tags: [] },
  { t: "anyway.", tags: [] },
  { t: "let's just — never mind.", tags: [] },
]);

const D_BACK_OFF_LATE = new DM.Deck([
  { t: "completely hypothetical. forget it.", tags: [] },
  { t: "anyway, how about this fake spring?", tags: [] },
  { t: "I'm just venting. forget it.", tags: [] },
  { t: "I have the wrong face for this conversation.", tags: [] },
  { t: "that was a test. you passed. there is no plan.", tags: [] },
  { t: "ah this was a bit from a play I'm writing.", tags: [] },
  { t: "I have no idea what I was talking about.", tags: [] },
  { t: "oh I meant al of that as a metaphor.", tags: [] },
  { t: "I was doing a bit. I'm going to leave now.", tags: [] },
  { t: "on reflection, I'm walking away from this conversation.", tags: [] },
  { t: "my lawyer would like me to stop talking.", tags: [] },
  { t: "I'm going to need you to forget the last two minutes.", tags: [] },
]);

const D_NARC_REVEAL = [
  { t: "my husband is a COP", tags: [] },
  { t: "I OWN Loblaws stock", tags: [] },
  { t: "I'm calling 911!", tags: [] },
  { t: "GET A JOB!", tags: [] },
  { t: "this is a Metro, not a manifesto", tags: [] },
  { t: "that's THEFT!", tags: [] },
  { t: "this is NOT how change happens!", tags: [] },
  { t: "the market will fix this naturally!", tags: [] },
  { t: "this is why we need more police", tags: [] },
  { t: "you're RUINING the neighbourhood!", tags: [] },
  { t: "you should just try budgeting", tags: [] },
  { t: "I'm on the board of Loblaws community partners!", tags: [] },
  { t: "shrinkflation is INNOVATION!", tags: [] },
  { t: "some of us LIKE to be touched by the the invisible hand!", tags: [] },
];

const D_NOT_NOW = [
  { t: "maybe another time", tags: [] },
  { t: "I want to but I can't right now", tags: [] },
  { t: "I'm scared", tags: [] },
  { t: "not tonight", tags: [] },
  { t: "give me a minute", tags: [] },
  { t: "I have anxiety", tags: [] },
  { t: "my heart says yes, my anxiety says no", tags: [] },
  { t: "I need to think", tags: [] },
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
  { t: "I'm this close. I'm just not there yet.", tags: [] },
  { t: "I need to eat something first. ironically.", tags: [] },
  { t: "I keep almost saying yes.", tags: [] },
  { t: "give me until tomorrow. I mean it.", tags: [] },
  { t: "I want to. I'm just — not tonight.", tags: [] },
  { t: "I've thought about this exact thing. I just need one more day.", tags: [] },
];

const D_NO_BYE = [
  { t: "yeah, no thanks", tags: [] },
  { t: "no, seriously, no.", tags: [] },
  { t: "nope", tags: [] },
  { t: "nope, NOPE!", tags: [] },
  { t: "I'm good, please go away", tags: [] },
  { t: "I'll pass on all of that", tags: [] },
  { t: "non, NON!", tags: [] },
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

const D_RETURN = [
  { t: "hey — I changed my mind. I'm in.", tags: [] },
  { t: "been thinking about what you said. let's do it.", tags: [] },
  { t: "couldn't stop thinking about it. count me in.", tags: [] },
  { t: "you still doing this? I want in.", tags: [] },
  { t: "you were right. I'm done waiting.", tags: [] },
  { t: "I thought about my kids. I'm in.", tags: ["kids"] },
  { t: "screw it. I'm in.", tags: [] },
  { t: "I went home and looked at my fridge. I'm in.", tags: [] },
  { t: "I went home, sat down, stood back up. I'm in.", tags: [] },
  { t: "who's going to do it if not us.", tags: [] },
  { t: "I told myself I'd sleep on it. I didn't sleep.", tags: [] },
  { t: "okay. you convinced me. let's go.", tags: [] },
  { t: "I looked at my grocery bill. I'm in.", tags: [] },
  { t: "I looked at the empty fridge. I'm in.", tags: [] },
  { t: "I almost went home. I didn't. I'm in.", tags: [] },
  { t: "I got as far as my door. then I turned around.", tags: [] },
  { t: "I was scared. I'm still scared. I'm in.", tags: [] },
];

const D_F_INVITE = [
  { t: "we're changing things. join us?", tags: [] },
  { t: "time to make change?", tags: [] },
];

const D_ACK_HUNGRY_ANGRY = ["exactly,", "right?"];
const D_ACK_NARC = ["well, ", "you know, ", "honestly, ", "I mean, "];

// ─────────────────────────────────────────
// DECK INSTANTIATION (unchanged)
// ─────────────────────────────────────────

const DECK_GREET = new DM.Deck(P_GREET);
const DECK_F_INVITE = new DM.Deck(D_F_INVITE);

const DECK_INVITE = new DM.Deck(D_INVITE);
const DECK_JOIN_CONSENT = new DM.Deck(D_JOIN_CONSENT_PAIRS);
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
  for (let attempt = 0; attempt < deck.pile.length; attempt++) {
    const candidate = deck.pile[deck.pile.length - 1 - attempt];
    const text = typeof candidate === "string" ? candidate : candidate.t;
    if (!_ambRecent.has(text)) {
      deck.pile.splice(deck.pile.length - 1 - attempt, 1);
      _ambRecent.add(text);
      setTimeout(() => _ambRecent.delete(text), _AMB_COOLDOWN_MS);
      return text;
    }
  }
  const item = deck.pop();
  return typeof item === "string" ? item : item.t;
}

const DECK_AMB_NARC = new DM.Deck(D_AMB_NARC);
const DECK_AMB_HUNGRY = new DM.Deck(D_AMB_HUNGRY);
const DECK_AMB_ANGRY = new DM.Deck(D_AMB_ANGRY);
