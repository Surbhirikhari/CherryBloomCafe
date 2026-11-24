<div align="center">

# 🌸 Cherry Blossom Cafe 🍵

**A cosy pink-and-green cafe cooking game, made in the browser.**

Chef Bloom and her sleepy cat Mochi run a little cafe under the cherry trees.
Customers drop by with a drink in mind. You whisk, pour, chop and decorate,
then send them off happy (and earn a few coins on the way).

<img src="docs/screenshots/street.jpg" alt="A close-up of the Cherry Blossom Cafe on a watercolour street, with a wooden welcome board and a pink Open the cafe sign hanging from it" width="820">

*Built step by step while learning HTML, CSS and JavaScript. No frameworks, no installs.*

</div>

---

## 🍓 Meet the crew

<img src="docs/screenshots/crew.jpg" alt="Chef Bloom behind the pink counter with a tea bowl, a matcha tin and a milk bottle, and Mochi the cat napping on the countertop" width="600">

**Chef Bloom** stands behind the counter. She sways, blinks, nods when you're doing well, and hops (with a little heart) when a drink is perfect. Click her and Mochi will tell you a secret about her.

**Mochi** naps on the counter with floating *Zzz*s. He wakes up to give you tips, stretches when you nail an order, and grumbles if you poke him awake: *"I'm not sleeping, I'm supervising."*

---

## ☕ How to play

| | |
|---|---|
| <img src="docs/screenshots/counter.jpg" alt="A customer with twin tails stands by the counter with a thought cloud showing a strawberry matcha latte" width="400"> | **1. A customer walks in.** Their thought cloud shows the drink they're dreaming of. Click the cloud. |
| <img src="docs/screenshots/recipe.jpg" alt="The recipe card for a Strawberry Matcha Latte, listing seven steps and a price of 15 coins" width="400"> | **2. Read the recipe card.** It shows the drink, every step in order, and the price. Click **Continue**. |
| <img src="docs/screenshots/whisk.jpg" alt="The matcha station: a bamboo whisk over a bowl of frothy green matcha, with the recipe checklist on the left" width="400"> | **3. Make it at the work station.** Scoop the matcha, add hot water, then *really whisk*: drag side to side until the foam meter fills. Pour it into the jar, then **hold** the milk bottle and let go between the pink lines. |
| <img src="docs/screenshots/decorate.jpg" alt="A layered pink, cream and green jar decorated with whipped cream, strawberry slices, mint, a sakura flower and sugar hearts, next to a cutting board" width="400"> | **4. Decorate however you like.** Chop strawberries on the board (3 chops = 4 slices), then drag slices, cream, sakura flowers, mint and sugar hearts *anywhere* on the drink. |
| <img src="docs/screenshots/served.jpg" alt="The happy customer says 'So pretty! And perfect!' while 23 coins float up and Mochi celebrates" width="400"> | **5. Serve it!** Your customer reacts, pays (with a tip for a perfect pour and a bonus for every topping), and the next one wanders in. |

---

## 🧁 The menu

| Drink | How it's made | Price |
|---|---|---|
| 🍵 **Strawberry Matcha Latte** | Hands-on matcha station: scoop, whisk, pour, layer, decorate | 15 coins |
| 🍓 **Strawberry Milk** | Mash strawberries, drop in ice, pour the milk, stir until it's all pink | 10 coins |
| 🌸 **Sakura Tea** | Add blossoms, pour hot water, steep until pink, swirl in honey | 9 coins |
| 🍯 **Honey Coffee** | Grind beans, brew a shot, swirl in honey, draw your own latte art | 11 coins |
| 🍦 **Strawberry Crêpe** | Pour batter, flip it when golden, pipe cream, add strawberries, fold into a cone, add a bunny cookie | 16 coins |
| 🍥 **Strawberry Roll Cake** | Pour batter, bake, spread pink cream, roll it up, slice to see the swirl | 18 coins |
| 🍞 **Strawberry Cream Toast** | Pop the toast when golden, spread pink cream, drizzle honey, add heart strawberries and daisies | 12 coins |
| 🥐 **Strawberry Croissant** | Bake, slice it open, pipe cream, add strawberries, dust with sugar | 14 coins |

Every drink can be decorated. Customers love toppings! 💕

---

## 🎀 Play it

1. Download or clone this repo.
2. Open **`index.html`** in your browser.
3. Click the pink **Open the cafe** sign hanging from the wooden board, and walk inside.

That's it: no installs, no build step. Works with a mouse, a touchscreen, or a keyboard (← → to whisk, Space to pour).

---

## 🗂️ What's inside

| File | What it does |
|---|---|
| `index.html` | The structure: every screen, button and character |
| `style.css` | The look: colours, layout, and all the little animations |
| `game.js` | The customer loop: arrive → recipe → make → serve → pay → leave |
| `menu.js` | Everything on the menu, and the prices |
| `customers.js` | Draws random customers in Bloom's style, with 3 moods |
| `matcha.js` | The Matcha Station mini-game (scoop, whisk, pour, layer) |
| `sparkles.js` | The little sparkle trail behind the flower mouse |
| `desserts.js` | The dessert drawings, tools and recipes (each step changes the drawing) |
| `drinks.js` | The drink recipes: strawberry milk, sakura tea, honey coffee |
| `bakery.js` | The Bakery Station: runs any dessert recipe (hold, tap, timing, rub, swipe) |
| `decor.js` | The cutting board and drag-anywhere toppings |
| `paint.js` | Shared watercolour "brushes" for drawing scenes |
| `street.js` | Paints the street outside, with walking people |
| `room.js` | Paints the cafe inside: wallpaper, curtains, shelves, lamps |
| `assets/bloom/` | Chef Bloom's 17 picture layers, so each part can move |

---

## 🌱 What I learned building it

- **HTML, CSS & JS** each have one job: structure, look, behaviour
- **Variables, functions and loops**, like the `for` loop that paints every blossom on the trees
- **CSS animations** with `@keyframes`, triggered by adding a class
- **SVG drawing**, plus filters that make smooth shapes look hand-painted
- **`async` / `await`** to script a scene step by step (react → pay → walk out)
- **Pointer events** for whisking, hold-to-pour and drag-and-drop
- **Splitting code into files** so each one does one thing
- **Debugging!** Like the time only one customer ever came, because the last one's walk-out animation was never cleared 🙈

---

## 🌷 Coming soon

- [x] Desserts! Crêpe, roll cake, cream toast and croissant
- [ ] More drinks and desserts (strawberry shortcake, anyone?)
- [ ] Day and night, and a daily goal
- [ ] Sounds: the whisk, the pour, the coin *ding*
- [ ] Saving your coins between visits

---

## 💐 Credits

- Chef Bloom's artwork is used with the original artist's permission.
- The street, cafe, Mochi, customers and tools were drawn for this game, inspired by reference art shared with permission.
- Fonts: [Mochiy Pop One](https://fonts.google.com/specimen/Mochiy+Pop+One) and [Nunito](https://fonts.google.com/specimen/Nunito) from Google Fonts.

<div align="center">

*Made with lots of matcha and a little help from Claude.* 🍵🌸

</div>
