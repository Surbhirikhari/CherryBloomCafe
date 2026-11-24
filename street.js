// =========================================================
// Cherry Blossom Cafe — street.js
// Paints the street outside the cafe in a soft watercolour style.
// Everything here is made of SVG shapes that JavaScript creates:
// buildings, the cafe, cherry trees, the sidewalk and people walking by.
//
// Watercolour tricks used:
//  - "wc" filter: wobbles shape edges so they look painted, not ruler-straight
//  - each wash gets a slightly darker edge, like paint pooling as it dries
//  - "ink" filter: thin brown lines with a hand-drawn shake
//  - "paper" filter: a light grain over everything, like watercolour paper
// =========================================================

(function () {
  const svg = document.getElementById("street");
  // our watercolour brushes, from paint.js
  const { random, between, pick, el, darker, box, wash, ink, filters } = createPainter(svg, 20250424);

  // ---------- Filters and colours we reuse ----------
  svg.innerHTML = `
    <defs>
      ${filters("")}
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbeef0"/>
        <stop offset="0.55" stop-color="#fdf7f2"/>
        <stop offset="1" stop-color="#f6eee6"/>
      </linearGradient>
      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fcebc6"/>
        <stop offset="1" stop-color="#f1c48d"/>
      </linearGradient>
    </defs>`;

  // ---------- 1. Sky ----------
  el("rect", { x: -50, y: -50, width: 1700, height: 1000, fill: "url(#sky)" });
  const skyWash = el("g", { filter: "url(#bloom)", opacity: 0.55 });
  for (let i = 0; i < 7; i++) {
    el("ellipse", { cx: between(0, 1600), cy: between(0, 260), rx: between(140, 300), ry: between(40, 90),
      fill: pick(["#fbe0e7", "#f9e9dd", "#f2e7f1"]) }, skyWash);
  }

  // ---------- 2. Neighbouring buildings ----------
  const farWash = el("g", { filter: "url(#wc)" });
  const farInk = el("g", { filter: "url(#ink)", opacity: 0.7 });

  const BUILDINGS = [
    { x: -20, w: 230, top: 200, color: "#efdfc6" },
    { x: 210, w: 200, top: 250, color: "#f2d8cf" },
    { x: 410, w: 190, top: 180, color: "#e9dac3" },
    { x: 1120, w: 190, top: 220, color: "#f0e2d0" },
    { x: 1310, w: 160, top: 170, color: "#ecd3c8" },
    { x: 1470, w: 160, top: 240, color: "#efdfc6" },
  ];

  function drawWindow(x, y, w, h, hasShutters, hasBalcony) {
    wash(box(x, y, w, h, 1), "#b8c3c4", farWash, 0.75);
    el("path", { d: box(x + 3, y + 3, w * 0.4, h * 0.5, 1), fill: "#eef1ee", opacity: 0.5 }, farWash);
    ink(box(x, y, w, h, 1), farInk);
    ink(`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h * 0.45} L${x + w} ${y + h * 0.45}`, farInk, 1.1);
    if (hasShutters) {
      wash(box(x - 13, y, 11, h, 1), "#a9b99b", farWash);
      wash(box(x + w + 2, y, 11, h, 1), "#a9b99b", farWash);
    }
    if (hasBalcony) {
      ink(`M${x - 10} ${y + h + 2} L${x + w + 10} ${y + h + 2} M${x - 10} ${y + h - 14} L${x + w + 10} ${y + h - 14}`, farInk, 1.4);
      for (let bx = x - 8; bx < x + w + 10; bx += 6) ink(`M${bx} ${y + h - 14} L${bx} ${y + h + 2}`, farInk, 0.9);
      drawPlants(x - 6, y + h - 14, w + 12, farWash);
    }
  }

  // A row of leafy plants with a few pink flowers.
  function drawPlants(x, y, w, parent) {
    for (let i = 0; i < w / 6; i++) {
      el("circle", { cx: x + between(0, w), cy: y - between(0, 12), r: between(4, 8), fill: pick(["#8fae7a", "#a3bf8c", "#7a9c6a"]), opacity: 0.85 }, parent);
    }
    for (let i = 0; i < w / 14; i++) {
      el("circle", { cx: x + between(0, w), cy: y - between(2, 14), r: between(2, 3.5), fill: pick(["#f2a2b6", "#f7c3cf"]) }, parent);
    }
  }

  BUILDINGS.forEach(function (b) {
    wash(box(b.x, b.top, b.w, 690 - b.top), b.color, farWash);
    wash(box(b.x - 6, b.top - 14, b.w + 12, 18), darker(b.color, 0.08), farWash);
    ink(box(b.x, b.top, b.w, 690 - b.top, 1), farInk, 1.3);

    const cols = Math.max(2, Math.floor(b.w / 62));
    const gap = b.w / cols;
    for (let y = b.top + 38; y < 500; y += 108) {
      const shutters = random() < 0.5;
      const balcony = random() < 0.35;
      for (let c = 0; c < cols; c++) {
        drawWindow(b.x + gap * c + gap / 2 - 16, y, 32, 56, shutters, balcony);
      }
    }
    // a little shop on the ground floor
    const shop = pick(["#8b6b5c", "#6f7f6b", "#7d6a7f", "#9a7462"]);
    wash(box(b.x + 14, 560, b.w - 28, 130), shop, farWash);
    wash(box(b.x + 26, 580, b.w - 52, 70), "#f3dcb6", farWash, 0.85);
    ink(box(b.x + 26, 580, b.w - 52, 70, 1), farInk);
  });

  // ---------- 3. Our cafe ----------
  const cafeWash = el("g", { filter: "url(#wc)" });
  const cafeInk = el("g", { filter: "url(#ink)", opacity: 0.8 });
  const X = 600, W = 520, TOP = 140;   // the cafe building: left edge, width, roof

  // upper floors, corner pillars and the cornice at the top
  wash(box(X, TOP, W, 340), "#f5e8d2", cafeWash);
  wash(box(X, TOP, 26, 550), "#ead9bf", cafeWash);
  wash(box(X + W - 26, TOP, 26, 550), "#ead9bf", cafeWash);
  wash(box(X - 14, TOP - 20, W + 28, 26), "#e3cfb2", cafeWash);
  for (let dx = X; dx < X + W; dx += 18) el("rect", { x: dx, y: TOP + 10, width: 9, height: 9, fill: "#d9c3a3" }, cafeWash);
  ink(box(X, TOP, W, 550, 1), cafeInk, 1.5);
  ink(box(X - 14, TOP - 20, W + 28, 26, 1), cafeInk, 1.3);

  // three tall arched windows with flower balconies
  for (let i = 0; i < 3; i++) {
    const cx = X + 110 + i * 150, y = 205, w = 72, h = 118;
    const arch = `M${cx - w / 2} ${y + h} L${cx - w / 2} ${y + 30} Q${cx - w / 2} ${y} ${cx} ${y} Q${cx + w / 2} ${y} ${cx + w / 2} ${y + 30} L${cx + w / 2} ${y + h} Z`;
    wash(arch, "#b5c2c3", cafeWash, 0.8);
    el("path", { d: `M${cx - 28} ${y + 40} Q${cx - 26} ${y + 14} ${cx - 6} ${y + 10} L${cx - 6} ${y + 60} L${cx - 28} ${y + 60} Z`, fill: "#f0f2ee", opacity: 0.5 }, cafeWash);
    ink(arch, cafeInk);
    ink(`M${cx} ${y} L${cx} ${y + h} M${cx - w / 2} ${y + 52} L${cx + w / 2} ${y + 52}`, cafeInk, 1.1);
    // balcony
    ink(`M${cx - 52} ${y + h + 4} L${cx + 52} ${y + h + 4} M${cx - 52} ${y + h - 16} L${cx + 52} ${y + h - 16}`, cafeInk, 1.6);
    for (let bx = cx - 50; bx <= cx + 50; bx += 7) ink(`M${bx} ${y + h - 16} L${bx} ${y + h + 4}`, cafeInk, 1);
    wash(box(cx - 56, y + h + 4, 112, 8), "#e1ccb0", cafeWash);
    drawPlants(cx - 50, y + h - 16, 100, cafeWash);
  }
  // a row of small windows
  for (let i = 0; i < 4; i++) {
    const wx = X + 78 + i * 112;
    wash(box(wx, 372, 36, 52, 1), "#b8c3c4", cafeWash, 0.75);
    ink(box(wx, 372, 36, 52, 1), cafeInk, 1.2);
    ink(`M${wx + 18} 372 L${wx + 18} 424`, cafeInk, 1);
  }

  // shop front: deep cherry wood
  wash(box(X + 10, 470, W - 20, 220), "#7b3338", cafeWash);
  // sign board with the cafe's name
  wash(box(X + 46, 480, W - 92, 48), "#5c2329", cafeWash);
  ink(box(X + 46, 480, W - 92, 48, 1), cafeInk, 1.4);
  const sign = el("text", { x: X + W / 2, y: 514, "text-anchor": "middle", "font-family": "Mochiy Pop One, Nunito, sans-serif",
    "font-size": 25, fill: "#fbe8d6", "letter-spacing": 1 });
  sign.textContent = "Cherry Blossom Cafe";
  for (const sx of [X + 66, X + W - 66]) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      el("circle", { cx: sx + Math.cos(a) * 6, cy: 504 + Math.sin(a) * 6, r: 5, fill: "#f4b3c4" }, cafeWash);
    }
    el("circle", { cx: sx, cy: 504, r: 3, fill: "#fbe8d6" }, cafeWash);
  }

  // striped awning with a scalloped edge
  wash(box(X + 18, 532, W - 36, 10), "#d9758f", cafeWash);
  const stripe = (W - 36) / 18;
  for (let i = 0; i < 18; i++) {
    const sx = X + 18 + i * stripe;
    const flare = (i - 8.5) * 1.6;              // stripes lean outward a little
    const d = `M${sx} 540 L${sx + stripe} 540 L${sx + stripe + flare} 584 Q${sx + stripe / 2 + flare} 600 ${sx + flare} 584 Z`;
    el("path", { d, fill: i % 2 ? "#fbf1ef" : "#ee9cb1", opacity: 0.95 }, cafeWash);
  }
  ink(`M${X + 18} 540 L${X + W - 18} 540`, cafeInk, 1.4);

  // two big windows, warm and glowing, full of cakes
  function shopWindow(x, w) {
    wash(box(x, 602, w, 88, 1), "url(#glow)", cafeWash, 1);
    for (const sy of [628, 652, 676]) {
      ink(`M${x + 6} ${sy} L${x + w - 6} ${sy}`, cafeInk, 1.2);
      for (let k = 0; k < w / 22; k++) {
        const cx = x + 14 + k * 22 + between(-3, 3);
        el("ellipse", { cx, cy: sy - 6, rx: 7, ry: 5.5, fill: pick(["#f3a9bb", "#fbeee6", "#c98d6b", "#f7d0d8", "#e9b06f"]) }, cafeWash);
        if (random() < 0.5) el("circle", { cx, cy: sy - 12, r: 2.4, fill: "#d9475f" }, cafeWash);
      }
    }
    ink(box(x, 602, w, 88, 1), cafeInk, 1.6);
    ink(`M${x + w / 2} 602 L${x + w / 2} 690`, cafeInk, 1.2);
    drawPlants(x, 600, w, cafeWash);
  }
  shopWindow(X + 40, 180);
  shopWindow(X + W - 220, 180);

  // the door (the game zooms in here when you open the cafe)
  const door = el("path", { id: "cafe-door", d: box(X + 232, 598, 56, 92, 1), fill: "#8b4a3b" }, cafeWash);
  wash(box(X + 240, 606, 40, 44, 1), "url(#glow)", cafeWash, 1);
  ink(box(X + 232, 598, 56, 92, 1), cafeInk, 1.6);
  ink(box(X + 240, 606, 40, 44, 1), cafeInk, 1.1);
  el("circle", { cx: X + 278, cy: 664, r: 2.6, fill: "#e9c27a" }, cafeWash);
  // a little "open" sign on the door
  wash(box(X + 246, 656, 28, 13, 1), "#fbf1ef", cafeWash);
  const open = el("text", { x: X + 260, y: 666, "text-anchor": "middle", "font-family": "Nunito, sans-serif", "font-size": 8, "font-weight": 800, fill: "#7b3338" });
  open.textContent = "OPEN";

  // ---------- 4. Sidewalk and road ----------
  const street = el("g", { filter: "url(#wc)" });
  const streetInk = el("g", { filter: "url(#ink)", opacity: 0.45 });
  wash(box(-20, 690, 1640, 106, 1), "#ece2d8", street);
  for (let y = 712; y < 792; y += 22) {             // paving stone lines
    let x = -20;
    while (x < 1620) {
      const len = between(30, 70);
      ink(`M${x} ${y + between(-1, 1)} L${x + len} ${y + between(-1, 1)}`, streetInk, 1);
      ink(`M${x + len} ${y - 22} L${x + len + between(-2, 2)} ${y}`, streetInk, 0.9);
      x += len + between(6, 14);
    }
  }
  wash(box(-20, 794, 1640, 12, 1), "#d8cdc2", street);
  wash(box(-20, 806, 1640, 110, 1), "#e3ddd9", street);
  for (let i = 0; i < 9; i++) {                    // soft blue-grey shadows on the road
    el("ellipse", { cx: between(0, 1600), cy: between(830, 890), rx: between(60, 160), ry: between(6, 14), fill: "#c9c6cf", opacity: 0.35 }, street);
  }
  ink("M-20 856 L1620 856", streetInk, 1);
  for (let x = 20; x < 1600; x += 140) ink(`M${x} 856 L${x + 70} 856`, streetInk, 3);

  // ---------- 5. Things on the sidewalk ----------
  const props = el("g", { filter: "url(#wc)" });
  const propsInk = el("g", { filter: "url(#ink)", opacity: 0.85 });

  // A-frame chalkboard menu
  ink("M560 708 L574 630 L600 630 L612 708", propsInk, 2);
  wash(box(570, 638, 36, 50, 1), "#3f4a45", props);
  for (let k = 0; k < 5; k++) ink(`M576 ${648 + k * 8} L${592 + between(-4, 8)} ${648 + k * 8}`, propsInk, 1.2).setAttribute("stroke", "#f3efe8");

  // bistro tables and chairs
  function table(cx) {
    el("ellipse", { cx, cy: 708, rx: 30, ry: 5, fill: "#b9b3c2", opacity: 0.35 }, props);
    wash(`M${cx - 26} 664 Q${cx} 656 ${cx + 26} 664 Q${cx} 672 ${cx - 26} 664 Z`, "#efe8e2", props);
    ink(`M${cx} 668 L${cx} 704 M${cx - 12} 706 L${cx + 12} 706`, propsInk, 2.2);
  }
  function chair(cx, facing) {
    ink(`M${cx} 704 L${cx} 682 L${cx + 14 * facing} 682 L${cx + 14 * facing} 704 M${cx} 682 L${cx - 2 * facing} 654`, propsInk, 2);
    wash(box(cx - 2, 678, 18, 5, 1), "#c9806f", props);
  }
  table(1010); chair(970, 1); chair(1040, 1);
  table(1180); chair(1215, -1);

  // flower pots by the door
  function pot(cx) {
    wash(`M${cx - 16} 676 L${cx + 16} 676 L${cx + 12} 704 L${cx - 12} 704 Z`, "#cf8f6e", props);
    drawPlants(cx - 20, 676, 40, props);
    for (let k = 0; k < 6; k++) el("circle", { cx: cx + between(-16, 16), cy: 664 + between(-10, 6), r: between(3, 5), fill: pick(["#f29cb2", "#f7c6d1", "#ffffff"]) }, props);
  }
  pot(X + 214); pot(X + 306);

  // a street lamp
  ink("M1265 760 L1265 470", propsInk, 5).setAttribute("stroke", "#4a5650");
  ink("M1250 470 L1280 470 L1286 440 L1244 440 Z", propsInk, 3).setAttribute("stroke", "#4a5650");
  el("path", { d: "M1250 466 L1280 466 L1284 444 L1246 444 Z", fill: "#fbe3a8", opacity: 0.9 }, props);
  ink("M1258 760 L1272 760", propsInk, 6).setAttribute("stroke", "#4a5650");

  // a bicycle with a basket of flowers
  function wheel(cx) { ink(`M${cx - 24} 752 A24 24 0 1 0 ${cx + 24} 752 A24 24 0 1 0 ${cx - 24} 752`, propsInk, 2); }
  wheel(440); wheel(520);
  ink("M440 752 L470 716 L506 716 L520 752 M470 716 L484 752 L506 716 M466 706 L476 706 M506 716 L510 700 L522 700", propsInk, 2.2).setAttribute("stroke", "#7f9c8a");
  wash(box(512, 690, 26, 16, 1), "#d7b483", props);
  for (let k = 0; k < 6; k++) el("circle", { cx: 518 + between(0, 16), cy: 686 + between(-4, 4), r: 4, fill: pick(["#f29cb2", "#f7c6d1", "#a3bf8c"]) }, props);

  // ---------- 6. Cherry trees ----------
  const trunks = el("g", { filter: "url(#wc)" });
  function branch(d, width) {
    el("path", { d, fill: "none", stroke: "#6f4a3c", "stroke-width": width, "stroke-linecap": "round", opacity: 0.92 }, trunks);
    el("path", { d, fill: "none", stroke: "#4e3128", "stroke-width": Math.max(1.5, width * 0.25), "stroke-linecap": "round", opacity: 0.5,
      transform: `translate(${width * 0.2} 0)` }, trunks);
  }
  // left tree
  branch("M150 800 Q170 600 200 470 Q225 360 260 300", 34);
  branch("M220 400 Q330 300 470 210", 16);
  branch("M250 320 Q300 200 360 120", 14);
  branch("M235 360 Q140 300 70 220", 13);
  branch("M380 260 Q470 200 560 160", 8);
  // right tree
  branch("M1500 800 Q1480 600 1450 470 Q1430 380 1420 320", 30);
  branch("M1440 400 Q1340 300 1230 220", 14);
  branch("M1425 340 Q1470 230 1540 160", 13);
  branch("M1300 270 Q1240 200 1160 170", 8);

  // blossoms: lots of soft pink dabs around each cluster centre
  const blossoms = el("g", { filter: "url(#bloom)" });
  const PINKS = ["#f7b8ca", "#f3a3ba", "#f9cfda", "#ee92ad", "#fbe2e9"];
  const CLUSTERS = [
    [260, 280, 130], [360, 150, 140], [120, 190, 120], [480, 140, 110], [300, 50, 150],
    [30, 300, 110], [590, 120, 80], [180, 60, 120], [430, 260, 80],
    [1410, 270, 130], [1290, 180, 120], [1530, 160, 140], [1580, 330, 100], [1180, 140, 90], [1450, 60, 140],
    [700, 30, 80], [1020, 20, 90],
  ];
  CLUSTERS.forEach(function ([cx, cy, size]) {
    for (let i = 0; i < size * 0.9; i++) {
      const angle = random() * Math.PI * 2;
      const dist = Math.sqrt(random()) * size;     // sqrt spreads dabs evenly
      el("circle", {
        cx: cx + Math.cos(angle) * dist,
        cy: cy + Math.sin(angle) * dist * 0.75,
        r: between(8, 24),
        fill: pick(PINKS),
        opacity: between(0.45, 0.8),
      }, blossoms);
    }
    for (let i = 0; i < size * 0.15; i++) {         // a few darker and white accents
      el("circle", { cx: cx + between(-size, size) * 0.8, cy: cy + between(-size, size) * 0.6, r: between(3, 7),
        fill: pick(["#e07796", "#ffffff"]), opacity: 0.7 }, blossoms);
    }
  });

  // petals lying on the sidewalk and road
  const fallen = el("g", { opacity: 0.8 });
  for (let i = 0; i < 90; i++) {
    const px = between(0, 1600), py = between(700, 895);
    el("ellipse", { cx: px, cy: py, rx: between(2.5, 5), ry: between(1.5, 3),
      fill: pick(["#f4a9bd", "#f8c7d3"]), transform: `rotate(${between(0, 180)} ${px} ${py})` }, fallen);
  }

  // ---------- 7. People ----------
  // Each person is drawn facing right with their feet at (0, 0).
  // CSS moves the ".walker" groups across the street (see style.css).
  const people = el("g", { filter: "url(#ink)" });
  const OUTLINE = "#5f463d";

  function drawPerson(p, parent) {
    const g = el("g", { transform: `translate(0 ${p.y}) scale(${p.dir * p.size} ${p.size})` }, parent);
    el("ellipse", { cx: 0, cy: 2, rx: 22, ry: 5, fill: "#9a97aa", opacity: 0.25 }, g);
    const body = el("g", { class: p.walking ? "bob" : "" }, g);
    // legs (they swing while walking)
    el("path", { class: p.walking ? "leg leg-a" : "", d: "M-5 -52 L-6 0", stroke: p.legs, "stroke-width": 7, "stroke-linecap": "round" }, body);
    el("path", { class: p.walking ? "leg leg-b" : "", d: "M5 -52 L6 0", stroke: p.legs, "stroke-width": 7, "stroke-linecap": "round" }, body);
    // coat or dress
    const coat = p.dress
      ? "M-22 -40 Q-18 -92 0 -98 Q18 -92 22 -40 Q0 -34 -22 -40 Z"
      : "M-17 -48 Q-20 -92 0 -98 Q20 -92 17 -48 Q0 -43 -17 -48 Z";
    el("path", { d: coat, fill: p.coat, stroke: OUTLINE, "stroke-width": 1.6 }, body);
    if (p.bag) {
      el("path", { d: "M-2 -94 L-14 -62", stroke: darker(p.bag, 0.3), "stroke-width": 1.5, fill: "none" }, body);
      el("path", { d: box(-22, -64, 14, 12, 0.5), fill: p.bag, stroke: OUTLINE, "stroke-width": 1.2 }, body);
    }
    el("path", { d: "M3 -90 Q10 -74 7 -58", stroke: darker(p.coat, 0.15), "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, body);
    // head and hair
    el("circle", { cx: 0, cy: -111, r: 12, fill: p.skin, stroke: OUTLINE, "stroke-width": 1.5 }, body);
    const HAIR = {
      bun:   "M-12 -110 Q-13 -125 0 -125 Q12 -125 12 -112 Q3 -118 -12 -110 Z M-14 -126 A6 6 0 1 0 -2 -126 A6 6 0 1 0 -14 -126",
      short: "M-12 -106 Q-15 -125 0 -125 Q13 -124 12 -112 Q4 -117 -6 -112 Q-8 -106 -12 -106 Z",
      long:  "M-12 -110 Q-15 -126 0 -126 Q14 -126 12 -111 Q5 -117 -4 -113 Q-6 -100 -2 -92 L-15 -92 Q-17 -100 -12 -110 Z",
      beret: "M-14 -117 Q-8 -130 6 -128 Q16 -124 13 -116 Q0 -119 -14 -117 Z M-12 -110 Q-13 -116 -6 -116 L-10 -104 Z",
    };
    el("path", { d: HAIR[p.hair], fill: p.hairColor, stroke: OUTLINE, "stroke-width": 1.3 }, body);
    el("circle", { cx: 6, cy: -112, r: 1.4, fill: OUTLINE }, body);
    el("circle", { cx: 6, cy: -106, r: 2.6, fill: "#f4a9b6", opacity: 0.7 }, body);
    // an optional pink parasol
    if (p.parasol) {
      el("path", { d: "M9 -86 L9 -152", stroke: OUTLINE, "stroke-width": 1.6 }, body);
      el("path", { d: "M-24 -146 Q9 -186 42 -146 Q34 -150 26 -146 Q17 -151 9 -146 Q1 -151 -8 -146 Q-16 -150 -24 -146 Z", fill: "#f4b6c6", stroke: OUTLINE, "stroke-width": 1.4 }, body);
    }
    // an optional little dog trotting ahead
    if (p.dog) {
      const dog = el("g", { class: "bob" }, g);
      el("path", { d: "M18 -60 L44 -30", stroke: OUTLINE, "stroke-width": 1, fill: "none" }, g);
      el("path", { class: "leg leg-a", d: "M40 -12 L40 0", stroke: "#e9d8c4", "stroke-width": 4, "stroke-linecap": "round" }, dog);
      el("path", { class: "leg leg-b", d: "M58 -12 L58 0", stroke: "#e9d8c4", "stroke-width": 4, "stroke-linecap": "round" }, dog);
      el("ellipse", { cx: 49, cy: -17, rx: 14, ry: 8, fill: "#f3e6d5", stroke: OUTLINE, "stroke-width": 1.3 }, dog);
      el("circle", { cx: 62, cy: -26, r: 7, fill: "#f3e6d5", stroke: OUTLINE, "stroke-width": 1.3 }, dog);
      el("path", { d: "M58 -31 L57 -38 L63 -33 Z", fill: "#c99f7a" }, dog);
      el("circle", { cx: 65, cy: -27, r: 1, fill: OUTLINE }, dog);
    }
    return g;
  }

  const WALKERS = [
    { y: 724, dir: 1,  speed: 44, delay: -6,  coat: "#9db391", legs: "#6a5a55", skin: "#f7ddcd", hair: "bun",   hairColor: "#6b4335", bag: "#e3b6a2", dress: false },
    { y: 748, dir: -1, speed: 52, delay: -30, coat: "#e8b4b8", legs: "#7f7a8c", skin: "#f3d4c2", hair: "long",  hairColor: "#3f2f2b", parasol: true, dress: true },
    { y: 770, dir: 1,  speed: 60, delay: -40, coat: "#a9bccb", legs: "#5e6270", skin: "#e9c4a8", hair: "short", hairColor: "#2f2624", dog: true },
    { y: 735, dir: -1, speed: 48, delay: -12, coat: "#e9cf94", legs: "#6f6060", skin: "#f7ddcd", hair: "beret", hairColor: "#a35a4a", bag: "#9db391", dress: true },
    { y: 760, dir: 1,  speed: 56, delay: -22, coat: "#c7aed3", legs: "#5e5a66", skin: "#d9ad8c", hair: "short", hairColor: "#4b342c" },
  ];
  WALKERS.forEach(function (p) {
    p.size = 0.82 + (p.y - 720) / 55 * 0.22;          // closer to us = a bit bigger
    p.walking = true;
    const walker = el("g", { class: p.dir > 0 ? "walker" : "walker walker-left",
      style: `animation-duration: ${p.speed}s; animation-delay: ${p.delay}s` }, people);
    drawPerson(p, walker);
  });

  // someone enjoying a drink at the cafe table (not walking)
  const sitter = el("g", { transform: "translate(1040 706)" }, people);
  drawPerson({ y: 0, dir: -1, size: 0.82, coat: "#f2c6cf", legs: "#7a6f80", skin: "#f7ddcd", hair: "bun", hairColor: "#c58b5a", dress: true }, sitter);
  el("path", { d: box(-38, -58, 9, 10, 0.5), fill: "#ffffff", stroke: OUTLINE, "stroke-width": 1.2 }, sitter);

  // ---------- 8. Paper grain over everything ----------
  el("rect", { x: 0, y: 0, width: 1600, height: 900, filter: "url(#paper)", style: "mix-blend-mode: multiply", opacity: 0.6 });
})();
