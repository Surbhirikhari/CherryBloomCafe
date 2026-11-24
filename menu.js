// =========================================================
// Cherry Blossom Cafe — menu.js
// Everything the cafe sells, and what each one costs.
// To add something new: write its recipe in desserts.js or drinks.js,
// then add it here with station: "bake" and its recipe name.
// =========================================================

const INK = "#412c2c";   // Bloom's marker ink, used for every outline

// ---------- The menu ----------
// "station" says where it's made: the Matcha Station (matcha.js),
// or the Bakery Station (bakery.js) using the recipe named in "dessert".
const MENU = [
  { name: "Strawberry Matcha Latte", price: 15, station: "matcha" },
  // drinks, made at the Bakery Station (recipes in drinks.js)
  { name: "Strawberry Milk",        price: 10, station: "bake", dessert: "milk" },
  { name: "Sakura Tea",             price: 9,  station: "bake", dessert: "sakura" },
  { name: "Honey Coffee",           price: 11, station: "bake", dessert: "coffee" },
  // desserts, made at the Bakery Station (recipes in desserts.js)
  { name: "Strawberry Crêpe",       price: 16, station: "bake", dessert: "crepe" },
  { name: "Strawberry Roll Cake",   price: 18, station: "bake", dessert: "roll" },
  { name: "Strawberry Cream Toast", price: 12, station: "bake", dessert: "toast" },
  { name: "Strawberry Croissant",   price: 14, station: "bake", dessert: "croissant" },
];
