// ═══════════════════════════════════════════════════════════════════════
// DM — Dialogue Manager
//
// TAG VOCABULARY — three kinds, three jobs:
//
//   TOPIC_TAGS   — subjects the game actively manages via cooldown.
//                  If a conversation is "about" bread, bread cools down
//                  and won't lead another conversation for COOLDOWN turns.
//                  Declare new topics here intentionally.
//
//   ROUTING_TAGS — tone/presentation tags (casual, concerned, direct).
//                  Used only for HELLO_PREFIX selection. Invisible to
//                  both coolmap and follows scoring.
//
//   link tags    — everything else. Not declared anywhere. They exist
//                  only to wire one line to the next via `follows`.
//                  The coolmap never touches them. Add as many as you
//                  want without registering them anywhere.
//
// FLOW PER CONVERSATION:
//   greet  → sets tone (routing tag) → ignored by coolmap + follows
//   hello  → sets lastDrawnTags → topic tags enter coolmap
//   pitch  → follows lastDrawnTags → sets lastDrawnTags
//   warm   → follows lastDrawnTags → sets lastDrawnTags
//   strong → follows lastDrawnTags → done
//   endConv → ages coolmap (topic tags only)
// ═══════════════════════════════════════════════════════════════════════

const DM = (() => {

  // ─────────────────────────────────────────
  // TAG LISTS
  // ─────────────────────────────────────────

  // TOPIC_TAGS: the subjects the cooldown system manages.
  // Add a tag here when you want the game to actively rotate away from it.
  // Everything not in this list is a link tag — wires beats together,
  // never touches the coolmap.
  const TOPIC_TAGS = new Set([
    // named subjects — rotate these aggressively
    "ghosts",
    // "bread",
    // "weston",
    // "price-fixing",
    // "dumpsters",
    // "wasted-food",   
    // "food-bank",
    // "three-co",
    // "cartel",
    // "dynamic-pricing",
    // "shrinkflation",
    // "robin-hood",
    // "boycott",
    // "points",
    // "wages",
    // "ceo-pay",
    // "audit",
    // "bailout",
    // "stat-36b",
    // "stat-47",
    // "stat-18b",
    // "stat-61b",
    // "stat-100b",
  ]);

  // ROUTING_TAGS: tone tags on the greet deck.
  // Used only for HELLO_PREFIX selection. Excluded from coolmap
  // and follows scoring entirely.
  const ROUTING_TAGS = new Set(["casual", "concerned", "direct"]);

  // COOLDOWN: conversations before a topic tag can lead again.
  // 3 = used in conv 1, won't lead until conv 4.
  const COOLDOWN = 3;

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  // Topic tags that have fired in the current conversation.
  // Used for within-conversation repeat suppression.
  let convTopicTags = new Set();

  // Cross-conversation: topic tag → conversations since last used.
  // Capped at COOLDOWN.
  const coolMap = new Map();

  // Tags of the most recently drawn item.
  // The follows system looks here. Updated on every draw.
  let lastDrawnTags = [];

  // ─────────────────────────────────────────
  // Deck
  // ─────────────────────────────────────────

  function shuffle(a) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

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

  // ─────────────────────────────────────────
  // Item helpers
  // ─────────────────────────────────────────

  const isPair   = (x) => x && typeof x === "object" && "join" in x && "consent" in x;
  const isTagged = (d) => d.src.length > 0 && typeof d.src[0] !== "string" && !isPair(d.src[0]);

  // tagsOf: returns all tags except routing tags.
  // These are the tags the scoring and follows system sees.
  const tagsOf    = (x) => (x?.tags ?? []).filter(t => !ROUTING_TAGS.has(t));

  // rawTagsOf: returns all tags including routing.
  // Used only to extract tone from the greet result.
  const rawTagsOf = (x) => x?.tags ?? [];

  const textOf    = (x) => (typeof x === "string" ? x : x.t);

  // ─────────────────────────────────────────
  // Scoring
  // ─────────────────────────────────────────

  // Has this topic appeared in a recent conversation?
  const isCooled = (tags) =>
    tags.some(t => TOPIC_TAGS.has(t) && coolMap.has(t) && coolMap.get(t) < COOLDOWN);

  // Has this topic already fired in the current conversation?
  const isConvClash = (tags) =>
    tags.some(t => TOPIC_TAGS.has(t) && convTopicTags.has(t));

  // Does this line share a non-routing tag with the last drawn line?
  const isBoostable = (tags) =>
    tags.some(t => lastDrawnTags.includes(t));

  function score(item, boost, follows) {
    const tags = tagsOf(item);

    // follows match: this line was written for this exact transition.
    // Score 4 so it always beats a boosted line (score 2).
    if (follows && item.follows && follows.includes(item.follows)) return 4;

    // Same topic already used in this conversation: suppress.
    if (isConvClash(tags)) return -2;

    // Topic cooled from a recent conversation: suppress.
    if (isCooled(tags)) return -1;

    // Shares a tag with the previous line: prefer.
    if (boost && isBoostable(tags)) return 2;

    // Untagged lines: neutral, always eligible.
    return 0;
  }

  // ─────────────────────────────────────────
  // Tag recording
  // ─────────────────────────────────────────

  function recordTags(tags) {
    lastDrawnTags = tags;
    for (const t of tags) {
      // Only topic tags enter the coolmap and convTopicTags.
      // Link tags update lastDrawnTags only.
      if (TOPIC_TAGS.has(t)) {
        convTopicTags.add(t);
        coolMap.set(t, 0);
      }
    }
  }

  // _seedConvTag: manually inject a tag into the conversation pool.
  // Used in TP 13 to tell the pitch what the hello established.
  function _seedConvTag(tag) {
    if (TOPIC_TAGS.has(tag)) convTopicTags.add(tag);
    // Always extend lastDrawnTags so follows can wire off it.
    if (!lastDrawnTags.includes(tag)) lastDrawnTags = [...lastDrawnTags, tag];
  }

  // ─────────────────────────────────────────
  // Follows injection
  // Injects ALL missing follows matches into the pile.
  // The scorer then picks the best one (score 4 wins).
  // ─────────────────────────────────────────

  function ensureFollowsInPile(deck, follows) {
    if (!follows || follows.length === 0) return;
    const alreadyInPile = new Set(
      deck.pile.filter(x => x.follows).map(x => x.follows)
    );
    const missing = deck.src.filter(
      x => x.follows && follows.includes(x.follows) && !alreadyInPile.has(x.follows)
    );
    for (const m of missing) {
      deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, m);
    }
  }

  // ─────────────────────────────────────────
  // Conversation lifecycle
  // ─────────────────────────────────────────

  // startConv: resets per-conversation topic tracking.
  // Does NOT clear lastDrawnTags — hello tags need to feed pitch boost.
  // Call ONCE per conversation at TP 0 only.
  function startConv() {
    convTopicTags = new Set();
    // lastDrawnTags intentionally preserved across this reset.
  }

  // endConv: ages the coolmap. Only topic tags are in the coolmap
  // so only topic tags age. Link tags are unaffected.
  function endConv() {
    for (const [t, v] of coolMap) {
      coolMap.set(t, Math.min(v + 1, COOLDOWN));
    }
    convTopicTags = new Set();
  }

  // ─────────────────────────────────────────
  // draw — main draw, records tags
  // ─────────────────────────────────────────

  function draw(deck, { boost = false, follows = null } = {}) {
    if (!deck.pile.length) deck._fill();

    // Untagged / pair decks: just pop, no scoring.
    if (!isTagged(deck)) {
      const item = deck.pop();
      return isPair(item) ? item : textOf(item);
    }

    ensureFollowsInPile(deck, follows);

    let bestIdx = 0, bestScore = -999;
    for (let i = 0; i < deck.pile.length; i++) {
      const s = score(deck.pile[i], boost, follows);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }

    const item = deck.take(bestIdx);
    recordTags(tagsOf(item));
    return isPair(item) ? item : textOf(item);
  }

  // ─────────────────────────────────────────
  // drawWithTags — draw + return tags to caller
  // Always returns { text, tags, tone }.
  // tone: the routing tag if present (for greet → HELLO_PREFIX).
  // ─────────────────────────────────────────

  function drawWithTags(deck, opts = {}) {
    if (!deck.pile.length) deck._fill();

    if (!isTagged(deck)) {
      const item = deck.pop();
      const raw = rawTagsOf(item);
      return {
        text: isPair(item) ? item : textOf(item),
        tags: raw.filter(t => !ROUTING_TAGS.has(t)),
        tone: raw.find(t => ROUTING_TAGS.has(t)) ?? null,
      };
    }

    ensureFollowsInPile(deck, opts.follows);

    let bestIdx = 0, bestScore = -999;
    for (let i = 0; i < deck.pile.length; i++) {
      const s = score(deck.pile[i], opts.boost ?? false, opts.follows ?? null);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }

    const item = deck.take(bestIdx);
    const tags = tagsOf(item);
    recordTags(tags);
    return {
      text: textOf(item),
      tags,
      tone: rawTagsOf(item).find(t => ROUTING_TAGS.has(t)) ?? null,
    };
  }

  // ─────────────────────────────────────────
  // drawNoRecord — draw without committing tags
  // For player choice preview. Tags don't enter coolmap or convTopicTags
  // until the player picks the line (caller seeds them via _seedConvTag).
  // Always returns { text, tags }.
  // ─────────────────────────────────────────

  function drawNoRecord(deck, opts = {}) {
    if (!deck.pile.length) deck._fill();

    if (!isTagged(deck)) {
      const item = deck.pop();
      return { text: isPair(item) ? item : textOf(item), tags: [] };
    }

    ensureFollowsInPile(deck, opts.follows);

    let bestIdx = 0, bestScore = -999;
    for (let i = 0; i < deck.pile.length; i++) {
      const s = score(deck.pile[i], opts.boost ?? false, opts.follows ?? null);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }

    const item = deck.take(bestIdx);
    // Update lastDrawnTags so follows can wire off this preview,
    // but do NOT record into convTopicTags or coolMap yet.
    lastDrawnTags = tagsOf(item);
    return { text: textOf(item), tags: tagsOf(item) };
  }

  // ─────────────────────────────────────────
  // drawForEmpty — for untagged hellos
  // When the hello had no tags, prefer pitch lines that are also untagged
  // (pure register). Stops the pitch inventing a topic from nowhere.
  // Falls back to normal scored draw if nothing untagged is available.
  // ─────────────────────────────────────────

  function drawForEmpty(deck) {
    if (!deck.pile.length) deck._fill();

    if (!isTagged(deck)) {
      const item = deck.pop();
      return { text: textOf(item), tags: [] };
    }

    const untagged = deck.pile
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => tagsOf(x).length === 0);

    if (untagged.length > 0) {
      const pick = untagged[Math.floor(Math.random() * untagged.length)];
      const item = deck.take(pick.i);
      recordTags(tagsOf(item));
      return { text: textOf(item), tags: [] };
    }

    // Nothing untagged available — fall back to normal draw.
    return drawWithTags(deck);
  }

  // ─────────────────────────────────────────
  // recentTopics — topic tags active in coolmap
  // Use for spawn-level suppression or debug.
  // ─────────────────────────────────────────

  function recentTopics() {
    const recent = new Set();
    for (const [t, age] of coolMap) {
      if (age < COOLDOWN) recent.add(t);
    }
    return recent;
  }

  // ─────────────────────────────────────────
  // Debug
  // ─────────────────────────────────────────

  function _debugConvTags()      { return convTopicTags; }
  function _debugLastDrawnTags() { return lastDrawnTags; }
  function _debugCoolMap()       { return new Map(coolMap); }

  return {
    Deck,
    draw,
    drawWithTags,
    drawNoRecord,
    drawForEmpty,
    recentTopics,
    _seedConvTag,
    startConv,
    endConv,
    _debugConvTags,
    _debugLastDrawnTags,
    _debugCoolMap,
      TOPIC_TAGS,
  };



})();
