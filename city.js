
  const HH = 3,
    HW = 5,
    HGAP = 1,
    RUH = 2,

    RDW = 4,
    RDH = 3,
    HPS = 3;
  const HOUSE_W = HW - HGAP;
  const BW = HPS * HW,
    BH = HH * 2 + RUH,
    CW = BW + RDW,
    CH = BH + RDH;

  const ROOF_STYLES = [
    ["/", "▄", "\\"],
    ["╱", "▀", "╲"],
    ["◢", "▀", "◣"],
    ["▀", "▀", "▀"],
    ["▛", "▄", "▜"],
  ];

  function renderCity(cx, cy) {
    for (let sy = 0; sy < H; sy++)
      for (let sx = 0; sx < W; sx++) {
        const mx = Math.floor(cx) + sx,
          my = Math.floor(cy) + sy;
        const lx = ((mx % CW) + CW) % CW,
          ly = ((my % CH) + CH) % CH;
        const inB = lx < BW && ly < BH;
        const inRuelle = inB && ly >= HH && ly < HH + RUH;
        if (!inB) {
          if (ly === BH && lx < BW) grid.set(sx, sy, "\u2550", "#333");
          else if (ly === CH - 1 && lx < BW) grid.set(sx, sy, "\u2550", "#333");
          else if (lx === BW && ly < BH) grid.set(sx, sy, "\u2551", "#333");
          else if (lx === CW - 1 && ly < BH) grid.set(sx, sy, "\u2551", "#333");
          else if (lx === BW && ly === BH) grid.set(sx, sy, "\u255D", "#333");
          else if (lx === CW - 1 && ly === BH) grid.set(sx, sy, "\u255A", "#333");
          else if (lx === BW && ly === CH - 1) grid.set(sx, sy, "\u2557", "#333");
          else if (lx === CW - 1 && ly === CH - 1) grid.set(sx, sy, "\u2554", "#333");
        } else if (inRuelle) {
          /* Clean ruelles */
        } else {
          const hr = ly < HH ? 0 : 1,
            hly = hr === 0 ? ly : ly - HH - RUH;
          const bc = ((Math.floor(mx / CW) % 30) + 30) % 30,
            br = ((Math.floor(my / CH) % 30) + 30) % 30;
          const hi = Math.floor(lx / HW),
            ai = (bc + br + hi + hr * 2) % HA.length,
            ci = (bc * 3 + br * 7 + hi * 5 + hr) % HC.length,
            ciRoof = (bc * 5 + br * 3 + hi * 7 + hr + 2) % HC.length;
          const col = lx % HW;
          if (col >= HOUSE_W) {
            // Gap column between houses -- deliberately left blank.
          } else if (hly === 0) {
            // Top row of each house = roof, shape picked per house
            const style = ROOF_STYLES[(bc + br + hi) % ROOF_STYLES.length];
            const roofCh = col === 0 ? style[0] : col === HOUSE_W - 1 ? style[2] : style[1];
            grid.set(sx, sy, roofCh, HC[ciRoof]);
          } else {
            // Body rows: HA[ai] holds one HOUSE_W-wide string per row.
            const row = HA[ai][hly];
            const ch = row && row[col];
            if (ch && ch !== " ") grid.set(sx, sy, ch, HC[ci]);
          }
        }
      }
  }

  function isRoad(wx, wy) {
    const lx = ((wx % CW) + CW) % CW,
      ly = ((wy % CH) + CH) % CH;
    if (lx >= BW || ly >= BH) return true;
    if (ly >= HH && ly < HH + RUH) return true;
    return false;
  }
  function hRoadY(row) {
    return row * CH + BH + 1;
  }
  function vRoadX(col) {
    return col * CW + BW + 1;
  }

  const BUILDINGS = window.GAME_DATA.buildings;

  function tileBuildings(blockW, usedNames) {
    const pieces = [];
    let remain = blockW,
      iter = 0,
      lastArt = null;
    while (remain > 0 && iter++ < 20) {
      const fits = BUILDINGS.filter((b) => b.size <= remain);
      if (fits.length === 0) break;
      const canClean = fits.filter((b) => {
        const r = remain - b.size;
        return r === 0 || r >= 6;
      });

      const fresh = [
        canClean.filter((b) => b.art !== lastArt && usedNames && !usedNames.has(b.name)),
        fits.filter((b) => b.art !== lastArt && usedNames && !usedNames.has(b.name)),
      ].find((c) => c.length > 0);
      const finalPool =
        fresh ||
        [canClean.filter((b) => b.art !== lastArt), fits.filter((b) => b.art !== lastArt), canClean.length > 0 ? canClean : fits].find(
          (c) => c.length > 0,
        );
      const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
      lastArt = chosen.art;
      if (usedNames) usedNames.add(chosen.name);
      pieces.push({ art: chosen.art, w: chosen.size, name: chosen.name });
      remain -= chosen.size;
    }
    return pieces;
  }
