// =========================================================
// Cherry Blossom Cafe — room.js
// Paints the inside of the cafe in the same watercolour style as the street:
// wallpaper, windows with pink curtains, shelves behind the counter,
// hanging lamps, a wooden floor, a window bench and plants.
// Uses the brushes from paint.js.
// =========================================================

(function () {
  const svg = document.getElementById("room");
  const { random, between, pick, el, darker, box, wash, ink, filters } = createPainter(svg, 777);
  const OUTLINE = "#5f463d";

  svg.innerHTML = `
    <defs>
      ${filters("r-")}
      <linearGradient id="r-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff3d6"/>
        <stop offset="1" stop-color="#f6d49c"/>
      </linearGradient>
      <linearGradient id="r-window" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbe9ee"/>
        <stop offset="1" stop-color="#fdf6ef"/>
      </linearGradient>
    </defs>`;

  const walls = el("g", { filter: "url(#r-wc)" });
  const wallInk = el("g", { filter: "url(#r-ink)", opacity: 0.7 });

  // ---------- 1. Wallpaper with soft stripes and tiny flowers ----------
  wash(box(-20, -20, 1640, 640, 1), "#f9e8e3", walls, 1);
  for (let x = 0; x < 1600; x += 44) {
    el("rect", { x, y: -20, width: 18, height: 640, fill: "#f3d5d4", opacity: 0.55 }, walls);
  }
  for (let i = 0; i < 70; i++) {
    const x = between(0, 1600), y = between(0, 470);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      el("circle", { cx: x + Math.cos(a) * 3, cy: y + Math.sin(a) * 3, r: 2.2, fill: "#eeaabb", opacity: 0.6 }, walls);
    }
  }

  // pink wainscoting (the panelled lower part of the wall) with a chair rail on top
  wash(box(-20, 470, 1640, 150, 1), "#f2c0ca", walls);
  for (let x = 20; x < 1600; x += 120) ink(box(x, 494, 96, 100, 1), wallInk, 1.3);
  wash(box(-20, 460, 1640, 16, 1), "#fbf3ea", walls);
  ink("M-20 460 L1620 460 M-20 476 L1620 476", wallInk, 1.4);

  // ---------- 2. Windows with ruffled pink curtains ----------
  function windowWithCurtains(x, w) {
    const y = 90, h = 320;
    const arch = `M${x} ${y + h} L${x} ${y + 60} Q${x} ${y} ${x + w / 2} ${y} Q${x + w} ${y} ${x + w} ${y + 60} L${x + w} ${y + h} Z`;
    wash(arch, "url(#r-window)", walls, 1);
    // cherry blossoms outside the glass
    const outside = el("g", { filter: "url(#r-bloom)", opacity: 0.8 });
    for (let i = 0; i < 60; i++) {
      el("circle", { cx: x + between(10, w - 10), cy: y + between(40, h * 0.7), r: between(8, 20),
        fill: pick(["#f7b8ca", "#f9cfda", "#f3a3ba"]), opacity: between(0.4, 0.75) }, outside);
    }
    wash(box(x + 6, y + h - 70, w - 12, 64, 2), "#e8dccf", outside, 0.6);      // rooftops far away
    ink(arch, wallInk, 2.2);
    ink(`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + 150} L${x + w} ${y + 150}`, wallInk, 2);
    // curtains on both sides, gathered with a tie
    for (const side of [0, 1]) {
      const cx = side ? x + w - 30 : x + 30;
      const out = side ? 34 : -34;
      const d = `M${cx - 34} ${y + 30} L${cx + 34} ${y + 30} Q${cx + out * 0.2} ${y + 180} ${cx + out} ${y + h + 20} L${cx + out * 2.2} ${y + h + 20} Q${cx + out * 1.5} ${y + 200} ${cx - 34 * (side ? -1 : 1)} ${y + 30} Z`;
      wash(d, "#f3aebf", walls);
      ink(`M${cx} ${y + 40} Q${cx + out * 0.6} ${y + 200} ${cx + out * 1.3} ${y + h + 10}`, wallInk, 1);
      wash(box(cx + out * 0.55 - 10, y + 196, 20, 10, 1), "#d9758f", walls);
    }
    // ruffled valance across the top
    const vy = y + 18;
    let ruffle = `M${x - 24} ${vy - 22} L${x + w + 24} ${vy - 22} L${x + w + 24} ${vy + 14}`;
    for (let rx = x + w + 24; rx > x - 24; rx -= 28) ruffle += ` Q${rx - 14} ${vy + 34} ${rx - 28} ${vy + 14}`;
    wash(ruffle + " Z", "#f6bccb", walls);
    ink(ruffle + " Z", wallInk, 1.3);
    wash(box(x - 30, vy - 30, w + 60, 10, 1), "#e9c7a5", walls);
  }
  windowWithCurtains(90, 280);
  windowWithCurtains(1230, 280);

  // ---------- 3. Behind the counter: shelves, menu board, espresso machine ----------
  const shelf = el("g", { filter: "url(#r-wc)" });
  const shelfInk = el("g", { filter: "url(#r-ink)", opacity: 0.8 });

  // chalkboard menu
  wash(box(640, 26, 320, 96, 2), "#c49a72", shelf);
  wash(box(652, 36, 296, 76, 2), "#3e4a45", shelf);
  ink(box(640, 26, 320, 96, 1), shelfInk, 1.6);
  const menu = el("text", { x: 800, y: 70, "text-anchor": "middle", "font-family": "Mochiy Pop One, Nunito, sans-serif", "font-size": 22, fill: "#fbf3ea" });
  menu.textContent = "Today's Menu";
  const menu2 = el("text", { x: 800, y: 98, "text-anchor": "middle", "font-family": "Nunito, sans-serif", "font-size": 16, "font-weight": 700, fill: "#cfe3b8" });
  menu2.textContent = "matcha latte · strawberry cake";

  // three wooden shelves full of things
  const SHELF_Y = [200, 300, 400];
  wash(box(470, 140, 660, 340, 2), "#f6dccf", shelf, 0.7);            // back panel
  ink(box(470, 140, 660, 340, 1), shelfInk, 1.4);
  SHELF_Y.forEach(function (sy) {
    wash(box(462, sy, 676, 12, 1), "#d6a57a", shelf);
    ink(box(462, sy, 676, 12, 1), shelfInk, 1.3);
  });

  function jar(x, base, h, fill) {
    wash(box(x, base - h, 34, h, 1), "#eef3f1", shelf, 0.85);
    wash(box(x + 3, base - h * 0.6, 28, h * 0.6 - 2, 1), fill, shelf, 0.85);
    wash(box(x - 2, base - h - 8, 38, 9, 1), "#f2a9bb", shelf);
    ink(box(x, base - h, 34, h, 1), shelfInk, 1.2);
  }
  function teapot(x, base, color) {
    wash(`M${x} ${base} Q${x - 6} ${base - 34} ${x + 22} ${base - 38} Q${x + 50} ${base - 34} ${x + 44} ${base} Z`, color, shelf);
    ink(`M${x} ${base} Q${x - 6} ${base - 34} ${x + 22} ${base - 38} Q${x + 50} ${base - 34} ${x + 44} ${base} Z`, shelfInk, 1.3);
    ink(`M${x + 44} ${base - 20} Q${x + 60} ${base - 26} ${x + 62} ${base - 36} M${x} ${base - 24} Q${x - 14} ${base - 20} ${x - 4} ${base - 8}`, shelfInk, 2);
    wash(box(x + 16, base - 46, 12, 8, 1), color, shelf);
  }
  function cup(x, base, color) {
    wash(`M${x} ${base - 18} L${x + 22} ${base - 18} L${x + 19} ${base} L${x + 3} ${base} Z`, color, shelf);
    ink(`M${x} ${base - 18} L${x + 22} ${base - 18} L${x + 19} ${base} L${x + 3} ${base} Z M${x + 22} ${base - 14} Q${x + 30} ${base - 10} ${x + 21} ${base - 4}`, shelfInk, 1.2);
  }
  function plant(x, base) {
    wash(`M${x} ${base - 22} L${x + 26} ${base - 22} L${x + 22} ${base} L${x + 4} ${base} Z`, "#cf8f6e", shelf);
    for (let k = 0; k < 9; k++) {
      const lx = x + 13 + between(-16, 16), ly = base - 30 - between(0, 22);
      // rotate(angle, x, y) spins the leaf around its own centre
      el("ellipse", { cx: lx, cy: ly, rx: 7, ry: 4.5, fill: pick(["#8fae7a", "#a3bf8c"]), transform: `rotate(${between(-40, 40)} ${lx} ${ly})` }, shelf);
    }
  }
  // top shelf
  jar(490, 200, 46, "#9cc56f"); jar(536, 200, 38, "#f4a9bb"); teapot(600, 200, "#fbf1ef");
  plant(680, 200); cup(730, 200, "#f3aebf"); cup(758, 200, "#fbf1ef"); cup(786, 200, "#cfe3b8");
  teapot(840, 200, "#f3aebf"); jar(920, 200, 44, "#e9c48f"); plant(980, 200); jar(1030, 200, 40, "#9cc56f"); jar(1076, 200, 50, "#f7d0d8");
  // middle shelf
  for (let k = 0; k < 6; k++) cup(490 + k * 30, 300, pick(["#fbf1ef", "#f3aebf", "#cfe3b8"]));
  wash(box(690, 252, 120, 48, 2), "#f3aebf", shelf);                  // pink espresso machine
  wash(box(702, 262, 40, 24, 1), "#fbf1ef", shelf);
  ink(box(690, 252, 120, 48, 1), shelfInk, 1.4);
  ink("M760 286 L760 300 M780 286 L780 300", shelfInk, 3);
  el("circle", { cx: 794, cy: 266, r: 5, fill: "#fbe3a8" }, shelf);
  jar(840, 300, 44, "#c98d6b"); jar(886, 300, 36, "#9cc56f"); teapot(940, 300, "#cfe3b8"); plant(1010, 300); jar(1060, 300, 42, "#f4a9bb");
  // bottom shelf: cake stands
  for (const cx of [540, 700, 860, 1020]) {
    wash(`M${cx - 44} ${400} L${cx + 44} 400 L${cx + 36} 392 L${cx - 36} 392 Z`, "#fbf1ef", shelf);
    wash(`M${cx - 30} 392 L${cx - 30} 362 Q${cx} 352 ${cx + 30} 362 L${cx + 30} 392 Z`, pick(["#f7d0d8", "#fbeee6", "#f3a9bb"]), shelf);
    ink(`M${cx - 30} 392 L${cx - 30} 362 Q${cx} 352 ${cx + 30} 362 L${cx + 30} 392`, shelfInk, 1.2);
    for (let k = 0; k < 4; k++) el("circle", { cx: cx - 18 + k * 12, cy: 358, r: 4, fill: "#d9475f" }, shelf);
  }

  // ---------- 4. Hanging lamps ----------
  const lamps = el("g", { filter: "url(#r-wc)" });
  for (const lx of [430, 800, 1170]) {
    ink(`M${lx} -20 L${lx} 120`, wallInk, 1.6);
    el("circle", { cx: lx, cy: 150, r: 50, fill: "#fff2cc", opacity: 0.35 }, lamps);   // soft glow
    wash(`M${lx - 30} 150 Q${lx - 26} 118 ${lx} 116 Q${lx + 26} 118 ${lx + 30} 150 Z`, "#f6c2cd", lamps);
    ink(`M${lx - 30} 150 Q${lx - 26} 118 ${lx} 116 Q${lx + 26} 118 ${lx + 30} 150 Z`, wallInk, 1.4);
    el("ellipse", { cx: lx, cy: 152, rx: 14, ry: 5, fill: "#fbe3a8" }, lamps);
  }

  // ---------- 5. Wooden floor ----------
  const floor = el("g", { filter: "url(#r-wc)" });
  const floorInk = el("g", { filter: "url(#r-ink)", opacity: 0.35 });
  wash(box(-20, 618, 1640, 300, 1), "#e9c9a6", floor, 1);
  for (let y = 640; y < 900; y += 26 + (y - 618) * 0.12) {        // planks get wider closer to us
    ink(`M-20 ${y} L1620 ${y}`, floorInk, 1.2);
    let x = between(-80, 0);
    while (x < 1620) {
      x += between(120, 260);
      ink(`M${x} ${y} L${x} ${y + 26 + (y - 618) * 0.12}`, floorInk, 1);
    }
    el("rect", { x: -20, y, width: 1640, height: 10, fill: "#f3dcc0", opacity: 0.35 }, floor);
  }
  wash(box(-20, 612, 1640, 12, 1), "#d8ad86", floor);              // skirting board

  // ---------- 6. Window bench and plants ----------
  const seats = el("g", { filter: "url(#r-wc)" });
  const seatInk = el("g", { filter: "url(#r-ink)", opacity: 0.9 });

  // a cushioned bench under the right window
  wash(box(1200, 436, 340, 30, 2), "#d6a57a", seats);
  wash(`M1206 436 Q1210 420 1240 418 L1500 418 Q1532 420 1534 436 Z`, "#f4a9bb", seats);
  for (const px of [1250, 1330, 1410, 1490]) wash(`M${px - 26} 420 Q${px - 30} 392 ${px} 388 Q${px + 30} 392 ${px + 26} 420 Z`, pick(["#fbecef", "#f7d0d8", "#cfe3b8"]), seats);
  ink(box(1200, 436, 340, 30, 1), seatInk, 1.4);

  // potted plants in the corners
  function bigPlant(x, y) {
    wash(`M${x - 34} ${y - 60} L${x + 34} ${y - 60} L${x + 26} ${y} L${x - 26} ${y} Z`, "#cf8f6e", seats);
    ink(`M${x - 34} ${y - 60} L${x + 34} ${y - 60} L${x + 26} ${y} L${x - 26} ${y} Z`, seatInk, 1.4);
    const leaves = el("g", { filter: "url(#r-bloom)" });
    for (let k = 0; k < 26; k++) {
      const lx = x + between(-50, 50), ly = y - 80 - between(0, 110);
      el("ellipse", { cx: lx, cy: ly, rx: between(10, 18), ry: between(6, 10), fill: pick(["#8fae7a", "#a3bf8c", "#7a9c6a"]),
        opacity: 0.9, transform: `rotate(${between(-50, 50)} ${lx} ${ly})` }, leaves);
    }
    for (let k = 0; k < 8; k++) el("circle", { cx: x + between(-40, 40), cy: y - 90 - between(0, 90), r: 5, fill: pick(["#f29cb2", "#ffffff"]) }, leaves);
  }
  bigPlant(40, 690);
  bigPlant(1570, 700);

  // ---------- 7. Paper grain over everything ----------
  el("rect", { x: 0, y: 0, width: 1600, height: 900, filter: "url(#r-paper)", style: "mix-blend-mode: multiply", opacity: 0.6 });
})();
