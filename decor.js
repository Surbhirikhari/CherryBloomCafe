// =========================================================
// Cherry Blossom Cafe — decor.js
// Decorating drinks, shared by the Matcha Station and the kitchen table:
//   - chop strawberries on the cutting board (3 chops each = 4 slices)
//   - drag slices and other toppings ANYWHERE on the drink
//   - drag a topping again to move it, off the drink to remove it,
//     or tap it to give it a spin
// =========================================================


// ---------- Topping drawings ----------
const TOP_LINE = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function sliceSVG() {
  return `
    <svg viewBox="0 0 60 60" class="art">
      <path d="M30 55 Q5 39 7 20 Q11 5 30 11 Q49 5 53 20 Q55 39 30 55 Z" fill="#ec5574" ${TOP_LINE}/>
      <path d="M30 47 Q13 35 15 22 Q19 13 30 17 Q41 13 45 22 Q47 35 30 47 Z" fill="#f9b3c0"/>
      <path d="M30 19 Q28 32 30 44" fill="none" stroke="#fde3e8" stroke-width="4" stroke-linecap="round"/>
      <g fill="#fff3c4"><circle cx="20" cy="25" r="1.6"/><circle cx="40" cy="25" r="1.6"/><circle cx="23" cy="35" r="1.6"/><circle cx="37" cy="35" r="1.6"/><circle cx="30" cy="42" r="1.4"/></g>
      <path d="M14 18 Q18 12 24 13" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    </svg>`;
}

function creamSVG() {
  return `
    <svg viewBox="0 0 70 60" class="art">
      <path d="M8 54 Q4 42 16 40 Q10 28 24 26 Q20 12 34 12 Q40 2 46 14 Q60 14 54 28 Q66 32 60 42 Q68 50 60 56 Z" fill="#fffaf1" ${TOP_LINE}/>
      <path d="M16 40 Q30 46 46 40 M24 26 Q36 32 52 28 M34 14 Q40 20 46 16" fill="none" stroke="#e6dccb" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 48 Q24 44 30 46" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
}

function sakuraSVG() {
  let petals = "";
  for (let k = 0; k < 5; k++) {
    petals += `<path d="M30 30 Q19 18 24 8 Q28 11 30 7 Q32 11 36 8 Q41 18 30 30 Z" fill="#f9c5d2" ${TOP_LINE} stroke-width="2.5" transform="rotate(${k * 72} 30 30)"/>`;
  }
  return `<svg viewBox="0 0 60 60" class="art">${petals}<circle cx="30" cy="30" r="5" fill="#f6d76b" ${TOP_LINE} stroke-width="2"/></svg>`;
}

function mintSVG() {
  return `
    <svg viewBox="0 0 60 60" class="art">
      <path d="M30 52 Q8 44 10 22 Q26 18 32 36 Q32 46 30 52 Z" fill="#8fc77a" ${TOP_LINE}/>
      <path d="M30 52 Q52 40 48 16 Q32 16 28 34 Q28 46 30 52 Z" fill="#a6d68f" ${TOP_LINE}/>
      <path d="M30 50 Q22 38 15 26 M30 50 Q38 36 44 22" fill="none" stroke="#5e9a4c" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
}

function heartSVG() {
  return `
    <svg viewBox="0 0 40 40" class="art">
      <path d="M20 35 Q4 24 6 13 Q9 4 20 11 Q31 4 34 13 Q36 24 20 35 Z" fill="#f47c9c" ${TOP_LINE}/>
      <path d="M11 13 Q13 9 17 10" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
}

// a whole strawberry on the board; "chops" draws the cut lines so far
function wholeBerrySVG(chops) {
  let cuts = "";
  for (let k = 0; k < chops; k++) cuts += `<path d="M${24 + k * 11} 22 L${24 + k * 11} 74" stroke="${INK}" stroke-width="2.5" stroke-dasharray="5 3"/>`;
  return `
    <svg viewBox="0 0 70 84" class="art">
      <path d="M35 80 Q6 62 8 36 Q12 18 35 24 Q58 18 62 36 Q64 62 35 80 Z" fill="#ec5574" ${TOP_LINE}/>
      <path d="M20 22 L26 6 L35 18 L44 6 L50 22 Q35 30 20 22 Z" fill="#8fc77a" ${TOP_LINE}/>
      <path d="M35 18 L35 4" ${TOP_LINE}/>
      <g fill="#fff3c4">
        <circle cx="22" cy="40" r="2"/><circle cx="35" cy="36" r="2"/><circle cx="48" cy="40" r="2"/>
        <circle cx="26" cy="54" r="2"/><circle cx="44" cy="54" r="2"/><circle cx="35" cy="66" r="2"/>
      </g>
      <path d="M16 36 Q20 28 28 28" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
      ${cuts}
    </svg>`;
}

function boardSVG() {
  return `
    <svg viewBox="0 0 320 170" class="art" preserveAspectRatio="none">
      <path d="M14 20 Q14 8 26 8 L262 8 Q274 8 278 20 L282 56 Q312 56 312 84 Q312 112 282 112 L278 150 Q274 162 262 162 L26 162 Q14 162 14 150 Z" fill="#ebc592" ${TOP_LINE}/>
      <circle cx="292" cy="84" r="9" fill="#ddb184" ${TOP_LINE}/>
      <path d="M30 40 Q120 34 250 44 M30 80 Q140 74 260 86 M34 124 Q150 118 256 128" fill="none" stroke="#d6a873" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 150 L270 150" stroke="#d29e68" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
    </svg>`;
}

function knifeSVG() {
  return `
    <svg viewBox="0 0 60 150" class="art">
      <path d="M18 6 Q42 10 44 60 L44 92 L18 92 Z" fill="#eef3f5" ${TOP_LINE}/>
      <path d="M24 20 Q36 26 38 60" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <rect x="14" y="90" width="34" height="56" rx="8" fill="#e57c8f" ${TOP_LINE}/>
      <circle cx="31" cy="108" r="3" fill="#fbe3a8" ${TOP_LINE} stroke-width="1.5"/>
      <circle cx="31" cy="128" r="3" fill="#fbe3a8" ${TOP_LINE} stroke-width="1.5"/>
    </svg>`;
}

// size = width as a % of the drink's width
const TOPPINGS = {
  slice:  { name: "Strawberry",  size: 24, svg: sliceSVG },
  cream:  { name: "Cream",       size: 34, svg: creamSVG },
  sakura: { name: "Sakura",      size: 22, svg: sakuraSVG },
  mint:   { name: "Mint",        size: 20, svg: mintSVG },
  heart:  { name: "Sugar heart", size: 13, svg: heartSVG },
};
const MAX_TOPPINGS = 16;


// ---------- Build the board and the topping tray (once) ----------
const decorEl = document.getElementById("decor");
decorEl.innerHTML = `
  <div class="board">
    <div class="board-art">${boardSVG()}</div>
    <div class="berries" id="berries"></div>
    <button class="slice-pile" id="slice-pile" aria-label="Strawberry slices">
      ${sliceSVG()}<span class="pile-count" id="pile-count">0</span>
    </button>
    <div class="knife" id="knife">${knifeSVG()}</div>
  </div>
  <div class="tray" id="tray"></div>`;

const berriesEl = document.getElementById("berries");
const slicePile = document.getElementById("slice-pile");
const pileCount = document.getElementById("pile-count");
const knifeEl   = document.getElementById("knife");
const trayEl    = document.getElementById("tray");

["cream", "sakura", "mint", "heart"].forEach(function (kind) {
  const button = document.createElement("button");
  button.className = "tray-item";
  button.innerHTML = TOPPINGS[kind].svg() + "<span>" + TOPPINGS[kind].name + "</span>";
  button.addEventListener("pointerdown", (event) => startDrag(event, kind, null));
  button.addEventListener("click", (event) => { if (event.detail === 0) dropRandomly(kind); });  // keyboard
  trayEl.appendChild(button);
});
slicePile.addEventListener("pointerdown", (event) => startDrag(event, "slice", null));
slicePile.addEventListener("click", (event) => { if (event.detail === 0) dropRandomly("slice"); });


// ---------- Memory ----------
const decor = {
  enabled: false,
  layer: null,          // the see-through layer over the drink where toppings go
  berries: [0, 0, 0],   // chops on each whole strawberry (3 = cut)
  slices: 0,            // slices waiting on the board
  placed: [],           // toppings on the drink: { kind, x, y, rot, el }
};


// ---------- Chopping ----------
function drawBerries() {
  berriesEl.innerHTML = "";
  decor.berries.forEach(function (chops, i) {
    if (chops >= 3) return;                         // already sliced
    const button = document.createElement("button");
    button.className = "berry";
    button.setAttribute("aria-label", "Chop strawberry");
    button.innerHTML = wholeBerrySVG(chops);
    button.addEventListener("click", () => chop(i, button));
    berriesEl.appendChild(button);
  });
  pileCount.textContent = decor.slices;
  slicePile.disabled = decor.slices === 0;
}

function chop(i, button) {
  if (!decor.enabled) return;
  // move the knife over this strawberry and bring it down
  const board = decorEl.querySelector(".board").getBoundingClientRect();
  const berry = button.getBoundingClientRect();
  knifeEl.style.left = ((berry.left + berry.width / 2 - board.left) / board.width) * 100 + "%";
  restartAnimation(knifeEl, "chop");

  decor.berries[i] = decor.berries[i] + 1;
  if (decor.berries[i] >= 3) decor.slices = decor.slices + 4;    // it falls into slices
  setTimeout(drawBerries, 160);
}


// ---------- Dragging toppings ----------
let drag = null;

function startDrag(event, kind, item) {
  if (!decor.enabled || !decor.layer) return;
  if (kind === "slice" && !item && decor.slices === 0) return;
  if (!item && decor.placed.length >= MAX_TOPPINGS) return;
  event.preventDefault();

  const ghost = document.createElement("div");
  ghost.className = "topping-ghost";
  ghost.innerHTML = TOPPINGS[kind].svg();
  ghost.style.width = (decor.layer.getBoundingClientRect().width * TOPPINGS[kind].size) / 100 + "px";
  document.body.appendChild(ghost);

  drag = { kind, item, ghost, startX: event.clientX, startY: event.clientY, moved: false };
  if (item) item.el.classList.add("lifted");
  moveGhost(event);
  document.addEventListener("pointermove", onDragMove);
  document.addEventListener("pointerup", onDragEnd, { once: true });
}

function moveGhost(event) {
  drag.ghost.style.left = event.clientX + "px";
  drag.ghost.style.top = event.clientY + "px";
}

function onDragMove(event) {
  if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6) drag.moved = true;
  moveGhost(event);
}

function onDragEnd(event) {
  document.removeEventListener("pointermove", onDragMove);
  drag.ghost.remove();
  const { kind, item, moved } = drag;
  drag = null;
  if (item) item.el.classList.remove("lifted");

  // a tap (no real movement)
  if (!moved) {
    if (item) { item.rot = item.rot + 35; positionTopping(item); }   // tap a placed topping: spin it
    else dropRandomly(kind);                                          // tap the tray: drop it on the drink
    return;
  }

  // where on the drink did we let go? (0–100% across and down)
  const box = decor.layer.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * 100;
  const y = ((event.clientY - box.top) / box.height) * 100;
  const onDrink = x >= 0 && x <= 100 && y >= 0 && y <= 100;

  if (item) {
    if (onDrink) { item.x = x; item.y = y; positionTopping(item); }
    else removeTopping(item);                                         // dragged off: take it away
  } else if (onDrink) {
    addTopping(kind, x, y);
  }
}

function dropRandomly(kind) {
  if (!decor.enabled || !decor.layer || decor.placed.length >= MAX_TOPPINGS) return;
  if (kind === "slice" && decor.slices === 0) return;
  addTopping(kind, 25 + Math.random() * 50, 12 + Math.random() * 30);
}

function addTopping(kind, x, y) {
  if (kind === "slice") { decor.slices = decor.slices - 1; drawBerries(); }
  const item = { kind, x, y, rot: Math.round(Math.random() * 50 - 25), el: document.createElement("span") };
  item.el.className = "topping";
  item.el.innerHTML = TOPPINGS[kind].svg();
  item.el.addEventListener("pointerdown", (event) => startDrag(event, kind, item));
  decor.layer.appendChild(item.el);
  decor.placed.push(item);
  positionTopping(item);
  restartAnimation(item.el, "plop");
}

function removeTopping(item) {
  item.el.remove();
  decor.placed = decor.placed.filter((t) => t !== item);
  if (item.kind === "slice") { decor.slices = decor.slices + 1; drawBerries(); }
}

function positionTopping(item) {
  item.el.style.left = item.x + "%";
  item.el.style.top = item.y + "%";
  item.el.style.width = TOPPINGS[item.kind].size + "%";
  item.el.style.setProperty("--rot", item.rot + "deg");
}


// ---------- What the stations use ----------
const Decor = {
  // put the board in this station, and toppings go on this layer
  attach(zoneEl, layerEl) {
    zoneEl.appendChild(decorEl);
    decor.layer = layerEl;
  },
  reset() {
    decor.placed.forEach((t) => t.el.remove());
    decor.placed = [];
    decor.berries = [0, 0, 0];
    decor.slices = 0;
    drawBerries();
  },
  enable(on) {
    decor.enabled = on;
    decorEl.classList.toggle("active", on);
  },
  count() {
    return decor.placed.length;
  },
  // the finished drink as HTML: the drawing, with the toppings on top
  art(baseSVG) {
    const tops = decor.placed.map((t) =>
      `<span class="topping" style="left:${t.x}%;top:${t.y}%;width:${TOPPINGS[t.kind].size}%;--rot:${t.rot}deg">${TOPPINGS[t.kind].svg()}</span>`
    ).join("");
    return `<div class="decorated">${baseSVG}${tops}</div>`;
  },
};

drawBerries();
