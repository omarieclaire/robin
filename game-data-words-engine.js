

const DM = (() => {

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

  const isTagged = (d) => d.src.length > 0 && typeof d.src[0] !== "string";
  const tagsOf  = (x) => x?.tags ?? [];
  const textOf  = (x) => (typeof x === "string" ? x : x.t);

  let lastTags = [];

  function clearLastTags() {
    lastTags = [];
  }

  function draw(deck, matchTags = []) {
    if (!deck.pile.length) deck._fill();

    if (!isTagged(deck)) {
      const item = deck.pop();
      return textOf(item);
    }

    let pool = [];

    if (matchTags.length > 0) {
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
    return textOf(item);
  }

  // returns tags too, for chaining beats
  function drawWithTags(deck, matchTags = []) {
    if (!deck.pile.length) deck._fill();

    if (!isTagged(deck)) {
      const item = deck.pop();
      const tags = tagsOf(item);
      lastTags = tags;
      return { text: textOf(item), tags, tone: tags[0] ?? null };
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
  // draw() already updates lastTags when tagged
  // untagged decks: clear to avoid stale tags
  if (!isTagged(deck)) lastTags = [];
  return result;
}

  function getLastTags() {
    return [...lastTags];
  }

  function startConv() {
    lastTags = [];
  }

  function endConv() {
    lastTags = [];
  }

  // gates the say-more step when unmatched
  function hasTaggedMatch(deck, matchTags) {
    if (!isTagged(deck) || !matchTags || !matchTags.length) return false;
    if (!deck.pile.length) deck._fill();
    return deck.pile.some(x => tagsOf(x).some(t => matchTags.includes(t)));
  }

  function _debugLastTags() { return [...lastTags]; }

  return {
    Deck,
    draw,
    drawWithTags,
        drawChained,

    getLastTags,
    clearLastTags,
    hasTaggedMatch,
    startConv,
    endConv,
    _debugLastTags,
  };

})();