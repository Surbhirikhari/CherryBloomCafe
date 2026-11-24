// =========================================================
// Cherry Blossom Cafe — bakery.js
// The Bakery Station: one station that makes everything on the menu.
// It reads a recipe (desserts.js, drinks.js) and runs its steps one by one.
//
// The work table: the dessert (or drink) on the left, and on the right
// ONE BIG thing for this step: a tool to pick up, the oven, or the
// toppings for decorating.
//
// Kinds of steps:
//   drop    - drag things in (strawberries, ice, flowers, matcha scoops)
//   pour    - carry the kettle, bowl or bottle over: it pours while it's over
//   pipe    - carry the piping bag: cream flows out wherever you hold it
//   drizzle - carry the honey dipper: honey drips wherever you hold it
//   stir    - put the spoon (whisk, masher) in and move it side to side
//             (axis "y": up and down)
//   rub     - move the sifter over the dessert to dust it
//   tap     - click the big tool (the coffee grinder)
//   swipe   - drag on the dessert to fold, roll or slice it
//   timer   - put it in the oven or toaster, press Start ON the oven,
//             and press Stop (in the same place) at the right time: 5 seconds.
//             The pan and the espresso machine have Start/Stop under them.
//             "autoStop" (the toaster): it pops up BY ITSELF at the right time,
//             and you lift the toast out onto the plate.
//             "clickPlate" (the crêpe pan): it starts cooking by itself,
//             and you click the crêpe to flip it.
//   decorate - the cutting board and toppings (decor.js), then Done
//
// Like a real kitchen, YOU decide when a step is finished: press
// "Next step". Too much, too little, too many or too few all cost points.
// =========================================================


// ---------- Grab the page parts ----------
const $ = (id) => document.getElementById(id);
const bTitle = $("b-title"), bSteps = $("b-steps"), bHint = $("b-hint");
const bRestart = $("b-restart"), bDone = $("b-done");
const bMeterRow = $("b-meter-row"), bMeterLabel = $("b-meter-label"), bMeter = $("b-meter");
const bZone = $("b-zone"), bFill = $("b-fill"), bNeedle = $("b-needle");
const bNext = $("b-next");
const bControls = $("b-controls"), bCtlTimer = $("b-ctl-timer"), bCtlBtn = $("b-ctl-btn");
const bPlate = $("b-plate"), bArt = $("b-art"), bToppings = $("b-toppings");
const bTool = $("b-tool"), bToolArt = $("b-tool-art"), bToolLabel = $("b-tool-label");
const bAppliance = $("b-appliance"), bApplianceArt = $("b-appliance-art"), bInside = $("b-inside"), bTimer = $("b-timer");
const bDecorZone = $("b-decor-zone"), bCarry = $("b-carry");


// ---------- The station's memory ----------
const bake = {
  id: null,             // which recipe, e.g. "crepe"
  recipe: null,         // the recipe itself
  index: 0,             // which step we're on
  v: {},                // how far each step got, e.g. { batter: 0.8, cook: 0.5 }
  marks: {},            // where cream, honey or sugar landed
  done: new Set(),      // the steps that are finished
  scores: [],           // how well each step went: { label, pct }
  busy: false,          // true for a moment between steps
  timer: { phase: "", t: 0 },   // for timer steps: "load", "ready", "running", "done"
  onDone: null,         // what to call when it's served
};

const FLOWS = ["pour", "pipe", "drizzle"];                     // something flows out of the tool
const COMMIT = ["pour", "pipe", "drizzle", "drop", "stir", "rub", "tap"];   // finished with "Next step"

function bStep() { return bake.recipe.steps[bake.index]; }


// ---------- Opening the station ----------
function openBakeStation(id, onDone) {
  bake.id = id;
  bake.recipe = DESSERTS[id];
  bake.onDone = onDone;
  bTitle.textContent = bake.recipe.name;
  Decor.attach(bDecorZone, bToppings, bake.recipe.tray);
  resetBake();
}

function resetBake() {
  endCarry(null, true);
  bake.timer = { phase: "", t: 0 };
  bake.index = 0;
  bake.v = {};
  bake.marks = {};
  bake.done = new Set();
  bake.scores = [];
  bake.busy = false;
  Decor.reset();
  startStep();
}

// get ready for the current step
function startStep() {
  const s = bStep();
  bHint.textContent = s.hint;
  bake.v[s.id] = 0;
  if (FLOWS.includes(s.type)) bake.marks[s.id] = [];
  if (s.type === "rub") prepareRub(s);
  if (s.type === "timer") bake.timer = { phase: s.appliance ? "load" : "ready", t: 0 };
  bArt.style.visibility = "";
  bTool.dataset.tool = "";
  drawBake();
  if (s.type === "timer" && s.clickPlate) startTimer(s);      // the pan is already hot
}

function nextBakeStep(message) {
  endCarry(null, true);
  const s = bStep();
  bake.done.add(s.id);
  bake.busy = true;
  bControls.hidden = true;
  bHint.textContent = message;
  drawBake();
  restartAnimation(bPlate, "yay");
  setTimeout(function () {
    bake.busy = false;
    bake.index = bake.index + 1;
    startStep();
  }, 900);
}


// ---------- Scores ----------
// How close is "value" to the zone from lo to hi? 100% inside it;
// outside it, you lose points the further off you are ("range" = how quickly).
function closeness(value, lo, hi, range) {
  if (value >= lo && value <= hi) return 100;
  const off = value < lo ? lo - value : value - hi;
  return Math.max(30, Math.round(100 - (off / range) * 100));
}

// "Next step": you say this step is finished, so we score it
function commitStep() {
  const s = bStep();
  if (bake.busy || !COMMIT.includes(s.type)) return;
  endCarry(null, true);
  const value = bake.v[s.id] || 0;
  let pct, why = "";
  if (s.target) {
    pct = closeness(value, s.target[0], s.target[1], s.max * 0.5);
    why = value > s.target[1] ? "A bit too much. " : "Not quite enough. ";
  } else if (s.type === "stir") {
    pct = Math.max(30, Math.round(Math.min(1, value) * 100));
    why = "Not quite mixed. ";
  } else if (s.type === "rub") {
    pct = Math.max(30, Math.min(100, Math.round((value / 0.85) * 100)));
    why = "Some bits were missed. ";
  } else {
    pct = Math.max(30, 100 - Math.abs(value - s.times) * 25);
    why = value > s.times ? "A few too many. " : "A few too few. ";
  }
  bake.scores.push({ label: s.text, pct });
  nextBakeStep(pct === 100 ? "Perfect! 100%" : why + pct + "%");
}


// ---------- Drawing ----------
function artState() {
  // flow: where the kettle, bag or honey is pouring from right now (or null)
  const flow = carry.on && carry.over && FLOWS.includes(carry.s.type) && (bake.v[carry.s.id] || 0) < carry.s.max
    ? { x: carry.x, y: carry.y } : null;
  return { v: bake.v, marks: bake.marks, step: bStep().id, done: (id) => bake.done.has(id), flow };
}

function drawDessert() {
  bArt.innerHTML = bake.recipe.draw(artState());
}

function drawBake() {
  const s = bStep();
  drawDessert();
  drawSide(s);
  bPlate.classList.toggle("active", !bake.busy && s.type === "swipe" && !s.carry);
  bPlate.classList.toggle("grab", !bake.busy && s.type === "timer" && bake.timer.phase === "load");
  bPlate.classList.toggle("clickable", !bake.busy && s.type === "timer" && !!s.clickPlate && bake.timer.phase === "running");
  // give the oven and toaster more room on the table
  bPlate.closest(".work-area").classList.toggle("big-side", s.type === "timer" && !!s.appliance);

  // the checklist
  bSteps.innerHTML = "";
  bake.recipe.steps.forEach(function (step, i) {
    const li = document.createElement("li");
    li.innerHTML = TOOL_ART[step.tool]() + "<span>" + step.text + "</span>";
    if (bake.done.has(step.id)) li.className = "done";
    else if (i === bake.index) li.className = "next";
    bSteps.appendChild(li);
  });

  drawMeter(s);
  Decor.enable(s.type === "decorate");
  bDone.disabled = s.type !== "decorate";
}

// the right side of the table: the big tool, the oven/toaster, or the toppings
function drawSide(s) {
  const decorating = s.type === "decorate";
  const appliance = s.type === "timer" && s.appliance;
  bDecorZone.hidden = !decorating;
  bAppliance.hidden = !appliance;
  bTool.hidden = decorating || !!appliance;
  if (appliance) drawAppliance(s);
  drawControls(s);
  if (bTool.hidden) return;

  if (bTool.dataset.tool !== s.tool) {                 // a new tool arrives on the table
    bToolArt.innerHTML = TOOL_ART[s.tool]();
    bTool.dataset.tool = s.tool;
    restartAnimation(bTool, "arrive");
  }
  bToolLabel.textContent = toolLabel(s);
  bTool.disabled = bake.busy || (s.type === "swipe" && !s.carry) || s.type === "timer";
  bTool.classList.toggle("lifted", carry.on);
  bTool.classList.toggle("picture", s.type === "swipe" && !s.carry);
}

const TOOL_NAMES = {
  batter: "Batter bowl", spatula: "Spatula", piping: "Piping bag", berries: "Strawberries", fold: "Fold",
  oven: "Oven", toaster: "Toaster", knife: "Knife", roll: "Roll", honey: "Honey", sifter: "Sugar sifter",
};
function toolLabel(s) {
  const name = TOOL_NAMES[s.tool] || s.tool;
  if (s.carry) return name + " · drag it over";
  if (s.type === "swipe") return "Drag on the dessert";
  if (s.type === "tap") return name + " · click it";
  if (s.type === "timer") return name;
  return name;
}

// Start / Stop: right on the oven or toaster, or just under the pan or espresso machine
function drawControls(s) {
  const phase = bake.timer.phase;
  const show = s.type === "timer" && (phase === "ready" || phase === "running") && !bake.busy;
  bControls.hidden = !show;
  if (!show) return;
  const home = s.appliance ? bAppliance : bTool.parentElement;
  if (bControls.parentElement !== home) {
    if (s.appliance) home.appendChild(bControls);
    else bTool.after(bControls);
  }
  bControls.classList.toggle("on-appliance", !!s.appliance);
  bCtlTimer.hidden = !!s.appliance;                // the oven and toaster show their own timer
  bCtlTimer.textContent = bake.timer.t.toFixed(1) + "s";
  bCtlBtn.textContent = phase === "running" ? (s.autoStop ? "Toasting…" : s.stop) : (s.start || "Start ▶");
  bCtlBtn.disabled = phase === "running" && !!s.autoStop;
  bCtlBtn.hidden = !!s.clickPlate;                 // on the pan, you click the crêpe itself
  bCtlBtn.classList.toggle("stop", phase === "running" && !s.autoStop);
}

bCtlBtn.addEventListener("click", function () {
  const s = bStep();
  if (bake.busy || s.type !== "timer") return;
  if (bake.timer.phase === "ready") startTimer(s);
  else if (bake.timer.phase === "running") stopTimer();
});

// the oven or toaster, with the dessert inside and the timer on the front
function drawAppliance(s) {
  const loaded = bake.timer.phase !== "load" && !(bake.timer.phase === "popped" && carry.on);
  const on = bake.timer.phase === "running";
  bAppliance.className = "appliance " + s.appliance + (on ? " on" : "") + (bake.timer.phase === "popped" ? " popped" : "");
  bApplianceArt.innerHTML = APPLIANCE_ART[s.appliance]({ loaded, on, shade: bake.v[s.id] || 0 });
  bInside.innerHTML = s.appliance === "oven" && loaded ? bake.recipe.draw(artState()) : "";
  bTimer.textContent = bake.timer.t.toFixed(1) + "s";
}

// the meter above the dessert, and the Next step / stop buttons
function drawMeter(s) {
  const value = bake.v[s.id] || 0;
  bMeterRow.hidden = s.type === "decorate";
  bNext.hidden = !COMMIT.includes(s.type);
  bNext.disabled = bake.busy || value <= 0;
  bMeter.className = "meter" + (s.type === "timer" ? " timing" : "");
  bNeedle.hidden = s.type !== "timer";
  bZone.hidden = s.type === "swipe";

  const zone = (lo, hi) => { bZone.style.left = lo * 100 + "%"; bZone.style.width = (hi - lo) * 100 + "%"; };
  if (s.target) {
    bMeterLabel.textContent = "Stop in the pink zone 💗";
    zone(s.target[0] / s.max, s.target[1] / s.max);
    bFill.style.width = Math.min(100, (value / s.max) * 100) + "%";
  } else if (s.type === "timer") {
    const t = bake.timer.t;
    bMeterLabel.textContent =
      bake.timer.phase === "load" ? "Drag it into the " + s.appliance + " →" :
      bake.timer.phase === "popped" ? "Pop! Lift it out onto the plate ←" :
      bake.timer.phase === "ready" ? "Press " + (s.start || "Start ▶") + (s.appliance ? " on the " + s.appliance : "") :
      s.clickPlate ? "⏱ " + t.toFixed(1) + "s · click the crêpe to flip it at " + s.seconds.toFixed(1) + "s" :
      "⏱ " + t.toFixed(1) + "s · stop at " + s.seconds.toFixed(1) + "s";
    zone((s.seconds - 0.3) / 10, (s.seconds + 0.3) / 10);
    bNeedle.style.left = Math.min(100, t * 10) + "%";
    bFill.style.width = "0";
  } else if (s.times && s.type !== "stir") {
    const most = s.times + 3;
    bMeterLabel.textContent = value + " in · the recipe says " + s.times;
    zone((s.times - 0.5) / most, (s.times + 0.5) / most);
    bFill.style.width = Math.min(100, (value / most) * 100) + "%";
  } else if (s.type === "stir") {
    bMeterLabel.textContent = value >= 1 ? "All mixed! Press Next step" : "Keep going…";
    zone(0.95, 1);
    bFill.style.width = Math.min(100, value * 100) + "%";
  } else if (s.type === "rub") {
    bMeterLabel.textContent = value >= 0.85 ? "All covered! Press Next step" : "Cover it all over…";
    zone(0.85, 1);
    bFill.style.width = Math.min(100, value * 100) + "%";
  } else {
    bMeterLabel.textContent = "Keep going!";
    bFill.style.width = Math.min(100, value * 100) + "%";
  }
}


// ---------- The big tool: click it, or pick it up ----------
bTool.addEventListener("pointerdown", function (event) {
  const s = bStep();
  if (bake.busy || !s.carry) return;
  startCarry(event, CARRY_ART[s.carry]);
});

bTool.addEventListener("click", function (event) {
  const s = bStep();
  if (bake.busy) return;
  if (s.type === "tap") {
    if (bake.v[s.id] >= s.times + 3) { bHint.textContent = "That's plenty!"; return; }
    bake.v[s.id] = bake.v[s.id] + 1;
    restartAnimation(bTool, "tapped");
    bHint.textContent = bake.v[s.id] + (bake.v[s.id] === 1 ? " turn." : " turns.") + " Press Next step when you think it's right.";
    drawBake();
  }
  if (s.type === "drop" && event.detail === 0) dropOne(s);          // keyboard: Enter drops one
});

// keyboard: hold Space or Enter on a pouring tool to pour into the middle
bTool.addEventListener("keydown", (event) => keyboardFlow(event, true));
bTool.addEventListener("keyup", (event) => keyboardFlow(event, false));
function keyboardFlow(event, down) {
  const s = bStep();
  if (!s.carry || !FLOWS.includes(s.type) || (event.key !== " " && event.key !== "Enter")) return;
  event.preventDefault();
  if (down && !carry.on && !event.repeat) {
    const a = s.area;
    Object.assign(carry, { on: true, s, over: true, look: null });
    carry.x = a.rx ? a.cx : a.x + a.w / 2;
    carry.y = a.rx ? a.cy : s.type === "pipe" ? a.y + a.h / 2 : a.y + 20;
    startFlow(s);
  } else if (!down) {
    endCarry(null, false);
  }
}


// ---------- Carrying something (a tool, or the dessert into the oven) ----------
const carry = { on: false, s: null, look: null, x: 0, y: 0, over: false, overAppliance: false, swiping: false };

function startCarry(event, look) {
  const s = bStep();
  if (carry.on) return;
  event.preventDefault();
  Object.assign(carry, { on: true, s, look, over: false, overAppliance: false, swiping: false });
  stir.dir = 0; stir.travel = 0; stir.lastX = null;
  bCarry.innerHTML = look.art();
  bCarry.style.width = bPlate.getBoundingClientRect().width * look.size + "px";
  bCarry.style.transformOrigin = look.tip[0] * 100 + "% " + look.tip[1] * 100 + "%";
  bCarry.style.setProperty("--tilt", (look.tilt || 0) + "deg");
  bCarry.hidden = false;
  bTool.classList.add("lifted");
  moveCarry(event);
  document.addEventListener("pointermove", moveCarry);
  document.addEventListener("pointerup", onCarryUp);
  if (FLOWS.includes(s.type)) startFlow(s);
}

// Where is the pointer on the drawing? (0–200 across and down, even outside the plate)
function plateXY(event) {
  const box = bPlate.getBoundingClientRect();
  return { x: ((event.clientX - box.left) / box.width) * 200, y: ((event.clientY - box.top) / box.height) * 200 };
}

function insideArea(area, x, y) {
  if (!area) return false;
  if (area.rx) return ((x - area.cx) / area.rx) ** 2 + ((y - area.cy) / area.ry) ** 2 <= 1;
  return x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h;
}

function moveCarry(event) {
  if (!carry.on || !carry.look) return;
  const look = carry.look, s = carry.s;
  // put the tool's tip (the kettle spout, the spoon bowl…) right on the pointer
  bCarry.style.left = event.clientX - bCarry.offsetWidth * look.tip[0] + "px";
  bCarry.style.top = event.clientY - bCarry.offsetHeight * look.tip[1] + "px";
  const p = plateXY(event);
  carry.x = p.x;
  carry.y = p.y;
  carry.over = insideArea(s.area, p.x, p.y);

  if (s.type === "timer") {                    // carrying the dessert in (or the toast out)
    const inBox = (el) => { const r = el.getBoundingClientRect(); return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom; };
    if (bake.timer.phase === "popped") {
      carry.overPlate = inBox(bPlate);
      bPlate.classList.toggle("target", carry.overPlate);
    } else {
      carry.overAppliance = inBox(bAppliance);
      bAppliance.classList.toggle("target", carry.overAppliance);
    }
    return;
  }
  bCarry.classList.toggle("tilted", carry.over && (s.type === "pour" || s.type === "drizzle"));
  bCarry.classList.toggle("squeeze", carry.over && s.type === "pipe");
  bCarry.classList.toggle("in-glass", carry.over && (s.type === "stir" || s.type === "swipe"));
  if (!carry.over) { carry.swiping = false; return; }

  if (s.type === "stir") stirTo(s, s.axis === "y" ? p.y : p.x);
  if (s.type === "rub") rubAt(s, p.x, p.y);
  if (s.type === "swipe") {
    if (!carry.swiping) {                       // the knife just touched the dessert
      carry.swiping = true;
      const sofar = (bake.v[s.id] || 0) * 110;
      drag2.startX = p.x - s.dir[0] * sofar;
      drag2.startY = p.y - s.dir[1] * sofar;
    }
    swipeTo(s, p.x, p.y);
  }
}

function onCarryUp() { endCarry(null, false); }

// let go: the tool goes back on the table
function endCarry(event, quiet) {
  if (!carry.on) return;
  const s = carry.s;
  const wasOver = carry.over, intoAppliance = carry.overAppliance, ontoPlate = carry.overPlate;
  carry.on = false;
  carry.over = false;
  carry.overAppliance = false;
  carry.overPlate = false;
  bPlate.classList.remove("target");
  bCarry.hidden = true;
  bCarry.classList.remove("tilted", "in-glass", "squeeze");
  bAppliance.classList.remove("target");
  bTool.classList.remove("lifted");
  document.removeEventListener("pointermove", moveCarry);
  document.removeEventListener("pointerup", onCarryUp);
  if (s.type === "timer" && bake.timer.phase === "load" && !intoAppliance) bArt.style.visibility = "";
  if (quiet || bake.busy || bStep() !== s) return;

  if (s.type === "drop") {
    if (wasOver) dropOne(s);
    else bHint.textContent = "Drop it in!";
  }
  if (s.type === "timer" && bake.timer.phase === "load") {
    if (intoAppliance) {
      bake.timer.phase = "ready";
      bArt.style.visibility = "hidden";                // it's in the oven now
      bHint.textContent = "It's in! Press " + (s.start || "Start ▶") + " on the " + s.appliance + ".";
      drawBake();
      bCtlBtn.focus();
    } else {
      bHint.textContent = "Drop it into the " + s.appliance + "!";
    }
  }
  if (s.type === "timer" && bake.timer.phase === "popped") {
    if (ontoPlate) { bArt.style.visibility = ""; nextBakeStep("Golden, crispy toast!"); }
    else { bHint.textContent = "Put the toast on the plate!"; drawAppliance(s); }
  }
  if (FLOWS.includes(s.type)) drawBake();
}

// drop: one more thing goes in
function dropOne(s) {
  if (bake.v[s.id] >= s.times + 3) { bHint.textContent = "That's plenty!"; return; }
  bake.v[s.id] = bake.v[s.id] + 1;
  restartAnimation(bPlate, "yay");
  bHint.textContent = "Plop! " + bake.v[s.id] + " in. The recipe says " + s.times + ". Press Next step when you're happy.";
  drawBake();
}

// pour, pipe and drizzle: while the tool is over the dessert, it keeps flowing
function startFlow(s) {
  let last = performance.now();
  let warned = false;
  function tick(now) {
    if (!carry.on || carry.s !== s) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (carry.over && bake.v[s.id] < s.max) {
      bake.v[s.id] = Math.min(s.max, bake.v[s.id] + s.speed * dt);
      const marks = bake.marks[s.id];
      const lastMark = marks[marks.length - 1];
      const near = lastMark && Math.hypot(lastMark.x - carry.x, lastMark.y - carry.y) < (s.type === "pipe" ? 6 : 5);
      if (s.type === "pipe") {
        // cream comes out right under the nozzle: a new blob when you move, a bigger one if you stay
        if (near) lastMark.r = Math.min(18, lastMark.r + 14 * dt);
        else marks.push({ x: carry.x, y: carry.y, r: 7 });
      }
      if (s.type === "drizzle") {
        if (near) lastMark.r = Math.min(9, lastMark.r + 6 * dt);
        else marks.push({ x: carry.x, y: carry.y, r: 2.5 });
      }
      bNext.disabled = false;
      if (bake.v[s.id] >= s.max && !warned) { warned = true; bHint.textContent = "Oops, it's overflowing! Press Next step (or Start over)."; }
      drawMeter(s);
    }
    drawDessert();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


// ---------- timer: the oven, the toaster, the pan, the espresso machine ----------
function startTimer(s) {
  bake.timer = { phase: "running", t: 0 };
  if (s.appliance) bArt.style.visibility = "hidden";     // it's inside the oven now
  bHint.textContent = s.clickPlate
    ? "It's cooking! Click the crêpe to flip it at " + s.seconds + " seconds."
    : "The timer is running! Press " + s.stop + " at " + s.seconds + " seconds.";
  drawBake();
  if (!s.clickPlate) bCtlBtn.focus();
  let last = performance.now();
  function tick(now) {
    if (bake.timer.phase !== "running" || bStep() !== s) return;
    bake.timer.t += Math.min(0.1, (now - last) / 1000);
    last = now;
    bake.v[s.id] = Math.min(1, bake.timer.t * 0.11);      // golden at 5 seconds, burnt at 9
    if (s.autoStop && bake.timer.t >= s.seconds) { popUp(s); return; }
    if (s.appliance) drawAppliance(s); else drawDessert();
    bCtlTimer.textContent = bake.timer.t.toFixed(1) + "s";
    drawMeter(s);
    if (bake.timer.t >= 10) { stopTimer(); return; }      // left it far too long!
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// the toaster pops the bread up by itself; now you lift it out
function popUp(s) {
  bake.timer.phase = "popped";
  bake.timer.t = s.seconds;
  bake.v[s.id] = 0.55;                                  // perfectly golden
  bHint.textContent = "Pop! The toast is ready. Drag it out onto the plate.";
  drawBake();
  restartAnimation(bAppliance, "pop");
}

// lifting the toast out of the toaster
bAppliance.addEventListener("pointerdown", function (event) {
  const s = bStep();
  if (bake.busy || s.type !== "timer" || bake.timer.phase !== "popped") return;
  const art = bake.recipe.draw(artState());
  startCarry(event, { size: 0.62, tip: [0.5, 0.5], art: () => art });
  drawAppliance(s);
});

// flip! (a quick flip animation, then the timer is judged)
function flipIt() {
  restartAnimation(bArt, "flip");
  stopTimer();
}

function stopTimer() {
  const s = bStep();
  if (s.type !== "timer" || bake.timer.phase !== "running") return;
  bake.timer.phase = "done";
  bArt.style.visibility = "";
  const t = bake.timer.t;
  const pct = closeness(t, s.seconds - 0.3, s.seconds + 0.3, 4);
  bake.scores.push({ label: s.text, pct });
  nextBakeStep(pct === 100
    ? "Perfect timing! " + t.toFixed(1) + "s · 100%"
    : (t < s.seconds ? "A little early (" : "A little late (") + t.toFixed(1) + "s) · " + pct + "%");
}

bNext.addEventListener("click", commitStep);


// ---------- rub, swipe and stir ----------
const drag2 = { down: false, startX: 0, startY: 0, cells: [], touched: new Set() };

// split the area into a grid of little squares; dusting near one "covers" it
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
}

function rubAt(s, x, y) {
  const marks = bake.marks[s.id];
  const lastMark = marks[marks.length - 1];
  if (lastMark && Math.hypot(lastMark.x - x, lastMark.y - y) < 6) return;
  marks.push({ x, y });
  drag2.cells.forEach(function (c, i) { if (Math.hypot(c.x - x, c.y - y) < 18) drag2.touched.add(i); });
  bake.v[s.id] = drag2.touched.size / drag2.cells.length;
  bNext.disabled = false;
  drawDessert();
  drawMeter(s);
}

// swipe: how far have you dragged in the right direction? (finishes by itself)
function swipeTo(s, x, y) {
  const along = (x - drag2.startX) * s.dir[0] + (y - drag2.startY) * s.dir[1];
  const progress = Math.max(bake.v[s.id] || 0, Math.min(1, along / 110));
  if (progress === bake.v[s.id]) return;
  bake.v[s.id] = progress;
  drawDessert();
  drawMeter(s);
  if (progress >= 1) {
    drag2.down = false;
    const done = { fold1: "Folded in half!", fold2: "A perfect little cone!", roll: "All rolled up!", slice: "Look at that!" };
    nextBakeStep(done[s.id] || "Lovely!");
  }
}

// stir: each time you change direction after a decent swish, it mixes more
const stir = { lastX: null, dir: 0, travel: 0 };
function stirTo(s, x) {
  if (stir.lastX === null) stir.lastX = x;
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
  if (bake.busy || bStep() !== s || bake.v[s.id] >= 1) return;
  bake.v[s.id] = Math.min(1, bake.v[s.id] + 1 / s.times);
  drawDessert();
  drawMeter(s);
  bNext.disabled = false;
}


// ---------- Dragging on the dessert itself ----------
bPlate.addEventListener("pointerdown", function (event) {
  const s = bStep();
  if (bake.busy) return;
  // the pan: click the crêpe to flip it
  if (s.type === "timer" && s.clickPlate && bake.timer.phase === "running") { flipIt(); return; }
  // a timer step with an oven: pick the dessert up and carry it over
  if (s.type === "timer" && bake.timer.phase === "load") {
    const art = bArt.innerHTML;
    startCarry(event, { size: 0.62, tip: [0.5, 0.5], art: () => art });
    bArt.style.visibility = "hidden";
    return;
  }
  if (s.type !== "swipe" || s.carry) return;
  event.preventDefault();
  bPlate.setPointerCapture(event.pointerId);
  drag2.down = true;
  const p = plateXY(event);
  const sofar = (bake.v[s.id] || 0) * 110;       // a swipe carries on from where you got to
  drag2.startX = p.x - s.dir[0] * sofar;
  drag2.startY = p.y - s.dir[1] * sofar;
});

bPlate.addEventListener("pointermove", function (event) {
  const s = bStep();
  if (!drag2.down || bake.busy || s.type !== "swipe") return;
  const p = plateXY(event);
  swipeTo(s, p.x, p.y);
});

["pointerup", "pointercancel"].forEach(function (type) {
  bPlate.addEventListener(type, function () { drag2.down = false; });
});

// keyboard: Enter on the dessert puts it in the oven; arrow keys swipe, stir and dust
bPlate.addEventListener("keydown", function (event) {
  const s = bStep();
  if (bake.busy) return;
  if (s.type === "timer" && s.clickPlate && bake.timer.phase === "running" && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault(); flipIt(); return;
  }
  if (s.type === "timer" && bake.timer.phase === "popped" && event.key === "Enter") {
    bArt.style.visibility = ""; nextBakeStep("Golden, crispy toast!"); return;
  }
  if (s.type === "timer" && bake.timer.phase === "load" && event.key === "Enter") {
    bake.timer.phase = "ready"; bArt.style.visibility = "hidden"; drawBake(); bCtlBtn.focus(); return;
  }
  if (!event.key.startsWith("Arrow")) return;
  event.preventDefault();
  if (s.type === "rub") {
    const c = drag2.cells[Math.floor(Math.random() * drag2.cells.length)];
    rubAt(s, c.x + Math.random() * 6 - 3, c.y + Math.random() * 6 - 3);
  }
  if (s.type === "stir") {
    const dir = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    if (dir !== stir.dir) addStir(s);
    stir.dir = dir;
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
  bake.onDone(bake.scores, Decor.art(bake.recipe.draw(artState())), Decor.count());
});
