// =========================================================
// Cherry Blossom Cafe — game.js
// The BEHAVIOUR of the game: the customer loop.
//
//   1. a customer walks in with a drink in their thought cloud
//   2. click the cloud  -> see the recipe -> Continue
//   3. at the kitchen table, click ingredients to fill the glass -> Done
//   4. the customer gets the drink, reacts, pays, and leaves
//   5. the next customer walks in
//
// The drinks live in menu.js, the customer drawings in customers.js,
// and the matcha mini-game in matcha.js.
// =========================================================


// ---------- 1. Grab the things on the page we want to control ----------
// document.getElementById finds the element in index.html with that id="..."
const titleScreen   = document.getElementById("screen-title");
const kitchenScreen = document.getElementById("screen-kitchen");
const prepScreen    = document.getElementById("screen-prep");
const matchaScreen  = document.getElementById("screen-matcha");
const openButton    = document.getElementById("btn-open");
const scene         = document.getElementById("scene");
const petalLayer    = document.getElementById("petals");
const chef          = document.getElementById("chef");
const mochi         = document.getElementById("mochi");
const mochiBubble   = document.getElementById("mochi-says");

const coinCount     = document.getElementById("coin-count");
const servedCount   = document.getElementById("served-count");

const customerEl    = document.getElementById("customer");
const customerArt   = document.getElementById("customer-art");
const orderCloud    = document.getElementById("order-cloud");
const cloudDrink    = document.getElementById("cloud-drink");
const customerSays  = document.getElementById("customer-says");
const coinPop       = document.getElementById("coin-pop");

const recipeCard    = document.getElementById("recipe-card");
const recipeFor     = document.getElementById("recipe-for");
const recipeTitle   = document.getElementById("recipe-title");
const recipeCup     = document.getElementById("recipe-cup");
const recipeSteps   = document.getElementById("recipe-steps");
const recipePrice   = document.getElementById("recipe-price");
const continueBtn   = document.getElementById("btn-continue");

const prepCup       = document.getElementById("prep-cup");
const ingredientBox = document.getElementById("ingredients");
const noteTitle     = document.getElementById("note-title");
const noteSteps     = document.getElementById("note-steps");
const prepHint      = document.getElementById("prep-hint");
const startOverBtn  = document.getElementById("btn-start-over");
const doneBtn       = document.getElementById("btn-done");


// ---------- 2. The game's memory ("state") ----------
let coins = 0;
let served = 0;
let customer = null;   // the customer at the counter right now (from makeCustomer)
let glass = [];        // what we've poured so far, bottom first, e.g. ["ice", "milk"]


// ---------- 3. Small helpers ----------

// wait(1000) pauses for 1 second. Use it with "await" inside an "async" function,
// so steps can happen one after another, like a little script.
function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// Play a CSS animation again, even if it already played before.
function restartAnimation(element, className) {
  element.classList.remove(className);
  element.getBoundingClientRect();     // makes the browser "reset" the element
  element.classList.add(className);
}

// Mochi talks. mood can be "awake" (the default) or "happy".
// After a few seconds of quiet, he drifts back to sleep.
let napTimer = null;
function mochiSays(text, mood = "awake") {
  mochiBubble.textContent = text;
  mochi.dataset.mood = "sleepy";
  mochi.getBoundingClientRect();
  mochi.dataset.mood = mood;
  clearTimeout(napTimer);
  napTimer = setTimeout(function () { mochi.dataset.mood = "sleepy"; }, 5000);
}

// Make Chef Bloom do a move: "hop", "nod" or "shake".
function chefDoes(move) {
  chef.classList.remove("do-hop", "do-nod", "do-shake");
  restartAnimation(chef, "do-" + move);
}

// What a drink looks like: the matcha latte comes in a jar, the rest in a glass.
function drinkArt(drink) {
  return drink.station === "matcha" ? jarSVG(PERFECT_JAR) : glassSVG(drink.steps);
}

// Switch between the counter, the kitchen table, and the matcha station.
function showScreen(name) {
  kitchenScreen.hidden = name !== "counter";
  prepScreen.hidden = name !== "table";
  matchaScreen.hidden = name !== "matcha";
  scene.classList.toggle("blurred", name !== "counter");   // soften the room behind the table
}


// ---------- 4. A customer arrives ----------
async function customerArrives() {
  customer = makeCustomer();

  customerArt.innerHTML = customerSVG(customer.look);
  customerEl.dataset.mood = "waiting";
  cloudDrink.innerHTML = drinkArt(customer.order);
  orderCloud.hidden = true;
  customerSays.hidden = true;
  coinPop.hidden = true;

  // walk in from the right
  customerEl.hidden = false;
  restartAnimation(customerEl, "walk-in");
  await wait(1600);

  // the thought cloud pops up
  orderCloud.hidden = false;
  restartAnimation(orderCloud, "pop");
  mochiSays(customer.name + " is here! Click the cloud to see what they want.");
  chefDoes("nod");
}


// ---------- 5. The recipe card ----------
function showRecipe() {
  const drink = customer.order;
  recipeFor.textContent = customer.name + "'s order";
  recipeTitle.textContent = drink.name;
  recipeCup.innerHTML = drinkArt(drink);
  recipePrice.textContent = drink.price;

  // one line per step: icon + what to do
  recipeSteps.innerHTML = "";
  if (drink.station === "matcha") {
    MATCHA_STEPS.forEach(function (step) {
      const li = document.createElement("li");
      li.innerHTML = step.icon() + "<span>" + step.text + "</span>";
      recipeSteps.appendChild(li);
    });
  } else {
    drink.steps.forEach(function (id) {
      const li = document.createElement("li");
      li.innerHTML = ingredientIconSVG(id) + "<span>" + INGREDIENTS[id].name + "</span>";
      recipeSteps.appendChild(li);
    });
  }

  recipeCard.hidden = false;
  continueBtn.focus();
}


// ---------- 6. The kitchen table: making the drink ----------
function startMaking() {
  recipeCard.hidden = true;

  // the matcha latte has its own hands-on station
  if (customer.order.station === "matcha") {
    openMatchaStation(serve);
    showScreen("matcha");
    return;
  }

  glass = [];
  noteTitle.textContent = customer.order.name;
  prepHint.textContent = "Click the ingredients in order.";
  drawTable(false);
  showScreen("table");
}

// Redraw the glass and the checklist so they match what's in the glass.
function drawTable(justPoured) {
  prepCup.innerHTML = glassSVG(glass, justPoured);
  doneBtn.disabled = glass.length === 0;

  const steps = customer.order.steps;
  noteSteps.innerHTML = "";
  steps.forEach(function (id, i) {
    const li = document.createElement("li");
    li.innerHTML = ingredientIconSVG(id) + "<span>" + INGREDIENTS[id].name + "</span>";
    if (glass[i] === id) li.className = "done";           // poured, in the right spot
    else if (i === glass.length) li.className = "next";    // this is the one to pour now
    noteSteps.appendChild(li);
  });
}

function pour(id) {
  if (glass.length >= MAX_LAYERS) {
    prepHint.textContent = "The glass is full! Press Done, or Start over.";
    return;
  }
  glass.push(id);                                  // add to the end of the list
  drawTable(true);

  const wanted = customer.order.steps[glass.length - 1];
  if (id === wanted) {
    prepHint.textContent = glass.length === customer.order.steps.length
      ? "Looks perfect! Press Done to serve it."
      : "Nice! " + INGREDIENTS[id].name + " is in.";
  } else {
    prepHint.textContent = "Hmm, that's not on the recipe here. Start over?";
  }
}

function startOver() {
  glass = [];
  prepHint.textContent = "Fresh glass! Click the ingredients in order.";
  drawTable(false);
}

// Build one button per ingredient on the table (this runs once, at the start).
Object.keys(INGREDIENTS).forEach(function (id) {
  const button = document.createElement("button");
  button.className = "ingredient";
  button.innerHTML = ingredientIconSVG(id) + "<span>" + INGREDIENTS[id].name + "</span>";
  button.addEventListener("click", function () {
    restartAnimation(button, "tapped");
    pour(id);
  });
  ingredientBox.appendChild(button);
});


// ---------- 7. Serving, paying and leaving ----------

// How good is the drink? 3 = perfect, 2 = right things but wrong order, 1 = wrong.
function rateDrink(made, wanted) {
  if (made.join() === wanted.join()) return 3;
  const sameThings = made.length === wanted.length &&
    [...made].sort().join() === [...wanted].sort().join();
  return sameThings ? 2 : 1;
}

// stars: how good it was (3, 2 or 1). art: a drawing of the drink we made.
async function serve(stars, art) {
  const drink = customer.order;

  // what they pay: price + a tip for perfect, half price if it's wrong
  let pay = drink.price;
  if (stars === 3) pay = drink.price + 3;
  if (stars === 1) pay = Math.ceil(drink.price / 2);

  // back to the counter: the drink appears in their cloud
  showScreen("counter");
  cloudDrink.innerHTML = art;
  restartAnimation(orderCloud, "pop");
  await wait(600);

  // they react
  orderCloud.hidden = true;
  customerSays.hidden = false;
  if (stars === 3) {
    customerEl.dataset.mood = "happy";
    customerSays.textContent = "Yummy! Perfect!";
    mochiSays(customer.name + " loved it! That's a tip!", "happy");
    chefDoes("hop");
  } else if (stars === 2) {
    customerEl.dataset.mood = "happy";
    customerSays.textContent = "Tasty, thank you!";
    mochiSays("Not quite perfect, but still tasty, nya.");
    chefDoes("nod");
  } else {
    customerEl.dataset.mood = "sad";
    customerSays.textContent = "Um… this isn't what I asked for.";
    mochiSays("Oops. Check the recipe card next time, nya.");
    chefDoes("shake");
  }
  restartAnimation(customerSays, "pop");
  if (stars > 1) restartAnimation(customerEl, "happy-hop");

  // they pay
  await wait(900);
  coins = coins + pay;
  served = served + 1;
  coinCount.textContent = coins;
  servedCount.textContent = served;
  coinPop.textContent = "+" + pay;
  coinPop.hidden = false;
  restartAnimation(coinPop, "rise");

  // they leave, and after a moment the next customer comes in
  await wait(1600);
  customerSays.hidden = true;
  restartAnimation(customerEl, "walk-out");
  await wait(1400);
  customerEl.hidden = true;
  await wait(1200);
  customerArrives();
}


// ---------- 8. Opening the cafe ----------
// The title card fades, the street zooms towards the door,
// then we're inside and the first customer walks in.
openButton.addEventListener("click", async function () {
  openButton.disabled = true;               // no double clicks while walking in

  // zoom towards the cafe door: find where it is on screen right now
  const door = document.getElementById("cafe-door").getBoundingClientRect();
  document.getElementById("street").style.transformOrigin =
    (door.left + door.width / 2) + "px " + (door.top + door.height / 2) + "px";

  titleScreen.classList.add("leaving");
  scene.classList.add("entering");
  await wait(1300);

  scene.classList.remove("entering");
  scene.classList.add("inside");
  titleScreen.hidden = true;
  showScreen("counter");
  mochiSays("Welcome to work! Customers are coming, nya.");
  chefDoes("hop");

  await wait(1200);
  customerArrives();
});


// ---------- 9. All the other clicks ----------
orderCloud.addEventListener("click", showRecipe);
continueBtn.addEventListener("click", startMaking);
startOverBtn.addEventListener("click", startOver);
doneBtn.addEventListener("click", function () {
  serve(rateDrink(glass, customer.order.steps), glassSVG(glass));
});

// Things Mochi says when you click on Bloom, or on him.
const CHEF_CLICK_LINES = [
  "Bloom says hi! She's been up since 6 baking.",
  "Bloom's ribbons were a gift from her grandma, nya.",
  "She hums while she whisks. Very off-key.",
  "Psst… she sneaks me cream when nobody's looking.",
];
const MOCHI_CLICK_LINES = [
  "Mrrp? I was napping…",
  "Five more minutes, nya…",
  "Is it treat time? It smells like treat time.",
  "I'm not sleeping, I'm supervising.",
];

chef.addEventListener("click", function () {
  mochiSays(randomItem(CHEF_CLICK_LINES));
  chefDoes("hop");
});
mochi.addEventListener("click", function () {
  mochiSays(randomItem(MOCHI_CLICK_LINES));
});


// ---------- 10. Falling petals outside ----------
// A "for" loop repeats code: here it makes 16 petals, each a little different.
for (let i = 0; i < 16; i++) {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = Math.random() * 100 + "%";
  petal.style.animationDuration = 6 + Math.random() * 6 + "s";
  petal.style.animationDelay = -Math.random() * 12 + "s";
  petal.style.setProperty("--drift", Math.random() * 160 - 80 + "px");
  petalLayer.appendChild(petal);
}
