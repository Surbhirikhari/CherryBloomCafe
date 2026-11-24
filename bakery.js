// =========================================================
// Cherry Blossom Cafe — bakery.js
// The Bakery Station: one station that can make every dessert.
// It reads a recipe from desserts.js and runs its steps one by one.
//
// How each kind of step works:
//   tap    - click the glowing tool "times" times
//   hold   - press and hold the tool; the meter fills; let go in the pink zone
//   timing - the needle swings by itself; click the tool in the green zone
//   rub    - drag over the dessert; we remember each spot (a "mark")
//            and count how much of the area you've covered
//   swipe  - drag over the dessert in one direction
//   decorate - the cutting board and toppings (decor.js), then Done
// =========================================================


// ---------- Grab the page parts ----------
const bTitle     = document.getElementById("b-title");
const bSteps     = document.getElementById("b-steps");
const bMeter     = document.getElementById("b-meter");
const bZone      = document.getElementById("b-zone");
const bFill      = document.getElementById("b-fill");
const bNeedle    = document.getElementById("b-needle");
const bHint      = document.getElementById("b-hint");
const bRestart   = document.getElementById("b-restart");
const bDone      = document.getElementById("b-done");
const bShelf     = document.getElementById("b-shelf");
const bPlate     = document.getElementById("b-plate");
const bArt       = document.getElementById("b-art");
const bToppings  = document.getElementById("b-toppings");
const bHand      = document.getElementById("b-hand");
const bDecorZone = document.getElementById("b-decor-zone");


// ---------- The station's memory ----------
const bake = {
  id: null,             // which dessert, e.g. "crepe"
  recipe: null,         // its recipe from DESSERTS
  index: 0,             // which step we're on
  v: {},                // how far each step got, e.g. { batter: 0.8, cook: 0.5 }
  marks: {},            // spots you rubbed, for "rub" steps
  done: new Set(),      // the steps that are finished
  stars: 3,             // starts perfect, mistakes take stars away
  busy: false,          // true for a moment between steps
  onDone: null,         // what to call when the dessert is served
  tools: {},            // the tool buttons on the shelf, by name
};

function bStep() { return bake.recipe.steps[bake.index]; }


// ---------- Opening the station ----------
function openBakeStation(id, onDone) {
  bake.id = id;
  bake.recipe = DESSERTS[id];
  bake.onDone = onDone;
  bTitle.textContent = bake.recipe.name;
  Decor.attach(bDecorZone, bToppings, bake.recipe.tray);
  buildShelf();
  resetBake();
}

// one button per tool this recipe uses (each tool only once)
function buildShelf() {
  bShelf.innerHTML = "";
  bake.tools = {};
  bake.recipe.steps.forEach(function (s) {
    if (s.type === "decorate" || bake.tools[s.tool]) return;
    const button = document.createElement("button");
    button.className = "tool";
    button.innerHTML = `<span>${TOOL_ART[s.tool]()}</span><span class="tool-label"></span>`;
    bake.tools[s.tool] = button;
    bShelf.appendChild(button);

    button.addEventListener("click", () => onToolClick(s.tool));
    button.addEventListener("pointerdown", (event) => onToolHold(event, s.tool));
    button.addEventListener("keydown", function (event) {
      if ((event.key === " " || event.key === "Enter") && !event.repeat && bStep().type === "hold") onToolHold(event, s.tool);
    });
    button.addEventListener("keyup", function (event) {
      if (event.key === " " || event.key === "Enter") stopHold();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => button.addEventListener(type, stopHold));
  });
}

function resetBake() {
  stopTiming();
  bake.index = 0;
  bake.v = {};
  bake.marks = {};
  bake.done = new Set();
  bake.stars = 3;
  bake.busy = false;
  bake.holding = false;
  Decor.reset();
  startStep();
}

// get ready for the current step
function startStep() {
  const s = bStep();
  bHint.textContent = s.hint;
  if (s.type === "rub") prepareRub(s);
  if (s.type === "swipe") bake.v[s.id] = 0;
  if (s.type === "timing") startTiming(s);
  drawBake();
}

function nextBakeStep(message) {
  const s = bStep();
  bake.done.add(s.id);
  bake.busy = true;
  bHint.textContent = message;
  drawBake();
  bPlate.classList.remove("yay");
  restartAnimation(bPlate, "yay");
  setTimeout(function () {
    bake.busy = false;
    bake.index = bake.index + 1;
    startStep();
  }, 700);
}


// ---------- Drawing ----------
function artState() {
  return { v: bake.v, marks: bake.marks, step: bStep().id, done: (id) => bake.done.has(id) };
}

function drawDessert() {
  bArt.innerHTML = bake.recipe.draw(artState());
}

function drawBake() {
  const s = bStep();
  drawDessert();

  // only this step's tool can be used, and it glows and bobs
  Object.keys(bake.tools).forEach(function (name) {
    const tool = bake.tools[name];
    const mine = name === s.tool && !bake.busy;
    tool.classList.toggle("active", mine);
    tool.disabled = !mine || s.type === "rub" || s.type === "swipe";
    tool.querySelector(".tool-label").textContent = toolLabel(name, mine ? s : null);
  });
  bPlate.classList.toggle("active", !bake.busy && (s.type === "rub" || s.type === "swipe"));

  // the checklist
  bSteps.innerHTML = "";
  bake.recipe.steps.forEach(function (step, i) {
    const li = document.createElement("li");
    li.innerHTML = TOOL_ART[step.tool]() + "<span>" + step.text + "</span>";
    if (bake.done.has(step.id)) li.className = "done";
    else if (i === bake.index) li.className = "next";
    bSteps.appendChild(li);
  });

  drawMeter();
  Decor.enable(s.type === "decorate");
  bDone.disabled = s.type !== "decorate";
}

const TOOL_NAMES = {
  batter: "Batter", spatula: "Spatula", piping: "Cream", berries: "Strawberries", fold: "Fold",
  oven: "Oven", toaster: "Toaster", knife: "Knife", roll: "Roll", honey: "Honey", sifter: "Sugar",
};
function toolLabel(name, step) {
  if (!step) return TOOL_NAMES[name];
  if (step.type === "hold") return TOOL_NAMES[name] + " (hold)";
  if (step.type === "rub" || step.type === "swipe") return TOOL_NAMES[name] + " (drag on plate)";
  if (step.type === "tap") return TOOL_NAMES[name] + " (" + (bake.v[step.id] || 0) + "/" + step.times + ")";
  return TOOL_NAMES[name] + "!";
}

// the meter under the checklist
function drawMeter() {
  const s = bStep();
  bMeter.hidden = s.type === "decorate";
  bMeter.className = "meter" + (s.type === "timing" ? " timing" : "");
  bZone.hidden = !(s.type === "hold" || s.type === "timing");
  bNeedle.hidden = s.type !== "timing";
  const value = bake.v[s.id] || 0;

  if (s.type === "hold") {
    bZone.style.left = (s.target[0] / s.max) * 100 + "%";
    bZone.style.width = ((s.target[1] - s.target[0]) / s.max) * 100 + "%";
    bFill.style.width = Math.min(100, (value / s.max) * 100) + "%";
  } else if (s.type === "timing") {
    bZone.style.left = s.zone[0] * 100 + "%";
    bZone.style.width = (s.zone[1] - s.zone[0]) * 100 + "%";
    bNeedle.style.left = value * 100 + "%";
    bFill.style.width = "0";
  } else if (s.type === "tap") {
    bFill.style.width = (value / s.times) * 100 + "%";
  } else {
    bFill.style.width = Math.min(100, value * 100) + "%";
  }
}


// ---------- tap ----------
function onToolClick(name) {
  const s = bStep();
  if (bake.busy || s.tool !== name || s.type === "hold") return;
  restartAnimation(bake.tools[name], "tapped");

  if (s.type === "tap") {
    bake.v[s.id] = (bake.v[s.id] || 0) + 1;
    if (bake.v[s.id] >= s.times) nextBakeStep("Yum, all in!");
    else { bHint.textContent = (s.times - bake.v[s.id]) + " more!"; drawBake(); }
  }
  if (s.type === "timing") stopTimingAndJudge(s);
  if (s.type === "rub" || s.type === "swipe") bHint.textContent = "Drag on the plate with your mouse!";
}


// ---------- hold ----------
function onToolHold(event, name) {
  const s = bStep();
  if (bake.busy || s.tool !== name || s.type !== "hold" || bake.holding) return;
  event.preventDefault();
  bake.holding = true;
  bake.tools[name].classList.add("pouring");

  let last = performance.now();
  function tick(now) {
    if (!bake.holding) return;
    bake.v[s.id] = Math.min(s.max, (bake.v[s.id] || 0) + s.speed * ((now - last) / 1000));
    last = now;
    drawDessert();
    drawMeter();
    if (bake.v[s.id] >= s.max) { stopHold(); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function stopHold() {
  if (!bake.holding) return;
  bake.holding = false;
  const s = bStep();
  bake.tools[s.tool].classList.remove("pouring");
  const value = bake.v[s.id] || 0;

  if (value < s.target[0] * 0.6) { bHint.textContent = "A bit more… hold it again."; return; }
  if (value >= s.target[0] && value <= s.target[1]) { nextBakeStep("Perfect amount!"); return; }
  bake.stars = Math.max(1, bake.stars - 1);
  nextBakeStep(value > s.target[1] ? "Oops, a little too much! Still yummy." : "A little less than the recipe, but okay!");
}


// ---------- timing ----------
let timingFrame = null;

function startTiming(s) {
  const start = performance.now();
  bake.v[s.id] = 0;
  function tick(now) {
    // slowly goes 0 → 1 → 0 → 1… (one sweep every 2.6 seconds)
    const t = ((now - start) / 2600) % 2;
    bake.v[s.id] = t < 1 ? t : 2 - t;
    drawDessert();
    drawMeter();
    timingFrame = requestAnimationFrame(tick);
  }
  timingFrame = requestAnimationFrame(tick);
}

function stopTiming() {
  cancelAnimationFrame(timingFrame);
  timingFrame = null;
}

function stopTimingAndJudge(s) {
  stopTiming();
  const value = bake.v[s.id];
  if (value >= s.zone[0] && value <= s.zone[1]) { nextBakeStep("Golden and perfect!"); return; }
  bake.stars = Math.max(1, bake.stars - 1);
  nextBakeStep(value < s.zone[0] ? "Hmm, a little pale. Still tasty!" : "Oops, a bit too toasty! Still tasty.");
}


// ---------- rub and swipe: dragging on the plate ----------
const drag2 = { down: false, startX: 0, startY: 0, last: null, cells: [], touched: new Set() };

// Where is the pointer on the drawing? (0–200 across and down)
function plateXY(event) {
  const box = bPlate.getBoundingClientRect();
  return { x: ((event.clientX - box.left) / box.width) * 200, y: ((event.clientY - box.top) / box.height) * 200 };
}

function insideArea(area, x, y) {
  if (area.rx) return ((x - area.cx) / area.rx) ** 2 + ((y - area.cy) / area.ry) ** 2 <= 1;
  return x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h;
}

// split the area into a grid of little squares; rubbing near one "covers" it
function prepareRub(s) {
  const a = s.area;
  const left = a.rx ? a.cx - a.rx : a.x, top = a.rx ? a.cy - a.ry : a.y;
  const w = a.rx ? a.rx * 2 : a.w, h = a.rx ? a.ry * 2 : a.h;
  drag2.cells = [];
  drag2.touched = new Set();
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const x = left + (i + 0.5) * (w / 10), y = top + (j + 0.5) * (h / 10);
      if (insideArea(a, x, y)) drag2.cells.push({ x, y });
    }
  }
  bake.marks[s.id] = [];
  bake.v[s.id] = 0;
}

function rubAt(s, x, y) {
  // only count spots on (or very near) the dessert
  const near = insideArea(s.area, x, y) || drag2.cells.some((c) => Math.hypot(c.x - x, c.y - y) < 14);
  if (!near) return;
  const marks = bake.marks[s.id];
  const lastMark = marks[marks.length - 1];
  if (lastMark && Math.hypot(lastMark.x - x, lastMark.y - y) < 6) return;
  marks.push({ x, y });
  drag2.cells.forEach(function (c, i) { if (Math.hypot(c.x - x, c.y - y) < 18) drag2.touched.add(i); });
  bake.v[s.id] = drag2.touched.size / drag2.cells.length;
  drawDessert();
  drawMeter();
  if (bake.v[s.id] >= 0.85) {
    bake.v[s.id] = 1;
    drag2.down = false;
    nextBakeStep(s.tool === "sifter" ? "Like fresh snow!" : "So smooth!");
  }
}

function swipeTo(s, x, y) {
  const along = (x - drag2.startX) * s.dir[0] + (y - drag2.startY) * s.dir[1];
  const progress = Math.max(bake.v[s.id] || 0, Math.min(1, along / 110));
  if (progress === bake.v[s.id]) return;
  bake.v[s.id] = progress;
  drawDessert();
  drawMeter();
  if (progress >= 1) {
    drag2.down = false;
    const done = { fold: "A perfect little cone!", roll: "All rolled up!", slice: "Look at that swirl!", cream: "Nice and even!" };
    nextBakeStep(done[s.id] || "Lovely!");
  }
}

// the tool follows your mouse over the plate
function moveHand(event) {
  const s = bStep();
  const show = !bake.busy && (s.type === "rub" || s.type === "swipe");
  bHand.hidden = !show;
  if (!show) return;
  const box = bPlate.getBoundingClientRect();
  bHand.style.left = ((event.clientX - box.left) / box.width) * 100 + "%";
  bHand.style.top = ((event.clientY - box.top) / box.height) * 100 + "%";
  bHand.classList.toggle("pressed", drag2.down);
}

bPlate.addEventListener("pointerdown", function (event) {
  const s = bStep();
  if (bake.busy || (s.type !== "rub" && s.type !== "swipe")) return;
  event.preventDefault();
  bPlate.setPointerCapture(event.pointerId);
  drag2.down = true;
  const p = plateXY(event);
  // a swipe continues from where you got to last time
  const sofar = (bake.v[s.id] || 0) * 110;
  drag2.startX = p.x - (s.dir ? s.dir[0] * sofar : 0);
  drag2.startY = p.y - (s.dir ? s.dir[1] * sofar : 0);
  if (s.type === "rub") rubAt(s, p.x, p.y);
  moveHand(event);
});

bPlate.addEventListener("pointermove", function (event) {
  moveHand(event);
  if (!drag2.down || bake.busy) return;
  const s = bStep();
  const p = plateXY(event);
  if (s.type === "rub") rubAt(s, p.x, p.y);
  if (s.type === "swipe") swipeTo(s, p.x, p.y);
});

["pointerup", "pointercancel"].forEach(function (type) {
  bPlate.addEventListener(type, function (event) { drag2.down = false; moveHand(event); });
});
bPlate.addEventListener("pointerleave", function () { bHand.hidden = true; });

// keyboard: the arrow keys rub and swipe too
bPlate.addEventListener("keydown", function (event) {
  const s = bStep();
  if (bake.busy || !event.key.startsWith("Arrow")) return;
  event.preventDefault();
  if (s.type === "rub") {
    const c = drag2.cells[Math.floor(Math.random() * drag2.cells.length)];
    rubAt(s, c.x + Math.random() * 6 - 3, c.y + Math.random() * 6 - 3);
  }
  if (s.type === "swipe") {
    drag2.startX = 0; drag2.startY = 0;
    const next = Math.min(1, (bake.v[s.id] || 0) + 0.2) * 110;
    swipeTo(s, s.dir[0] * next, s.dir[1] * next);
  }
});


// ---------- Start over, and Done ----------
bRestart.addEventListener("click", resetBake);

bDone.addEventListener("click", function () {
  stopTiming();
  bake.onDone(bake.stars, Decor.art(bake.recipe.draw(artState())), Decor.count());
});
