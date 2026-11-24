// =========================================================
// Cherry Blossom Cafe — customers.js
// Draws customers in Chef Bloom's style: big round heads, little oval eyes,
// rosy cheeks and thick marker outlines. Every customer gets a random look.
// =========================================================

const CUSTOMER_NAMES = ["Hana", "Yuki", "Momo", "Ren", "Sora", "Aiko", "Kai", "Mei", "Lily", "Theo", "Iris", "Nana"];
const SKIN_TONES   = ["#fde6d8", "#f6d6c3", "#ebc3a6", "#d9a988", "#b8846a"];
const HAIR_COLOURS = ["#6b4335", "#3f2f2b", "#c58b5a", "#2f2624", "#a35a4a", "#ecc77f"];
const OUTFITS      = ["#a9bccb", "#9db391", "#f2c6cf", "#c7aed3", "#e9cf94", "#f6b8a0", "#bfd8d2"];
const HAIR_STYLES  = ["bob", "twintails", "short", "bun"];
const HATS         = ["none", "none", "bow", "beret"];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Make a brand-new random customer.
function makeCustomer() {
  return {
    name: randomItem(CUSTOMER_NAMES),
    order: randomItem(MENU),                     // anything on the menu
    look: {
      skin: randomItem(SKIN_TONES),
      hairColor: randomItem(HAIR_COLOURS),
      hair: randomItem(HAIR_STYLES),
      outfit: randomItem(OUTFITS),
      hat: randomItem(HATS),
    },
  };
}

// Draw a customer as SVG code. Their mood ("waiting", "happy" or "sad")
// is set later with data-mood, which picks the matching face in style.css.
function customerSVG(look) {
  const s = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const hc = look.hairColor;

  // hair behind the head, and the fringe in front of it
  const BACK = {
    bob:       `<path d="M30 140 Q26 58 100 56 Q174 58 170 140 L170 192 Q140 202 128 188 L72 188 Q60 202 30 192 Z" fill="${hc}" ${s}/>`,
    twintails: `<path d="M44 112 Q4 140 16 222 Q30 240 44 216 Q36 162 56 130 Z" fill="${hc}" ${s}/>
                <path d="M156 112 Q196 140 184 222 Q170 240 156 216 Q164 162 144 130 Z" fill="${hc}" ${s}/>
                <path d="M34 132 Q30 60 100 58 Q170 60 166 132 Z" fill="${hc}" ${s}/>`,
    short:     `<path d="M34 134 Q30 58 100 56 Q170 58 166 134 Z" fill="${hc}" ${s}/>`,
    bun:       `<circle cx="100" cy="52" r="24" fill="${hc}" ${s}/>
                <path d="M32 136 Q28 60 100 58 Q172 60 168 136 L166 162 Q100 150 34 162 Z" fill="${hc}" ${s}/>`,
  };
  const FRONT = {
    bob:       `M38 128 Q36 66 100 62 Q164 66 162 128 Q150 104 138 98 Q134 112 120 114 Q116 96 104 94 Q100 110 86 112 Q80 96 70 98 Q56 108 38 128 Z`,
    twintails: `M38 126 Q36 66 100 62 Q164 66 162 126 Q146 100 128 102 Q120 88 100 92 Q80 88 72 102 Q54 100 38 126 Z`,
    short:     `M38 122 Q40 64 100 60 Q160 64 162 120 Q140 92 112 96 Q128 84 100 82 Q72 90 38 122 Z`,
    bun:       `M38 124 Q36 68 100 64 Q164 68 162 124 Q146 100 120 104 Q110 90 100 90 Q86 96 80 104 Q54 100 38 124 Z`,
  };
  const HAT = {
    none: "",
    bow:   `<g transform="translate(140 74) rotate(18)">
              <path d="M0 0 L-20 -12 L-20 12 Z M0 0 L20 -12 L20 12 Z" fill="#f2a6b8" ${s} stroke-width="3"/>
              <circle r="5" fill="#f2a6b8" ${s} stroke-width="3"/></g>`,
    beret: `<path d="M44 84 Q40 50 100 46 Q162 44 160 76 Q130 66 100 70 Q70 70 44 84 Z" fill="#e57c8f" ${s}/>
            <circle cx="102" cy="44" r="5" fill="#e57c8f" ${s} stroke-width="3"/>`,
  };

  return `
    <svg viewBox="0 0 200 340" class="customer-svg" aria-hidden="true">
      <g class="customer-body">
        ${BACK[look.hair]}
        <!-- legs and shoes -->
        <rect x="78" y="272" width="16" height="50" rx="7" fill="${look.skin}" ${s}/>
        <rect x="106" y="272" width="16" height="50" rx="7" fill="${look.skin}" ${s}/>
        <ellipse cx="84" cy="324" rx="14" ry="8" fill="#6b4a42" ${s}/>
        <ellipse cx="116" cy="324" rx="14" ry="8" fill="#6b4a42" ${s}/>
        <!-- outfit, collar, arms -->
        <path d="M56 292 Q58 214 100 204 Q142 214 144 292 Q100 300 56 292 Z" fill="${look.outfit}" ${s}/>
        <ellipse cx="58" cy="246" rx="13" ry="28" fill="${look.outfit}" ${s} transform="rotate(14 58 246)"/>
        <ellipse cx="142" cy="246" rx="13" ry="28" fill="${look.outfit}" ${s} transform="rotate(-14 142 246)"/>
        <circle cx="53" cy="274" r="9" fill="${look.skin}" ${s} stroke-width="3"/>
        <circle cx="147" cy="274" r="9" fill="${look.skin}" ${s} stroke-width="3"/>
        <rect x="91" y="184" width="18" height="24" fill="${look.skin}" ${s}/>
        <path d="M100 208 Q86 202 79 212 Q86 224 100 215 Q114 224 121 212 Q114 202 100 208 Z" fill="#fffdf7" ${s} stroke-width="3"/>
        <!-- the big round head -->
        <ellipse cx="100" cy="126" rx="64" ry="60" fill="${look.skin}" ${s}/>
        <path d="${FRONT[look.hair]}" fill="${hc}" ${s}/>
        ${HAT[look.hat]}
        <!-- rosy cheeks (blurred) -->
        <g fill="#f3a9b0" opacity="0.75" style="filter: blur(3px)">
          <ellipse cx="66" cy="152" rx="12" ry="7"/><ellipse cx="134" cy="152" rx="12" ry="7"/>
        </g>
        <!-- three faces; CSS shows the one matching the mood -->
        <g class="face face-waiting">
          <ellipse cx="78" cy="136" rx="5.5" ry="9" fill="${INK}"/>
          <ellipse cx="122" cy="136" rx="5.5" ry="9" fill="${INK}"/>
          <path d="M94 158 Q100 163 106 158" fill="none" ${s} stroke-width="3"/>
        </g>
        <g class="face face-happy">
          <path d="M70 140 Q78 128 86 140 M114 140 Q122 128 130 140" fill="none" ${s}/>
          <path d="M91 154 Q100 168 109 154 Z" fill="#e98a9a" ${s} stroke-width="3"/>
        </g>
        <g class="face face-sad">
          <path d="M70 134 L86 138 M130 134 L114 138" fill="none" ${s}/>
          <path d="M93 162 Q100 155 107 162" fill="none" ${s} stroke-width="3"/>
          <path d="M150 112 Q144 124 150 128 Q156 124 150 112 Z" fill="#bfe0ef" ${s} stroke-width="2"/>
        </g>
      </g>
    </svg>`;
}
