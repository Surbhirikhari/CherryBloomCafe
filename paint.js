// =========================================================
// Cherry Blossom Cafe — paint.js
// Shared "paint brushes" for drawing watercolour scenes with SVG.
// street.js (outside) and room.js (inside) both use these,
// so we write them once here instead of copying them twice.
// =========================================================

// createPainter(svg, seed) gives back a set of drawing tools for one SVG.
// "seed" makes the random numbers repeat, so a scene looks the same every visit.
function createPainter(svg, seed) {
  const NS = "http://www.w3.org/2000/svg";

  // A "seeded" random number between 0 and 1.
  function random() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function between(a, b) { return a + random() * (b - a); }
  function pick(list) { return list[Math.floor(random() * list.length)]; }

  // Make an SVG element with some attributes and add it to a parent.
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const name in attrs) e.setAttribute(name, attrs[name]);
    (parent || svg).appendChild(e);
    return e;
  }

  // Make a colour a bit darker (amount 0–1).
  function darker(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * (1 - amount));
    const g = Math.round(((n >> 8) & 255) * (1 - amount));
    const b = Math.round((n & 255) * (1 - amount));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // A slightly wonky rectangle, like one drawn by hand.
  function box(x, y, w, h, wobble = 2) {
    const j = () => between(-wobble, wobble);
    return `M${x + j()} ${y + j()} L${x + w + j()} ${y + j()} L${x + w + j()} ${y + h + j()} L${x + j()} ${y + h + j()} Z`;
  }

  // A watercolour wash: the colour, plus a darker edge where the paint pools.
  function wash(d, color, parent, opacity = 0.92) {
    el("path", { d, fill: color, opacity }, parent);
    if (color.startsWith("#")) {
      el("path", { d, fill: "none", stroke: darker(color, 0.18), "stroke-width": 3, opacity: 0.45 }, parent);
    }
  }

  // A thin ink line.
  function ink(d, parent, width = 1.6) {
    return el("path", { d, fill: "none", stroke: "#5f463d", "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
  }

  // The watercolour filters. "prefix" keeps their names unique on the page.
  function filters(prefix) {
    return `
      <filter id="${prefix}wc" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" result="wobbly"/>
        <feGaussianBlur in="wobbly" stdDeviation="0.6"/>
      </filter>
      <filter id="${prefix}bloom" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" result="wobbly"/>
        <feGaussianBlur in="wobbly" stdDeviation="1.1"/>
      </filter>
      <filter id="${prefix}ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="5" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5"/>
      </filter>
      <filter id="${prefix}paper" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="2" stitchTiles="stitch"/>
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.3  0.55 0 0 0 -0.18"/>
      </filter>`;
  }

  return { random, between, pick, el, darker, box, wash, ink, filters };
}
