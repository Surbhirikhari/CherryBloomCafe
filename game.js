// =========================================================
// Cherry Blossom Cafe — game.js
// The BEHAVIOUR of the game: the customer loop.
//
//   1. a customer walks in with a drink in their thought cloud
//   2. click the cloud  -> see the recipe -> Continue
//   3. make it at a hands-on station (matcha, or the Bakery Station) -> Done
//   4. the customer gets it, a receipt shows the score for each step,
//      they pay (a bigger tip for a better score), and leave
//   5. the next customer walks in, until the day's customers are all served
//   6. Bloom's notebook sums up the day, then the next day starts
//
// The menu lives in menu.js, the customer drawings in customers.js,
// the recipes in desserts.js + drinks.js (run by bakery.js),
// and decorating in decor.js.
// =========================================================


// ---------- 1. Grab the things on the page we want to control ----------
// document.getElementById finds the element in index.html with that id="..."
const titleScreen   = document.getElementById("screen-title");
const kitchenScreen = document.getElementById("screen-kitchen");
const bakeScreen    = document.getElementById("screen-bake");
const openButton    = document.getElementById("btn-open");
const scene         = document.getElementById("scene");
const petalLayer    = document.getElementById("petals");
const chef          = document.getElementById("chef");
const mochi         = document.getElementById("mochi");
const mochiBubble   = document.getElementById("mochi-says");

const coinCount     = document.getElementById("coin-count");
const servedCount   = document.getElementById("served-count");
const dayCount      = document.getElementById("day-count");
const dayGoalEl     = document.getElementById("day-goal");

const scoreCard     = document.getElementById("score-card");
const scoreTitle    = document.getElementById("score-title");
const scoreRows     = document.getElementById("score-rows");
const scoreTotal    = document.getElementById("score-total");
const scorePay      = document.getElementById("score-pay");

const dayCard       = document.getElementById("day-card");
const nextDayBtn    = document.getElementById("btn-next-day");

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



// ---------- 2. The game's memory ("state") ----------
let coins = 0;
let day = 1;
// what happened today, for Bloom's notebook at the end of the day
let today = { served: 0, coins: 0, dishes: [] };   // dishes: { name, pct }

// Day 1 has 5 customers, then one more each day (up to 8)
function customersToday() { return Math.min(8, 4 + day); }

// Remember the day and coins in this browser, so you can carry on later.
// (try/catch: some browsers block saving, and the game still works without it)
function saveGame() {
  try { localStorage.setItem("cherry-blossom-cafe", JSON.stringify({ day, coins })); } catch (e) {}
}
function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem("cherry-blossom-cafe"));
    if (saved) { day = saved.day || 1; coins = saved.coins || 0; }
  } catch (e) {}
}

function drawHud() {
  dayCount.textContent = day;
  servedCount.textContent = today.served;
  dayGoalEl.textContent = customersToday();
  coinCount.textContent = coins;
}
let customer = null;   // the customer at the counter right now (from makeCustomer)


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

// What an order looks like: every recipe draws itself (desserts.js and drinks.js).
function drinkArt(drink) {
  return perfectDessertArt(drink.dessert);
}

// Switch between the counter and the kitchen station.
function showScreen(name) {
  kitchenScreen.hidden = name !== "counter";
  bakeScreen.hidden = name !== "bake";
  scene.classList.toggle("blurred", name !== "counter");   // soften the room behind the table
}


// ---------- 4. A customer arrives ----------
async function customerArrives() {
  customer = makeCustomer();

  customerArt.innerHTML = customerSVG(customer.look);
  customerEl.dataset.mood = "waiting";
  cloudDrink.innerHTML = drinkArt(customer.order);
  cloudDrink.classList.add("is-dessert");
  orderCloud.hidden = true;
  customerSays.hidden = true;
  coinPop.hidden = true;

  // walk in from the right. First clear the last customer's animations,
  // or their "walk-out" (which ends off-screen) would win and hide this one.
  customerEl.classList.remove("walk-out", "happy-hop");
  customerEl.hidden = false;
  restartAnimation(customerEl, "walk-in");
  await wait(1600);
  // They've arrived: take the walk-in animation off. Otherwise, when we come
  // back from the kitchen, the counter screen is shown again, the browser
  // replays the animation, and they walk in all over again.
  customerEl.classList.remove("walk-in");

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
  recipeCup.classList.add("is-dessert");
  recipePrice.textContent = drink.price;

  // one line per step: icon + what to do
  recipeSteps.innerHTML = "";
  DESSERTS[drink.dessert].steps.forEach(function (step) {
    const li = document.createElement("li");
    li.innerHTML = TOOL_ART[step.tool]() + "<span>" + step.text + "</span>";
    recipeSteps.appendChild(li);
  });

  recipeCard.hidden = false;
  continueBtn.focus({ preventScroll: true });
}


// ---------- 6. Off to the right station to make it ----------
function startMaking() {
  recipeCard.hidden = true;

  showScreen("bake");                    // show it first, so the plate has a size
  openBakeStation(customer.order.dessert, serve);
}


// ---------- 7. Serving, paying and leaving ----------

// scores: how well each step went, e.g. [{ label: "Pour the milk", pct: 92 }]
// art: a drawing of what we made. toppings: how many decorations we added.
async function serve(scores, art, toppings = 0) {
  const drink = customer.order;

  // decorating counts too: no toppings 40%, 4 or more 100%
  const rows = scores.concat([{ label: "Decoration", pct: Math.min(100, 40 + toppings * 15) }]);
  const total = Math.round(rows.reduce((sum, r) => sum + r.pct, 0) / rows.length);

  // what they pay: the price, plus a tip that grows with the score
  // (at 100% the tip is half the price; a poor score only pays half)
  const tip = Math.round(drink.price * 0.5 * Math.max(0, total - 50) / 50);
  const pay = total >= 60 ? drink.price + tip : Math.ceil(drink.price / 2);

  // back to the counter: the drink appears in their cloud
  showScreen("counter");
  cloudDrink.innerHTML = art;
  restartAnimation(orderCloud, "pop");
  await wait(600);

  // they react
  orderCloud.hidden = true;
  customerSays.hidden = false;
  if (total >= 90) {
    customerEl.dataset.mood = "happy";
    customerSays.textContent = toppings >= 3 ? "So pretty! And perfect!" : "Yummy! Perfect!";
    mochiSays(customer.name + " loved it! Big tip!", "happy");
    chefDoes("hop");
  } else if (total >= 60) {
    customerEl.dataset.mood = "happy";
    customerSays.textContent = toppings >= 3 ? "Ooh, so cute! Thank you!" : "Tasty, thank you!";
    mochiSays("Not quite perfect, but still tasty, nya.");
    chefDoes("nod");
  } else {
    customerEl.dataset.mood = "sad";
    customerSays.textContent = "Hmm… not quite right.";
    mochiSays("Look at the meter for the pink zone next time, nya.");
    chefDoes("shake");
  }
  restartAnimation(customerSays, "pop");
  if (total >= 60) restartAnimation(customerEl, "happy-hop");
  showReceipt(drink, rows, total, pay, tip);

  // they pay
  await wait(900);
  coins = coins + pay;
  today.served = today.served + 1;
  today.coins = today.coins + pay;
  today.dishes.push({ name: drink.name, pct: total });
  drawHud();
  saveGame();
  coinPop.textContent = "+" + pay;
  coinPop.hidden = false;
  restartAnimation(coinPop, "rise");

  // they leave
  await wait(2600);
  customerSays.hidden = true;
  scoreCard.hidden = true;
  customerEl.classList.remove("walk-in", "happy-hop");
  restartAnimation(customerEl, "walk-out");
  await wait(1400);
  customerEl.hidden = true;

  // was that the last customer of the day?
  if (today.served >= customersToday()) { await wait(500); endOfDay(); return; }
  await wait(1200);
  customerArrives();
}

// the receipt: one little bar for each step, the total, and what they paid
function showReceipt(drink, rows, total, pay, tip) {
  scoreTitle.textContent = drink.name;
  scoreRows.innerHTML = "";
  rows.forEach(function (row) {
    const li = document.createElement("li");
    if (row.pct === 100) li.className = "perfect";
    li.innerHTML = `<span>${row.label}</span><strong>${row.pct}%</strong><span class="bar"><span style="width:${row.pct}%"></span></span>`;
    scoreRows.appendChild(li);
  });
  scoreTotal.textContent = total + "%";
  scorePay.textContent = total >= 60
    ? "+" + pay + " coins (" + tip + " tip)" + (total >= 90 ? " ✨" : "")
    : "+" + pay + " coins (half price)";
  scoreCard.hidden = false;
  restartAnimation(scoreCard, "pop");
}


// ---------- 7b. The end of the day: Bloom's notebook ----------
const DAY_NOTES = [
  [90, "A purr-fect day! Customers are telling all their friends."],
  [75, "Lovely work today. I only napped a little."],
  [60, "Not bad! Watch the pink zones tomorrow, nya."],
  [0,  "A tricky day… tomorrow will be better. Treats help."],
];

function endOfDay() {
  const average = Math.round(today.dishes.reduce((sum, d) => sum + d.pct, 0) / today.dishes.length);
  const best = today.dishes.reduce((a, b) => (b.pct > a.pct ? b : a));
  const stars = average >= 90 ? 3 : average >= 70 ? 2 : 1;

  document.getElementById("day-title").textContent = "Day " + day + " is done!";
  const starsEl = document.getElementById("day-stars");
  starsEl.innerHTML = "★".repeat(stars) + `<span class="dim">${"★".repeat(3 - stars)}</span>`;
  starsEl.setAttribute("aria-label", stars + " out of 3 stars");
  document.getElementById("day-served").textContent = today.served;
  document.getElementById("day-coins").textContent = today.coins;
  document.getElementById("day-average").textContent = average + "%";
  document.getElementById("day-best").textContent = best.name + " (" + best.pct + "%)";
  document.getElementById("day-note").textContent = DAY_NOTES.find(([min]) => average >= min)[1];

  mochiSays("Closing time! Let's count the coins.", "happy");
  chefDoes("hop");
  dayCard.hidden = false;
  nextDayBtn.focus({ preventScroll: true });
}

function startNextDay() {
  dayCard.hidden = true;
  day = day + 1;
  today = { served: 0, coins: 0, dishes: [] };
  drawHud();
  saveGame();
  mochiSays("Good morning! Day " + day + ": " + customersToday() + " customers today, nya.");
  setTimeout(customerArrives, 1200);
}


// ---------- 8. Opening the cafe ----------
// The "Open the cafe" sign hangs under the wooden board in the street
// painting. The painting scales with the screen, so we measure where
// the board's empty spot is and put the button exactly there.
function placeOpenSign() {
  const spot = document.getElementById("open-spot").getBoundingClientRect();
  openButton.style.left = spot.left + "px";
  openButton.style.top = spot.top + "px";
  openButton.style.width = spot.width + "px";
  openButton.style.height = spot.height + "px";
  openButton.style.fontSize = Math.max(12, spot.height * 0.3) + "px";
}
loadGame();
placeOpenSign();
window.addEventListener("resize", placeOpenSign);
document.fonts.ready.then(placeOpenSign);

// The sign fades, the street zooms towards the door,
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
  drawHud();
  mochiSays(day === 1
    ? "Welcome to work! " + customersToday() + " customers today, nya."
    : "Welcome back! It's day " + day + ", nya.");
  chefDoes("hop");

  await wait(1200);
  customerArrives();
});


// ---------- 9. All the other clicks ----------
orderCloud.addEventListener("click", showRecipe);
continueBtn.addEventListener("click", startMaking);
nextDayBtn.addEventListener("click", startNextDay);

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
