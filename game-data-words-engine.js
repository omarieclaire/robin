
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
      const inPile = deck.pile.some((x) => x.follows && opts.follows.includes(x.follows));
      if (!inPile) {
        const allMatching = deck.src.filter((x) => x.follows && opts.follows.includes(x.follows));
        if (allMatching.length > 0) {
          const pick = allMatching[Math.floor(Math.random() * allMatching.length)];
          deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, pick);
        }
      }
    }
    let bestIdx = 0,
      bestScore = -999;
    for (let i = 0; i < deck.pile.length; i++) {
      const s = score(deck.pile[i], opts.boost ?? false, opts.follows ?? null);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = i;
      }
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
      const inPile = deck.pile.some((x) => x.follows && follows.includes(x.follows));
      console.log("follows check after fill — looking for:", follows, "inPile:", inPile, "pile size:", deck.pile.length);

      if (!inPile) {
        const allMatching = deck.src.filter((x) => x.follows && follows.includes(x.follows));
        if (allMatching.length > 0) {
          const pick = allMatching[Math.floor(Math.random() * allMatching.length)];
          deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, pick);
        }
      }
    }
    let bestIdx = 0,
      bestScore = -999;
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
    console.log(
      "after fill, pile follows:",
      deck.pile.map((x) => x?.follows ?? "none").filter((x) => x !== "none"),
    );

    if (!isTagged(deck)) return { text: textOf(deck.pop()), tags: [] };

    if (opts.follows && opts.follows.length > 0) {
      const matchCheck = deck.pile.filter((x) => x.follows && opts.follows.includes(x.follows));
      console.log(
        "follows match check:",
        opts.follows,
        "matching items:",
        matchCheck.map((x) => x.t),
      );

      const inPile = deck.pile.some((x) => x.follows && opts.follows.includes(x.follows));
      if (!inPile) {
        const allMatching = deck.src.filter((x) => x.follows && opts.follows.includes(x.follows));
        if (allMatching.length > 0) {
          const pick = allMatching[Math.floor(Math.random() * allMatching.length)];
          deck.pile.splice(Math.floor(Math.random() * (deck.pile.length + 1)), 0, pick);
        }
      }
    }
    let bestIdx = 0,
      bestScore = -999;
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

  function _debugLastDrawnTags() {
    return lastDrawnTags;
  }

  function endConv() {
    for (const [t, v] of coolMap) coolMap.set(t, v + 1);
    convTags = new Set();
  }
  function _debugConvTags() {
    return convTags;
  }

  return { Deck, draw, drawWithTags, drawNoRecord, _seedConvTag, _debugConvTags, _debugLastDrawnTags, startConv, endConv };
})();
