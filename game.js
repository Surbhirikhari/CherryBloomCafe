// =========================================================
// Cherry Blossom Cafe — game.js
// This file is the BEHAVIOUR of the game: what happens when you click.
// Lesson 1: open the cafe and scoop matcha into the bowl.
// =========================================================


// ---------- 1. Grab the things on the page we want to control ----------
// document.getElementById finds the element in index.html with that id="..."
const titleScreen   = document.getElementById("screen-title");
const kitchenScreen = document.getElementById("screen-kitchen");
const openButton    = document.getElementById("btn-open");
const mochiBubble   = document.getElementById("mochi-says");
const scoopButton   = document.getElementById("btn-scoop");
const unscoopButton = document.getElementById("btn-unscoop");
const scoopCount    = document.getElementById("scoop-count");
const powder        = document.getElementById("powder");
const chef          = document.getElementById("chef");
const scene         = document.getElementById("scene");
const petalLayer    = document.getElementById("petals");
const mochi         = document.getElementById("mochi");


// ---------- 2. The game's memory ("state") ----------
// A variable is a labelled box that holds a value. "let" means it can change.
let scoops = 0;

// "const" means it never changes. These are our recipe rules.
const PERFECT_SCOOPS = 2;
const MAX_SCOOPS = 5;


// ---------- 3. Small helper functions ----------
// A function is a reusable set of instructions. We "call" it with mochiSays("hi").
// mood can be "awake" (the default) or "happy".
// After a few seconds of quiet, Mochi drifts back to sleep.
let napTimer = null;

function mochiSays(text, mood = "awake") {
  mochiBubble.textContent = text;
  setMochiMood(mood);
}

function setMochiMood(mood) {
  // Setting it to sleepy first means "happy" replays its stretch even twice in a row.
  mochi.dataset.mood = "sleepy";
  mochi.getBoundingClientRect();
  mochi.dataset.mood = mood;         // this changes data-mood="..." in the HTML

  clearTimeout(napTimer);            // cancel any nap that was planned
  napTimer = setTimeout(function () {
    mochi.dataset.mood = "sleepy";   // 5 seconds later: back to sleep, Zzz
  }, 5000);
}

// Redraw the bowl so it matches the number of scoops.
function drawPowder() {
  scoopCount.textContent = scoops;

  // More scoops = a bigger pile. 0 scoops = invisible (size 0).
  if (scoops === 0) {
    powder.setAttribute("rx", 0);
    powder.setAttribute("ry", 0);
  } else {
    powder.setAttribute("rx", 10 + scoops * 9);
    powder.setAttribute("ry", 4 + scoops * 3);
  }

  // Give the bowl a little squish so the click feels alive.
  restartAnimation(powder.closest("svg"), "bounce");
}

// Play a CSS animation again, even if it already played before.
// (Removing and re-adding the same class wouldn't restart it on its own,
//  so in between we ask the browser to measure the element, which "resets" it.)
function restartAnimation(element, className) {
  element.classList.remove(className);
  element.getBoundingClientRect();
  element.classList.add(className);
}

// Make Chef Bloom do a move: "hop", "nod" or "shake".
// The matching CSS lives in style.css under ".chef.do-hop" etc.
function chefDoes(move) {
  chef.classList.remove("do-hop", "do-nod", "do-shake");
  restartAnimation(chef, "do-" + move);
}

// Mochi reacts to how many scoops are in the bowl, and so does the owner.
function mochiReactsToScoops() {
  if (scoops === 0) {
    mochiSays("The bowl is empty, nya. Add some matcha!");
    chefDoes("nod");
  } else if (scoops < PERFECT_SCOOPS) {
    mochiSays("A little more… one more scoop!");
    chefDoes("nod");
  } else if (scoops === PERFECT_SCOOPS) {
    mochiSays("Two scoops! That's exactly 2 grams. Purr-fect!", "happy");
    chefDoes("hop");
  } else {
    mochiSays("Too much! It will taste bitter. Take one out?");
    chefDoes("shake");
  }
}

// Things Mochi says when you click on the owner.
const CHEF_CLICK_LINES = [
  "Bloom says hi! She's been up since 6 baking.",
  "Bloom's ribbons were a gift from her grandma, nya.",
  "She hums while she whisks. Very off-key.",
  "Psst… she sneaks me cream when nobody's looking.",
];

// Things Mochi says when you wake him up by clicking him.
const MOCHI_CLICK_LINES = [
  "Mrrp? I was napping…",
  "Five more minutes, nya…",
  "Is it treat time? It smells like treat time.",
  "I'm not sleeping, I'm supervising.",
];


// ---------- 4. What happens when you click things ----------
// addEventListener("click", fn) means: "when this is clicked, run fn".

// Opening the cafe = walking inside.
// 1. the title card fades and the painting zooms towards the door,
// 2. 1.3 seconds later (setTimeout) we swap to the inside painting and the kitchen.
openButton.addEventListener("click", function () {
  openButton.disabled = true;               // no double clicks while walking in

  // zoom towards the cafe door: find where it is on screen right now
  const door = document.getElementById("cafe-door").getBoundingClientRect();
  document.getElementById("street").style.transformOrigin =
    (door.left + door.width / 2) + "px " + (door.top + door.height / 2) + "px";

  titleScreen.classList.add("leaving");
  scene.classList.add("entering");

  setTimeout(function () {
    scene.classList.remove("entering");
    scene.classList.add("inside");
    titleScreen.hidden = true;              // hide the title screen
    kitchenScreen.hidden = false;           // show the kitchen
    mochiSays("Welcome! First, scoop the matcha. We need 2 scoops, nya!");
    chefDoes("hop");
  }, 1300);
});

mochi.addEventListener("click", function () {
  const index = Math.floor(Math.random() * MOCHI_CLICK_LINES.length);
  mochiSays(MOCHI_CLICK_LINES[index]);
});

chef.addEventListener("click", function () {
  // Pick a random line: Math.random() gives 0–0.999…, times the list length, rounded down.
  const index = Math.floor(Math.random() * CHEF_CLICK_LINES.length);
  mochiSays(CHEF_CLICK_LINES[index]);
  chefDoes("hop");
});

scoopButton.addEventListener("click", function () {
  if (scoops >= MAX_SCOOPS) {
    mochiSays("The bowl is overflowing! No more scoops.");
    return;                         // stop here, don't add another
  }
  scoops = scoops + 1;
  drawPowder();
  mochiReactsToScoops();
});

unscoopButton.addEventListener("click", function () {
  if (scoops === 0) return;         // can't go below zero
  scoops = scoops - 1;
  drawPowder();
  mochiReactsToScoops();
});


// ---------- 5. Falling petals outside ----------
// A "for" loop repeats code: here it makes 16 petals, each a little different.
for (let i = 0; i < 16; i++) {
  const petal = document.createElement("span");          // make a new element
  petal.className = "petal";
  petal.style.left = Math.random() * 100 + "%";           // somewhere across the screen
  petal.style.animationDuration = 6 + Math.random() * 6 + "s";   // 6–12 seconds to fall
  petal.style.animationDelay = -Math.random() * 12 + "s";        // start mid-fall
  petal.style.setProperty("--drift", Math.random() * 160 - 80 + "px");  // drift left or right
  petalLayer.appendChild(petal);                          // put it on the page
}
