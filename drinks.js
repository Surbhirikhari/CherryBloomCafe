// =========================================================
// Cherry Blossom Cafe — drinks.js
// Hands-on recipes for the drinks: Strawberry Milk, Sakura Tea
// and Honey Coffee. They work exactly like the desserts (see
// desserts.js), so the Bakery Station runs them too.
//
// New kinds of steps here:
//   stir    - drag side to side on the drink, like stirring with a spoon
//   drop, pour, drizzle - pick a tool up off the shelf and use it over
//                         the glass (Sakura Tea; see bakery.js)
// =========================================================


// ---------- A tall glass (Strawberry Milk) and a glass mug (Sakura Tea) ----------
const TALL_GLASS = "M50 40 L150 40 L140 184 Q139 192 130 192 L70 192 Q61 192 60 184 Z";

function glassFront(clip) {
  return `
    <path d="M62 52 L70 178" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.6"/>
    <path d="${TALL_GLASS}" fill="none" ${DL} stroke-width="3.5"/>
    <ellipse cx="100" cy="40" rx="50" ry="6" fill="none" ${DL} stroke-width="2.5"/>`;
}

function iceCube(x, y, rot) {
  return `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="5" fill="#f4fbfd" stroke="${INK}" stroke-width="2"
            opacity="0.92" transform="rotate(${rot} ${x} ${y})"/>
          <path d="M${x - 6} ${y - 5} L${x - 1} ${y - 7}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" transform="rotate(${rot} ${x} ${y})"/>`;
}


// ================= Strawberry Milk =================
// Mash strawberries, add ice, pour milk, stir until it's all pink.
function strawberryMilkArt(st) {
  const v = st.v;
  const clip = uid("smilk");
  const mash = st.done("mash") ? 1 : Math.min(1, v.mash || 0);
  const pureeTop = 190 - 36 * mash;
  const milk = Math.min(v.milk || 0, 1.12);
  const milkTop = pureeTop - (pureeTop - 46) * Math.min(milk, 1);
  const mix = st.done("stir") ? 1 : (v.stir || 0);

  const pink = "#f7b5c6";
  const milkColor = mixColor("#fbf0dc", pink, mix);
  const pureeColor = mixColor("#ec5574", pink, mix);

  const ices = [[82, 0, -12], [116, 6, 14], [98, 16, 4], [74, 20, 20], [124, 22, -8], [100, -6, 30]].slice(0, Math.min(6, v.ice || 0)).map(([x, dy, r], k) =>
    iceCube(x, milk > 0 ? milkTop + 12 + dy : pureeTop - 12 - k * 20, r)).join("");


  return dessertSVG(`
    <defs><clipPath id="${clip}"><path d="${TALL_GLASS}"/></clipPath></defs>
    <ellipse cx="100" cy="194" rx="62" ry="7" fill="#e9d6cf" opacity="0.7"/>
    ${st.done("stir") || st.step === "finished" ? `
      <path d="M118 60 L146 6" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M118 60 L146 6" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <path d="M121 54 L124 48 M128 40 L131 34 M135 26 L138 20" stroke="#f08caa" stroke-width="6"/>` : ""}
    <path d="${TALL_GLASS}" fill="#eef6f7" opacity="0.7"/>
    <g clip-path="url(#${clip})">
      ${milk > 0 ? `<rect x="0" y="${milkTop}" width="200" height="${pureeTop - milkTop + 2}" fill="${milkColor}"/>
        <path d="M40 ${milkTop + 1} Q70 ${milkTop + 5} 100 ${milkTop + 1} Q130 ${milkTop - 3} 160 ${milkTop + 1}" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.7"/>` : ""}
      ${mash > 0 ? `<rect x="0" y="${pureeTop}" width="200" height="60" fill="${pureeColor}"/>
        <path d="M40 ${pureeTop} Q60 ${pureeTop - 5} 80 ${pureeTop} Q100 ${pureeTop + 5} 120 ${pureeTop} Q140 ${pureeTop - 5} 160 ${pureeTop}"
              fill="none" stroke="${mixColor(pureeColor, INK, 0.2)}" stroke-width="2" opacity="${1 - mix}"/>
        <g fill="#fff3c4" opacity="${1 - mix * 0.6}"><circle cx="80" cy="${pureeTop + 12}" r="1.8"/><circle cx="104" cy="${pureeTop + 20}" r="1.8"/><circle cx="122" cy="${pureeTop + 10}" r="1.8"/></g>` : ""}
      ${mix > 0 && mix < 1 ? `<path d="M60 ${(milkTop + pureeTop) / 2} Q100 ${pureeTop - 30} 140 ${(milkTop + pureeTop) / 2}" fill="none" stroke="${pureeColor}" stroke-width="6" opacity="0.5"/>` : ""}
      ${ices}
    </g>
    ${milk > 1.02 ? `<path d="M50 42 Q42 70 48 84 Q56 74 54 46 Z M150 42 Q158 70 152 84 Q144 74 146 46 Z" fill="${milkColor}" ${DL} stroke-width="2"/>` : ""}
    ${glassFront(clip)}
    ${st.flow ? pourStream(st.flow, milk > 0 ? milkTop : pureeTop, "#fbf0dc", 8) : ""}`);
}


// ================= Sakura Tea =================
// Everything is carried over to the glass, one tool at a time:
// drop in 3 flowers, pour hot water up to the heart marker,
// stir with a spoon until it's pink, then drip honey wherever you like.
const MUG = "M46 56 L154 56 L148 178 Q146 190 134 190 L66 190 Q54 190 52 178 Z";

function teaColor(t) {
  return t < 0.55 ? mixColor("#eef6f7", "#f6b3c4", t / 0.55) : mixColor("#f6b3c4", "#c9506f", (t - 0.55) / 0.45);
}

function blossom(x, y, s = 1) {
  let petals = "";
  for (let k = 0; k < 5; k++) petals += `<ellipse cx="0" cy="-8" rx="5.5" ry="8" fill="#f9c5d2" ${DL} stroke-width="2" transform="rotate(${k * 72})"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${petals}<circle r="3.5" fill="#f6d76b" ${DL} stroke-width="1.5"/></g>`;
}

// the heart marker on the glass: pour up to here
const TEA_MARK = 0.79;
const teaLevel = (amount) => 188 - 130 * amount;

function sakuraTeaArt(st) {
  const v = st.v;
  const clip = uid("tea");
  const water = Math.min(v.water || 0, 1.15);
  const top = teaLevel(Math.min(water, 1));
  const stir = st.done("stir") ? 1 : (v.stir || 0);
  const color = teaColor(0.06 + stir * 0.49);           // stirring turns it pink
  const spin = stir * 14;                                // the flowers swirl while you stir

  const flowers = [[78, 0], [104, 8], [128, -2], [90, 14], [116, -8], [66, 10]].slice(0, Math.min(6, v.blossoms || 0)).map(([x, dy], k) =>
    water > 0
      ? blossom(x + Math.sin(spin + k * 2.1) * 12, top + 6 + dy * 0.4, 1.05)
      : blossom(x, 176 - dy, 1.05)).join("");

  // honey: a golden ribbon from where it dripped, sinking to a little pool
  const honeyMarks = st.marks.honey || [];
  const ribbons = water > 0 ? honeyMarks.map((m) => {
    const x = Math.max(54, Math.min(146, m.x));
    return `<path d="M${x} ${top} Q${x + 8} ${(top + 180) / 2} ${x - 4} 182" fill="none" stroke="#e8a83a" stroke-width="${(m.r * 0.7).toFixed(1)}" stroke-linecap="round" opacity="0.5"/>
            <circle cx="${x}" cy="${top + 2}" r="${m.r.toFixed(1)}" fill="#f2c157" opacity="0.9"/>`;
  }).join("") : "";
  const pool = Math.min(1, (v.honey || 0) / 0.8);

  // what's pouring right now: hot water from the kettle, or honey from the dipper
  let stream = "";
  if (st.flow) {
    const fx = st.flow.x, fy = Math.min(st.flow.y, top - 4);
    const honeyNow = st.step === "honey";
    stream = `<path d="M${fx} ${fy} L${fx} ${top}" stroke="${INK}" stroke-width="${honeyNow ? 6 : 10}" stroke-linecap="round" opacity="0.8"/>
              <path d="M${fx} ${fy} L${fx} ${top}" stroke="${honeyNow ? "#f2c157" : "#e6f4f8"}" stroke-width="${honeyNow ? 3.5 : 7}" stroke-linecap="round"/>
              ${honeyNow ? "" : `<ellipse cx="${fx}" cy="${top}" rx="10" ry="3" fill="#ffffff" opacity="0.8"/>`}`;
  }

  const markY = teaLevel(TEA_MARK);
  const showMark = !st.done("water");
  return dessertSVG(`
    <defs><clipPath id="${clip}"><path d="${MUG}"/></clipPath></defs>
    <ellipse cx="100" cy="194" rx="66" ry="7" fill="#e9d6cf" opacity="0.7"/>
    ${water > 1.01 ? `<ellipse cx="100" cy="194" rx="${70 + (water - 1) * 200}" ry="${7 + (water - 1) * 30}" fill="#dff0f5" ${DL} stroke-width="2" opacity="0.9"/>` : ""}
    <path d="M152 80 Q186 80 184 112 Q182 144 148 144" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
    <path d="M152 80 Q186 80 184 112 Q182 144 148 144" fill="none" stroke="#eef6f7" stroke-width="7" stroke-linecap="round"/>
    <path d="${MUG}" fill="#eef6f7" opacity="0.7"/>
    <g clip-path="url(#${clip})">
      ${water > 0 ? `<rect x="0" y="${top}" width="200" height="200" fill="${color}"/>
        <path d="M44 ${top + 1} Q72 ${top + 5} 100 ${top + 1} Q128 ${top - 3} 156 ${top + 1}" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.7"/>` : ""}
      ${pool > 0 ? `<ellipse cx="100" cy="190" rx="${50 * pool}" ry="${6 + 6 * pool}" fill="#f2c157" opacity="0.8"/>` : ""}
      ${ribbons}
      ${flowers}
    </g>
    ${water > 1.01 ? `<path d="M46 58 Q36 96 44 120 Q54 104 50 60 Z M154 58 Q162 90 156 110 Q148 98 150 60 Z" fill="#dff0f5" ${DL} stroke-width="2"/>` : ""}
    ${water > 0 && !st.flow ? `<g fill="none" stroke="#c9c6cf" stroke-width="3" stroke-linecap="round" opacity="0.7">
        <path d="M80 44 Q74 34 80 24 Q86 14 80 4"/><path d="M118 44 Q112 34 118 24 Q124 14 118 4"/></g>` : ""}
    <path d="M58 68 L66 176" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.6"/>
    ${showMark ? `<path d="M52 ${markY} L148 ${markY}" stroke="#e1658e" stroke-width="2.5" stroke-dasharray="7 5"/>
      <path d="M38 ${markY + 6} Q28 ${markY} 30 ${markY - 4} Q33 ${markY - 9} 38 ${markY - 4} Q43 ${markY - 9} 46 ${markY - 4} Q48 ${markY} 38 ${markY + 6} Z" fill="#f47c9c" ${DL} stroke-width="2"/>` : ""}
    <path d="${MUG}" fill="none" ${DL} stroke-width="3.5"/>
    <ellipse cx="100" cy="56" rx="54" ry="6" fill="none" ${DL} stroke-width="2.5"/>
    ${stream}`);
}


// ---------- Things you carry (their "tip" is where the pointer holds them) ----------
const CARRY_ART = {
  flower: { size: 0.15, tip: [0.5, 0.5], art: () => `<svg viewBox="-20 -20 40 40" class="art">${blossom(0, 0, 1.4)}</svg>` },
  kettle: { size: 0.44, tip: [0.95, 0.29], tilt: 38, art: () => teaKettleSVG() },
  spoon:  { size: 0.1, tip: [0.5, 0.92], art: () => `
    <svg viewBox="0 0 24 130" class="art">
      <path d="M12 4 L12 100" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M12 4 L12 100" stroke="#d7d5de" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="12" cy="112" rx="9" ry="14" fill="#d7d5de" ${DL} stroke-width="2.5"/>
      <path d="M8 104 Q9 100 12 99" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </svg>` },
  dipper: { size: 0.1, tip: [0.5, 0.97], art: () => honeyDipperSVG() },
  batterBowl: { size: 0.34, tip: [0.9, 0.5], tilt: 42, art: () => TOOL_ART.batter() },
  piping:     { size: 0.25, tip: [0.48, 0.88], art: () => TOOL_ART.piping() },
  berry:      { size: 0.14, tip: [0.5, 0.5], art: () => `<svg viewBox="-28 -28 56 56" class="art">${berryHalf(0, 0, 1, 180)}</svg>` },
  knife:      { size: 0.34, tip: [0.14, 0.58], art: () => TOOL_ART.knife() },
  sifter:     { size: 0.26, tip: [0.5, 0.72], art: () => TOOL_ART.sifter() },
  masher:     { size: 0.32, tip: [0.5, 0.72], art: () => TOOL_ART.masher() },
  ice:        { size: 0.12, tip: [0.5, 0.5], art: () => `<svg viewBox="-14 -14 28 28" class="art">${iceCube(0, 0, -10)}</svg>` },
  milkBottle: { size: 0.24, tip: [0.5, 0.06], tilt: 130, art: () => milkBottleSVG() },
  pitcher:    { size: 0.22, tip: [0.14, 0.2], tilt: -38, art: () => TOOL_ART.pitcher() },
  scoop:      { size: 0.2,  tip: [0.12, 0.55], art: () => TOOL_ART.scoop() },
  whisk:      { size: 0.16, tip: [0.5, 0.92], art: () => whiskSVG() },
  matchaBowl: { size: 0.46, tip: [0.97, 0.27], tilt: 48, art: () => matchaBowlSVG({ powder: 2, water: true, froth: 100 }) },
  creamJar:   { size: 0.22, tip: [0.16, 0.29], tilt: -62, art: () => strawberryCreamSVG() },
};

// a little pink kettle; the spout tip is at the top right
function teaKettleSVG() {
  return `
    <svg viewBox="0 0 120 90" class="art">
      <path d="M30 40 Q14 40 14 56 Q14 70 30 70" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M30 40 Q14 40 14 56 Q14 70 30 70" fill="none" stroke="#e58aa5" stroke-width="4" stroke-linecap="round"/>
      <path d="M78 52 Q96 46 114 26 L108 24 Q94 38 76 44 Z" fill="#f6b8cb" ${DL} stroke-width="2.5"/>
      <path d="M26 84 Q22 34 54 32 Q86 34 82 84 Z" fill="#f6b8cb" ${DL}/>
      <ellipse cx="54" cy="32" rx="20" ry="5" fill="#e58aa5" ${DL} stroke-width="2.5"/>
      <circle cx="54" cy="24" r="5" fill="#fffaf4" ${DL} stroke-width="2"/>
      <path d="M36 50 Q34 64 38 76" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <path d="M54 66 Q46 60 47 55 Q49 51 54 54 Q59 51 61 55 Q62 60 54 66 Z" fill="#fffaf4" ${DL} stroke-width="1.8"/>
    </svg>`;
}

// a honey dipper with a drop on the end
function honeyDipperSVG() {
  return `
    <svg viewBox="0 0 30 124" class="art">
      <path d="M15 4 L15 80" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M15 4 L15 80" stroke="#c9967a" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="15" cy="96" rx="12" ry="17" fill="#e9b25a" ${DL} stroke-width="2.5"/>
      <path d="M4 88 L26 88 M3 96 L27 96 M4 104 L26 104" stroke="#b97a2e" stroke-width="2"/>
      <path d="M15 112 Q11 118 15 122 Q19 118 15 112 Z" fill="#f2c157" ${DL} stroke-width="1.5"/>
    </svg>`;
}


// ================= Honey Coffee =================
// Grind beans, brew a shot (stop at the right strength), swirl honey,
// then pour milk foam on top and draw your own latte art.
function coffeeColor(t) {
  return t < 0.55 ? mixColor("#d9b48f", "#7a4a2e", t / 0.55) : mixColor("#7a4a2e", "#2e1a12", (t - 0.55) / 0.45);
}

// the coffee's surface, seen from a little above (latte art goes here)
const SURFACE = { cx: 100, cy: 98, rx: 50, ry: 15 };

function honeyCoffeeArt(st) {
  const v = st.v;
  const clip = uid("cup");
  const brewing = st.step === "brew" && !st.done("brew") && (v.brew || 0) > 0;
  const hasCoffee = st.done("brew") || brewing;
  const surface = hasCoffee ? coffeeColor(v.brew ?? 0.55) : "#ead7cc";
  const honey = Math.min(1, (v.honey || 0) / 0.8);

  // honey swirl, squashed to lie flat on the coffee
  let swirl = "";
  for (let i = 0; i <= 70; i++) {
    const t = i / 70, a = t * 2.2 * Math.PI * 2;
    swirl += (i ? "L" : "M") + (100 + Math.cos(a) * 40 * t).toFixed(1) + " " + (98 + Math.sin(a) * 11 * t).toFixed(1) + " ";
  }

  const marks = st.marks.latte || [];
  const latte = marks.length
    ? creamMarksSVG(marks.map((m) => ({ x: m.x, y: SURFACE.cy + (m.y - SURFACE.cy) * 0.9, r: m.r })), "#fff6ea", 6)
    : st.done("latte")
      ? `<path d="M100 110 Q78 100 80 92 Q83 84 92 88 Q97 90 100 95 Q103 90 108 88 Q117 84 120 92 Q122 100 100 110 Z" fill="#fff6ea" stroke="${mixColor("#fff6ea", INK, 0.25)}" stroke-width="1.5"/>`
      : "";

  const machine = !st.done("brew") ? `
    <rect x="52" y="0" width="96" height="26" rx="6" fill="#d7d5de" ${DL}/>
    <path d="M64 26 L136 26 L130 40 L70 40 Z" fill="#6d6670" ${DL}/>
    <rect x="130" y="28" width="46" height="9" rx="4.5" fill="#9b7766" ${DL} stroke-width="2.5"/>
    ${(v.grind || 0) > 0 ? `<path d="M74 26 Q100 ${26 - 4 * Math.min(7, v.grind)} 126 26 Z" fill="#6b4632" ${DL} stroke-width="2"/>` : ""}
    <circle cx="66" cy="13" r="4" fill="#f6b8cb" ${DL} stroke-width="1.5"/>
    ${brewing ? `<path d="M100 40 L100 ${SURFACE.cy}" stroke="${coffeeColor(v.brew)}" stroke-width="6" stroke-linecap="round"/>` : ""}` : "";

  return dessertSVG(`
    <ellipse cx="100" cy="190" rx="78" ry="8" fill="#e9d6cf" opacity="0.7"/>
    <ellipse cx="100" cy="178" rx="74" ry="14" fill="#fffaf4" ${DL}/>
    <path d="M150 112 Q184 112 182 138 Q180 162 146 160" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
    <path d="M150 112 Q184 112 182 138 Q180 162 146 160" fill="none" stroke="#f6b8cb" stroke-width="7" stroke-linecap="round"/>
    <path d="M44 98 L156 98 L148 166 Q146 180 130 180 L70 180 Q54 180 52 166 Z" fill="#f6b8cb" ${DL}/>
    <path d="M62 112 Q60 140 66 164" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
    <path d="M86 140 Q78 132 80 126 Q83 121 88 124 Q93 121 96 126 Q98 132 86 140 Z" fill="#fffaf4" ${DL} stroke-width="2"/>
    <ellipse cx="100" cy="98" rx="56" ry="18" fill="#fffaf4" ${DL}/>
    <defs><clipPath id="${clip}"><ellipse cx="${SURFACE.cx}" cy="${SURFACE.cy}" rx="${SURFACE.rx}" ry="${SURFACE.ry}"/></clipPath></defs>
    <ellipse cx="${SURFACE.cx}" cy="${SURFACE.cy}" rx="${SURFACE.rx}" ry="${SURFACE.ry}" fill="${surface}" stroke="${INK}" stroke-width="2"/>
    <g clip-path="url(#${clip})">
      ${hasCoffee ? `<ellipse cx="100" cy="98" rx="40" ry="10" fill="none" stroke="${mixColor(surface, "#ffffff", 0.3)}" stroke-width="3" opacity="0.6"/>` : ""}
      ${(st.marks.honey || []).length
        ? creamMarksSVG(st.marks.honey.map((m) => ({ x: m.x, y: Math.max(86, Math.min(110, m.y)), r: m.r * 0.8 })), "#f2c157", 3)
        : (v.honey || 0) > 0 ? `<path d="${swirl}" fill="none" stroke="#f2c157" stroke-width="3.5" stroke-linecap="round"
          pathLength="100" stroke-dasharray="${(honey * 100).toFixed(1)} 200"/>` : ""}
      ${latte}
    </g>
    ${hasCoffee ? `<g fill="none" stroke="#c9c6cf" stroke-width="3" stroke-linecap="round" opacity="0.7">
        <path d="M84 76 Q78 66 84 56 Q90 46 84 38"/><path d="M116 76 Q110 66 116 56 Q122 46 116 38"/></g>` : ""}
    ${machine}
    ${st.flow && st.step === "honey" ? pourStream(st.flow, Math.max(st.flow.y, 98), "#f2c157", 3.5) : ""}`);
}


// ================= Strawberry Matcha Latte =================
// Scoop matcha into the bowl, add hot water, whisk until frothy,
// pour it into the jar, pour milk to the pink lines, top with strawberry cream.

// put one of the matcha.js drawings at a spot inside our 200 x 200 drawing
function placeSVG(svg, x, y, w, h) {
  return svg.replace(/^\s*<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" `).replace(/class="[^"]*"/, "");
}

function matchaLatteArt(st) {
  const v = st.v;
  const bowlGone = st.done("pour");
  const bowl = {
    powder: Math.min(5, v.scoop || 0),
    water: (v.water || 0) > 0,
    froth: Math.min(100, (st.done("whisk") ? Math.max(v.whisk, 0.3) : (v.whisk || 0)) * 100),
  };
  const jar = {
    matcha: 40 * Math.min(1.1, v.pour || 0),
    milk: 100 * (v.milk || 0),
    berry: 100 * (v.cream || 0),
    sparkle: st.done("cream"),
  };
  // the jar moves to the middle once the bowl is put away
  const J = bowlGone ? { x: 45, y: 22, w: 110, h: 156 } : { x: 100, y: 36, w: 96, h: 136 };
  const B = { x: 0, y: 116, w: 108, h: 79 };
  const scale = J.w / 120;
  const jarTop = J.y + (JAR_BOTTOM - jar.matcha - jar.milk - jar.berry) * scale;
  const bowlTop = B.y + 46 * (B.w / 220);

  let stream = "";
  if (st.flow) {
    const colors = { water: "#e6f4f8", pour: "#8fb565", milk: "#fbf3e3", cream: "#f4aab5" };
    const toY = st.step === "water" ? bowlTop : jarTop;
    stream = pourStream(st.flow, toY, colors[st.step] || "#ffffff", 7);
  }
  const spill = (v.water || 0) > 1.02 ? `<ellipse cx="54" cy="194" rx="${50 + (v.water - 1) * 160}" ry="5" fill="#a9d16c" opacity="0.6"/>` : "";
  const over = jar.matcha + jar.milk + jar.berry > 150
    ? `<path d="M${J.x + 8} ${J.y + 20} Q${J.x} ${J.y + 60} ${J.x + 6} ${J.y + 80}" stroke="#fbf3e3" stroke-width="7" stroke-linecap="round" fill="none"/>` : "";

  return dessertSVG(`
    <ellipse cx="${J.x + J.w / 2}" cy="${J.y + J.h - 2}" rx="${J.w * 0.45}" ry="6" fill="#e9d6cf" opacity="0.7"/>
    ${placeSVG(jarSVG(jar, st.step === "milk"), J.x, J.y, J.w, J.h)}
    ${over}
    ${bowlGone ? "" : spill + placeSVG(matchaBowlSVG(bowl), B.x, B.y, B.w, B.h)}
    ${stream}`);
}


// ---------- Tools for the drinks ----------
Object.assign(TOOL_ART, {
  masher: () => T(`
    <path d="M40 8 L40 46" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M40 8 L40 46" stroke="#e57c8f" stroke-width="6" stroke-linecap="round"/>
    <path d="M18 48 L62 48 L58 60 L22 60 Z" fill="#d7d5de" ${DL}/>
    <path d="M26 54 L54 54" stroke="#9e9aa8" stroke-width="2" stroke-dasharray="3 3"/>
    ${berryHalf(40, 70, 0.4, 180)}`),
  ice: () => T(`
    <path d="M14 36 L66 36 L60 72 L20 72 Z" fill="#cfe3ea" ${DL}/>
    ${iceCube(30, 26, -12)}${iceCube(50, 22, 10)}`),
  milk: () => milkBottleSVG(),
  spoon: () => T(`
    <path d="M18 70 L50 20" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M18 70 L50 20" stroke="#d7d5de" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse cx="56" cy="13" rx="8" ry="11" fill="#d7d5de" ${DL} stroke-width="2.5" transform="rotate(33 56 13)"/>
    <path d="M60 46 Q68 50 66 58 M64 36 Q74 40 74 50" fill="none" stroke="#f08caa" stroke-width="3" stroke-linecap="round"/>`),
  sakura: () => T(`${blossom(28, 46, 1.2)}${blossom(52, 30, 1)}${blossom(56, 58, 0.8)}`),
  sakuraBowl: () => T(`
    ${blossom(26, 40, 1.1)}${blossom(54, 38, 1.1)}${blossom(40, 30, 1.2)}
    <path d="M6 46 L74 46 Q72 74 40 74 Q8 74 6 46 Z" fill="#fffaf4" ${DL}/>
    <path d="M6 46 L74 46" ${DL}/>
    <path d="M16 56 Q22 66 32 68" fill="none" stroke="#f6b8cb" stroke-width="3" stroke-linecap="round"/>`),
  kettle: () => kettleSVG(),
  teaKettle: () => teaKettleSVG(),
  honeyJar: () => T(`
    <path d="M16 46 Q16 74 40 74 Q64 74 64 46 Q64 32 40 32 Q16 32 16 46 Z" fill="#f2c157" ${DL}/>
    <rect x="24" y="22" width="32" height="12" rx="4" fill="#d99a3b" ${DL}/>
    <g transform="translate(44 -6) rotate(20) scale(0.5)">${honeyDipperSVG().replace('<svg viewBox="0 0 30 124" class="art">', "").replace("</svg>", "")}</g>`),
  timer: () => T(`
    <rect x="18" y="8" width="44" height="8" rx="3" fill="#c9967a" ${DL}/>
    <rect x="18" y="64" width="44" height="8" rx="3" fill="#c9967a" ${DL}/>
    <path d="M24 16 L56 16 Q56 34 40 40 Q56 46 56 64 L24 64 Q24 46 40 40 Q24 34 24 16 Z" fill="#eef6f7" ${DL}/>
    <path d="M30 24 L50 24 Q46 34 40 36 Q34 34 30 24 Z" fill="#f6b3c4"/>
    <path d="M40 44 L40 54 M30 62 Q40 52 50 62 Z" fill="#f6b3c4" stroke="#f6b3c4" stroke-width="2"/>`),
  grinder: () => T(`
    <path d="M20 32 L60 32 L56 72 L24 72 Z" fill="#c9967a" ${DL}/>
    <path d="M16 22 L64 22 L60 32 L20 32 Z" fill="#9b7766" ${DL}/>
    <path d="M40 22 L40 10 L62 10" fill="none" ${DL} stroke-width="3.5"/>
    <circle cx="64" cy="10" r="5" fill="#f6b8cb" ${DL} stroke-width="2"/>
    <rect x="34" y="46" width="12" height="8" rx="2" fill="#fffaf4" ${DL} stroke-width="2"/>`),
  brew: () => T(`
    <rect x="12" y="8" width="56" height="20" rx="5" fill="#d7d5de" ${DL}/>
    <path d="M22 28 L58 28 L54 38 L26 38 Z" fill="#6d6670" ${DL}/>
    <path d="M40 40 L40 52" stroke="#7a4a2e" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 54 L54 54 L52 72 L28 72 Z" fill="#f6b8cb" ${DL}/>`),
  tin: () => matchaTinSVG(),
  scoop: () => T(`
    <path d="M70 66 Q40 52 18 44" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M70 66 Q40 52 18 44" fill="none" stroke="#dcb56d" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse cx="14" cy="42" rx="11" ry="7" fill="#dcb56d" ${DL} stroke-width="2.5"/>
    <ellipse cx="14" cy="38" rx="9" ry="5" fill="#8fbd57" ${DL} stroke-width="2"/>`),
  whisk: () => whiskSVG(),
  matchaBowl: () => matchaBowlSVG({ powder: 2, water: true, froth: 100 }),
  creamJar: () => strawberryCreamSVG(),
  pitcher: () => T(`
    <path d="M22 26 L54 26 L60 70 L18 70 Z" fill="#eef3f5" ${DL}/>
    <path d="M22 26 L12 18" ${DL} stroke-width="4"/>
    <path d="M56 34 Q70 36 68 50 Q66 60 58 60" fill="none" ${DL}/>
    <path d="M26 36 L28 62" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <path d="M10 14 Q6 6 12 2" fill="none" stroke="#fff6ea" stroke-width="4" stroke-linecap="round"/>`),
});
Object.assign(TOOL_NAMES, {
  masher: "Masher", ice: "Ice", milk: "Milk", spoon: "Spoon", sakura: "Sakura", kettle: "Hot water",
  timer: "Steep", grinder: "Grinder", brew: "Espresso", pitcher: "Milk foam",
  sakuraBowl: "Sakura flowers", teaKettle: "Hot water", honeyJar: "Honey", batter: "Batter bowl",
  tin: "Matcha", whisk: "Bamboo whisk", matchaBowl: "Matcha bowl", creamJar: "Strawberry cream",
});


// ---------- The drink recipes ----------
Object.assign(DESSERTS, {
  matcha: {
    name: "Strawberry Matcha Latte",
    draw: matchaLatteArt,
    oneTool: true,
    tray: ["cream", "sakura", "mint", "heart"],
    steps: [
      { id: "scoop", type: "drop", tool: "tin", carry: "scoop", times: 2, text: "2 scoops of matcha",
        area: { x: 0, y: 90, w: 116, h: 110 },
        hint: "Drag the bamboo scoop from the matcha tin into the bowl. The recipe says 2 scoops. Then press Next step." },
      { id: "water", type: "pour", tool: "teaKettle", carry: "kettle", text: "Add hot water",
        area: { x: 0, y: 20, w: 116, h: 150 }, target: [0.6, 0.9], max: 1.15, speed: 0.32,
        hint: "Pick up the kettle and hold it over the bowl. Stop in the pink zone, then press Next step." },
      { id: "whisk", type: "stir", tool: "whisk", carry: "whisk", times: 12, text: "Whisk until frothy",
        area: { x: 0, y: 100, w: 116, h: 100 },
        hint: "Pick up the whisk, put it in the bowl and whisk fast side to side until it's frothy. Then press Next step." },
      { id: "pour", type: "pour", tool: "matchaBowl", carry: "matchaBowl", text: "Pour it into the jar",
        area: { x: 96, y: 0, w: 104, h: 130 }, target: [0.85, 1.02], max: 1.1, speed: 0.4,
        hint: "Pick up the bowl and pour the matcha into the jar. Pour it all, but don't spill! Then press Next step." },
      { id: "milk", type: "pour", tool: "milk", carry: "milkBottle", text: "Milk to the pink lines",
        area: { x: 40, y: 0, w: 120, h: 130 }, target: [MILK_TARGET[0] / 100, MILK_TARGET[1] / 100], max: 0.8, speed: 0.2,
        hint: "Pick up the milk and pour into the jar. Stop between the pink lines, then press Next step." },
      { id: "cream", type: "pour", tool: "creamJar", carry: "creamJar", text: "Top with strawberry cream",
        area: { x: 40, y: 0, w: 120, h: 130 }, target: [0.2, 0.32], max: 0.45, speed: 0.14,
        hint: "Pick up the strawberry cream and pour a pink layer on top. Stop in the pink zone, then press Next step." },
      DECORATE("Chop strawberries and decorate however you like. Press Done when it's cute."),
    ],
  },

  milk: {
    name: "Strawberry Milk",
    draw: strawberryMilkArt,
    oneTool: true,
    tray: ["cream", "heart", "berry", "mint"],
    steps: [
      { id: "mash", type: "stir", axis: "y", tool: "masher", carry: "masher", times: 6, text: "Mash the strawberries",
        area: { x: 50, y: 20, w: 100, h: 176 },
        hint: "Pick up the masher, put it in the glass and move it up and down to squish the strawberries. Then press Next step." },
      { id: "ice", type: "drop", tool: "ice", carry: "ice", times: 3, text: "Add 3 ice cubes",
        area: { x: 40, y: 10, w: 120, h: 186 },
        hint: "Drag ice cubes into the glass. The recipe says 3. Then press Next step." },
      { id: "milk", type: "pour", tool: "milk", carry: "milkBottle", text: "Pour the milk",
        area: { x: 44, y: 0, w: 112, h: 120 }, target: [0.68, 0.92], max: 1.12, speed: 0.3,
        hint: "Pick up the milk bottle and hold it over the glass to pour. Stop in the pink zone, then press Next step." },
      { id: "stir", type: "stir", tool: "spoon", carry: "spoon", times: 8, text: "Stir until pink",
        area: { x: 50, y: 40, w: 100, h: 156 },
        hint: "Pick up the spoon, put it in the glass, and stir side to side until it's all pink. Then press Next step." },
      DECORATE("Top it with cream, hearts and a strawberry. Press Done when it's cute."),
    ],
  },

  sakura: {
    name: "Sakura Tea",
    draw: sakuraTeaArt,
    oneTool: true,                       // only the tool for this step is on the shelf
    tray: ["sakura", "heart", "mint", "daisy"],
    steps: [
      { id: "blossoms", type: "drop", tool: "sakuraBowl", carry: "flower", times: 3, text: "Drop in 3 sakura flowers", doneText: "So pretty, they're floating!",
        area: { x: 40, y: 10, w: 120, h: 186 },
        hint: "Drag flowers from the bowl into the glass. The recipe says 3. Then press Next step." },
      { id: "water", type: "pour", tool: "teaKettle", carry: "kettle", text: "Pour hot water to the heart",
        area: { x: 46, y: 0, w: 108, h: 120 }, target: [TEA_MARK - 0.06, TEA_MARK + 0.06], max: 1.15, speed: 0.3,
        hint: "Pick up the kettle and hold it over the glass to pour. Stop at the heart line, or it overflows!" },
      { id: "stir", type: "stir", tool: "spoon", carry: "spoon", times: 8, text: "Stir until pink",
        area: { x: 50, y: 50, w: 100, h: 142 },
        hint: "Pick up the spoon, put it in the glass, and stir side to side until the tea turns pink. Then press Next step." },
      { id: "honey", type: "drizzle", tool: "honeyJar", carry: "dipper", text: "Drizzle honey",
        area: { x: 46, y: 0, w: 108, h: 140 }, target: [0.45, 0.8], max: 1.05, speed: 0.32,
        hint: "Pick up the honey dipper and hold it over the glass. The honey drips wherever you move it! Stop in the pink zone, then press Next step." },
      DECORATE("Float some petals on top. Press Done when it's cute."),
    ],
  },

  coffee: {
    name: "Honey Coffee",
    draw: honeyCoffeeArt,
    oneTool: true,
    tray: ["heart", "choco", "cream", "sakura"],
    steps: [
      { id: "grind", type: "tap", tool: "grinder", times: 4, text: "Grind the beans (4 turns)",
        hint: "Click the grinder to turn it. The recipe says 4 turns. Then press Next step." },
      { id: "brew", type: "timer", tool: "brew", seconds: 5, text: "Brew for 5 seconds",
        start: "Brew ▶", stop: "Stop shot!",
        hint: "Press Brew under the espresso machine, then press Stop shot! in the same spot at 5 seconds." },
      { id: "honey", type: "drizzle", tool: "honeyJar", carry: "dipper", text: "Drizzle honey",
        area: { x: 50, y: 20, w: 100, h: 96 }, target: [0.5, 0.82], max: 1.05, speed: 0.32,
        hint: "Pick up the honey dipper and hold it over the coffee. Honey drips wherever you move it! Stop in the pink zone, then press Next step." },
      { id: "latte", type: "pipe", tool: "pitcher", carry: "pitcher", text: "Pour latte art",
        area: { cx: 100, cy: 98, rx: 50, ry: 16 }, target: [0.5, 0.85], max: 1.1, speed: 0.28,
        hint: "Pick up the milk pitcher and move it over the coffee: the foam flows out. Draw a heart! Stop in the pink zone, then press Next step." },
      DECORATE("Add a few sweet touches. Press Done when it's cute."),
    ],
  },
});
