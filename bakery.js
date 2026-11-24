// =========================================================
// Cherry Blossom Cafe — bakery.js
// The Bakery Station: one station that can make every recipe in desserts.js.
// It reads the recipe and runs its steps one by one.
//
// How each kind of step works:
//   tap    - click the glowing tool "times" times
//   hold   - press and hold the tool; the meter fills; let go in the pink zone
//   timing - click the tool to turn it on; the needle rises slowly;
//            press the big stop button ("Turn off!") in the green zone
//   pipe   - hold the mouse down on the dessert: cream flows out right there
//            (and grows while you stay still); let go in the pink zone
//   rub    - drag over the dessert; we count how much of the area you covered
//   swipe  - drag over the dessert in one direction
//   stir   - drag side to side over the drink, like stirring with a spoon
//   decorate - the cutting board and toppings (decor.js), then Done
// =========================================================


// ---------- Grab the page parts ----------
const bTitle      = document.getElementById("b-title");
const bSteps      = document.getElementById("b-steps");
const bMeterRow   = document.getElementById("b-meter-row");
const bMeterLabel = document.getElementById("b-meter-label");
const bMeter      = document.getElementById("b-meter");
const bZone       = document.getElementById("b-zone");
const bFill       = document.getElementById("b-fill");
const bNeedle     = document.getElementById("b-needle");
const bAction     = document.getElementById("b-action");
const bHint       = document.getElementById("b-hint");
const bRestart    = document.getElementById("b-restart");
const bDone       = document.getElementById("b-done");
const bShelf      = document.getElementById("b-shelf");
const bPlate      = document.getElementById("b-plate");
const bArt        = document.getElementById("b-art");
const bToppings   = document.getElementById("b-toppings");
const bHand       = document.getElementById("b-hand");
const bDecorZone  = document.getElementById("b-decor-zone");


// ---------- The station's memory ----------
const bake = {
  id: null,             // which recipe, e.g. "crepe"
  recipe: null,         // the recipe from DESSERTS
  index: 0,             // which step we're on
  v: {},                // how far each step got, e.g. { batter: 0.8, cook: 0.5 }
  marks: {},            // spots where cream flowed (or sugar was rubbed)
  done: new Set(),      // the steps that are finished
  stars: 3,             // starts perfect, mistakes take stars away
  busy: false,          // true for a moment between steps
  holding: false,       // holding a "hold" tool
  heating: false,       // a "timing" step is running
  onDone: null,         // what to call when it's served
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
  bake.heating = false;
  bake.holding = false;
  pipe.on = false;
  bake.index = 0;
  bake.v = {};
  bake.marks = {};
  bake.done = new Set();
  bake.stars = 3;
  bake.busy = false;
  Decor.reset();
  startStep();
}

// get ready for the current step
function startStep() {
  const s = bStep();
  bHint.textContent = s.hint;
  if (s.type === "rub") prepareRub(s);
  if (s.type === "pipe") { bake.marks[s.id] = []; bake.v[s.id] = 0; }
  if (s.type === "swipe" || s.type === "timing" || s.type === "stir") bake.v[s.id] = 0;
  drawBake();
}

function nextBakeStep(message) {
  const s = bStep();
  bake.done.add(s.id);
  bake.busy = true;
  bake.heating = false;
  bHint.textContent = message;
  drawBake();
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

// steps you do by dragging on the plate
function onPlate(s) { return s.type === "rub" || s.type === "swipe" || s.type === "pipe" || s.type === "stir"; }

function drawBake() {
  const s = bStep();
  drawDessert();

  // only this step's tool can be used, and it glows and bobs
  Object.keys(bake.tools).forEach(function (name) {
    const tool = bake.tools[name];
    const mine = name === s.tool && !bake.busy;
    tool.classList.toggle("active", mine);
    tool.disabled = !mine || onPlate(s) || bake.heating;
    tool.querySelector(".tool-label").textContent = toolLabel(name, mine ? s : null);
  });
  bPlate.classList.toggle("active", !bake.busy && onPlate(s));

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
  const base = TOOL_NAMES[name] || step?.label || name;
  if (!step) return base;
  if (step.type === "hold") return base + " (hold)";
  if (onPlate(step)) return base + " (use on plate)";
  if (step.type === "tap") return base + " (" + (bake.v[step.id] || 0) + "/" + step.times + ")";
  if (step.type === "timing") return bake.heating ? base + "…" : base + ": " + (step.start || "Start");
  return base;
}

// the meter on the table, above the dessert
function drawMeter() {
  const s = bStep();
  const value = bake.v[s.id] || 0;
  const amount = s.type === "hold" || s.type === "pipe";

  bMeterRow.hidden = s.type === "decorate";
  bMeter.className = "meter" + (s.type === "timing" ? " timing" : "");
  bZone.hidden = !(amount || s.type === "timing");
  bNeedle.hidden = s.type !== "timing";
  bAction.hidden = !(s.type === "timing" && bake.heating);
  bAction.textContent = s.stop || "Stop!";

  if (amount) {
    bMeterLabel.textContent = "Let go in the pink zone 💗";
    bZone.style.left = (s.target[0] / s.max) * 100 + "%";
    bZone.style.width = ((s.target[1] - s.target[0]) / s.max) * 100 + "%";
    bFill.style.width = Math.min(100, (value / s.max) * 100) + "%";
  } else if (s.type === "timing") {
    bMeterLabel.textContent = bake.heating ? "Stop it in the green zone ✨" : "Raw · Golden · Burnt";
    bZone.style.left = s.zone[0] * 100 + "%";
    bZone.style.width = (s.zone[1] - s.zone[0]) * 100 + "%";
    bNeedle.style.left = value * 100 + "%";
    bFill.style.width = "0";
  } else if (s.type === "tap") {
    bMeterLabel.textContent = (bake.v[s.id] || 0) + " of " + s.times;
    bFill.style.width = (value / s.times) * 100 + "%";
  } else {
    bMeterLabel.textContent = "Keep going!";
    bFill.style.width = Math.min(100, value * 100) + "%";
  }
}

// Is the amount right? Used when you let go of a "hold" tool or the piping bag.
function judgeAmount(s, value) {
  if (value < s.target[0] * 0.6) { bHint.textContent = "A bit more… hold it again."; drawBake(); return; }
  if (value >= s.target[0] && value <= s.target[1]) { nextBakeStep("Perfect amount!"); return; }
  bake.stars = Math.max(1, bake.stars - 1);
  nextBakeStep(value > s.target[1] ? "Oops, a little too much! Still yummy." : "A little less than the recipe, but okay!");
}


// ---------- tap, and turning things on ----------
function onToolClick(name) {
  const s = bStep();
  if (bake.busy || s.tool !== name || s.type === "hold") return;
  restartAnimation(bake.tools[name], "tapped");

  if (s.type === "tap") {
    bake.v[s.id] = (bake.v[s.id] || 0) + 1;
    if (bake.v[s.id] >= s.times) nextBakeStep("Yum, all in!");
    else { bHint.textContent = (s.times - bake.v[s.id]) + " more!"; drawBake(); }
  }
  if (s.type === "timing" && !bake.heating) startTiming(s);
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
    bake.v[s.id] = Math.min(s.max, (bake.v[s.id] || 0) + s.speed * (Math.min(0.1, (now - last) / 1000)));
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
  judgeAmount(s, bake.v[s.id] || 0);
}


// ---------- timing: on, watch it rise, Turn off! ----------
// The needle only goes one way, slowly (about 9 seconds from raw to burnt).
const BAKE_SECONDS = 9;

function startTiming(s) {
  bake.heating = true;
  bake.v[s.id] = 0;
  bHint.textContent = "It's cooking! Press " + (s.stop || "Stop!") + " in the green zone.";
  drawBake();
  bAction.focus();

  let last = performance.now();
  function tick(now) {
    if (!bake.heating || bStep() !== s) return;
    bake.v[s.id] = Math.min(1, bake.v[s.id] + Math.min(0.1, (now - last) / 1000) / BAKE_SECONDS);
    last = now;
    drawDessert();
    drawMeter();
    if (bake.v[s.id] >= 1) { stopTiming(); return; }     // left it too long!
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function stopTiming() {
  const s = bStep();
  if (!bake.heating || s.type !== "timing") return;
  bake.heating = false;
  const value = bake.v[s.id];
  if (value >= s.zone[0] && value <= s.zone[1]) { nextBakeStep("Golden and perfect!"); return; }
  bake.stars = Math.max(1, bake.stars - 1);
  nextBakeStep(value < s.zone[0] ? "Hmm, a little pale. Still tasty!" : "Oops, a bit too dark! Still tasty.");
}

bAction.addEventListener("click", stopTiming);


// ---------- dragging on the plate: pipe, rub and swipe ----------
const drag2 = { down: false, startX: 0, startY: 0, cells: [], touched: new Set() };
const pipe = { on: false, x: 0, y: 0 };

// Where is the pointer on the drawing? (0–200 across and down)
function plateXY(event) {
  const box = bPlate.getBoundingClientRect();
  return { x: ((event.clientX - box.left) / box.width) * 200, y: ((event.clientY - box.top) / box.height) * 200 };
}

function insideArea(area, x, y) {
  if (area.rx) return ((x - area.cx) / area.rx) ** 2 + ((y - area.cy) / area.ry) ** 2 <= 1;
  return x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h;
}

// --- pipe: cream flows while the mouse is held down ---
function startPipe(s, x, y) {
  pipe.on = true;
  pipe.x = x;
  pipe.y = y;
  bHand.classList.add("flowing");
  let last = performance.now();
  function tick(now) {
    if (!pipe.on || bStep() !== s) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    // only cream that lands on the dessert counts
    if (insideArea(s.area, pipe.x, pipe.y)) {
      bake.v[s.id] = Math.min(s.max, bake.v[s.id] + s.speed * dt);
      const marks = bake.marks[s.id];
      const lastMark = marks[marks.length - 1];
      if (lastMark && Math.hypot(lastMark.x - pipe.x, lastMark.y - pipe.y) < 6) {
        lastMark.r = Math.min(18, (lastMark.r || 7) + 14 * dt);    // stay still: the blob grows
      } else {
        marks.push({ x: pipe.x, y: pipe.y, r: 7 });                // moving: a new blob
      }
      drawDessert();
      drawMeter();
      if (bake.v[s.id] >= s.max) { stopPipe(); return; }          // overflowing!
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function stopPipe() {
  if (!pipe.on) return;
  pipe.on = false;
  bHand.classList.remove("flowing");
  const s = bStep();
  if (s.type === "pipe") judgeAmount(s, bake.v[s.id]);
}

// --- rub: split the area into a grid; rubbing near a square "covers" it ---
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

// --- swipe: how far have you dragged in the right direction? ---
function swipeTo(s, x, y) {
  const along = (x - drag2.startX) * s.dir[0] + (y - drag2.startY) * s.dir[1];
  const progress = Math.max(bake.v[s.id] || 0, Math.min(1, along / 110));
  if (progress === bake.v[s.id]) return;
  bake.v[s.id] = progress;
  drawDessert();
  drawMeter();
  if (progress >= 1) {
    drag2.down = false;
    const done = { fold: "A perfect little cone!", roll: "All rolled up!", slice: "Look at that swirl!" };
    nextBakeStep(done[s.id] || "Lovely!");
  }
}

// --- stir: each time you change direction after a decent swish, it mixes more ---
const stir = { lastX: 0, dir: 0, travel: 0 };
function stirTo(s, x) {
  const dx = x - stir.lastX;
  stir.lastX = x;
  if (Math.abs(dx) < 0.5) return;
  const dir = Math.sign(dx);
  if (stir.dir !== 0 && dir !== stir.dir) {
    if (stir.travel > 18) addStir(s);
    stir.travel = 0;
  }
  stir.dir = dir;
  stir.travel += Math.abs(dx);
}
function addStir(s) {
  bake.v[s.id] = Math.min(1, bake.v[s.id] + 1 / s.times);
  drawDessert();
  drawMeter();
  if (bake.v[s.id] >= 1) { drag2.down = false; nextBakeStep("All mixed and pink!"); }
}

// the tool follows your mouse over the plate
function moveHand(event) {
  const s = bStep();
  const show = !bake.busy && onPlate(s) && s.type !== "stir";   // stirring uses the spoon in the glass
  bHand.hidden = !show;
  if (!show) return;
  if (bHand.dataset.tool !== s.tool) { bHand.innerHTML = TOOL_ART[s.tool](); bHand.dataset.tool = s.tool; }
  const box = bPlate.getBoundingClientRect();
  bHand.style.left = ((event.clientX - box.left) / box.width) * 100 + "%";
  bHand.style.top = ((event.clientY - box.top) / box.height) * 100 + "%";
  bHand.classList.toggle("pressed", drag2.down && s.type !== "pipe");
}

bPlate.addEventListener("pointerdown", function (event) {
  const s = bStep();
  if (bake.busy || !onPlate(s)) return;
  event.preventDefault();
  bPlate.setPointerCapture(event.pointerId);
  drag2.down = true;
  const p = plateXY(event);
  moveHand(event);
  if (s.type === "pipe") { startPipe(s, p.x, p.y); return; }
  if (s.type === "stir") { stir.lastX = p.x; stir.dir = 0; stir.travel = 0; return; }
  // a swipe continues from where you got to last time
  const sofar = (bake.v[s.id] || 0) * 110;
  drag2.startX = p.x - (s.dir ? s.dir[0] * sofar : 0);
  drag2.startY = p.y - (s.dir ? s.dir[1] * sofar : 0);
  if (s.type === "rub") rubAt(s, p.x, p.y);
});

bPlate.addEventListener("pointermove", function (event) {
  moveHand(event);
  const s = bStep();
  const p = plateXY(event);
  if (pipe.on) { pipe.x = p.x; pipe.y = p.y; return; }
  if (!drag2.down || bake.busy) return;
  if (s.type === "rub") rubAt(s, p.x, p.y);
  if (s.type === "swipe") swipeTo(s, p.x, p.y);
  if (s.type === "stir") stirTo(s, p.x);
});

["pointerup", "pointercancel"].forEach(function (type) {
  bPlate.addEventListener(type, function (event) { drag2.down = false; stopPipe(); moveHand(event); });
});
bPlate.addEventListener("pointerleave", function () { if (!pipe.on) bHand.hidden = true; });

// keyboard: hold Space on the plate to pipe; arrow keys rub, swipe and stir
bPlate.addEventListener("keydown", function (event) {
  const s = bStep();
  if (bake.busy) return;
  if (s.type === "pipe" && event.key === " " && !event.repeat) {
    event.preventDefault();
    const a = s.area;
    startPipe(s, a.rx ? a.cx : a.x + a.w / 2, a.rx ? a.cy : a.y + a.h / 2);
    return;
  }
  if (!event.key.startsWith("Arrow")) return;
  event.preventDefault();
  if (s.type === "pipe" && pipe.on) {           // move the piping bag around
    pipe.x += event.key === "ArrowRight" ? 10 : event.key === "ArrowLeft" ? -10 : 0;
    pipe.y += event.key === "ArrowDown" ? 10 : event.key === "ArrowUp" ? -10 : 0;
  }
  if (s.type === "rub") {
    const c = drag2.cells[Math.floor(Math.random() * drag2.cells.length)];
    rubAt(s, c.x + Math.random() * 6 - 3, c.y + Math.random() * 6 - 3);
  }
  if (s.type === "stir" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    const dir = event.key === "ArrowLeft" ? -1 : 1;
    if (dir !== stir.dir) addStir(s);
    stir.dir = dir;
  }
  if (s.type === "swipe") {
    drag2.startX = 0; drag2.startY = 0;
    const next = Math.min(1, (bake.v[s.id] || 0) + 0.2) * 110;
    swipeTo(s, s.dir[0] * next, s.dir[1] * next);
  }
});
bPlate.addEventListener("keyup", function (event) { if (event.key === " ") stopPipe(); });


// ---------- Start over, and Done ----------
bRestart.addEventListener("click", resetBake);

bDone.addEventListener("click", function () {
  bake.onDone(bake.stars, Decor.art(bake.recipe.draw(artState())), Decor.count());
});
