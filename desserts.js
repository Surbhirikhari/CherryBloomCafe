// =========================================================
// Cherry Blossom Cafe — desserts.js
// The desserts: their drawings, their tools, and their recipes.
// The Bakery Station (bakery.js) reads the recipes and runs them.
//
// Every recipe is a list of steps. Each step has a "type",
// which says how you do it with the mouse:
//   tap    - click the tool a few times          (add strawberries)
//   hold   - press and hold the tool, let go     (pour batter, pipe cream)
//            when it reaches the pink zone
//   timing - turn the tool on, watch the needle   (bake, toast, cook)
//            rise, press "Turn off!" in the golden zone
//   pipe   - hold the mouse down on the dessert:  (all the creams)
//            cream flows out where you are; let go in the pink zone
//   rub    - drag over the dessert to cover it     (sugar)
//   swipe  - drag in one direction              (fold, roll, slice)
// The last step is always "decorate" (decor.js).
//
// Each dessert has a draw(state) function. state tells it how far
// each step has got, so the picture changes while you work.
// =========================================================


// ---------- Little drawing helpers ----------
const DL = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

let dessertNumber = 0;                         // every drawing needs its own clip-path ids
function uid(name) { return name + "-" + dessertNumber++; }

function dessertSVG(inside) {
  return `<svg viewBox="0 0 200 200" class="art dessert-svg">${inside}</svg>`;
}

// How baked something is: 0 = raw dough, about 0.55 = golden, 1 = burnt
function bakeColor(t) {
  t = Math.max(0, Math.min(1, t));
  return t < 0.55
    ? mixColor("#f7e7bd", "#e6a85a", t / 0.55)
    : mixColor("#e6a85a", "#8a5432", (t - 0.55) / 0.45);
}

// half a strawberry, pointing down (rot 180 points it up)
function berryHalf(x, y, s = 1, rot = 0) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M0 25 Q-25 9 -23 -10 Q-19 -25 0 -19 Q19 -25 23 -10 Q25 9 0 25 Z" fill="#ec5574" ${DL}/>
      <path d="M0 17 Q-17 5 -15 -8 Q-11 -17 0 -13 Q11 -17 15 -8 Q17 5 0 17 Z" fill="#f9b3c0"/>
      <g fill="#fff3c4"><circle cx="-8" cy="-4" r="1.6"/><circle cx="8" cy="-4" r="1.6"/><circle cx="0" cy="8" r="1.5"/></g>
    </g>`;
}

// a little swirl of whipped cream
function puff(x, y, s = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-16 8 Q-20 -2 -10 -4 Q-12 -14 0 -14 Q4 -22 10 -12 Q20 -10 16 -2 Q22 6 14 10 Z" fill="#fffaf1" ${DL} stroke-width="2.5"/>
      <path d="M-8 2 Q2 6 10 0" fill="none" stroke="#e6dccb" stroke-width="2" stroke-linecap="round"/>
    </g>`;
}

// a spiral from the middle outwards (for the roll cake)
function spiralPath(cx, cy, rMax, turns) {
  let d = "";
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    const a = t * turns * Math.PI * 2;
    d += (i === 0 ? "M" : "L") + (cx + Math.cos(a) * rMax * t).toFixed(1) + " " + (cy + Math.sin(a) * rMax * t).toFixed(1) + " ";
  }
  return d;
}

// the spots you rubbed: a soft blob at each one
// (a mark can have its own size "r": flowing cream grows while you hold still)
function marksSVG(marks, color, r) {
  return marks.map((m) => `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${(m.r || r).toFixed(1)}" fill="${color}"/>`).join("");
}
// the same, with a soft outline so the cream looks thick
function creamMarksSVG(marks, color, r) {
  return `<g>${marks.map((m) => `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${((m.r || r) + 1.5).toFixed(1)}" fill="${mixColor(color, INK, 0.25)}"/>`).join("")}
          ${marksSVG(marks, color, r)}</g>`;
}

// a warm oven glow behind things that are baking
function ovenGlow(on) {
  if (!on) return "";
  return `
    <rect x="8" y="40" width="184" height="150" rx="24" fill="#f9c784" opacity="0.35"/>
    <g fill="none" stroke="#e8a05a" stroke-width="3" stroke-linecap="round" opacity="0.7">
      <path d="M60 52 Q54 42 60 32 Q66 22 60 12"/><path d="M100 48 Q94 38 100 28 Q106 18 100 8"/><path d="M140 52 Q134 42 140 32 Q146 22 140 12"/>
    </g>`;
}

// a round pink-rimmed plate
function plateSVG(cx = 100, cy = 104, rx = 94, ry = 94) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fffaf4" ${DL}/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 10}" ry="${ry - 10}" fill="none" stroke="#f6b8cb" stroke-width="3" stroke-dasharray="7 6"/>`;
}


// ================= 1. Strawberry Crêpe =================
// Pour batter in the pan, flip it when golden, spread cream,
// add strawberries, then fold it into a cone with a paper wrap.

function crepeArt(st) {
  const v = st.v;
  const shade = bakeColor(v.cook ?? 0);
  const edge = mixColor(shade, INK, 0.25);

  // in the pan
  if (!st.done("cook")) {
    const amount = v.batter || 0;
    const r = 8 + 64 * Math.min(amount, 1.15);
    const bubbles = st.step === "cook"
      ? [[78, 92], [118, 88], [98, 124], [68, 122], [128, 118], [96, 100]].map(([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="${edge}" stroke-width="1.5" opacity="${0.4 + (v.cook || 0) * 0.5}"/>`).join("")
      : "";
    return dessertSVG(`
      <rect x="150" y="150" width="60" height="18" rx="9" fill="#9b7766" ${DL} transform="rotate(38 150 159)"/>
      <circle cx="94" cy="102" r="88" fill="#6d6670" ${DL}/>
      <circle cx="94" cy="102" r="76" fill="#57515b"/>
      <path d="M36 62 Q56 34 94 28" stroke="#8d8692" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${amount > 0 ? `<circle cx="94" cy="102" r="${r}" fill="${shade}" ${DL} stroke-width="2.5"/>` : ""}
      ${amount > 1.02 ? `<path d="M30 140 Q20 160 34 166 Q44 158 40 146 Z" fill="${shade}" ${DL} stroke-width="2"/>` : ""}
      ${bubbles}`);
  }

  // on the plate: flat, folding, or folded
  const p = st.done("fold") ? 1 : (v.fold || 0);
  const hw = (y) => 64 * (190 - y) / 132;              // half the cone's width at height y
  let d = "";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const cx = 100 + 72 * Math.cos(a), cy = 104 + 72 * Math.sin(a);
    let tx, ty;
    if (Math.sin(a) < 0) {                              // the top edge of the cone
      tx = 100 + 64 * Math.cos(a); ty = 58 + 10 * Math.sin(a);
    } else {                                            // the two sides, down to the tip
      const u = a / Math.PI;                            // 0 at the right, 1 at the left
      if (u < 0.5) { tx = 164 + (100 - 164) * u * 2; ty = 58 + 132 * u * 2; }
      else         { tx = 100 + (36 - 100) * (u - 0.5) * 2; ty = 190 - 132 * (u - 0.5) * 2; }
    }
    d += (i === 0 ? "M" : "L") + (cx + (tx - cx) * p).toFixed(1) + " " + (cy + (ty - cy) * p).toFixed(1) + " ";
  }
  d += "Z";

  const clip = uid("crepe");
  const lift = -22 * p;                                 // the fillings rise as it folds
  const berries = [[64, 80, -12], [90, 70, 6], [116, 72, -4], [140, 80, 14]]
    .slice(0, Math.min(4, v.berries || 0))
    .map(([x, y, r]) => berryHalf(x, y + lift, 0.95, 180 + r)).join("");

  let cream;
  if (p > 0 || st.done("cream")) {
    cream = [[50, 80], [74, 72], [100, 68], [126, 72], [150, 80], [88, 84], [114, 84]]
      .map(([x, y]) => puff(x, y + lift, 1.1)).join("");
  } else {
    cream = `<g clip-path="url(#${clip})">${creamMarksSVG(st.marks.cream || [], "#fffaf1", 10)}</g>`;
  }

  const folded = p >= 1;
  const wrapClip = uid("wrap");
  const wrap = `M${100 - hw(112)} 112 L${100 + hw(134)} 134 L100 192 Z`;
  return dessertSVG(`
    ${folded ? "" : plateSVG()}
    <defs><clipPath id="${clip}"><path d="${d}"/></clipPath>
          <clipPath id="${wrapClip}"><path d="${wrap}"/></clipPath></defs>
    <path d="${d}" fill="${shade}" ${DL}/>
    ${!folded && p < 0.3 ? `<g fill="${edge}" opacity="0.35"><circle cx="70" cy="120" r="5"/><circle cx="124" cy="134" r="4"/><circle cx="100" cy="150" r="3"/><circle cx="140" cy="112" r="3"/></g>` : ""}
    ${cream}
    ${berries}
    ${folded ? `
      <path d="M${100 - hw(70)} 70 Q100 100 ${100 + hw(70)} 70 L100 190 Z" fill="${shade}" ${DL}/>
      <path d="M${100 - hw(70) + 6} 76 Q100 102 ${100 + hw(70) - 6} 76" fill="none" stroke="${edge}" stroke-width="2" stroke-dasharray="4 5"/>
      <path d="${wrap}" fill="#fff6f8" ${DL}/>
      <g clip-path="url(#${wrapClip})" stroke="#f08caa" stroke-width="7">
        ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<path d="M40 ${100 + k * 15} L170 ${126 + k * 15}"/>`).join("")}
      </g>
      <path d="${wrap}" fill="none" ${DL}/>` : ""}`);
}


// ================= 2. Strawberry Roll Cake =================
// Pour batter in the tray, bake it golden, spread strawberry cream,
// roll it up, then cut a slice to show the swirl.

function rollArt(st) {
  const v = st.v;
  const crust = bakeColor(v.bake ?? 0);
  const sponge = "#f8e3b0";

  // in the baking tray (seen from the side)
  if (!st.done("bake")) {
    const amount = v.batter || 0;
    const top = 156 - 34 * Math.min(amount, 1);
    const clip = uid("tray");
    return dessertSVG(`
      ${ovenGlow(st.step === "bake")}
      <g transform="translate(100 140) scale(1.25) translate(-100 -140)">
      <defs><clipPath id="${clip}"><path d="M30 116 L170 116 L162 156 L38 156 Z"/></clipPath></defs>
      <path d="M22 110 L178 110 L166 162 L34 162 Z" fill="#d7d5de" ${DL}/>
      <path d="M30 116 L170 116 L162 156 L38 156 Z" fill="#bdbac6"/>
      ${amount > 0 ? `<g clip-path="url(#${clip})"><rect x="0" y="${top}" width="200" height="60" fill="${crust}"/>
        <path d="M20 ${top} Q60 ${top - 3} 100 ${top} Q140 ${top + 3} 180 ${top}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/></g>` : ""}
      ${amount > 1.02 ? `<path d="M26 112 Q14 130 22 140 Q32 134 30 116 Z M174 112 Q186 130 178 140 Q168 134 170 116 Z" fill="${crust}" ${DL} stroke-width="2"/>` : ""}
      <path d="M22 110 L178 110" ${DL}/>
      <path d="M40 122 L46 150" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
      </g>`);
  }

  const board = `<rect x="10" y="150" width="180" height="22" rx="8" fill="#ebc592" ${DL}/>
                 <path d="M24 162 L176 162" stroke="#d29e68" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;

  // a flat sponge sheet, with cream, rolling up from the left
  if (!st.done("roll")) {
    const p = v.roll || 0;
    const x0 = 30 + 140 * p;
    const creamEnd = st.done("cream") ? 170 : x0;
    // flowing cream: the plate is zoomed by 1.2 here, so turn mouse spots into drawing spots
    const creamClip = uid("rollcream");
    const flowing = (st.marks.cream || []).map((m) => ({ x: 100 + (m.x - 100) / 1.2, y: 124, r: (m.r || 8) / 1.2 }));
    const r = p > 0 ? 10 + 30 * Math.sqrt(p) : 0;
    return dessertSVG(`<g transform="translate(100 150) scale(1.2) translate(-100 -150)">
      ${board}
      ${x0 < 170 ? `<rect x="${x0}" y="130" width="${170 - x0}" height="20" fill="${sponge}" ${DL}/>
        <path d="M${x0} 132 L170 132" stroke="${crust}" stroke-width="4"/>` : ""}
      ${creamEnd > x0 ? `<path d="M${x0} 131 L${x0} 122 Q${(x0 + creamEnd) / 2} 116 ${creamEnd} 122 L${creamEnd} 131 Z" fill="#f7b7c8" ${DL} stroke-width="2.5"/>
        ${[0.2, 0.45, 0.7].map((k) => `<circle cx="${x0 + (creamEnd - x0) * k}" cy="126" r="2" fill="#ec5574"/>`).join("")}` : ""}
      ${!st.done("cream") && flowing.length ? `<defs><clipPath id="${creamClip}"><rect x="30" y="96" width="140" height="35"/></clipPath></defs>
        <g clip-path="url(#${creamClip})">${creamMarksSVG(flowing, "#f7b7c8", 7)}</g>` : ""}
      ${r > 0 ? `<circle cx="${x0 - r + 6}" cy="${150 - r}" r="${r}" fill="${sponge}" ${DL}/>
        <path d="${spiralPath(x0 - r + 6, 150 - r, r - 4, 1 + 2 * p)}" fill="none" stroke="#f7a8c0" stroke-width="${3 + 3 * p}" stroke-linecap="round"/>
        <circle cx="${x0 - r + 6}" cy="${150 - r}" r="${r}" fill="none" stroke="${crust}" stroke-width="3"/>
        <circle cx="${x0 - r + 6}" cy="${150 - r}" r="${r + 1.5}" fill="none" ${DL}/>` : ""}</g>`);
  }

  // the whole roll on the board, waiting to be sliced
  if (!st.done("slice")) {
    const p = v.slice || 0;
    return dessertSVG(`
      ${board}
      <path d="M36 72 L146 72 L146 150 L36 150 Q24 150 24 138 L24 84 Q24 72 36 72 Z" fill="${crust}" ${DL}/>
      <path d="M40 90 Q80 84 130 90 M40 120 Q80 114 130 120" fill="none" stroke="${mixColor(crust, INK, 0.2)}" stroke-width="2" opacity="0.5"/>
      <circle cx="146" cy="111" r="39" fill="${sponge}" ${DL}/>
      <path d="${spiralPath(146, 111, 33, 2.6)}" fill="none" stroke="#f7a8c0" stroke-width="7" stroke-linecap="round"/>
      <circle cx="146" cy="111" r="37" fill="none" stroke="${crust}" stroke-width="4"/>
      <circle cx="146" cy="111" r="39" fill="none" ${DL}/>
      <path d="M104 66 L104 ${66 + 90 * p}" stroke="${INK}" stroke-width="3" stroke-dasharray="6 4"/>`);
  }

  // one slice, standing up, showing the swirl
  return dessertSVG(`
    <ellipse cx="100" cy="176" rx="76" ry="9" fill="#e9d6cf" opacity="0.7"/>
    <circle cx="86" cy="114" r="62" fill="${crust}" ${DL}/>
    <rect x="86" y="52" width="18" height="124" fill="${crust}"/>
    <path d="M86 52 L104 52 M86 176 L104 176" ${DL}/>
    <circle cx="104" cy="114" r="62" fill="${sponge}" ${DL}/>
    <path d="${spiralPath(104, 114, 50, 2.4)}" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="${spiralPath(104, 114, 50, 2.4)}" fill="none" stroke="#f7a8c0" stroke-width="11" stroke-linecap="round"/>
    <circle cx="104" cy="114" r="58" fill="none" stroke="${crust}" stroke-width="7"/>
    <circle cx="104" cy="114" r="62" fill="none" ${DL}/>
    <g fill="#ec5574" opacity="0.6"><rect x="84" y="96" width="6" height="4" rx="2"/><rect x="122" y="128" width="6" height="4" rx="2"/><rect x="96" y="140" width="5" height="4" rx="2"/></g>`);
}


// ================= 3. Strawberry Cream Toast =================
// Toast the bread golden, spread pink cream, drizzle honey,
// then decorate with heart-shaped strawberry slices and daisies.

const BREAD = "M44 64 Q40 30 76 32 Q100 18 124 32 Q160 30 156 64 L154 166 Q154 176 144 176 L56 176 Q46 176 46 166 Z";
const CRUMB = "M56 70 Q54 44 80 44 Q100 32 120 44 Q146 44 144 70 L142 158 Q142 164 136 164 L64 164 Q58 164 58 158 Z";

function toastArt(st) {
  const v = st.v;
  const t = v.toast ?? 0;
  const crust = bakeColor(Math.min(1, 0.35 + t * 0.8));
  const crumb = bakeColor(t * 0.75);

  const bread = `
    <path d="${BREAD}" fill="${crust}" ${DL}/>
    <path d="${CRUMB}" fill="${crumb}"/>
    <g fill="${mixColor(crumb, INK, 0.15)}" opacity="0.4"><circle cx="80" cy="90" r="2"/><circle cx="118" cy="104" r="2"/><circle cx="94" cy="132" r="2"/><circle cx="126" cy="146" r="1.6"/></g>`;

  // still in the pink toaster
  if (!st.done("toast")) {
    return dessertSVG(`
      <g transform="translate(0 6)">${bread}</g>
      ${st.step === "toast" ? `<path d="M40 108 L160 108" stroke="#f39a4b" stroke-width="6" stroke-linecap="round" opacity="0.6"/>` : ""}
      <rect x="26" y="104" width="148" height="88" rx="28" fill="#f6b8cb" ${DL}/>
      <rect x="40" y="100" width="120" height="10" rx="5" fill="#e58aa5" ${DL} stroke-width="2.5"/>
      <path d="M40 128 Q42 118 54 118" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <path d="M100 166 Q90 158 92 151 Q95 146 100 150 Q105 146 108 151 Q110 158 100 166 Z" fill="#fffaf4" ${DL} stroke-width="2"/>
      <rect x="174" y="120" width="12" height="30" rx="5" fill="#e58aa5" ${DL} stroke-width="2.5"/>
      <circle cx="58" cy="158" r="7" fill="#fffaf4" ${DL} stroke-width="2"/>`);
  }

  const clip = uid("toast");
  const honey = Math.min(1, (v.honey || 0) / 0.9);
  return dessertSVG(`
    <ellipse cx="100" cy="182" rx="80" ry="10" fill="#e9d6cf" opacity="0.7"/>
    ${bread}
    <defs><clipPath id="${clip}"><path d="${CRUMB}"/></clipPath></defs>
    <g clip-path="url(#${clip})">
      ${st.done("spread") ? `<path d="${CRUMB}" fill="#fbd3de"/>` : creamMarksSVG(st.marks.spread || [], "#fbd3de", 12)}
    </g>
    ${st.done("spread") ? `<path d="M66 60 Q90 52 110 60" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>` : ""}
    ${(v.honey || 0) > 0 ? `<path d="M62 70 L138 82 L64 98 L138 112 L66 128 L136 142 L72 156" fill="none" stroke="#e8a83a" stroke-width="5"
        stroke-linecap="round" stroke-linejoin="round" pathLength="100" stroke-dasharray="${(honey * 100).toFixed(1)} 200" opacity="0.9"/>` : ""}
    ${(v.honey || 0) > 1.02 ? `<path d="M70 166 Q60 182 76 186 Q96 188 92 172 Z" fill="#f2c157" ${DL} stroke-width="2"/>` : ""}`);
}


// ================= 4. Strawberry Croissant =================
// Bake the croissant golden, slice it open, pipe in cream,
// add strawberries, then dust it with powdered sugar.

function croissantArt(st) {
  const v = st.v;
  const shade = bakeColor(v.bake ?? 0);
  const deep = mixColor(shade, INK, 0.2);

  const seg = (cx, cy, rx, ry, rot) => `
    <g transform="rotate(${rot} ${cx} ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${shade}" ${DL}/>
      <path d="M${cx - rx * 0.6} ${cy - ry * 0.5} Q${cx} ${cy - ry * 0.2} ${cx + rx * 0.6} ${cy - ry * 0.5}
               M${cx - rx * 0.7} ${cy + ry * 0.2} Q${cx} ${cy + ry * 0.5} ${cx + rx * 0.7} ${cy + ry * 0.2}" fill="none" stroke="${deep}" stroke-width="2" opacity="0.6"/>
    </g>`;
  const body = seg(34, 130, 18, 20, -50) + seg(166, 130, 18, 20, 50) +
               seg(64, 118, 28, 34, -25) + seg(136, 118, 28, 34, 25) + seg(100, 112, 36, 44, 0);

  const opened = st.done("slice");
  const cream = Math.min(1.15, v.cream || 0);
  const cw = 64;
  const berries = [[66, 90, -14], [90, 82, 4], [114, 82, -6], [138, 90, 12]]
    .slice(0, Math.min(4, v.berries || 0))
    .map(([x, y, r]) => berryHalf(x, y, 0.9, 180 + r)).join("");

  const dots = [[0, 0], [6, 4], [-5, 5], [3, -6], [-6, -3]];
  const sugar = st.done("sugar")
    ? [[60, 116], [80, 130], [100, 140], [124, 128], [146, 116], [40, 132], [160, 132], [90, 150], [114, 152], [70, 104], [132, 104]]
    : (st.marks.sugar || []).map((m) => [m.x, m.y]);
  const sugarDots = sugar.map(([x, y]) => dots.map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.8" fill="#ffffff"/>`).join("")).join("");

  return dessertSVG(`
    ${ovenGlow(st.step === "bake")}
    ${st.step === "bake" || !st.done("bake") ? "" : plateSVG(100, 128, 96, 58)}
    ${body}
    <path d="M58 92 Q70 100 82 94 M118 94 Q130 100 142 92" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    ${!opened && (v.slice || 0) > 0 ? `<path d="M40 100 L${40 + 120 * v.slice} 100" stroke="${INK}" stroke-width="3" stroke-dasharray="6 4"/>` : ""}
    ${opened ? `<path d="M36 100 Q100 116 164 100 Q100 86 36 100 Z" fill="#f8e3b0" ${DL}/>` : ""}
    ${opened && !st.done("cream") ? (st.marks.cream || []).map((m) =>
        puff(Math.max(46, Math.min(154, m.x)), Math.max(86, Math.min(100, m.y)), Math.min(1.3, (m.r || 8) / 10))).join("") : ""}
    ${st.done("cream") ? `<path d="M${100 - cw} 100 Q${100 - cw} 84 ${100 - cw / 2} 88 Q${100 - cw / 4} 76 100 82 Q${100 + cw / 4} 76 ${100 + cw / 2} 88 Q${100 + cw} 84 ${100 + cw} 100 Q100 110 ${100 - cw} 100 Z" fill="#fffaf1" ${DL} stroke-width="2.5"/>` : ""}
    ${cream > 1.02 ? `<path d="M50 104 Q44 122 54 126 Q62 120 58 106 Z M150 104 Q156 122 146 126 Q138 120 142 106 Z" fill="#fffaf1" ${DL} stroke-width="2"/>` : ""}
    ${berries}
    ${sugarDots}`);
}


// ---------- Tools (the things on the shelf) ----------
const T = (inside) => `<svg viewBox="0 0 80 80" class="art">${inside}</svg>`;

const TOOL_ART = {
  batter: () => T(`
    <path d="M10 40 L70 40 Q68 70 40 70 Q12 70 10 40 Z" fill="#f6b8cb" ${DL}/>
    <ellipse cx="40" cy="40" rx="30" ry="7" fill="#f7e7bd" ${DL}/>
    <path d="M52 38 L70 8" ${DL} stroke-width="5"/><path d="M52 38 L70 8" stroke="#c9967a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M18 52 Q24 62 34 64" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`),
  spatula: () => T(`
    <path d="M12 30 L44 22 L48 42 L16 50 Z" fill="#eef3f5" ${DL}/>
    <path d="M22 34 L40 30 M24 42 L42 38" stroke="#b8c4ca" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M47 33 L74 56" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M47 33 L74 56" stroke="#e57c8f" stroke-width="5" stroke-linecap="round"/>`),
  piping: () => T(`
    <path d="M14 12 L62 12 L44 58 L32 58 Z" fill="#fffaf1" ${DL}/>
    <path d="M14 12 L62 12 L56 26 L20 26 Z" fill="#f6b8cb" ${DL}/>
    <path d="M32 58 L44 58 L40 70 L36 70 Z" fill="#d7d5de" ${DL}/>
    <path d="M26 30 L34 52" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`),
  berries: () => T(`
    <path d="M8 44 L72 44 Q70 72 40 72 Q10 72 8 44 Z" fill="#fffaf4" ${DL}/>
    ${berryHalf(26, 36, 0.55, 190)}${berryHalf(54, 36, 0.55, 170)}${berryHalf(40, 28, 0.6, 180)}
    <path d="M8 44 L72 44" ${DL}/>`),
  fold: () => T(`
    <path d="M14 30 L66 30 L40 74 Z" fill="#f2c98a" ${DL}/>
    <path d="M24 30 L32 52 L40 30 L48 52 L56 30" fill="none" stroke="#f08caa" stroke-width="3"/>
    <path d="M40 24 L40 6 M30 14 L40 4 L50 14" fill="none" ${DL} stroke-width="3.5"/>`),
  oven: () => T(`
    <rect x="8" y="12" width="64" height="58" rx="10" fill="#f6b8cb" ${DL}/>
    <rect x="16" y="28" width="48" height="34" rx="6" fill="#f9c784" ${DL} stroke-width="2.5"/>
    <path d="M22 36 L30 36" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="22" cy="20" r="3" fill="#fffaf4" ${DL} stroke-width="1.5"/><circle cx="34" cy="20" r="3" fill="#fffaf4" ${DL} stroke-width="1.5"/>
    <path d="M48 20 L62 20" ${DL} stroke-width="3"/>`),
  toaster: () => T(`
    <path d="M24 32 L24 18 Q24 12 32 12 L48 12 Q56 12 56 18 L56 32 Z" fill="#f2c98a" ${DL}/>
    <rect x="8" y="28" width="64" height="44" rx="16" fill="#f6b8cb" ${DL}/>
    <path d="M40 58 Q34 54 35 50 Q37 47 40 49 Q43 47 45 50 Q46 54 40 58 Z" fill="#fffaf4" ${DL} stroke-width="1.5"/>
    <rect x="70" y="40" width="6" height="14" rx="3" fill="#e58aa5" ${DL} stroke-width="2"/>`),
  knife: () => T(`
    <path d="M8 46 Q14 30 54 32 L54 46 Z" fill="#eef3f5" ${DL}/>
    <path d="M16 42 Q22 36 46 36" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <rect x="52" y="34" width="22" height="14" rx="5" fill="#e57c8f" ${DL}/>`),
  roll: () => T(`
    <circle cx="28" cy="44" r="18" fill="#f8e3b0" ${DL}/>
    <path d="${spiralPath(28, 44, 14, 2)}" fill="none" stroke="#f7a8c0" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M46 52 L72 52" ${DL} stroke-width="8"/><path d="M46 52 L72 52" stroke="#f8e3b0" stroke-width="3.5"/>
    <path d="M50 22 L72 22 M64 14 L72 22 L64 30" fill="none" ${DL} stroke-width="3.5"/>`),
  honey: () => T(`
    <path d="M16 46 Q16 74 40 74 Q64 74 64 46 Q64 32 40 32 Q16 32 16 46 Z" fill="#f2c157" ${DL}/>
    <rect x="24" y="22" width="32" height="12" rx="4" fill="#d99a3b" ${DL}/>
    <path d="M58 22 L70 8" fill="none" ${DL}/>
    <path d="M26 48 Q40 54 54 48" fill="none" stroke="#fbe3a0" stroke-width="3" stroke-linecap="round"/>`),
  sifter: () => T(`
    <path d="M12 26 L68 26 L58 56 L22 56 Z" fill="#eef3f5" ${DL}/>
    <path d="M18 34 L62 34 M20 42 L60 42 M22 50 L58 50" stroke="#b8c4ca" stroke-width="2" stroke-dasharray="3 3"/>
    <path d="M68 30 L78 22" ${DL} stroke-width="4"/>
    <g fill="#ffffff" ${DL} stroke-width="1"><circle cx="30" cy="66" r="2.5"/><circle cx="42" cy="72" r="2.5"/><circle cx="52" cy="64" r="2.5"/></g>`),
  decorate: () => sliceSVG(),
};


// ---------- The recipes ----------
// For "hold" steps, the amount goes up while you hold: let go inside "target".
// For "timing" steps, press the stop button while the needle is inside "zone".
// For "pipe" steps, the cream amount goes up while you hold: let go inside "target".
// For "pipe" and "rub" steps, "area" is where on the drawing it goes (0–200 across and down).
const DECORATE = (hint) => ({ id: "decorate", type: "decorate", tool: "decorate", text: "Decorate!", hint });

const DESSERTS = {
  crepe: {
    name: "Strawberry Crêpe",
    draw: crepeArt,
    tray: ["bunny", "pocky", "choco", "cream"],
    steps: [
      { id: "batter", type: "hold", tool: "batter", text: "Pour the batter (hold)", target: [0.72, 0.95], max: 1.15, speed: 0.42,
        hint: "Hold the batter bowl to pour. Let go when the batter almost fills the pan, inside the pink zone." },
      { id: "cook", type: "timing", tool: "spatula", text: "Flip when golden", zone: [0.42, 0.68],
        start: "Cook it", stop: "Flip!",
        hint: "Click the spatula to start cooking. Press Flip! when the needle reaches the green zone." },
      { id: "cream", type: "pipe", tool: "piping", text: "Pipe the cream", area: { cx: 100, cy: 80, rx: 62, ry: 30 },
        target: [0.55, 0.85], max: 1.1, speed: 0.3,
        hint: "Hold the mouse down on the top of the crêpe and the cream flows out. Move it around! Let go in the pink zone." },
      { id: "berries", type: "tap", tool: "berries", times: 4, text: "Add 4 strawberries",
        hint: "Click the strawberry bowl 4 times." },
      { id: "fold", type: "swipe", tool: "fold", dir: [0, -1], text: "Fold into a cone",
        hint: "Drag upwards on the crêpe to fold it into a cone." },
      DECORATE("Add a bunny cookie, pocky sticks and a chocolate drizzle! Press Done when it's cute."),
    ],
  },

  roll: {
    name: "Strawberry Roll Cake",
    draw: rollArt,
    tray: ["cream", "berry", "heart", "sakura"],
    steps: [
      { id: "batter", type: "hold", tool: "batter", text: "Pour the batter (hold)", target: [0.75, 0.95], max: 1.15, speed: 0.42,
        hint: "Hold the batter bowl. Let go when the tray is nearly full, inside the pink zone." },
      { id: "bake", type: "timing", tool: "oven", text: "Bake until golden", zone: [0.42, 0.66],
        start: "Turn on", stop: "Turn off!",
        hint: "Click the oven to turn it on. Press Turn off! when the needle reaches the green zone." },
      { id: "cream", type: "pipe", tool: "piping", text: "Pipe strawberry cream", area: { x: 16, y: 96, w: 168, h: 44 },
        target: [0.55, 0.85], max: 1.1, speed: 0.3,
        hint: "Hold the mouse down on the sponge and drag along it. The pink cream flows out! Let go in the pink zone." },
      { id: "roll", type: "swipe", tool: "roll", dir: [1, 0], text: "Roll it up",
        hint: "Drag to the right to roll the cake up, nice and tight." },
      { id: "slice", type: "swipe", tool: "knife", dir: [0, 1], text: "Cut a slice",
        hint: "Drag downwards over the roll to cut a slice." },
      DECORATE("Chop strawberries and add cream on top, like a little crown. Press Done when it's cute."),
    ],
  },

  toast: {
    name: "Strawberry Cream Toast",
    draw: toastArt,
    tray: ["daisy", "heart", "mint", "cream"],
    steps: [
      { id: "toast", type: "timing", tool: "toaster", text: "Toast until golden", zone: [0.4, 0.66],
        start: "Push down", stop: "Pop up!",
        hint: "Click the toaster to start. Press Pop up! when the needle reaches the green zone." },
      { id: "spread", type: "pipe", tool: "piping", text: "Pipe pink cream", area: { x: 56, y: 40, w: 90, h: 126 },
        target: [0.6, 0.9], max: 1.15, speed: 0.28,
        hint: "Hold the mouse down on the toast and move around: the pink cream flows out. Let go in the pink zone." },
      { id: "honey", type: "hold", tool: "honey", text: "Drizzle honey (hold)", target: [0.6, 0.9], max: 1.1, speed: 0.4,
        hint: "Hold the honey jar to drizzle. Let go inside the pink zone." },
      DECORATE("Chop strawberries (they're heart-shaped!) and add little daisies. Press Done when it's cute."),
    ],
  },

  croissant: {
    name: "Strawberry Croissant",
    draw: croissantArt,
    tray: ["cream", "mint", "heart", "choco"],
    steps: [
      { id: "bake", type: "timing", tool: "oven", text: "Bake until golden", zone: [0.45, 0.7],
        start: "Turn on", stop: "Turn off!",
        hint: "Click the oven to turn it on. Press Turn off! when the needle reaches the green zone." },
      { id: "slice", type: "swipe", tool: "knife", dir: [1, 0], text: "Slice it open",
        hint: "Drag from left to right along the croissant to slice it open." },
      { id: "cream", type: "pipe", tool: "piping", text: "Pipe the cream", area: { cx: 100, cy: 94, rx: 66, ry: 22 },
        target: [0.6, 0.9], max: 1.15, speed: 0.32,
        hint: "Hold the mouse down inside the croissant and drag along: the cream flows out. Let go in the pink zone." },
      { id: "berries", type: "tap", tool: "berries", times: 4, text: "Add 4 strawberries",
        hint: "Click the strawberry bowl 4 times." },
      { id: "sugar", type: "rub", tool: "sifter", text: "Dust with sugar", area: { cx: 100, cy: 120, rx: 70, ry: 36 },
        hint: "Rub over the croissant to dust it with powdered sugar." },
      DECORATE("Add some finishing touches. Press Done when it's cute."),
    ],
  },
};

// The finished dessert, made perfectly (for the thought cloud and the recipe card).
function perfectDessertArt(id) {
  const recipe = DESSERTS[id];
  const v = {};
  recipe.steps.forEach(function (s) {
    if (s.type === "hold" || s.type === "pipe") v[s.id] = (s.target[0] + s.target[1]) / 2;
    else if (s.type === "timing") v[s.id] = (s.zone[0] + s.zone[1]) / 2;
    else if (s.type === "tap") v[s.id] = s.times;
    else v[s.id] = 1;
  });
  return recipe.draw({ v, marks: {}, step: "finished", done: () => true });
}
