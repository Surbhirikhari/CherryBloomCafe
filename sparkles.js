// =========================================================
// Cherry Blossom Cafe — sparkles.js
// A little trail of sparkles follows the flower mouse.
//
// How it works: every time the mouse has moved a few pixels, we drop
// one tiny sparkle where it is. CSS (the "sparkle-fade" animation)
// makes it twinkle, drift down and fade. When its animation ends,
// we remove it, so the page never fills up with old sparkles.
// =========================================================

(function () {
  // people who turn off animations in their settings don't get the trail
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const COLORS = ["#fbc4d6", "#f7a8c2", "#ffffff", "#fff1b8", "#f6d76b"];
  const GAP = 14;            // drop a sparkle every 14 pixels of movement
  let lastX = 0;
  let lastY = 0;

  // a 4-pointed star, or sometimes a small round dot
  function sparkleSVG(color) {
    if (Math.random() < 0.35) {
      return `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="${color}"/></svg>`;
    }
    return `<svg viewBox="0 0 20 20">
      <path d="M10 0 Q11.5 8.5 20 10 Q11.5 11.5 10 20 Q8.5 11.5 0 10 Q8.5 8.5 10 0 Z"
            fill="${color}" stroke="#f07aa2" stroke-width="0.8"/>
    </svg>`;
  }

  function dropSparkle(x, y) {
    const s = document.createElement("span");
    s.className = "sparkle";
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    s.innerHTML = sparkleSVG(color);
    // scatter them a little around the mouse, in different sizes
    s.style.left = (x + (Math.random() * 16 - 8)) + "px";
    s.style.top = (y + (Math.random() * 16 - 8)) + "px";
    s.style.width = (12 + Math.random() * 12) + "px";
    s.style.setProperty("--drift", (Math.random() * 30 - 15) + "px");
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }

  document.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;      // no trail for fingers
    const moved = Math.hypot(event.clientX - lastX, event.clientY - lastY);
    if (moved < GAP) return;
    lastX = event.clientX;
    lastY = event.clientY;
    dropSparkle(event.clientX, event.clientY);
  });
})();
