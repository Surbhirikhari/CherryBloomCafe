// =========================================================
// Cherry Blossom Cafe — menu.js
// The ingredients, the drinks on the menu, and how to draw them.
// To add a new drink: add an entry to MENU using ingredients from INGREDIENTS.
// =========================================================

const INK = "#412c2c";   // Bloom's marker ink, used for every outline

// ---------- Ingredients ----------
// Each one has a name, the colour it makes in the glass, and an icon (drawn below).
const INGREDIENTS = {
  ice:        { name: "Ice",        color: "#dcedf3" },
  milk:       { name: "Milk",       color: "#fbf0dc" },
  strawberry: { name: "Strawberry", color: "#f590a8" },
  water:      { name: "Hot water",  color: "#f3e6cc" },
  sakura:     { name: "Sakura",     color: "#f9cdd8" },
  honey:      { name: "Honey",      color: "#f2c157" },
  coffee:     { name: "Coffee",     color: "#8a5a3c" },
};

// ---------- The menu ----------
// "steps" is the order to add things, from the bottom of the glass to the top.
// A drink with a "station" is made in its own mini-game instead (see matcha.js).
const MENU = [
  { name: "Strawberry Matcha Latte", price: 15, station: "matcha" },
  { name: "Strawberry Milk",   price: 10, steps: ["strawberry", "ice", "milk"] },
  { name: "Sakura Tea",        price: 9,  steps: ["sakura", "water", "honey"] },
  { name: "Honey Coffee",      price: 11, steps: ["coffee", "honey", "milk"] },
];

const MAX_LAYERS = 4;   // the glass holds 4 pours at most


// ---------- Drawing a glass with layers ----------
// layers is a list like ["strawberry", "ice", "milk"], bottom first.
// Returns SVG code as a string, which we can put on the page with innerHTML.
let glassNumber = 0;   // every glass needs its own clip-path id
const GLASS = "M14 8 L86 8 L78 122 Q77 128 70 128 L30 128 Q23 128 22 122 Z";

function glassSVG(layers, newest = false) {
  const clipId = "glass-clip-" + glassNumber++;
  const layerHeight = 28;
  let inside = "";

  layers.forEach(function (id, i) {
    const y = 128 - (i + 1) * layerHeight;
    const isNew = newest && i === layers.length - 1;
    inside += `<g class="${isNew ? "layer-new" : ""}">${layerSVG(id, y, layerHeight)}</g>`;
  });

  return `
    <svg viewBox="0 0 100 134" class="glass-svg">
      <defs><clipPath id="${clipId}"><path d="${GLASS}"/></clipPath></defs>
      <path d="${GLASS}" fill="#eef6f7" opacity="0.7"/>
      <g clip-path="url(#${clipId})">${inside}</g>
      <path d="M24 20 L29 112" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      <path d="${GLASS}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    </svg>`;
}

// One layer of liquid (or ice, or petals) inside the glass.
function layerSVG(id, y, h) {
  const color = INGREDIENTS[id].color;
  let extra = "";
  if (id === "ice") {
    extra = `
      <rect x="26" y="${y + 5}" width="18" height="17" rx="4" fill="#f4fbfd" stroke="${INK}" stroke-width="1.5" transform="rotate(-10 35 ${y + 13})"/>
      <rect x="52" y="${y + 7}" width="18" height="17" rx="4" fill="#f4fbfd" stroke="${INK}" stroke-width="1.5" transform="rotate(12 61 ${y + 15})"/>`;
  } else if (id === "strawberry") {
    extra = [20, 38, 56, 72].map((x, k) => `<circle cx="${x}" cy="${y + 10 + (k % 2) * 8}" r="1.8" fill="#fff3c4"/>`).join("");
  } else if (id === "sakura") {
    extra = [28, 50, 70].map((x) => `<circle cx="${x}" cy="${y + 14}" r="5" fill="#f19bb1"/><circle cx="${x}" cy="${y + 14}" r="1.6" fill="#fff3c4"/>`).join("");
  } else if (id === "honey") {
    extra = `<path d="M10 ${y + 6} Q50 ${y + 2} 90 ${y + 6}" stroke="#fbe3a0" stroke-width="3" fill="none"/>`;
  } else if (id === "milk") {
    extra = `<path d="M10 ${y + 2} Q30 ${y + 6} 50 ${y + 2} Q70 ${y - 2} 90 ${y + 2}" stroke="#f1e9dc" stroke-width="2" fill="none"/>`;
  }
  return `<rect x="0" y="${y}" width="100" height="${h + 1}" fill="${color}"/>${extra}`;
}


// ---------- Ingredient icons ----------
// Little drawings for the jars on the kitchen table.
function ingredientIconSVG(id) {
  const s = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
  const ICONS = {
    ice: `
      <path d="M14 36 L66 36 L60 72 L20 72 Z" fill="#cfe3ea" ${s}/>
      <rect x="20" y="18" width="16" height="16" rx="3" fill="#f4fbfd" ${s} transform="rotate(-12 28 26)"/>
      <rect x="38" y="12" width="16" height="16" rx="3" fill="#f4fbfd" ${s} transform="rotate(10 46 20)"/>
      <rect x="48" y="24" width="14" height="14" rx="3" fill="#f4fbfd" ${s}/>`,
    milk: `
      <path d="M28 74 L28 36 Q28 28 34 24 L34 10 L46 10 L46 24 Q52 28 52 36 L52 74 Z" fill="#fffdf7" ${s}/>
      <rect x="33" y="6" width="14" height="7" rx="2" fill="#f6b8cb" ${s}/>
      <rect x="30" y="44" width="20" height="14" rx="2" fill="#f6b8cb" ${s}/>`,
    strawberry: `
      <path d="M40 74 Q12 56 16 36 Q22 22 40 28 Q58 22 64 36 Q68 56 40 74 Z" fill="#f2667f" ${s}/>
      <path d="M28 26 L34 14 L40 24 L46 14 L52 26 Q40 32 28 26 Z" fill="#8fae7a" ${s}/>
      <g fill="#fff3c4"><circle cx="30" cy="42" r="2"/><circle cx="46" cy="40" r="2"/><circle cx="38" cy="54" r="2"/><circle cx="52" cy="52" r="2"/></g>`,
    water: `
      <path d="M18 72 Q14 42 40 38 Q66 42 62 72 Z" fill="#f3e6cc" ${s}/>
      <path d="M62 52 Q74 48 74 36" fill="none" ${s}/>
      <path d="M30 38 Q40 26 50 38" fill="none" ${s}/>
      <path d="M30 22 Q26 16 30 10 M42 20 Q38 14 42 8" fill="none" ${s} stroke-width="2.5" opacity="0.6"/>`,
    sakura: [0, 72, 144, 216, 288].map((a) =>
        `<ellipse cx="40" cy="24" rx="11" ry="15" fill="#f9cdd8" ${s} transform="rotate(${a} 40 44)"/>`).join("") +
      `<circle cx="40" cy="44" r="7" fill="#fff3c4" ${s}/>`,
    honey: `
      <path d="M16 46 Q16 74 40 74 Q64 74 64 46 Q64 32 40 32 Q16 32 16 46 Z" fill="#f2c157" ${s}/>
      <rect x="24" y="22" width="32" height="12" rx="4" fill="#d99a3b" ${s}/>
      <path d="M58 22 L70 8" fill="none" ${s}/>
      <path d="M26 46 Q40 52 54 46" fill="none" ${s} stroke-width="2.5"/>`,
    coffee: `
      <path d="M20 30 L56 30 L52 72 L24 72 Z" fill="#8a5a3c" ${s}/>
      <path d="M56 40 Q70 40 68 52 Q66 62 54 60" fill="none" ${s}/>
      <rect x="16" y="22" width="44" height="10" rx="3" fill="#c49a72" ${s}/>
      <ellipse cx="34" cy="50" rx="5" ry="7" fill="#5e3b26" ${s} stroke-width="2"/>`,
  };
  return `<svg viewBox="0 0 80 80" class="icon-svg" aria-hidden="true">${ICONS[id]}</svg>`;
}
