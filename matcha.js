// =========================================================
// Cherry Blossom Cafe — matcha.js
// The Matcha Station: a hands-on mini-game for the Strawberry Matcha Latte.
//
//   1. scoop matcha into the bowl (2 scoops)   2. add hot water
//   3. whisk until frothy (drag side to side)  4. pour it into the jar
//   5. hold to pour milk, stop between the lines
//   6. top with strawberry cream
//
// Drawings first, then the station's logic.
// =========================================================


// ---------- Little helpers ----------

// Mix two colours: t = 0 gives a, t = 1 gives b, 0.5 is halfway.
function mixColor(a, b, t) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round(((A >> shift) & 255) + (((B >> shift) & 255) - ((A >> shift) & 255)) * t);
  return "#" + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
}

// Smoothly change a number over time, calling onFrame with each new value.
function animateNumber(from, to, ms, onFrame) {
  return new Promise(function (resolve) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      onFrame(from + (to - from) * t);
      if (t < 1) requestAnimationFrame(tick); else resolve();
    }
    requestAnimationFrame(tick);
  });
}

const LINE = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;


// ---------- Drawings (redrawn from the reference pictures) ----------

// the matcha tin with its lid beside it, and the bamboo scoop resting on top
function matchaTinSVG() {
  return `
    <svg viewBox="0 0 130 118" class="art">
      <path d="M78 64 L78 98 Q100 108 122 98 L122 64" fill="#f4efe4" ${LINE}/>
      <ellipse cx="100" cy="64" rx="22" ry="8" fill="#b5cf8a" ${LINE}/>
      <path d="M10 34 L10 100 Q40 112 70 100 L70 34" fill="#f7f1e6" ${LINE}/>
      <rect x="20" y="56" width="40" height="32" rx="3" fill="#fffdf7" ${LINE} stroke-width="2.5"/>
      <path d="M30 80 Q32 64 46 62 Q46 76 30 80 Z" fill="#8fb565" ${LINE} stroke-width="2"/>
      <rect x="49" y="74" width="7" height="7" fill="#d9475f" stroke="none"/>
      <ellipse cx="40" cy="34" rx="30" ry="10" fill="#7fae4c" ${LINE}/>
      <ellipse cx="40" cy="35" rx="24" ry="7" fill="#8fbd57" stroke="none"/>
      <path d="M14 26 Q62 16 116 10" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M14 26 Q62 16 116 10" fill="none" stroke="#dcb56d" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="16" cy="27" rx="8" ry="5" fill="#7fae4c" ${LINE} stroke-width="2.5"/>
    </svg>`;
}

// a little pink kettle of hot water
function kettleSVG() {
  return `
    <svg viewBox="0 0 120 112" class="art">
      <path d="M34 52 Q60 14 86 52" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M34 52 Q60 14 86 52" fill="none" stroke="#dcb56d" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 76 Q116 70 114 46 L106 50 Q106 64 94 68 Z" fill="#f6c2cd" ${LINE}/>
      <path d="M18 100 Q12 54 60 48 Q108 54 102 100 Z" fill="#f6c2cd" ${LINE}/>
      <ellipse cx="60" cy="50" rx="18" ry="5" fill="#fbe0e6" ${LINE} stroke-width="2.5"/>
      <circle cx="60" cy="42" r="5" fill="#fbe0e6" ${LINE} stroke-width="2.5"/>
      <text x="60" y="84" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="15" fill="${INK}">80°</text>
      <path d="M44 30 Q40 22 44 14 M58 26 Q54 18 58 10" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    </svg>`;
}

// the bamboo whisk (chasen), handle up and tines down, ready to whisk
function whiskSVG() {
  let tines = "";
  for (let x = 16; x <= 64; x += 6) tines += `<path d="M${x} 82 Q${40 + (x - 40) * 1.25} 120 ${40 + (x - 40) * 0.6} 146" fill="none" stroke="#c99a4e" stroke-width="2"/>`;
  return `
    <svg viewBox="0 0 80 152" class="art">
      <rect x="24" y="4" width="32" height="72" rx="7" fill="#dcb56d" ${LINE}/>
      <path d="M24 64 L56 64" ${LINE} stroke-width="2.5"/>
      <path d="M12 80 Q6 136 40 148 Q74 136 68 80 Q54 74 40 74 Q26 74 12 80 Z" fill="#f3dfae" ${LINE}/>
      ${tines}
      <path d="M14 82 L66 82" ${LINE} stroke-width="5"/>
    </svg>`;
}

// the speckled tea bowl with a little spout. b = { powder, water, froth }
const BOWL_SPECKLES = [];
for (let i = 0; i < 30; i++) BOWL_SPECKLES.push([40 + ((i * 37) % 130), 78 + ((i * 23) % 50)]);
const BOWL_BUBBLES = [];
for (let i = 0; i < 46; i++) {
  const angle = i * 2.4, r = Math.sqrt((i + 0.5) / 46);
  BOWL_BUBBLES.push([105 + Math.cos(angle) * r * 66, 48 + Math.sin(angle) * r * 13, 1.5 + (i % 3)]);
}

function matchaBowlSVG(b) {
  let contents = "";
  if (b.water) {
    const color = mixColor("#4e7a2e", "#a9d16c", b.froth / 100);   // dark tea -> bright froth
    contents = `<ellipse cx="105" cy="54" rx="76" ry="19" fill="${color}"/>`;
    const n = Math.round((b.froth / 100) * BOWL_BUBBLES.length);
    contents += BOWL_BUBBLES.slice(0, n).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#dcefb8" opacity="0.9"/>`).join("");
  } else if (b.powder > 0) {
    contents = `<ellipse cx="105" cy="60" rx="${10 + b.powder * 12}" ry="${5 + b.powder * 4}" fill="#7fae4c"/>`;
  }
  return `
    <svg viewBox="0 0 220 160" class="art">
      <ellipse cx="105" cy="46" rx="88" ry="26" fill="#e6dccb"/>
      ${contents}
      <rect x="80" y="134" width="50" height="12" rx="4" fill="#e3d8c4" ${LINE}/>
      <path d="M17 46 Q20 140 105 142 Q190 140 193 46 A88 26 0 0 1 17 46 Z" fill="#f3ecdf" ${LINE}/>
      ${BOWL_SPECKLES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#b7ab95"/>`).join("")}
      <path d="M184 38 Q210 30 214 42 Q204 52 190 56" fill="#f3ecdf" ${LINE}/>
      <ellipse cx="105" cy="46" rx="88" ry="26" fill="none" ${LINE}/>
    </svg>`;
}

// the milk bottle
function milkBottleSVG() {
  return `
    <svg viewBox="0 0 80 124" class="art">
      <path d="M22 118 L22 52 Q22 40 32 34 L32 14 L48 14 L48 34 Q58 40 58 52 L58 118 Z" fill="#fffdf7" ${LINE}/>
      <rect x="30" y="6" width="20" height="10" rx="3" fill="#f6b8cb" ${LINE}/>
      <rect x="26" y="66" width="28" height="26" rx="3" fill="#f6b8cb" ${LINE} stroke-width="2.5"/>
      <text x="40" y="84" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="10" fill="${INK}">MILK</text>
    </svg>`;
}

// a jar of pink strawberry cream
function strawberryCreamSVG() {
  return `
    <svg viewBox="0 0 92 104" class="art">
      <path d="M14 30 L78 30 L74 96 Q74 100 68 100 L24 100 Q18 100 18 96 Z" fill="#f7b6c2" ${LINE}/>
      <rect x="10" y="18" width="72" height="14" rx="4" fill="#fffdf7" ${LINE}/>
      <circle cx="46" cy="64" r="20" fill="#fffdf7" ${LINE} stroke-width="2.5"/>
      <path d="M46 78 Q32 68 34 58 Q38 50 46 54 Q54 50 58 58 Q60 68 46 78 Z" fill="#f2667f" ${LINE} stroke-width="2"/>
      <path d="M40 52 L44 46 L46 52 L50 46 L52 52 Z" fill="#8fb565" ${LINE} stroke-width="1.5"/>
    </svg>`;
}

// the drink jar. j = { matcha, milk, berry, sparkle } (layer heights in jar units)
const JAR_PATH = "M26 10 L94 10 Q98 10 98 16 L98 22 Q108 28 108 42 L108 154 Q108 164 98 164 L22 164 Q12 164 12 154 L12 42 Q12 28 22 22 L22 16 Q22 10 26 10 Z";
const JAR_BOTTOM = 163;
let jarNumber = 0;

function sparkle(x, y, r) {
  return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="#ffffff"/>`;
}
function doodleFlower(x, y) {
  let petals = "";
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    petals += `<circle cx="${x + Math.cos(a) * 4}" cy="${y + Math.sin(a) * 4}" r="3" fill="none" stroke="#ffffff" stroke-width="1.3"/>`;
  }
  return petals + `<circle cx="${x}" cy="${y}" r="1.4" fill="#ffffff"/>`;
}

function jarSVG(j, showTarget = false) {
  const clipId = "jar-clip-" + jarNumber++;
  let y = JAR_BOTTOM;
  let layers = "";

  // one soft layer with a wavy top edge; returns its top
  function layer(h, color) {
    const top = y - h;
    layers += `<path d="M0 ${y + 2} L0 ${top} Q15 ${top - 4} 30 ${top} T60 ${top} T90 ${top} T120 ${top} L120 ${y + 2} Z" fill="${color}"/>`;
    y = top;
    return top;
  }
  // soft cloudy puffs where two layers meet, so they look blended
  function puffs(atY, color) {
    for (let x = 16; x < 110; x += 15) layers += `<circle cx="${x}" cy="${atY + ((x * 7) % 6)}" r="${7 + ((x * 3) % 5)}" fill="${color}" opacity="0.85"/>`;
  }

  if (j.matcha > 0) {
    const top = layer(j.matcha, "#8fb565");
    for (let k = 0; k < 7; k++) layers += `<path d="M${18 + k * 13} ${JAR_BOTTOM - 8 - (k % 3) * 9} q5 -5 10 0" fill="none" stroke="#6f9a48" stroke-width="2.5" stroke-linecap="round"/>`;
    if (j.milk > 0) puffs(top, "#fbf3e3");
  }
  if (j.milk > 0) {
    const top = layer(j.milk, "#fbf3e3");
    if (j.berry > 0) puffs(top, "#f4aab5");
  }
  if (j.berry > 0) layer(j.berry, "#f4aab5");

  // the two dashed pink lines: aim to stop the milk between them
  let target = "";
  if (showTarget) {
    const low = JAR_BOTTOM - j.matcha - MILK_TARGET[0];
    const high = JAR_BOTTOM - j.matcha - MILK_TARGET[1];
    target = `
      <rect x="0" y="${high}" width="120" height="${low - high}" fill="#f6b8cb" opacity="0.28"/>
      <path d="M12 ${low} L108 ${low} M12 ${high} L108 ${high}" stroke="#d8648b" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  }

  let shine = "";
  if (j.sparkle) {
    shine = sparkle(78, 48, 9) + sparkle(92, 64, 5) + sparkle(32, 132, 6) +
      doodleFlower(86, 36) + doodleFlower(40, 58) + doodleFlower(84, 120) + doodleFlower(28, 112) + doodleFlower(60, 146);
  }

  return `
    <svg viewBox="0 0 120 170" class="art jar-svg">
      <defs><clipPath id="${clipId}"><path d="${JAR_PATH}"/></clipPath></defs>
      <path d="${JAR_PATH}" fill="#f3f8f8" opacity="0.85"/>
      <g clip-path="url(#${clipId})">${layers}${target}</g>
      ${shine}
      <path d="M22 42 L22 146" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      <path d="${JAR_PATH}" fill="none" ${LINE}/>
      <path d="M22 22 L98 22" fill="none" ${LINE} stroke-width="2.5"/>
    </svg>`;
}

// What a finished, perfect drink looks like (for the thought cloud and recipe card).
const PERFECT_JAR = { matcha: 40, milk: 48, berry: 26, sparkle: true };


// ---------- The station's steps ----------
const MILK_TARGET = [40, 55];   // stop the milk between these amounts
const MILK_MAX = 72;            // any more and it overflows
const MILK_SPEED = 30;          // jar units per second while you hold the bottle

const MATCHA_STEPS = [
  { id: "scoop", text: "Scoop matcha (2 scoops)", icon: matchaTinSVG,
    hint: "Click the matcha tin to add a scoop to the bowl." },
  { id: "water", text: "Add hot water", icon: kettleSVG,
    hint: "Click the kettle. 80°C, never boiling, or the matcha turns bitter!" },
  { id: "whisk", text: "Whisk until frothy", icon: whiskSVG,
    hint: "Press on the bowl and drag quickly side to side, like M-M-M. (Or tap ← →.)" },
  { id: "pour",  text: "Pour it into the jar", icon: () => matchaBowlSVG({ powder: 0, water: true, froth: 100 }),
    hint: "Click the bowl to pour the matcha into the jar." },
  { id: "milk",  text: "Pour the milk", icon: milkBottleSVG,
    hint: "Press and HOLD the milk bottle. Let go between the pink lines!" },
  { id: "berry", text: "Top with strawberry cream", icon: strawberryCreamSVG,
    hint: "Click the strawberry cream to finish." },
];


// ---------- The station's memory ----------
const station = {
  step: 0,                                  // which of MATCHA_STEPS we're on
  bowl: { powder: 0, water: false, froth: 0 },
  jar: { matcha: 0, milk: 0, berry: 0, sparkle: false },
  pouringMilk: false,
  onDone: null,                             // what to call when the drink is served
};

const mTin     = document.getElementById("m-tin");
const mKettle  = document.getElementById("m-kettle");
const mBowlBox = document.getElementById("m-bowl-area");
const mBowl    = document.getElementById("m-bowl");
const mWhisk   = document.getElementById("m-whisk");
const mJar     = document.getElementById("m-jar");
const mStream  = document.getElementById("m-stream");
const mMilk    = document.getElementById("m-milk");
const mBerry   = document.getElementById("m-berry");
const mSteps   = document.getElementById("m-steps");
const mFrothBar = document.getElementById("m-froth-bar");
const mFroth   = document.getElementById("m-froth");
const mHint    = document.getElementById("m-hint");
const mRestart = document.getElementById("m-restart");
const mDone    = document.getElementById("m-done");

// draw the tools that never change
document.getElementById("m-tin-art").innerHTML = matchaTinSVG();
document.getElementById("m-kettle-art").innerHTML = kettleSVG();
document.getElementById("m-milk-art").innerHTML = milkBottleSVG();
document.getElementById("m-berry-art").innerHTML = strawberryCreamSVG();
mWhisk.innerHTML = whiskSVG();

function currentStep() {
  return MATCHA_STEPS[station.step] ? MATCHA_STEPS[station.step].id : "finished";
}


// ---------- Opening the station, and drawing it ----------
function openMatchaStation(onDone) {
  station.onDone = onDone;
  resetStation();
}

function resetStation() {
  station.step = 0;
  station.bowl = { powder: 0, water: false, froth: 0 };
  station.jar = { matcha: 0, milk: 0, berry: 0, sparkle: false };
  station.pouringMilk = false;
  mStream.hidden = true;
  drawStation();
}

function drawStation() {
  const step = currentStep();
  mBowl.innerHTML = matchaBowlSVG(station.bowl);
  drawJar();

  // only the tool for this step can be used, and it gently bobs
  mTin.disabled    = step !== "scoop";
  mKettle.disabled = step !== "water";
  mMilk.disabled   = !(step === "milk" || step === "berry");
  mBerry.disabled  = step !== "berry";
  [mTin, mKettle, mMilk, mBerry].forEach((tool) => tool.classList.toggle("active", !tool.disabled));
  mBowlBox.classList.toggle("active", step === "whisk" || step === "pour");
  mWhisk.hidden = step !== "whisk";
  mFrothBar.hidden = step !== "whisk";
  mFroth.style.width = station.bowl.froth + "%";

  // the checklist
  mSteps.innerHTML = "";
  MATCHA_STEPS.forEach(function (s, i) {
    const li = document.createElement("li");
    li.innerHTML = s.icon() + "<span>" + s.text + "</span>";
    if (i < station.step) li.className = "done";
    else if (i === station.step) li.className = "next";
    mSteps.appendChild(li);
  });

  if (step === "finished") {
    mHint.textContent = "Beautiful! Press Done to serve it.";
  } else if (!mHint.dataset.keep) {
    mHint.textContent = MATCHA_STEPS[station.step].hint;
  }
  delete mHint.dataset.keep;
  mDone.disabled = step !== "finished";
}

function drawJar() {
  const step = currentStep();
  mJar.innerHTML = jarSVG(station.jar, step === "milk" || step === "berry");
}

function nextStep() {
  station.step = station.step + 1;
  drawStation();
}

// show a message under the checklist without it being replaced straight away
function stationSays(text) {
  mHint.textContent = text;
  mHint.dataset.keep = "yes";
}


// ---------- 1. Scoop ----------
mTin.addEventListener("click", function () {
  station.bowl.powder = station.bowl.powder + 1;
  restartAnimation(mTin, "tapped");
  if (station.bowl.powder >= 2) {
    stationSays("Two scoops, about 2 grams. Perfect!");
    nextStep();
  } else {
    stationSays("One scoop in. One more!");
    drawStation();
  }
});

// ---------- 2. Hot water ----------
mKettle.addEventListener("click", function () {
  restartAnimation(mKettle, "tapped");
  station.bowl.water = true;
  nextStep();
});

// ---------- 3. Whisk ----------
// Each time you change direction after a decent swipe, the foam grows.
const whiskMove = { down: false, lastX: 0, dir: 0, travel: 0, keyDir: 0 };

function moveWhiskTo(clientX) {
  const box = mBowlBox.getBoundingClientRect();
  const percent = Math.min(66, Math.max(22, ((clientX - box.left) / box.width) * 100));
  mWhisk.style.left = percent + "%";
}

function addFroth(amount) {
  station.bowl.froth = Math.min(100, station.bowl.froth + amount);
  mBowl.innerHTML = matchaBowlSVG(station.bowl);
  mFroth.style.width = station.bowl.froth + "%";
  if (station.bowl.froth >= 100) {
    whiskMove.down = false;
    stationSays("Lovely green foam! Now pour it into the jar.");
    nextStep();
  }
}

mBowlBox.addEventListener("pointerdown", function (event) {
  if (currentStep() === "pour") { pourMatcha(); return; }
  if (currentStep() !== "whisk") return;
  whiskMove.down = true;
  whiskMove.lastX = event.clientX;
  mBowlBox.setPointerCapture(event.pointerId);   // keep getting moves even outside the bowl
  moveWhiskTo(event.clientX);
});

mBowlBox.addEventListener("pointermove", function (event) {
  if (currentStep() !== "whisk") return;
  moveWhiskTo(event.clientX);
  if (!whiskMove.down) return;
  const dx = event.clientX - whiskMove.lastX;
  whiskMove.lastX = event.clientX;
  if (Math.abs(dx) < 1) return;
  const dir = Math.sign(dx);                      // +1 moving right, -1 moving left
  if (whiskMove.dir !== 0 && dir !== whiskMove.dir) {
    if (whiskMove.travel > 25) addFroth(6);       // a real swipe, not a wobble
    whiskMove.travel = 0;
  }
  whiskMove.dir = dir;
  whiskMove.travel += Math.abs(dx);
});

["pointerup", "pointercancel"].forEach(function (type) {
  mBowlBox.addEventListener(type, function () { whiskMove.down = false; });
});

// keyboard: tap left and right arrows in turn
mBowlBox.addEventListener("keydown", function (event) {
  if (currentStep() === "pour" && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); pourMatcha(); return; }
  if (currentStep() !== "whisk") return;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const dir = event.key === "ArrowLeft" ? -1 : 1;
  mWhisk.style.left = dir < 0 ? "26%" : "62%";
  if (dir !== whiskMove.keyDir) addFroth(6);
  whiskMove.keyDir = dir;
});

// ---------- 4. Pour the matcha into the jar ----------
async function pourMatcha() {
  if (currentStep() !== "pour") return;
  station.step = -1;                       // "busy" while it pours, so nothing else can be clicked
  mBowlBox.classList.add("tilt");
  mStream.className = "stream stream-matcha";
  mStream.hidden = false;
  await animateNumber(0, 40, 900, function (v) { station.jar.matcha = v; drawJar(); });
  mStream.hidden = true;
  mBowlBox.classList.remove("tilt");
  station.bowl = { powder: 0, water: false, froth: 0 };
  station.step = MATCHA_STEPS.findIndex((s) => s.id === "pour") + 1;
  drawStation();
}

// ---------- 5. Pour the milk (press and hold) ----------
function startMilk(event) {
  if (event) event.preventDefault();
  if (mMilk.disabled || station.pouringMilk || station.jar.berry > 0) return;
  station.pouringMilk = true;
  mMilk.classList.add("pouring");
  mStream.className = "stream stream-milk";
  mStream.hidden = false;

  let last = performance.now();
  function tick(now) {
    if (!station.pouringMilk) return;
    station.jar.milk = Math.min(MILK_MAX, station.jar.milk + MILK_SPEED * ((now - last) / 1000));
    last = now;
    drawJar();
    if (station.jar.milk >= MILK_MAX) {
      stopMilk();
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function stopMilk() {
  if (!station.pouringMilk) return;
  station.pouringMilk = false;
  mMilk.classList.remove("pouring");
  mStream.hidden = true;

  const milk = station.jar.milk;
  if (milk >= MILK_MAX) stationSays("Whoa! It nearly overflowed. Add the strawberry cream.");
  else if (milk > MILK_TARGET[1]) stationSays("A bit too much milk, but it'll do. Add the strawberry cream.");
  else if (milk >= MILK_TARGET[0]) stationSays("Perfect amount! Now the strawberry cream.");
  else stationSays("A little more milk… hold the bottle again.");

  if (currentStep() === "milk" && milk >= MILK_TARGET[0] - 15) nextStep();
  else drawStation();
}

mMilk.addEventListener("pointerdown", startMilk);
["pointerup", "pointerleave", "pointercancel"].forEach(function (type) {
  mMilk.addEventListener(type, stopMilk);
});
mMilk.addEventListener("keydown", function (event) {
  if ((event.key === " " || event.key === "Enter") && !event.repeat) startMilk(event);
});
mMilk.addEventListener("keyup", function (event) {
  if (event.key === " " || event.key === "Enter") stopMilk();
});

// ---------- 6. Strawberry cream on top ----------
mBerry.addEventListener("click", async function () {
  if (currentStep() !== "berry") return;
  station.step = -1;
  restartAnimation(mBerry, "tapped");
  await animateNumber(0, 26, 700, function (v) { station.jar.berry = v; drawJar(); });
  station.jar.sparkle = true;
  station.step = MATCHA_STEPS.length;      // all done
  drawStation();
});

// ---------- Start over, and Done ----------
mRestart.addEventListener("click", resetStation);

// 3 stars = milk between the lines, 2 = close, 1 = way off
function matchaStars() {
  const milk = station.jar.milk;
  if (milk >= MILK_TARGET[0] && milk <= MILK_TARGET[1]) return 3;
  if (milk >= MILK_TARGET[0] - 10 && milk <= MILK_TARGET[1] + 10) return 2;
  return 1;
}

mDone.addEventListener("click", function () {
  station.onDone(matchaStars(), jarSVG(station.jar));
});
