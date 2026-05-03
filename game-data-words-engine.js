

const DM = (() => {

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
    pop() {
      if (!this.pile.length) this._fill();
      return this.pile.pop();
    }
    take(i) {
      return this.pile.splice(i, 1)[0];
    }
  }

  // ─────────────────────────────────────────
  // Item helpers
  // ─────────────────────────────────────────

  const isPair  = (x) => x && typeof x === "object" && "join" in x && "consent" in x;
  const isTagged = (d) => d.src.length > 0 && typeof d.src[0] !== "string" && !isPair(d.src[0]);
  const tagsOf  = (x) => x?.tags ?? [];
  const textOf  = (x) => (typeof x === "string" ? x : x.t);

  // ─────────────────────────────────────────
  // State — just the last drawn tags
  // ─────────────────────────────────────────

  let lastTags = [];

  function clearLastTags() {
    lastTags = [];
  }

  // ─────────────────────────────────────────
  // Core draw
  //
  // draw(deck, matchTags?)
  //   → finds all items whose tags overlap with matchTags
  //   → picks randomly among matches
  //   → if no matches (or no matchTags), picks randomly from full deck
  //   → records drawn item's tags as lastTags
  //   → returns text string, or pair object for const isTagged = (d) => d.src.length > 0 && typeof d.src[0] !== "string" && (!isPair(d.src[0]) || (d.src[0].tags?.length > 0));
  // ─────────────────────────────────────────

  function draw(deck, matchTags = []) {
    if (!deck.pile.length) deck._fill();

    // Untagged / pair decks — just pop
    if (!isTagged(deck)) {
      const item = deck.pop();
      return isPair(item) ? item : textOf(item);
    }

    let pool = [];

    if (matchTags.length > 0) {
      // find all items that share at least one tag with matchTags
      pool = deck.pile
        .map((x, i) => ({ x, i }))
        .filter(({ x }) => tagsOf(x).some(t => matchTags.includes(t)));
    }

    // no matches → use full pile
    if (pool.length === 0) {
      pool = deck.pile.map((x, i) => ({ x, i }));
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const item = deck.take(pick.i);
    lastTags = tagsOf(item);
    return isPair(item) ? item : textOf(item);
  }

  // ─────────────────────────────────────────
  // drawWithTags — like draw, but returns { text, tags }
  // Use this when the caller needs the tags to feed the next beat.
  // For DECK_GREET, also returns tone (first tag) for HELLO_PREFIX.
  // ─────────────────────────────────────────

  function drawWithTags(deck, matchTags = []) {
    if (!deck.pile.length) deck._fill();

    if (!isTagged(deck)) {
      const item = deck.pop();
      const tags = tagsOf(item);
      lastTags = tags;
      return { text: isPair(item) ? item : textOf(item), tags, tone: tags[0] ?? null };
    }

    let pool = [];

    if (matchTags.length > 0) {
      pool = deck.pile
        .map((x, i) => ({ x, i }))
        .filter(({ x }) => tagsOf(x).some(t => matchTags.includes(t)));
    }

    if (pool.length === 0) {
      pool = deck.pile.map((x, i) => ({ x, i }));
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const item = deck.take(pick.i);
    const tags = tagsOf(item);
    lastTags = tags;
    return { text: textOf(item), tags, tone: tags[0] ?? null };
  }



function drawChained(deck) {
  const result = draw(deck, lastTags);
  // lastTags is already updated inside draw() for tagged decks
  // For untagged decks, clear so next draw doesn't carry stale tags
  if (!isTagged(deck)) lastTags = [];
  return result;
}

  // ─────────────────────────────────────────
  // getLastTags — read lastTags without drawing
  // ─────────────────────────────────────────

  function getLastTags() {
    return [...lastTags];
  }

  // ─────────────────────────────────────────
  // Conversation lifecycle
  // ─────────────────────────────────────────

  function startConv() {
    lastTags = [];
  }

  function endConv() {
    lastTags = [];
  }

  // ─────────────────────────────────────────
  // Debug
  // ─────────────────────────────────────────

  function _debugLastTags() { return [...lastTags]; }

  return {
    Deck,
    draw,
    drawWithTags,
        drawChained,

    getLastTags,
    clearLastTags,
    startConv,
    endConv,
    _debugLastTags,
  };

})();