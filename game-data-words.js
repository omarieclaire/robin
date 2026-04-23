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
  "I have three jobs",
  "I saw the total and just nodded",
  "I ate the free samples as a course",
  "pasta again tonight",
  "my fridge is just condiments",
  "I do cost-per-calorie math now",
  "I stood in front of the berries. then I left.",
  "I came in for milk. I left without it.",
  "I counted the pasta. to make sure it would stretch.",
  "I looked up the recipe. then the prices. then I closed the tab.",
  "I split one meal into two. called it meal prep.",
  "I keep buying less and it still costs more.",
  "dinner was coffee. breakfast was also coffee.",
  "I know exactly how many apples are in my fridge. two.",
  "picky is a luxury I used to have.",
  // Montreal texture
  "PA is cheaper. PA is far.",
  "Jean-Talon has everything. Jean-Talon has prices.",
  "IGA or Metro. same price, different logo.",
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
  "parliament held five hearings. bread is still $6.",
  "the fine was a rounding error",
  "they bought back their own stock",
  "same bag. less in it.",
  "the invisible hand is their hand",
  "watch out for-a Luigi!",
  "no competition. no consequences.",
  "Robin Hood was just early",
  // real events / Montreal texture
  "the boycott didn't move the price one cent",
  "they closed the store in Hochelaga. opened a new one in Westmount.",
  "Loblaws owns Shoppers too. your pharmacy is also them.",
  "there are two Galen Westons. that's just a fact.",
  "the Competition Bureau studied it. found concentration. recommended nothing binding.",
];

// ─────────────────────────────────────────
// AMBIENT — NARC
// oblivious, pro-corporate, played for dark comedy
// ─────────────────────────────────────────

const D_AMB_NARC = [
  "everything's fine",
  "I love this store",
  "the CEO worked hard for that bonus",
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
  "competition keeps prices down. I think.",
  "the invisible hand is working on it",
  "Galen is a good man",
  "I heard groceries are actually a low-margin business",
  "maybe stop buying avocados",
  "someone has to pay for the renovations",
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
  { t: "yo, you okay?", tags: ["concerned"] },
  { t: "salut, toi. ça va?", tags: ["concerned"] },
  { t: "yo, hold up. ça va?", tags: ["direct"] },
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
  { t: "on my way to lunch at the Ritz-Carlton", tags: [] },
  { t: "the system works and I work within it.", tags: [] },
  { t: "no problems here! none! at all!", tags: [] },
  { t: "the free market is working as intended.", tags: [] },
  { t: "everyone just needs to budget better.", tags: [] },
  { t: "the economy is doing great.", tags: [] },
  { t: "some people need to stop buying avocados.", tags: [] },
  { t: "everything's fine.", tags: [] },
  { t: "money is just a mindset issue.", tags: [] },
  { t: "the market self-corrects. it always does.", tags: [] },
  { t: "I love the market economy.", tags: [] },
  { t: "if people stopped doing drugs they could afford food.", tags: [] },
  { t: "have you considered a second job?", tags: [] },
  { t: "the invisible hand will sort it out.", tags: [] },
  { t: "when you use a points card food is basically free.", tags: [] },
  { t: "competition keeps prices down. I read that somewhere.", tags: [] },
  { t: "have you tried the PC Optimum app?", tags: [] },
];

const DECK_ANGRY_HELLO = new DM.Deck([
  { t: "we got priced out of a feeling we used to have for free", tags: [] },
  { t: "did you know that Galen Weston owns a CASTLE?", tags: ["weston"] },
  { t: "they lock the freaking dumpsters now!", tags: ["dumpsters"] },
  { t: "three companies own this province.", tags: ["three-co", "cartel"] },
  { t: "dynamic pricing, unfortunately.", tags: ["dynamic-pricing"] },
  { t: "shrinkflation, those pigs!", tags: ["shrinkflation"] },
  { t: "Robin Hood had the right idea!", tags: ["robin-hood"] },
  { t: "the invisible hand stole my lunch.", tags: ["invisible-hand"] },
  { t: "none of this is 'broken', it's working exactly as designed.", tags: [] },
  { t: "some are making money while others starve", tags: ["stat-36b"] },
  { t: "the free market works great if you own the market.", tags: ["cartel"] },
  { t: "47% markup. the flyer makes it feel like a deal!", tags: ["stat-47"] },
  { t: "Loblaws made $3.6 billion and gave me $3 in points.", tags: ["points", "stat-36b"] },
  { t: "it's just wrong. a cashier makes $15 and the CEO takes $8 million.", tags: ["wages", "ceo-pay"] },
  { t: "they caught the bread cartel but nothing ever changes.", tags: ["price-fixing", "bread"] },
  { t: "they fix prices. it's illegal but so what, right?", tags: ["price-fixing"] },
  { t: "Loblaws tested surge pricing on GROCERIES.", tags: ["dynamic-pricing"] },
  { t: "three families own the food supply", tags: ["three-co", "cartel"] },
  { t: "I want to cut off the invisible hand!", tags: ["invisible-hand"] },
  { t: "Weston's castle has more rooms thanI have piasses!", tags: ["weston"] },
  { t: "the price tags go up more when you are desperate.", tags: ["dynamic-pricing"] },
  { t: "food bank lineups are longer than the winter!", tags: ["food-bank"] },
  { t: "record profits. record food bank lineups. nice.", tags: ["food-bank", "stat-36b"] },
  { t: "I get paid $15/hr to ring through a billion dollars of groceries.", tags: ["wages", "stat-36b"] },
  { t: "those scoundrels fixed the price of bread and never had to pay!", tags: ["bread", "price-fixing"] },
  { t: "essential workers? not essential enough for a living wage.", tags: ["wages"] },
  { t: "the market's been about to fix itself for 800 years.", tags: [] },
  { t: "a billion dollars of food tossed out, and the garbage bins are locked.", tags: ["wasted-food", "dumpsters"] },
  { t: "quarterly profits up, quality of living is down.", tags: ["stat-36b"] },
  { t: "no-name. no shame!", tags: ["three-co"] },
  { t: "empire, metro, loblaws, our three kings.", tags: ["three-co", "cartel"] },
  { t: "everything is getting smaller but the price keeps goimng up.", tags: ["shrinkflation"] },
  { t: "were you at the April boycott? one month. prices didn't move.", tags: ["boycott"] },
  { t: "they closed the Hochelaga store. too low-margin apparently.", tags: ["boycott", "three-co"] },
  { t: "Loblaws owns Shoppers. everyone works for Galen.", tags: ["weston", "three-co"] },
  { t: "the Competition Bureau studied grocery prices, found concentration, recommended nothing.", tags: ["audit", "three-co"] },
  { t: "plateau prices, hochelaga wages", tags: ["wages"] },
]);

const DECK_HUNGRY_HELLO = new DM.Deck([
  { t: "my stomach sounds like aids wolf.", tags: [] },
  { t: "I was briefly at peace near a dumpster and I don't want to explain it.", tags: [] },
  { t: "I made a decision at a dep at 2am that I'm still paying for.", tags: [] },
  { t: "I've been gaslit by a vending machine", tags: [] },
  { t: "I left my body around noon and I'm still looking for it.", tags: [] },
  { t: "I made eye contact with a raccoon and we understood each other.", tags: [] },
  { t: "I would do crimes for a sandwich right now.", tags: [] },
  { t: "I ate crackers over a sink and called it lunch.", tags: [] },
  { t: "my stomach sounds like a noise show at mardi spaghetti", tags: [] },
  { t: "I'm running on spite and half a granola bar.", tags: [] },
  { t: "I could eat a traffic cone.", tags: [] },
  { t: "I make condiment sandwiches now.", tags: ["condiments"] },
  { t: "I got to art openings for the crackers and grapes.", tags: [] },
  { t: "I've been skipping lunch to afford dinner.", tags: [] },
  { t: "I do cost-per-calorie math at the grocery store now.", tags: [] },
  { t: "nothing in the fridge again tonight.", tags: [] },
  { t: "my diet is very clean. there's nothing in it.", tags: [] },
  { t: "I eat before I grocery shop so I don't cry in the vitamin aisle.", tags: [] },
  { t: "These days I often pretend I already ate.", tags: [] },
  { t: "I haven't had a real meal in two days.", tags: [] },
  { t: "I work three jobs and I still can't make it work.", tags: ["wages"] },
  { t: "I paid $6 for tofu yesterday.", tags: [] },
  { t: "I stretch meals until they break.", tags: [] },
  { t: "I'm doing intermittent fasting, involuntarily.", tags: [] },
  { t: "my meal planning is a lot of planning and not a lot of meals.", tags: [] },
  { t: "I drink water to feel full. It sometimes works.", tags: [] },
  { t: "I scan prices like it's a horror game.", tags: [] },
  { t: "I can't even afford Segals anymore.", tags: [] },
  { t: "I walked out of the IGA without buying anything yesterday. again.", tags: [] },
  { t: "What's the point in even complaining? I'm just tired.", tags: [] },
  { t: "I bought the store brand of the store brand.", tags: [] },
  { t: "my fridge is just condiments now.", tags: ["condiments"] },
  { t: "Last night I biked to costco, snuck in, and ate samples for dinner.", tags: [] },
  { t: "I've been eating dollar store ramen for lunch all week.", tags: ["dollar-store"] },
  { t: "I split one meal into two days and call it meal prep.", tags: [] },
  { t: "I'm not picky anymore. picky is a luxury.", tags: [] },
  { t: "I ate dollar store crackers for dinner.", tags: ["dollar-store"] },
  { t: "I made soup for dinner. mostly water. called it broth.", tags: [] },
  { t: "I stood in front of the berries for a while. then I left.", tags: [] },
  { t: "I've been digging in my couch cushions for coins.", tags: [] },
  { t: "dinner was coffee. breakfast was also coffee.", tags: [] },
  { t: "I ate two dollar Chow Mein for dinner. sober.", tags: [] },
  { t: "I miss having leftovers.", tags: [] },
  { t: "I started a garden. out of desperation, mostly.", tags: [] },
  { t: "I've started finishing my kids' plates. as a treat.", tags: ["kids"] },
  { t: "I bought one avocado. as a treat.", tags: [] },
  { t: "I went to three stores to save $4.", tags: [] },
  { t: "I got to the checkout and had to put things back. so embarassing.", tags: [] },
  { t: "I make $18/hr and I'm choosing between transit and groceries.", tags: ["wages"] },
  { t: "I collected enough points for a free yogurt. one yogurt.", tags: ["points"] },
  { t: "my kids asked why we never go out for dinner anymore.", tags: ["kids"] },
  { t: "I went to the food bank for the first time last week.", tags: ["food-bank"] },
  { t: "I'm not bad with money. money is just bad.", tags: [] },
  { t: "I check flyers like it's a second job.", tags: [] },
  { t: "I have two jobs. still can't keep the fridge full.", tags: ["wages"] },
  { t: "my kids think cereal counts as a meal now.", tags: ["kids"] },
  { t: "the bin out back has more food in it than my fridge.", tags: ["dumpsters"] },
  { t: "there's sealed food in the grocery store dumpsters.", tags: ["dumpsters"] },
  { t: "I redeemed my points. got a yogurt. one yogurt.", tags: ["points"] },
  { t: "I used to go to the food bank as a last resort. now it's Tuesday.", tags: ["food-bank"] },
  { t: "bread was $3 two years ago. I remember buying it without thinking.", tags: ["bread"] },
  { t: "I made $400 this week. rent is $900. dinner is whatever's left.", tags: ["wages"] },
  { t: "I used to have a grocery budget. now I have a grocery ceiling.", tags: [] },
  { t: "I put the oat milk back. twice.", tags: [] },
  { t: "I've started calculating price-per-bite.", tags: [] },
  { t: "I found a dollar in my coat. felt rich for a second.", tags: [] },
  { t: "I went for oat milk. oat milk was $6. I went home.", tags: [] },
  { t: "I went to PA for cheap potatoes today.", tags: [] },
  { t: "I am just trying to survive.", tags: [] },
  { t: "Hochelaga doesn't have a PA. we have a Metro and a prayer.", tags: [] },
]);

// ─────────────────────────────────────────
// ANGRY PITCH (player line)
// RULE: systemic, named villains, no personal hunger as main register
// ─────────────────────────────────────────

const DECK_ANGRY_PITCH = new DM.Deck([
  { t: "same bag. less food. same price.", tags: ["shrinkflation"] },
  { t: "and Loblaws fixed the price of bread for fourteen years.", tags: ["price-fixing", "bread"] },
  { t: "and their fine for price-fixing was $500k. they made that back before lunch.", tags: ["price-fixing", "stat-36b"] },
  { t: "fourteen years of fixed prices. the fine was a rounding error.", tags: ["price-fixing"] },
  { t: "the bread cartel ran longer than most governments. same impunity.", tags: ["price-fixing", "bread"] },
  { t: "five hearings. one report. bread is still six dollars.", tags: ["bread", "price-fixing"] },
  { t: "$18 billion in savings we never got. that's the actual number.", tags: ["stat-18b", "bread", "price-fixing"] },
  { t: "Galen Weston testified before parliament. got a raise the same quarter.", tags: ["weston", "ceo-pay"] },
  { t: "the CEO apologized to parliament. bread is still six dollars.", tags: ["weston", "bread"] },
  { t: "the CEO took home $8 million. the cashier took home $32k. same store.", tags: ["weston", "wages", "ceo-pay"] },
  { t: "Weston's fine for price-fixing was less than his wine budget. probably.", tags: ["weston", "price-fixing"] },
  { t: "Galen's bonus could feed this block for a decade.", tags: ["weston", "ceo-pay"] },
  { t: "empire, metro, loblaws — one cartel, three logos.", tags: ["three-co", "cartel"] },
  { t: "three companies run your food supply. they call that a market.", tags: ["three-co", "cartel"] },
  { t: "oligopoly is just monopoly with better branding.", tags: ["three-co", "cartel"] },
  { t: "no-name brand is still Loblaws.", tags: ["three-co"] },
  { t: "they bought all the competition. then told us competition keeps prices honest.", tags: ["three-co", "cartel"] },
  { t: "free market. captive customers.", tags: ["cartel"] },
  { t: "$3.6 billion profit. bread is six dollars.", tags: ["stat-36b", "bread"] },
  { t: "47% markup. the flyer makes it feel like a deal.", tags: ["stat-47"] },
  { t: "prices up 27% since 2020. wages didn't get the memo.", tags: ["wages"] },
  { t: "a third of Canadians are skipping meals. the quarterly report looks great.", tags: [] },
  { t: "food banks have waiting lists now. waiting lists.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them.", tags: ["food-bank"] },
  { t: "record profits, record food bank lines. funny coincidence.", tags: ["food-bank", "stat-36b"] },
  { t: "the food bank used to be a last resort. now it's a calendar event.", tags: ["food-bank"] },
  { t: "they lock the dumpsters. it's not about the food. it's about the principle.", tags: ["dumpsters"] },
  { t: "dumpster diving is illegal. throwing food away is just business.", tags: ["dumpsters"] },
  { t: "they'd rather pay to destroy it than let someone eat it for free.", tags: ["dumpsters", "wasted-food"] },
  { t: "dynamic pricing is gouging with an algorithm.", tags: ["dynamic-pricing"] },
  { t: "the algorithm knows when you're desperate. charges accordingly.", tags: ["dynamic-pricing"] },
  { t: "Loblaws tested dynamic pricing on groceries. on groceries.", tags: ["dynamic-pricing"] },
  { t: "shrinkflation: same price, less product, same logo.", tags: ["shrinkflation"] },
  { t: "shareholders got a dividend. we got a smaller bag of chips.", tags: ["shrinkflation"] },
  { t: "parliament held five hearings. nobody was charged.", tags: ["price-fixing"] },
  { t: "the government asked nicely. the price went up anyway. twice.", tags: [] },
  { t: "they announced a price freeze. twelve items. three months.", tags: [] },
  { t: "the system isn't broken. it's working exactly as designed.", tags: [] },
  { t: "the hunger is real. the scarcity is manufactured.", tags: [] },
  { t: "it's not a coincidence. it's a business model.", tags: [] },
  { t: "the invisible hand has been in our pockets this whole time.", tags: ["invisible-hand"] },
  { t: "Robin Hood had the right idea. just saying.", tags: ["robin-hood"] },
  { t: "Robin Hood is a folk hero because the math was obvious.", tags: ["robin-hood"] },
  { t: "the April boycott lasted a month. prices didn't move a cent.", tags: ["boycott"] },
  { t: "a month of boycott. Loblaws posted record profits the same quarter.", tags: ["boycott", "stat-36b"] },
  { t: "Loblaws owns Shoppers Drug Mart. your pharmacist works for Galen.", tags: ["weston", "three-co"] },
  { t: "they own the grocery store and the pharmacy. soup to pills, one family.", tags: ["three-co", "weston"] },
  { t: "Joe Fresh is Loblaws. the discount jeans are also Galen's.", tags: ["weston", "three-co"] },
  { t: "there are two Galen Westons. both doing fine.", tags: ["weston"] },
  { t: "the Competition Bureau found significant concentration. recommended a study.", tags: ["audit", "three-co"] },
  { t: "they closed stores in low-income neighbourhoods. margin too thin.", tags: ["three-co"] },
  { t: "Hochelaga lost its store. Westmount got a renovation.", tags: ["three-co"] },
  { t: "the boycott was trending. Loblaws was profitable. both things happened.", tags: ["boycott"] },
  { t: "the government bailed out the supply chain. Loblaws pocketed the margin.", tags: ["bailout"] },
  { t: "the audit found nothing. the auditors bill them $400/hr.", tags: ["audit"] },
  { t: "the CEO's bonus is clawed back if he loses market share. not if we go hungry.", tags: ["ceo-pay"] },
  { t: "insurance covers their losses. nothing covers ours.", tags: ["insurance"] },
  { t: "shrinkflation is legal. hunger is the consequence.", tags: ["shrinkflation"] },
  { t: "a castle? and the fine they paid for price-fixing was $500k!", tags: ["weston", "price-fixing"], follows: "weston" },
  { t: "fourteen years. $500k fine. bread is still six dollars.", tags: ["price-fixing", "bread"], follows: "price-fixing" },
  { t: "nothing. the fine was a rounding error and bread is still six dollars.", tags: ["price-fixing", "bread"], follows: "bread" },
  { t: "waiting lists — while Loblaws posts record profits.", tags: ["food-bank", "stat-36b"], follows: "food-bank" },
  { t: "locked bins — they'd rather destroy food than give it away.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "one cartel, three logos — they call it a market.", tags: ["three-co"], follows: "three-co" },
  { t: "gouging with an algorithm — they automated the theft.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "smaller bag, same price — shareholders got the difference.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "Robin Hood didn't wait for the market to correct itself.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "the invisible hand has been picking our pockets the whole time.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "record profits, record food bank lines — they call it a supply chain issue.", tags: ["food-bank", "stat-36b"], follows: "stat-36b" },
  { t: "$15/hr to ring through $3.6 billion in groceries. the math is right there.", tags: ["stat-36b", "wages"], follows: "stat-36b" },
  { t: "47% markup — the flyer is theatre.", tags: ["stat-47"], follows: "stat-47" },
  { t: "essential worker pay hasn't kept up with essential worker groceries.", tags: ["wages"], follows: "wages" },
  { t: "a billion dollars of food wasted — and the bins are locked.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "PC Optimum points are a refund they owe you, repackaged as a gift.", tags: ["points"], follows: "points" },
  { t: "the audit cleared them. same year they fixed prices.", tags: ["audit"], follows: "audit" },
  { t: "the CEO's bonus is tied to margins. margins go up when we eat less.", tags: ["ceo-pay"], follows: "ceo-pay" },
  { t: "their losses are insured. ours aren't.", tags: ["insurance"], follows: "insurance" },
  { t: "they got a subsidy. we got a coupon.", tags: ["bailout"], follows: "bailout" },
  { t: "one month of boycott. nothing. the algorithm just waited us out.", tags: ["boycott", "dynamic-pricing"], follows: "boycott" },
  { t: "locked bins and a castle. thanks Galen!", tags: ["weston"], follows: "dumpsters" },
  { t: "no wage competition either — same three companies, same floor, same ceiling.", tags: ["three-co", "cartel"], follows: "wages" },
  { t: "they gave us points while kids skipped meals. that's the whole trade.", tags: ["points"], follows: "kids" },
  { t: "$500k fine. Galen made that back before his morning meeting.", tags: ["weston", "price-fixing"], follows: "price-fixing" },
  { t: "bread cartel, food cartel — same three names, different packaging.", tags: ["three-co", "price-fixing"], follows: "bread" },
  { t: "points shrink too. same spend, less reward — both ends, same direction.", tags: ["shrinkflation", "points"], follows: "points" },
  { t: "food bank waiting lists — and a billion in locked dumpsters.", tags: ["wasted-food", "dumpsters"], follows: "food-bank" },
  { t: "shrinkflation hits wages too. less value, same label.", tags: ["wages"], follows: "shrinkflation" },
  { t: "clean audit. record profits. the CEO got a raise.", tags: ["ceo-pay"], follows: "audit" },
  { t: "subsidized supply chain. $3.6 billion in private profit.", tags: ["stat-36b"], follows: "bailout" },
  {
    t: "they survived the boycott and posted record profits. they know we have nowhere else to go.",
    tags: ["stat-36b", "three-co"],
    follows: "boycott",
  },
  { t: "one family owns grocery, pharmacy, fashion. it's too much.", tags: ["three-co"], follows: "weston" },
  {
    t: "the Competition Bureau found concentration and recommended a task force. bread is still six dollars.",
    tags: ["audit", "bread"],
    follows: "three-co",
  },
]);

const DECK_HUNGRY_PITCH = new DM.Deck([
  { t: "nobody should go to bed hungry.", tags: [] },
  { t: "the shelves are full. our fridges aren't.", tags: [] },
  { t: "there's a store full of food thirty feet away.", tags: [] },
  { t: "one of us is eating tonight. I vote us.", tags: [] },
  { t: "the food exists. someone just decided it wasn't ours.", tags: [] },
  { t: "when did feeding your family become a luxury?", tags: [] },
  { t: "nobody should have to choose between rent and dinner.", tags: [] },
  { t: "somebody's eating well tonight. it's not us.", tags: [] },
  { t: "what if tonight, everyone on this block just ate?", tags: [] },
  { t: "hunger isn't a personal failure.", tags: [] },
  { t: "the food is right there. I can see it from here.", tags: [] },
  { t: "a full stomach shouldn't be a privilege.", tags: [] },
  { t: "I'm not asking for a feast. I'm asking for dinner.", tags: [] },
  { t: "I'm not political. I'm just hungry.", tags: [] },
  { t: "you eat today? me neither. so.", tags: [] },
  { t: "I'm not asking anyone to do anything they haven't already thought about.", tags: [] },
  { t: "we're not stealing. we're correcting an allocation problem.", tags: [] },
  { t: "food is right there. hunger is right here. I can't stop thinking about that.", tags: [] },
  { t: "I'm not proud. I'm hungry. those are different things.", tags: [] },
  { t: "eating isn't a radical act. it really shouldn't be.", tags: [] },
  { t: "there's no reason to be hungry on a street with a grocery store.", tags: [] },
  { t: "this isn't about politics. it's about whether my family eats tonight.", tags: [] },
  { t: "three families on this block skipped dinner tonight. that store didn't.", tags: [] },
  { t: "the store planned for shrinkage. we're delivering it.", tags: [] },
  { t: "bread is six dollars. six.", tags: ["bread"] },
  { t: "your kids shouldn't have to learn to ignore hunger.", tags: ["kids"] },
  { t: "the dumpster out back has more food in it than my fridge.", tags: ["dumpsters"] },
  { t: "bread is six dollars and the bin behind the store is full of it.", tags: ["bread", "dumpsters"] },
  { t: "they throw it out at midnight. we could be there at midnight.", tags: ["dumpsters", "wasted-food"] },
  { t: "my kids are hungry. that's the whole argument.", tags: ["kids"] },
  { t: "I looked in that dumpster. there's sealed food in there.", tags: ["dumpsters"] },
  { t: "it expires at midnight. after that it's a philosophical question.", tags: ["dumpsters", "wasted-food"] },
  { t: "my daughter had crackers for dinner. the store had a full aisle.", tags: ["kids"] },
  { t: "you shouldn't need a loyalty card to eat.", tags: ["points"] },
  { t: "they mark it to zero and lock it up. that's not business. that's spite.", tags: ["dumpsters"] },
  { t: "I've been doing the math on what's in that bin every night for a month.", tags: ["dumpsters"] },
  { t: "that food was going to be thrown out anyway. we're adjusting the timeline.", tags: ["dumpsters", "wasted-food"] },
  { t: "there are kids on this street who went to bed hungry last night.", tags: ["kids"] },
  { t: "bread used to be $3. I remember buying it without thinking about it.", tags: ["bread"] },
  { t: "the food bank has a waiting list now.", tags: ["food-bank"] },
  { t: "I watched them throw out a whole cart last week. locked bin.", tags: ["dumpsters", "wasted-food"] },
  { t: "the bin is locked. the food behind it is sealed. think about that pairing.", tags: ["dumpsters"] },
  { t: "more food goes in that bin every night than this block eats in a week.", tags: ["wasted-food", "dumpsters"] },
  { t: "they'd rather it rot than let us have it. think about that.", tags: ["dumpsters", "wasted-food"] },
  { t: "a points card is not dinner.", tags: ["points"] },
  { t: "somebody made billions off this store. we made do. tonight we don't.", tags: [] },
  { t: "I'm not asking for a revolution. I'm asking for groceries.", tags: [] },
  { t: "this is the most reasonable thing I've said all week.", tags: [] },
  { t: "the store closes at 10. we don't have to.", tags: ["dumpsters"] },
  { t: "the bin is public property once it's on the curb. I read that somewhere.", tags: ["dumpsters"] },
  { t: "PA is forty minutes away and still expensive. so.", tags: [] },
  { t: "Jean-Talon has beautiful produce. I stood there. then I left.", tags: [] },
  { t: "three blocks from a Metro and I still can't afford it.", tags: [] },
  { t: "Hochelaga doesn't have a PA. we have what we have.", tags: [] },
  { t: "your kids are watching you put things back at checkout. not tonight.", tags: ["kids"], follows: "kids" },
  { t: "three jobs and still choosing between rent and food.", tags: ["wages"], follows: "wages" },
  { t: "more goes in that bin every night than we'd ever need.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "a points card is how they make you feel grateful for a partial refund.", tags: ["points"], follows: "points" },
  { t: "bread was $3. now it's $6. that gap is somebody's salary.", tags: ["bread"], follows: "bread" },
  { t: "the food bank waiting list just keeps getting longer.", tags: ["food-bank"], follows: "food-bank" },
  { t: "the bin is right there. sealed food. I check it every night.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "smaller bag, same price — my kids still need to eat the same amount.", tags: ["kids"], follows: "kids" },
  { t: "Robin Hood fed people. that's all this is.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "wages went up $2. groceries went up $400. the bin didn't go up at all.", tags: ["dumpsters", "wages"], follows: "wages" },
  { t: "sealed food in there right now. I know because I check.", tags: ["dumpsters"], follows: "wasted-food" },
  { t: "the bin doesn't have a waiting list.", tags: ["dumpsters", "food-bank"], follows: "food-bank" },
  { t: "points. while my kids skip meals. one yogurt.", tags: ["points", "kids"], follows: "kids" },
]);

// ─────────────────────────────────────────
// SAY MORE — WARM (NPC, matched energy, wants more)
// short, curious, open. Tagged follows echo the topic.
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
  { t: "finish that thought.", tags: [] },
  { t: "that's not nothing.", tags: [] },
  { t: "okay. I'm still here.", tags: [] },
  { t: "you said what now?", tags: [] },

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
  { t: "the audit?", tags: ["audit"], follows: "audit" },
  { t: "the CEO pay thing — go on.", tags: ["ceo-pay"], follows: "ceo-pay" },
  { t: "a bailout?", tags: ["bailout"], follows: "bailout" },
  { t: "insurance covers their losses?", tags: ["insurance"], follows: "insurance" },
  { t: "the boycott didn't work?", tags: ["boycott"], follows: "boycott" },
  { t: "Shoppers too?", tags: ["three-co", "weston"], follows: "shoppers" },

  // cross-tag follows — bridges
  { t: "and Galen just... what, apologized?", tags: ["weston"], follows: "price-fixing" },
  { t: "how much food are we actually talking?", tags: ["wasted-food"], follows: "dumpsters" },
  { t: "the bin has actual sealed food in it?", tags: ["dumpsters"], follows: "wasted-food" },
  { t: "and nobody's in jail for any of this?", tags: ["price-fixing"], follows: "weston" },
  { t: "wait, which three companies?", tags: ["three-co"], follows: "cartel" },
  { t: "so their profits just keep going up?", tags: ["stat-36b"], follows: "food-bank" },
  { t: "the points card is the whole deal, isn't it.", tags: ["points"], follows: "three-co" },
  // NEW cross-tag bridges
  { t: "and the audit just cleared them?", tags: ["audit"], follows: "ceo-pay" },
  { t: "the government subsidized them?", tags: ["bailout"], follows: "three-co" },
  { t: "so insurance covers what they waste?", tags: ["insurance"], follows: "dumpsters" },
  { t: "they get a subsidy and we get a points card?", tags: ["bailout", "points"], follows: "bailout" },
]);

const D_SAY_MORE_SKEPTICAL = new DM.Deck([
  { t: "elaborate please sir?", tags: [] },
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


const DECK_STRONGER_PITCH = new DM.Deck([
  // bread / price-fixing
  { t: "they fixed bread prices for fourteen years. we're taking some bread.", tags: ["bread", "price-fixing"] },
  { t: "the law said it was wrong. they paid a rounding error and kept going.", tags: ["price-fixing"] },
  { t: "bread was $3. now it's $6. that difference is someone's bonus.", tags: ["bread"] },
  { t: "we wrote the letters. signed the petitions. bread is still six dollars.", tags: ["bread"] },
  { t: "they budgeted for the fine. we budgeted for tonight.", tags: ["price-fixing"] },

  // weston / ceo-pay
  { t: "Galen Weston owns a castle. he will not notice.", tags: ["weston"] },
  { t: "the CEO got a raise this quarter. the least we can do is get dinner.", tags: ["weston", "ceo-pay"] },
  { t: "the CEO took home $8 million. we're taking groceries. I think the math works.", tags: ["weston", "ceo-pay"] },

  // three-co
  { t: "three men control your dinner. tonight we redistribute a little.", tags: ["three-co"] },
  { t: "empire, metro, loblaws — between them they'll survive one bad night.", tags: ["three-co"] },
  { t: "Loblaws controls a third of Canadian groceries. they can spare some.", tags: ["three-co"] },
  { t: "no-name is still Loblaws. the savings were always theirs. tonight we take some back.", tags: ["three-co"] },

  // stats
  { t: "they cleared $3.6 billion. we're taking some bread.", tags: ["stat-36b", "bread"] },
  { t: "Loblaws made $3.6 billion last year. they can absorb a lasagna.", tags: ["stat-36b"] },
  { t: "47% markup. we're taking some of it back.", tags: ["stat-47"] },
  { t: "prices up 27% since 2020. consider this a partial refund.", tags: [] },

  // food bank
  { t: "the food bank has a waiting list. we're done being patient.", tags: ["food-bank"] },
  { t: "Loblaws donates to food banks. they also cause them. tonight we skip the middleman.", tags: ["food-bank"] },
  { t: "food bank usage up 40%. profit up too. tonight we correct one of those numbers.", tags: ["food-bank"] },

  // dumpsters
  { t: "they locked the dumpsters. they didn't lock the front door.", tags: ["dumpsters"] },
  { t: "there's sealed food in that bin. we're just finishing the sentence.", tags: ["dumpsters"] },
  { t: "Loblaws wasted a billion dollars of food. tonight we correct the waste.", tags: ["wasted-food", "dumpsters"] },

  // shrinkflation / points
  { t: "same price, less food, same logo. we're done.", tags: ["shrinkflation"] },
  { t: "a loyalty card is a refund they owe you. we're skipping the card.", tags: ["points"] },

  // system
  { t: "the shelves are insured. our hunger isn't.", tags: [] },
  { t: "their losses are tax deductible. our hunger isn't.", tags: [] },
  { t: "the store is insured, incorporated, and subsidized. we are none of those things.", tags: ["insurance", "bailout"] },
  { t: "they were never going to fix it. so.", tags: [] },
  { t: "we've been polite about it for years. polite doesn't feed anyone.", tags: [] },
  { t: "asking nicely had its moment. this is the next moment.", tags: [] },

  // robin-hood
  { t: "Robin Hood wasn't a criminal. he was just early.", tags: ["robin-hood"] },
  { t: "we're robins. not robbers.", tags: ["robin-hood"] },

  // NEW: bailout / insurance / ceo-pay
  { t: "their losses go on the insurance claim. ours go on the kids.", tags: ["insurance"] },
  { t: "the bailout covered their margins. nothing covered ours.", tags: ["bailout"] },
  { t: "the CEO's bonus survives this. we're the ones who can't.", tags: ["ceo-pay"] },
  { t: "insured, subsidized, and protected. we are literally none of those things.", tags: ["insurance", "bailout"] },

  // NEW: boycott / shoppers / montreal
  { t: "we boycotted for a month. they noticed nothing. tonight they notice us.", tags: ["boycott"] },
  { t: "the boycott didn't move prices. this might.", tags: ["boycott"] },
  { t: "they own the grocery store and the pharmacy. might as well own the night.", tags: ["three-co", "weston"] },
  { t: "Galen Jr. has a castle too, presumably. they can spare a lasagna.", tags: ["weston"] },
  { t: "the Competition Bureau recommended a task force. we're the task force.", tags: ["audit"] },
  { t: "Hochelaga lost its store. we still live here.", tags: ["three-co"] },

  // closers
  { t: "one store, one night, the whole block eats.", tags: [] },
  { t: "we go in, we take what our families need, we leave.", tags: [] },
  { t: "tonight we eat. all of us.", tags: [] },
  { t: "the food exists. it's just not ours yet.", tags: [] },
  { t: "this is civil disobedience with snacks.", tags: [] },
  { t: "I'm not asking you to storm the barricades. I'm asking you to eat.", tags: [] },
  { t: "everybody eats or nobody does. I say everybody.", tags: [] },
  { t: "it's not theft if they stole it first.", tags: [] },
  { t: "we're not stealing. we're correcting a very long-running error.", tags: [] },
  // NEW closers
  { t: "one night. one store. the math is not complicated.", tags: [] },
  { t: "we're not making a statement. we're making dinner.", tags: [] },
  { t: "I've thought about this longer than it sounds like.", tags: [] },

  // ── follows: same-tag ──────────────────────────────────────────────────────
  { t: "a person in a castle won't notice a little spillage.", tags: ["weston"], follows: "weston" },
  { t: "fourteen years, $500k fine — they budgeted for getting caught. so did we.", tags: ["price-fixing", "bread"], follows: "price-fixing" },
  { t: "bread is six dollars and the bin is full of it.", tags: ["bread", "dumpsters"], follows: "bread" },
  { t: "the waiting list ends tonight. for us at least.", tags: ["food-bank"], follows: "food-bank" },
  { t: "they locked the bins. they didn't lock the front door.", tags: ["dumpsters"], follows: "dumpsters" },
  { t: "three companies. one bad night. they split the loss three ways.", tags: ["three-co"], follows: "three-co" },
  { t: "they tried dynamic pricing. we tried a boycott. tonight we try something else.", tags: ["dynamic-pricing"], follows: "dynamic-pricing" },
  { t: "same bag, less food — tonight we take the difference back.", tags: ["shrinkflation"], follows: "shrinkflation" },
  { t: "Robin Hood was just someone who did the math and acted on it.", tags: ["robin-hood"], follows: "robin-hood" },
  { t: "$3.6 billion. they can absorb one bad night. we cannot absorb one more.", tags: ["stat-36b"], follows: "stat-36b" },
  { t: "47% markup means they've been taking from us for years. tonight we take some back.", tags: ["stat-47"], follows: "stat-47" },
  { t: "$15/hr doesn't cover dinner anymore.", tags: ["wages"], follows: "wages" },
  { t: "a billion dollars of food wasted — we're correcting the math.", tags: ["wasted-food", "dumpsters"], follows: "wasted-food" },
  { t: "loyalty points expire. hunger doesn't.", tags: ["points"], follows: "points" },
  { t: "the invisible hand has been in our pockets for years. tonight we reach back.", tags: ["invisible-hand"], follows: "invisible-hand" },
  { t: "clean audit. record profits. the CEO got a raise. so do we.", tags: ["ceo-pay", "audit"], follows: "ceo-pay" },
  { t: "the bailout covered their losses. nothing covered ours.", tags: ["bailout"], follows: "bailout" },
  { t: "insured against loss. we're not. that's the whole imbalance.", tags: ["insurance"], follows: "insurance" },
  { t: "they waited out the boycott. they won't wait out a missing lasagna.", tags: ["boycott"], follows: "boycott" },
  { t: "the task force is us. tonight.", tags: ["audit"], follows: "audit" },

  // ── follows: cross-tag ─────────────────────────────────────────────────────
  // stat-36b → weston: profit lands on one person
  { t: "Loblaws made $3.6 billion. Galen won't notice a lasagna.", tags: ["weston", "stat-36b"], follows: "stat-36b" },
  // price-fixing → dumpsters: fine and the bin are the same logic
  { t: "the fine was a rounding error. the food in that bin is not.", tags: ["dumpsters", "price-fixing"], follows: "price-fixing" },
  // cartel → three-co: they split the loss
  { t: "three companies. one bad night. they split the loss three ways.", tags: ["three-co"], follows: "cartel" },
  // food-bank → dumpsters: one of these we fix tonight
  { t: "the food bank is full. the bin is full. one of those we fix tonight.", tags: ["dumpsters", "food-bank"], follows: "food-bank" },
  // bailout → insurance: both sides of the same protection
  { t: "subsidized supply chain. insured losses. none of that is ours.", tags: ["insurance"], follows: "bailout" },
  // boycott → dynamic-pricing: they algorithmed through it
  { t: "they priced through the boycott. the algorithm doesn't care about solidarity.", tags: ["dynamic-pricing", "boycott"], follows: "boycott" },
  // weston → three-co: the full empire
  { t: "grocery, pharmacy, fashion — one family. they can absorb one bad night.", tags: ["three-co"], follows: "weston" },
  // audit → three-co: the Bureau shrugged
  { t: "the Competition Bureau shrugged. we don't have to.", tags: ["three-co"], follows: "audit" },
]);

// this is where I stopped 


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
  { t: "you've made worse decisions for less.", tags: [] },
  { t: "I think you already know what you want to say.", tags: [] },
  { t: "no pressure. some pressure?", tags: [] },
  { t: "the store's not going to rob itself.", tags: [] },
  { t: "how do you feel about a little food redistribution — tonight?", tags: [] },
  { t: "you interested?", tags: [] },
  { t: "we're done asking nicely. are you?", tags: [] },
  { t: "tonight we eat. want to join us?", tags: [] },
  { t: "just say the word.", tags: [] },
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
  { join: "what's the worst that could happen?", consent: "let's do this!" },
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
  { join: "I don't know...ok, yes!", consent: "allons-y" },
  { join: "I thought someone braver than me would go", consent: "but I'm ready." },
  { join: "it's this or watching tv", consent: "allons-y!" },
  { join: "I bought crackers for dinner. I'm in.", consent: "let's go" },
  { join: "I was going to write a strongly worded letter.", consent: "count me in!" },
  { join: "it's time.", consent: "I'm in" },
  { join: "honestly I've been this close for months", consent: "okay. yes. let's." },
  { join: "every week I budget. every week it doesn't work.", consent: "count me in." },
  { join: "why not?", consent: "let's do this." },
  { join: "the boycott did nothing.", consent: "this might do something. I'm in." },
  { join: "enough.", consent: "câline. let's go." },
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
  { t: "yo get a job!", tags: [] },
  { t: "this is a Metro, not a manifesto", tags: [] },
  { t: "that's THEFT!", tags: [] },
  { t: "sir this is a grocery store", tags: [] },
  { t: "this is NOT how change happens!", tags: [] },
  { t: "the market will fix this naturally!", tags: [] },
  { t: "this is why we need more police", tags: [] },
  { t: "you're RUINING the neighbourhood!", tags: [] },
  { t: "markets are UP today!", tags: [] },
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


const D_ACK_HUNGRY_ANGRY = ["exactly,", "right?"];
const D_ACK_NARC = ["well, ", "you know, ", "honestly, ", "I mean, "];

// ─────────────────────────────────────────
// DECK INSTANTIATION (unchanged)
// ─────────────────────────────────────────

const DECK_GREET = new DM.Deck(P_GREET);
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
