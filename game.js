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


// ---------- 2. The game's memory ("state") ----------
// A variable is a labelled box that holds a value. "let" means it can change.
let scoops = 0;

// "const" means it never changes. These are our recipe rules.
const PERFECT_SCOOPS = 2;
const MAX_SCOOPS = 5;


// ---------- 3. Small helper functions ----------
// A function is a reusable set of instructions. We "call" it with mochiSays("hi").
function mochiSays(text) {
  mochiBubble.textContent = text;
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
  const bowl = powder.closest("svg");
  bowl.classList.remove("bounce");
  void bowl.offsetWidth;            // trick: forces the animation to restart
  bowl.classList.add("bounce");
}

// Mochi reacts to how many scoops are in the bowl.
function mochiReactsToScoops() {
  if (scoops === 0) {
    mochiSays("The bowl is empty, nya. Add some matcha!");
  } else if (scoops < PERFECT_SCOOPS) {
    mochiSays("A little more… one more scoop!");
  } else if (scoops === PERFECT_SCOOPS) {
    mochiSays("Two scoops! That's exactly 2 grams. Purr-fect!");
  } else {
    mochiSays("Too much! It will taste bitter. Take one out?");
  }
}


// ---------- 4. What happens when you click things ----------
// addEventListener("click", fn) means: "when this is clicked, run fn".

openButton.addEventListener("click", function () {
  titleScreen.hidden = true;        // hide the title screen
  kitchenScreen.hidden = false;     // show the kitchen
  mochiSays("Welcome! First, scoop the matcha. We need 2 scoops, nya!");
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
