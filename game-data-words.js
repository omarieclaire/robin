// Player greets [DECK_GREET]
// NPC replies [HELLO_PREFIX + DECK_HUNGRY_HELLO / DECK_ANGRY_HELLO / DECK_NARC_HELLO]
// Player chooses:

// Bail → shown as [DECK_BACK_OFF_EARLY] → NPC replies [DECK_BAIL_RESPONSE] → end
// Tone deaf → shown as [DECK_ANGRY_PITCH / DECK_HUNGRY_PITCH (wrong type)] → NPC replies [DECK_MISMATCH_TOO_STRUCTURAL / DECK_MISMATCH_TOO_LITERAL] + [DECK_NO_BYE] → end
// Match → shown as [DECK_HUNGRY_PITCH / DECK_ANGRY_PITCH (correct type)] (narcs also get [DECK_ACK_NARC] prefix) → NPC replies [DECK_FILLER] → player chooses:

// Walk away → shown as [DECK_BACK_OFF_EARLY] → end
// Recruit → shown as [DECK_F_INVITE] → TP24 resolves:

// 80%: NPC joins → [DECK_JOIN_CONSENT] (join line, then consent line timed separately) → end
// 20%: NPC asks for more → [DECK_SAY_MORE_WARM] (narc always goes here via [DECK_SAY_MORE_SKEPTICAL]) → player does stronger pitch [DECK_STRONGER_PITCH] or walks [DECK_BACK_OFF_LATE] → end

// Stronger pitch chosen → resolves directly:

// Narc → [DECK_NARC_REV] → heat +1 → end
// Non-narc 60% → [DECK_JOIN_CONSENT] (join line, then consent line) → end
// Non-narc 40% → [DECK_NOT_NOW] → wanders off → rejoins 4–7s later → [DECK_RETURN] → end

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
  { t: "hey, how's it hanging?", tags: ["casual", "hows-it-hang"] },
  { t: "hi there. you good?", tags: ["casual", "you-good"] },
  { t: "salut. what's up?", tags: ["casual", "sup"] },
  { t: "hey, you good?", tags: ["concerned", "you-good"] },
  { t: "hey neighbour. how are you?", tags: ["casual", "how-are-you"] },
  { t: "allô. what's up?", tags: ["casual", "sup"] },
  { t: "hey neighbour, you ok?", tags: ["concerned", "you-ok"] },
  { t: "hey, what's up?", tags: ["casual", "sup"] },
  { t: "hey, you hungry?", tags: ["direct", "you-hungry"] },
  { t: "hey, I know that look. you ok?", tags: ["concerned", "you-ok"] },
  { t: "real talk?", tags: ["direct", "real-talk"] },
  { t: "hey, you look like you get it.", tags: ["direct", "get-it"] },
  { t: "hey, you look like someone who's had enough.", tags: ["direct", "had-enough"] },
  { t: "hey, rough day?", tags: ["direct", "rough-day"] },
  { t: "ça va?", tags: ["concerned", "ca-va"] },
  { t: "you okay?", tags: ["concerned", "you-ok"] },
  { t: "salut, toi. ça va?", tags: ["concerned", "ca-va"] },
  { t: "hold up. ça va?", tags: ["direct", "ca-va"] },
];

const HELLO_PREFIX = {
  casual: {
    angry: ["yeah well —", "ha.", "okay, honestly?"],
    hungry: ["honestly —", "ugh.", "not great, actually —"],
    narc: ["great, thanks!", "not much!", "doing great!"],
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
  { t: "on my way to lunch at the Ritz-Carlton", tags: ["ritz"] },
  { t: "the system works and I work within it.", tags: ["system"] },
  { t: "no problems here! none! at all!", tags: ["no-prob"] },
  { t: "the free market is working as intended.", tags: ["intended"] },
  { t: "everyone just needs to budget better.", tags: ["budget"] },
  { t: "the economy is doing great.", tags: ["great-econ"] },
  { t: "some people need to stop buying avocados.", tags: ["avocado"] },
  { t: "everything's fine.", tags: ["fine"] },
  { t: "money is just a mindset issue.", tags: ["mindset"] },
  { t: "the market self-corrects. it always does.", tags: ["self-corrects"] },
  { t: "I love the market economy.", tags: ["market-econ"] },
  { t: "if people stopped doing drugs they could afford food.", tags: ["drugs"] },
  { t: "the invisible hand will sort it out.", tags: ["invisible-hand-sort"] },
  { t: "when you use a points card food is basically free.", tags: ["free-points-card"] },
  { t: "competition keeps prices down. I read that somewhere.", tags: ["competition"] },
  { t: "have you tried the PC Optimum app?", tags: ["optimum"] },
];

const DECK_ANGRY_HELLO = new DM.Deck([
  { t: "I googled 'is capitalism fair' at 3am. |pause||pause| now i'm on a list. also: no.", tags: ["fair-cap"] },
  { t: "the shareholders are migrating south for winter, |pause||pause|honking contentedly.", tags: ["honk", "shareholders"] },
  { t: "the economy is a dumpster fire", tags: ["fire"] },
  { t: "we got priced out of life", tags: ["life"] },
  { t: "did you know that Galen Weston owns a CASTLE?", tags: ["castle"] },
  { t: "robin hood had the right idea: steal from the rich. give to the poor.", tags: ["robin-hood"] },
  { t: "food bank lineups are so long now", tags: ["food-lines"] },
  { t: "the market's been about to fix itself for 800 years.", tags: ["market"] },
  { t: "a billion dollars of food tossed out.", tags: ["wasted-food", "dumpsters"] },
  { t: "no-name? no shame!", tags: ["price-fixing"] },
  { t: "everything is getting smaller but the price keeps going up.", tags: ["pigs"] },
  { t: "were you at the April boycott?", tags: ["boycott", "loblaws", "anger", "solidarity"] },
  { t: "I pay plateau prices with hochelaga wages", tags: ["plat-hoch"] },
  { t: "my loyalty card is not feeling very mutual", tags: ["points-card"] },
  { t: 'i just found out about "dynamic pricing".', tags: ["dynamic-pricing"] },
  { t: "what happened with that bread pricing scandal?", tags: ["bread-scandal"] },
  { t: "when is the invisible hand going lift us up where we belong?", tags: ["invisible-hand"] },
]);

const DECK_HUNGRY_HELLO = new DM.Deck([
  { t: "I work in a grocery store but I can't afford to shop there.", tags: ["work"] },
  { t: "my therapist says focus on what I can control.", tags: ["therapy"] },
  { t: "I tried to save a banana.", tags: ["banana"] },
  { t: "my stomach sounds like an aids wolf concert.", tags: ["aids-wolf"] },
  { t: "I was briefly at peace near a dumpster. Don't ask.", tags: ["peace"] },
  { t: "I made a decision at a dep at 2am, I'm still paying for it.", tags: ["dep"] },
  { t: "I made eye contact with a raccoon and we understood each other.", tags: ["racoon"] },
  { t: "I would do crimes for a sandwich right now.", tags: ["sandwich"] },
  { t: "I ate crackers over a sink and called it lunch.", tags: ["sink-crackers"] },
  { t: "my stomach is doing its mardi spaghetti set.", tags: ["spaghetti"] },
  { t: "I'm so hungry I could eat a traffic cone.", tags: ["hunger", "traffic-cone"] },
  { t: "you smell like someone who ate today.", tags: ["smell"] },
  { t: "was going to eat. rent had other plans.", tags: ["rent"] },
  { t: "I make condiment sandwiches now.", tags: ["condiment"] },
  { t: "I got to gaspe art openings for the crackers and grapes.", tags: ["crack-grapes", "art"] },
  { t: "my diet is very clean. nothing in it.", tags: ["clean"] },
  { t: "I work three jobs and I still can't make it work.", tags: ["3-jobs"] },
  { t: "I've been stretching meals until they snap.", tags: ["snap"] },
  { t: "intermittent fasting. not by choice.", tags: ["fasting"] },
  { t: "even Segals is too expensive for me now.", tags: ["segals"] },
  { t: "I've been living off the free samples at Marché Jean-Talon.", tags: ["samples"] },
  { t: "I've been eating dollar store ramen for lunch all week.", tags: ["dollar-store", "ramen"] },
  { t: "I split one meal into two days and call it meal prep.", tags: ["meal-prep"] },
  { t: "soup tonight. water-forward.", tags: ["soup"] },
  { t: "dinner was coffee. breakfast was also coffee.", tags: ["coffee"] },
  { t: "I ate $2 peanut butter chow mein for dinner.", tags: ["chow-mein"] },
  { t: "started a garden. desperation mostly.", tags: ["garden"] },
  { t: "I bought one avocado. as a treat.", tags: ["avocado"] },
  { t: "I went to three stores to save $4.", tags: ["saver"] },
  { t: "we deserve better than dumpster diving.", tags: ["diving"] },
  { t: "I've started calculating price-per-bite.", tags: ["bite"] },
  { t: "I ate my cereal with water this morning.", tags: ["cereal-water"] },
  { t: "I went to PA for cheap potatoes today.", tags: ["potato"] },
  { t: "Hochelaga doesn't have a PA. we have a Metro and a prayer.", tags: ["hochelaga"] },
  { t: "fruit prices feel like a practical joke.", tags: ["joke"] },
  { t: "I didn't have breakfast.", tags: ["no-breaky"] },
  { t: "I've been thinking about dumpster-diving.", tags: ["diving"] },
]);

const DECK_ANGRY_PITCH = new DM.Deck([
  { t: "following the dividends of course", tags: ["honk", "shareholders"] },
  { t: "5 doritos, alone in the bag, wondering where everyone went.", tags: ["pigs"] },
  { t: "the numbers are doing excellent. the numbers measure the numbers.", tags: ["economy", "numbers"] },
  { t: "Yes, he owns a castle. and you own a points card.", tags: ["castle"] },
  { t: "now they know everything about you and gave you a coupon for beans", tags: ["points-card"] },
  { t: "yeah I'm moving further east every year. eventually we'll be in the river.", tags: ["plat-hoch"] },
  { t: "I was at the boycott yes. I bought nothing. i do that every day but this time it counted", tags: ["boycott"] },
  { t: 'and we\'re all standing around it going "is this nice?"', tags: ["fire"] },
  { t: "they were going to fix the other thing next but then they got tired.", tags: [] },
  { t: "and the garbage bins are locked.", tags: ["wasted-food", "dumpsters"] },
  { t: "it is fixing itself. this is the fixing.", tags: ["market"] },
  { t: "Me either, the invisible hand stole it.", tags: ["invisible-hand", "lunch"] },
  { t: "yeah longer than waiting for a park ex bus in january", tags: ["food-lines", "food-lines"] },
  { t: "life got priced out of life. |pause||pause|life moved to saguenay to live on wild blueberries", tags: ["priced-out"] },
  { t: "loblaws fixed bread prices for fourteen years. the fine was $500k. they made that back before lunch.", tags: ["price-fixing"] },
  { t: "Galen testified before parliament. got a raise the same quarter.", tags: ["weston", "ceo-pay"] },
  { t: "empire, metro, loblaws — one cartel, three logos.", tags: ["three-co", "cartel"] },
  { t: "oligopoly is just monopoly with better branding.", tags: ["fair-cap"] },
  { t: "no-name brand is still Loblaws.", tags: ["three-co"] },
  { t: "they bought all the competition. then cited competition.", tags: ["three-co", "cartel"] },
  { t: "free market. captive customers.", tags: ["cartel"] },
  { t: "$3.6 billion profit. bread is six dollars.", tags: ["stat-36b", "bread"] },
  { t: "47% markup. the flyer is theatre.", tags: ["stat-47"] },
  { t: "prices up 27%. wages didn't get the memo.", tags: ["wages"] },
  { t: "a third of Canadians are skipping meals. the quarterly report looks great.", tags: [] },
  { t: "food banks have waiting lists now. waiting lists.", tags: [] },
  { t: "the algorithm knows when you're desperate. charges accordingly.", tags: ["dynamic-pricing"] },
  { t: "Loblaws tested dynamic pricing on groceries. on groceries.", tags: ["dynamic-pricing"] },
  { t: "price freeze. twelve items. three months.", tags: [] },
  { t: "that glorious bandit didn't wait for the market to correct itself.", tags: ["robin-hood"] },
  { t: "there are two Galen Westons. both doing fine.", tags: ["weston"] },
  { t: "the Competition Bureau found a cartel. recommended a study.", tags: ["audit", "three-co"] },
  { t: "the government bailed out the supply chain. Galen kept the money.", tags: ["bailout"] },
  { t: "the audit found nothing. the auditors bill them $400/hr.", tags: ["audit"] },
  { t: "record profits the same quarter. they know we have nowhere else to go.", tags: ["stat-36b", "three-co"], follows: "boycott" },
  { t: "PC Optimum points are a refund they owe you, repackaged as a gift.", tags: ["points"], follows: "points" },
  { t: "clean audit. record profits. CEO got a raise.", tags: ["ceo-pay"], follows: "audit" },
  { t: "they got a subsidy. we got a coupon.", tags: ["bailout"], follows: "bailout" },
  { t: "that hand has been picking our pockets the whole time.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "margins go up when we eat less. bonus is tied to margins.", tags: ["ceo-pay"], follows: "ceo-pay" },
  { t: "same three companies, same wage floor, same ceiling.", tags: ["three-co", "cartel"], follows: "wages" },
  { t: "it won't. and there will be no fingerprints.", tags: ["invisible-hand"] },
]);

const DECK_HUNGRY_PITCH = new DM.Deck([
  { t: "I went to Metro for a deal. Metro was not participating.", tags: ["hochelaga"] },
  { t: "you're calculating price-per-bite. they're calculating price-per-yacht. someone's math is wrong.", tags: ["bite"] },
  { t: "you've automated the sadness. that's efficient.", tags: ["bite"] },
  { t: "you deserve better. they deserve a yacht. funny how deserving works out.", tags: ["diving"] },
  {
    t: "when a grocery purchase is self-care, either avocados have gotten too expensive or you have gotten too sad. either way someone in a boardroom is very pleased.",
    tags: ["avocado"],
  },
  {
    t: "The vendors know. They've always known. But they keep putting the samples a little closer to the edge of the tray, and neither of you has ever said a word about it.",
    tags: ["samples"],
  },
  { t: "the soup has been thinned to the point of philosophy. we are eating an idea of soup. the idea is also running low.", tags: ["snap"] },
  { t: "they call it a living wage because the alternative is too on the nose.", tags: ["3-jobs"] },
  { t: "the stomach has sent three formal letters. they have gone unanswered. it is now making calls.", tags: ["clean"] },
  {
    t: "there is a version of this that is a choice and a version that is not a choice and the somehow the sandwich tastes the same either way",
    tags: ["condiment"],
  },
  { t: "traffic cones are shaped like a piece of pizza which I think is cruel under the circumstances.", tags: ["traffic-cone"] },
  {
    t: "they made it illegal to steal bread and then made it impossible to afford bread and then built a museum about Les Misérables.",
    tags: ["sandwich"],
  },
  { t: "he knew your name. he has always known your name. he will not use it but he knows it.", tags: ["racoon"] },
  {
    t: "the raccoon has no mortgage, no boss, no credit score, and he's been eating better than you for a decade. what you felt was recognition. what he felt was pity.",
    tags: ["racoon"],
  },
  {
    t: "every 2am dep decision is just proof that somewhere between midnight and morning you briefly see the truth and the truth is terrible.",
    tags: ["dep"],
  },
  { t: "the dumpster recognized you. this has happened before. the dumpster does not forget.", tags: ["peace"] },
  { t: "noted. not asking.", tags: ["peace"] },
  {
    t: 'they\'ve been saying that since the seventies. funny how "focus on what you can control" never turns into "so let\'s talk about who controls everything else."',
    tags: ["therapy"],
  },
  { t: "the Metro is doing its best. its best at at arranging the food so the one that expires today is in the front, smiling", tags: ["hochelaga"] },
  { t: "Somewhere there's a CEO who saved $4 billion and he only had to go to one meeting.", tags: ["saver"] },
  { t: "sounds very french.", tags: ["coffee"] },
  { t: "yeah it's bad when you have to half it again, zeno's leftovers.", tags: ["meal-prep"] },
  { t: "the olive oil lady knows something is wrong but she keeps pouring because eye contact was made and now there are rules.", tags: ["samples"] },
  { t: "me too. my landlord is starting to look delicious.", tags: ["rent", "fasting"] },
  { t: "no one can say that hunger is boring.", tags: ["spaghetti"] },
  { t: "define crimes.", tags: ["sandwich"] },
  { t: "yeah, that lifestyle is starting to make a lot of sense to me.", tags: ["racoon"] },
  { t: "that's your gut biome unionizing.", tags: ["aids-wolf"] },
  { t: "we've all been there.", tags: ["peace", "dep", "racoon"] },
  { t: "well at least that crosses entertainment off the budget list.", tags: ["aids-wolf", "spaghetti"] },
  { t: "you can't save a banana. the banana has its own timeline.", tags: ["banana"] },
  { t: "excellent advice. you might be surprised at how much you can control.", tags: ["therapy"] },
  { t: "potato haul. this is what it's come to.", tags: ["potato"] },
  { t: "it's good to feed the squirrels but you need to eat too.", tags: ["garden"] },
  { t: "sober? oh no.", tags: ["chow-mein"] },
  { t: "oh like la croix, but food.", tags: ["soup"] },
  { t: "a cracker is just a tiny bread that gave up", tags: ["tiny-bread", "sink-crackers"] },
  { t: "you don't seem too salty about it.", tags: ["ramen"] },
  { t: "nutrition via humiliation.", tags: ["market", "cereal-water"] },
  { t: "yeah even the garbage bins of dried beans are a fancy day treat.", tags: ["segals"] },
  { t: "yeah I eat like a king. eat like a king who lost everything in a war.", tags: ["king", "cereal-water"] },
  { t: "I added water to the pasta water and honestly it's got a kind of haunted depth now.", tags: ["snap", "snap", "cereal-water"] },
  { t: "the math is doing something. not sure what. not addition.", tags: ["3-jobs"] },
  { t: "very lean. very clean. like a machine.", tags: ["diet", "clean"] },
  { t: "i know. we all know. the art is not the reason anyone is here.", tags: ["art"] },
  { t: "me too. the mustard holds it all together.", tags: ["mustard", "condiment"] },
  { t: "please don't eat me.", tags: ["smell"] },
  { t: "leave the street decorations alone.", tags: ["traffic-cone"] },
  { t: "they're not food but you're not wrong.", tags: ["traffic-cone"] },
  { t: "the machine lied. the machine has no remorse. the machine is doing great actually.", tags: ["vending-machine"] },
  { t: "the food exists. somebody decided it wasn't ours.", tags: ["diving"] },
  { t: "hunger isn't a personal failure.", tags: [] },
  { t: "they throw out the food and lock the bin. that's not business. that's spite.", tags: ["dumpsters", "diving"] },
  { t: "we're not asking for a revolution. we're asking for groceries.", tags: ["condiment"] },
  { t: "do you know the story of robin hood?", tags: ["diving"] },
]);

const DECK_BAD_READ = new DM.Deck([
  { t: "anyway, let's talk about me.", tags: [] },
  // { t: "so I've been thinking a lot about systemic change lately", tags: [] },
  // { t: "that's rough. so listen, I have this idea—", tags: [] },
  // { t: "yeah totally. so are you coming to the meeting or what", tags: [] },
  // { t: "mmhm. anyway. the fridge.", tags: [] },
  // { t: "right, right. so here's the thing though—", tags: [] },
  { t: "have you tried just... not being stressed about it?", tags: [] },
  // { t: "I feel like this is actually a great opportunity", tags: [] },
  // { t: "okay but what if I told you there was a solution", tags: [] },
  // { t: "sounds like you need a community fridge honestly", tags: [] },
]);

const D_SAY_MORE_WARM = new DM.Deck([
  { t: "go on.", tags: ["market"] },
  { t: "tell me more.", tags: [] },
  { t: "keep talking.", tags: [] },
  { t: "wait — tell me more?", tags: [] },
  { t: "okay. I'm listening.", tags: ["fire"] },
  { t: "that's intense. say more.", tags: [] },
  { t: "what are you saying?", tags: ["honk", "life", "castle"] },
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
  { t: "the chips are the same. the bag has simply grown around them.", tags: ["pigs"] },
  { t: "new line", tags: [] },
  { t: "a castle has enormous upkeep. i actually feel bad for him.", tags: ["castle"] },
  { t: "before you criticize the dumpster fire, ask yourself — is it not, in its own way, providing warmth?", tags: ["dumpsters", "fire"] },
  { t: "elaborate please?", tags: ["robin-hood"] },
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
  { t: "five hearings. one report. bread is still six dollars.", tags: ["price-fixing"] },
  { t: "a billion in wasted food. dumpster diving is illegal. food destruction is just business.", tags: ["wasted-food"] },
  { t: "record profits, record food bank lines. they call it a supply chain issue.", tags: ["food-lines"] },
  { t: "shareholders got a dividend. we got a smaller bag of chips.", tags: ["pigs"] },
  { t: "I'm saying he better get a moat or get ready for some *hungry* dinner guests", tags: ["castle"] },
  { t: "I'm saying they're not the only ones who can bite. we're taking what we need|pause||pause| tonight.", tags: ["honk"] },
  { t: "one in four canadians is food insecure.", tags: [] },
  { t: "they were never going to fix anything.", tags: [] },
  { t: "we're robins. not robbers.", tags: ["robin-hood"] },
  { t: "they're not worried about what you'll do. they're worried about what we'll do together.", tags: [] },
  { t: "the food exists. it's just not ours yet.", tags: [] },
  { t: "it's not theft if they stole it first.", tags: [] },
  { t: "$15/hr doesn't cover dinner anymore.", tags: ["wages"], follows: "wages" },
  { t: "the food bank has a waitlist. the castle has a moat. these facts are related.", tags: ["weston", "food-bank"], follows: "food-bank" },
  { t: "a billion dollars of food thrown out. not lost. thrown. out.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "somewhere there is a room where they decided this was fine. we were not in that room.", tags: ["fire"] },
  { t: "I looked into doing nothing. the waitlist was full.", tags: [] },
  { t: "if not us, someone hungrier. I'd rather it be us.", tags: [] },
  { t: "the ones at the top are not smarter. they're just higher.", tags: [] },
  { t: "they keep moving the finish line. at some point you stop running toward it and start running toward them.", tags: ["fire"] },
  { t: "somewhere in a very tall building someone is genuinely surprised this is happening.", tags: [] },
  { t: "someone in a fleece vest is about to explain this using a whiteboard.", tags: [] },
  { t: "they named it the system so we'd think it ran on its own.", tags: [] },
  { t: "we keep asking if it's the right time. the right time is wondering where we are.", tags: [] },
  { t: "the emergency exit has always been unlocked. that's what emergency means.", tags: [] },
  { t: "I'm saying that we are waiting for permission from the people who benefit from the waiting.", tags: ["life"] },
  { t: "the rules were written by the people the rules were written to protect.", tags: [] },
  { t: "this is the moment. someone should probably start it though.", tags: [] },
  { t: "the door is open. it has been open. we are standing in the rain asking if it is open.", tags: [] },
  { t: "look at what we have and look at what they have. the math isn't complicated. we've just been told we're bad at math.", tags: ["market"] },
  { t: "the invisible hand has been in our pockets for years. tonight we reach back.", tags: ["invisible-hand"], follows: "invisible-hand" },
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
  { t: "a person in a castle won't notice a little spillage.", tags: ["weston"], follows: "weston" },
  { t: "$3.6 billion. they absorb one bad night. we can't absorb one more.", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "$15/hr doesn't cover dinner anymore.", tags: ["wages"], follows: "wages" },
  { t: "the Competition Bureau shrugged. we don't have to.", tags: ["three-co"], follows: "audit" },
]);

const D_INVITE = [
  { t: "come with us, we're taking it back?", tags: [] },
  { t: "so. you in? we're taking what's ours.", tags: [] },
  { t: "want in?", tags: [] },
  { t: "tonight we eat. all of us. you in?", tags: [] },
  { t: "you with us?", tags: [] },
  { t: "tonight. you free?", tags: [] },
  { t: "we could use someone like you.", tags: [] },
  { t: "what do you have to lose?", tags: [] },
  { t: "we're not waiting anymore. you don't have to either.", tags: [] },
  { t: "you look like a robin to me.", tags: [] },
  { t: "you look like someone who's had enough.", tags: [] },
  { t: "no pressure. some pressure?", tags: [] },
  { t: "the store's not going to rob itself.", tags: [] },
  { t: "how do you feel about a little food redistribution tonight?", tags: [] },
  { t: "we're done asking nicely. are you?", tags: [] },
  { t: "tonight we eat. want to join us?", tags: [] },
  { t: "just say the word. the word is now", tags: [] },
];

const DECK_BAIL_RESPONSE = new DM.Deck([
  { t: "...okay then.", tags: [] },
  { t: "sure. whatever.", tags: [] },
  { t: "okay. bye I guess.", tags: [] },
  { t: "cool. cool cool cool.", tags: [] },
  { t: "...alright then.", tags: [] },
  { t: "okay. that's fine.", tags: [] },
  { t: "right. okay.", tags: [] },
]);

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
  { t: "I used to think one person couldn't make a difference. then I learned how few people are making all the decisions.", tags: ["points-card"] },
  { t: "CEO: $8 million. cashier: $32k. same store.", tags: ["plat-hoch"] },
  { t: "they own the store. we own what happens next.", tags: ["boycott"] },
  { t: "$18 billion. that's the bread tab. not an estimate.", tags: ["price-fixing"] },
  { t: "we're not stealing. we're correcting a long-running error.", tags: ["market"] },
  { t: "loblaws donates to food banks. they also cause them.", tags: ["food-lines"] },
  { t: "robin hood wasn't a criminal. he was just early.", tags: ["robin-hood"] },
  { t: "yeah the chip bag is now 80% air and even the air is somehow also smaller?", tags: ["pigs"] },
  { t: "maybe? but what if we refuse to pay the price?", tags: ["life"] },
  { t: "sure, but the wrong things are burning. join us? we change things tonight.", tags: ["fire"] },
  { t: "while they're gone, |pause||pause|we're going to get some bread", tags: ["honk"] },
  { t: "new line", tags: [] },
  { t: "we're changing things. join us?", tags: [] },
  { t: "time to make change?", tags: [] },

  // { t: "we're not waiting any more either. join us?", tags: ["robin-hood"] },
  // { t: "join us? we're taking the rest back tonight.", tags: ["shrinkflation"] },
  // { t: "it's almost like the laws...well anyways, want to join us?", tags: ["castle"] },
  // { t: "and what if we refuse to pay the price?", tags: ["we", "life"] },
  // { t: "but the idea is ready for a come back. join us?", tags: ["robin-hood"] },
  // { t: "I know how we can even things out. Join us?", tags: ["castle"] },
  // { t: "I know what we can do while they're away. Join us?", tags: ["honk"] },
  // { t: "come with us? we have a plan.", tags: ["fire", "shrinkflation", "big-fire"] },
  // { t: "we're changing things. join us?", tags: ["shrinkflation"] },
  // { t: "time to make change?", tags: ["life"] },
  // a store full of food, thirty feet away
  // one of us is eating tonight. I vote us
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

const D_FILLER = [
  { t: "don't get me started about beans", tags: ["points-card"] },
  { t: "yeah I get paid $15/hr to ring through $3.6 billion in groceries. do the math.", tags: [] },
  { t: "one month of boycott. the algorithm just waited us out.", tags: ["boycott"] },
  { t: "yeah, found it in a coat pocket, probably.", tags: ["price-fixing"] },
  { t: "new line", tags: [] },
  { t: "no fingerprints. classic.", tags: ["no-name"] },
  { t: "the trash has never eaten so well. the trash is thriving.", tags: ["wasted-food"] },
  { t: "right. of course. almost there.", tags: ["market"] },
  { t: "the food bank used to be a last resort. now it's just tuesday.", tags: ["food-lines"] },
  { t: "of course the rich have since lobbied against this.", tags: ["robin-hood"] },
  { t: "the bag got smaller. the price didn't hear about it.", tags: ["pigs"] },
  { t: "and yet|pause| somehow, he is not the villain in this story, legally.", tags: ["castle"] },
  { t: "so we just keep moving?", tags: ["life"] },
  { t: "it's probably fine, right? it's a controlled burn.", tags: ["fire"] },
  { t: "and biting anyone who gets in the way!", tags: ["honk"] },
  { t: "lol", tags: ["controlled-burn"] },
  { t: "hmm...", tags: [] },
  { t: "yeah...", tags: [] },
];

const D_NPC_WALK_AWAY_REACTION = [
  { t: "?", tags: [] },
  // { t: "...okay", tags: [] },
  // { t: "um.", tags: [] },
  // { t: "...?", tags: [] },
  // { t: "alright then", tags: [] },
];

const DECK_FILLER = new DM.Deck(D_FILLER);
const DECK_NPC_WALK_AWAY_REACTION = new DM.Deck(D_NPC_WALK_AWAY_REACTION);
