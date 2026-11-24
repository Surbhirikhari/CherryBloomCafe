// =========================================================
// Cherry Blossom Cafe — sound.js
// Every sound in the cafe, made from scratch with the Web Audio API.
//
// There are NO sound files. Each sound is cooked from two ingredients,
// a bit like baking everything from flour and sugar:
//   - a TONE: a pure note (an "oscillator") that can slide up or down.
//     A tiny tone that slides UP very fast is exactly what a bubble
//     sounds like, so lots of them make pouring water.
//   - NOISE: a hiss of random numbers. Put it through a "filter"
//     (which keeps only the high or low part) and it turns into
//     steam, cream, a knife, sugar falling, or a sizzling pan.
//
// Two volume knobs ("buses"): one for the music and birds in the
// background, one for the cooking sounds. The ♫ and 🔈 buttons in the
// top bar turn each one on or off, and the game remembers your choice.
//
// Browsers only allow sound after you click or tap something,
// so everything stays quiet until your first click.
// =========================================================

const Sound = (function () {

  // ---------- Your choices: music on/off, sounds on/off ----------
  const SAVE_KEY = "cherry-blossom-cafe-sound";
  const prefs = { music: true, sfx: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); } catch (e) {}
  function savePrefs() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  const MUSIC_LEVEL = 0.6;      // the music sits quietly under everything else
  let ctx = null;               // the "audio kitchen": made on your first click
  let out, sfxBus, musicBus, echoIn, noiseBuf;


  // ---------- 1. Setting up the audio kitchen ----------
  function setup() {
    const AudioKitchen = window.AudioContext || window.webkitAudioContext;
    if (!AudioKitchen) return;                       // a very old browser: no sound, the game still works
    ctx = new AudioKitchen();

    // a "compressor" keeps loud moments from getting harsh
    const soften = ctx.createDynamicsCompressor();
    soften.threshold.value = -12;
    soften.ratio.value = 4;
    soften.attack.value = 0.005;
    soften.release.value = 0.2;
    soften.connect(ctx.destination);
    out = ctx.createGain();
    out.gain.value = 3.6;                            // the main volume knob
    out.connect(soften);

    // a soft "room echo" so everything sounds like it's in a cosy cafe
    const echo = ctx.createConvolver();
    echo.buffer = makeRoomEcho(2.4);
    echoIn = ctx.createGain();
    echoIn.connect(echo);
    echo.connect(out);

    sfxBus = makeBus(prefs.sfx ? 1 : 0, 0.16);
    musicBus = makeBus(prefs.music ? MUSIC_LEVEL : 0, 0.45);
    noiseBuf = makeNoise(2);

    startMusic();
    startAmbience();
  }

  // a bus: one volume knob, plus a little of it sent to the room echo
  function makeBus(level, echoAmount) {
    const bus = ctx.createGain();
    bus.gain.value = level;
    bus.connect(out);
    const send = ctx.createGain();
    send.gain.value = echoAmount;
    bus.connect(send);
    send.connect(echoIn);
    return bus;
  }

  // 2 seconds of hiss (random numbers between -1 and 1)
  function makeNoise(seconds) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // a room echo is just hiss that fades away, slightly different in each ear
  function makeRoomEcho(seconds) {
    const length = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
    return buffer;
  }

  // On an iPhone, web sounds are silenced by the ring/silent switch.
  // Saying we're "playback" (like a music app) lets them play anyway.
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}

  // Wake the audio up on the first click, tap or key press.
  // ("interrupted" happens on iPhones after a phone call or Siri.)
  let warmedUp = false;
  function unlock() {
    if (!ctx) setup();
    if (!ctx) return;
    if (ctx.state !== "running") ctx.resume();
    if (!warmedUp) {
      // older iPhones only fully wake up after something plays during a tap:
      // a tiny silent sound does the trick
      warmedUp = true;
      const silence = ctx.createBufferSource();
      silence.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      silence.connect(ctx.destination);
      silence.start(0);
    }
  }
  ["pointerdown", "touchend", "click", "keydown"].forEach(function (type) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  });

  // Hush when you switch to another app or tab, and carry on when you come back.
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  const on = () => ctx && prefs.sfx;                 // should cooking sounds play?
  const now = () => ctx.currentTime + 0.01;


  // ---------- 2. The two ingredients: tone() and hiss() ----------

  // send a sound to a bus, a little to the left (-1) or right (+1)
  function connectOut(node, pan, bus) {
    if (pan && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      node.connect(panner);
      panner.connect(bus);
    } else {
      node.connect(bus);
    }
  }

  // a "shape" for the volume: rise quickly (a), then fade away (d)
  function envelope(gain, t, vol, a, d) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + a);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  // A note. f = how high (in Hz), to = slide to this pitch, at = start a bit later,
  // a = how fast it starts, d = how long it fades, vol = how loud.
  function tone({ f, to, type = "sine", at = 0, when, a = 0.005, d = 0.2, vol = 0.1, glide, pan = 0, bus = sfxBus, detune = 0 }) {
    const t = when !== undefined ? when : now() + at;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(f, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + (glide || a + d));
    const gain = ctx.createGain();
    envelope(gain, t, vol, a, d);
    osc.connect(gain);
    connectOut(gain, pan, bus);
    osc.start(t);
    osc.stop(t + a + d + 0.05);
  }

  // A filtered hiss. "lowpass" keeps the deep part (a thud, a rumble),
  // "highpass" keeps the bright part (steam, sugar), "bandpass" keeps a
  // slice in the middle around f (water, a whoosh). q = how narrow.
  function hiss({ at = 0, when, a = 0.005, d = 0.1, vol = 0.1, type = "bandpass", f = 1000, to, q = 1, pan = 0, bus = sfxBus }) {
    const t = when !== undefined ? when : now() + at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(f, t);
    if (to) filter.frequency.exponentialRampToValueAtTime(to, t + a + d);
    const gain = ctx.createGain();
    envelope(gain, t, vol, a, d);
    src.connect(filter);
    filter.connect(gain);
    connectOut(gain, pan, bus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + a + d + 0.05);
  }

  // A bell or music-box note: a main tone plus fainter, higher "shimmer" tones.
  function bell(f, { at = 0, when, vol = 0.08, d = 1.2, pan = 0, bus = sfxBus } = {}) {
    const t = when !== undefined ? when : now() + at;
    tone({ f, when: t, vol, d, pan, bus });
    tone({ f: f * 2.01, when: t, vol: vol * 0.3, d: d * 0.45, pan, bus });
    tone({ f: f * 3.98, when: t, vol: vol * 0.1, d: d * 0.18, pan, bus });
  }

  // a bubble: a tiny tone that slides UP very quickly
  function bubble(f, vol = 0.06, d = 0.05, pan = 0) {
    tone({ f, to: f * 1.8, a: 0.003, d, vol, pan });
  }

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const note = (midi) => 440 * Math.pow(2, (midi - 69) / 12);   // piano key number -> Hz

  // A long-running sound (a hum, a hiss bed) that plays until we stop it.
  // Returns the source so we can stop it later.
  function hum(dest, { type = "sawtooth", f = 60, filter = 200, vol = 0.03 }) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = filter;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    osc.connect(lp); lp.connect(gain); gain.connect(dest);
    osc.start();
    return osc;
  }
  function hissBed(dest, { type = "bandpass", f = 1000, q = 0.7, vol = 0.03 }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = f;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter); filter.connect(gain); gain.connect(dest);
    src.start(0, Math.random() * 1.5);
    src.filter = filter;
    return src;
  }


  // ---------- 3. Things that flow: pouring, piping, drizzling ----------
  // Each liquid has a soft hiss "bed" underneath and little events on top
  // (bubbles, glugs, squelches, drips). "level" is how full it is (0 to 1):
  // like a real glass, the bubbles get higher as it fills up.
  const LIQUIDS = {
    water: {                         // hot water from the kettle: lots of bright bubbles
      bed: { type: "bandpass", f: 1500, q: 0.6, vol: 0.05 }, rate: 40, rises: true,
      event: (lvl) => bubble(rand(420, 650) + lvl * 900, rand(0.03, 0.08), rand(0.03, 0.06), rand(-0.2, 0.2)),
    },
    tea: {                           // the matcha bowl tipped into the jar: a little thicker
      bed: { type: "bandpass", f: 1000, q: 0.7, vol: 0.05 }, rate: 28, rises: true,
      event: (lvl) => bubble(rand(320, 480) + lvl * 600, rand(0.03, 0.07), rand(0.04, 0.07)),
    },
    milk: {                          // milk: smooth, with soft round bubbles
      bed: { type: "bandpass", f: 750, q: 0.8, vol: 0.06 }, rate: 18, rises: true,
      event: (lvl) => bubble(rand(260, 380) + lvl * 450, rand(0.03, 0.06), rand(0.05, 0.08)),
    },
    batter: {                        // thick batter: slow, deep "blop"s
      bed: { type: "lowpass", f: 420, q: 0.8, vol: 0.07 }, rate: 6,
      event: () => { tone({ f: rand(140, 200), to: rand(230, 300), d: 0.09, vol: 0.12 }); hiss({ type: "lowpass", f: 600, d: 0.06, vol: 0.04 }); },
    },
    creamPour: {                     // the strawberry cream jar: a soft, silky glug
      bed: { type: "lowpass", f: 520, q: 0.7, vol: 0.06 }, rate: 5,
      event: () => tone({ f: rand(190, 250), to: rand(300, 380), d: 0.08, vol: 0.09 }),
    },
    cream: {                         // the piping bag: an airy, squishy "pfshhh" with little squelches
      bed: { type: "bandpass", f: 900, q: 1.4, vol: 0.075 }, rate: 9, jitter: true,
      event: () => {
        tone({ f: rand(240, 320), to: rand(110, 150), d: rand(0.05, 0.08), vol: 0.07, type: "triangle" });
        hiss({ type: "lowpass", f: 700, d: 0.05, vol: 0.05 });
      },
    },
    honey: {                         // honey: slow, sticky, golden drips
      bed: { type: "lowpass", f: 280, q: 0.7, vol: 0.02 }, rate: 2.5,
      event: () => { tone({ f: rand(480, 600), to: rand(900, 1100), a: 0.01, d: 0.14, vol: 0.07 }); },
    },
  };

  // which liquid each tool pours
  const TOOL_LIQUID = {
    kettle: "water", teaKettle: "water", matchaBowl: "tea", milk: "milk", milkBottle: "milk",
    pitcher: "milk", batter: "batter", batterBowl: "batter", creamJar: "creamPour",
    piping: "cream", honeyJar: "honey", dipper: "honey",
  };

  let flowing = null;                // the liquid sound that's playing right now

  function startLiquid(kind) {
    stopFlow();
    const L = LIQUIDS[kind];
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(sfxBus);
    const bed = hissBed(gain, { ...L.bed, vol: 1 });
    flowing = { kind, L, gain, bed, active: false, level: 0 };
    flowing.timer = setInterval(function () {
      if (!flowing.active) return;
      if (Math.random() < L.rate * 0.03) L.event(flowing.level);
      const t = ctx.currentTime;
      if (L.jitter) bed.filter.frequency.setTargetAtTime(L.bed.f * rand(0.55, 1.5), t, 0.02);   // squish, squish
      else if (L.rises) bed.filter.frequency.setTargetAtTime(L.bed.f * (1 + flowing.level * 0.7), t, 0.1);
    }, 30);
  }

  // Called every frame while you hold a pouring tool.
  // active: is it flowing right now? level: how full (0 to 1)
  function flow(tool, active, level) {
    if (!on()) return;
    const kind = TOOL_LIQUID[tool] || "water";
    if (!flowing || flowing.kind !== kind) startLiquid(kind);
    flowing.level = level;
    if (flowing.active !== active) {
      flowing.active = active;
      flowing.gain.gain.setTargetAtTime(active ? flowing.L.bed.vol : 0, ctx.currentTime, 0.04);
    }
  }

  function stopFlow() {
    if (!flowing) return;
    const f = flowing;
    flowing = null;
    clearInterval(f.timer);
    f.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    f.bed.stop(ctx.currentTime + 0.4);
  }


  // ---------- 4. Machines: the oven, toaster, pan and espresso machine ----------
  let machine = null;                // the machine that's running right now

  function startMachine(kind) {
    stopMachine();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(sfxBus);
    gain.gain.setTargetAtTime(1, ctx.currentTime, 0.15);
    const parts = [];
    let every = null, count = 0;

    if (kind === "pan") {                          // the crêpe sizzling in butter
      parts.push(hissBed(gain, { type: "highpass", f: 2600, q: 0.5, vol: 0.03 }));
      parts.push(hissBed(gain, { type: "lowpass", f: 350, q: 0.7, vol: 0.02 }));
      every = () => {
        for (let i = 0; i < 2; i++) if (Math.random() < 0.55)
          hiss({ type: "bandpass", f: rand(2500, 7000), q: 2, d: rand(0.004, 0.015), vol: rand(0.02, 0.07), pan: rand(-0.3, 0.3) });
      };
    }
    if (kind === "oven") {                         // a warm hum, a fan, and the timer going tick… tock…
      parts.push(hum(gain, { f: 55, filter: 170, vol: 0.06 }));
      parts.push(hissBed(gain, { type: "lowpass", f: 500, vol: 0.025 }));
      every = () => { if (count++ % 17 === 0) tone({ f: count % 34 < 17 ? 2600 : 2200, d: 0.015, vol: 0.03 }); };
    }
    if (kind === "toaster") {                      // glowing coils and a busy little clockwork timer
      parts.push(hum(gain, { type: "sine", f: 120, filter: 400, vol: 0.02 }));
      parts.push(hissBed(gain, { type: "highpass", f: 3500, vol: 0.008 }));
      every = () => { if (count++ % 8 === 0) tone({ f: 1800, d: 0.012, vol: 0.025 }); };
    }
    if (kind === "brew") {                         // the espresso pump buzzing, steam, coffee trickling
      parts.push(hum(gain, { f: 50, filter: 320, vol: 0.05 }));
      parts.push(hissBed(gain, { type: "bandpass", f: 1900, q: 0.8, vol: 0.02 }));
      parts.push(hissBed(gain, { type: "bandpass", f: 900, q: 1.2, vol: 0.02 }));
      every = () => { if (Math.random() < 0.14) bubble(rand(600, 900), 0.04, 0.05); };
    }
    const timer = every && setInterval(every, 30);
    machine = {
      kind,
      stop() {
        clearInterval(timer);
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
        parts.forEach((p) => p.stop(ctx.currentTime + 0.5));
      },
    };
  }

  function stopMachine() {
    if (machine) { machine.stop(); machine = null; }
  }


  // ---------- 5. Background music: a slow music-box lullaby ----------
  // Four soft chords (F, Dm, B♭, C) each last two bars. Over them a music
  // box makes up a new gentle tune as it goes, so it never repeats exactly.
  const BEAT = 0.8;                    // seconds per beat (a slow, sleepy 75 beats a minute)
  const EIGHTH = BEAT / 2;
  const CHORDS = [
    { bass: 41, pad: [53, 57, 60, 64] },   // F major 7
    { bass: 38, pad: [50, 53, 57, 60] },   // D minor 7
    { bass: 46, pad: [50, 53, 57, 62] },   // B♭ major 7
    { bass: 48, pad: [52, 55, 60, 62] },   // C add 9
  ];
  const TUNE = [72, 74, 77, 79, 81, 84, 86, 89];   // the music box only plays these (F major pentatonic)
  const music = { time: 0, step: 0, idx: 3 };

  function startMusic() {
    music.time = ctx.currentTime + 0.3;
    setInterval(scheduleMusic, 100);
  }

  // look a little ahead and book the next notes, so they're perfectly on time
  function scheduleMusic() {
    if (!prefs.music || ctx.state !== "running") { music.time = ctx.currentTime + 0.2; return; }
    if (music.time < ctx.currentTime) music.time = ctx.currentTime + 0.05;
    while (music.time < ctx.currentTime + 0.5) {
      playEighth(music.step, music.time);
      music.time += EIGHTH;
      music.step++;
    }
  }

  function playEighth(step, t) {
    const bar = Math.floor(step / 8);
    const inBar = step % 8;
    const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];

    if (inBar === 0 && bar % 2 === 0) padChord(chord, t, BEAT * 8);
    if (inBar === 0) tone({ f: note(chord.bass), when: t, a: 0.02, d: 3.2, vol: bar % 2 ? 0.07 : 0.1, bus: musicBus });

    // the tune: more notes on the beat, fewer in between, and every 4th bar it rests
    const breathe = bar % 4 === 3;
    const chance = breathe ? 0.12 : inBar % 2 === 0 ? 0.55 : 0.22;
    if (Math.random() < chance) {
      music.idx = Math.max(0, Math.min(TUNE.length - 1, music.idx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      const pan = rand(-0.35, 0.35);
      bell(note(TUNE[music.idx]), { when: t, vol: 0.05, d: 1.8, pan, bus: musicBus });
      if (Math.random() < 0.12 && music.idx < TUNE.length - 1)            // a little sparkle grace note
        bell(note(TUNE[music.idx + 1]), { when: t + EIGHTH / 2, vol: 0.025, d: 1, pan, bus: musicBus });
    }
  }

  // a soft, warm chord that swells in slowly and fades out slowly
  function padChord(chord, t, length) {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.022, t + 1.8);
    gain.gain.setValueAtTime(0.022, t + length - 0.6);
    gain.gain.linearRampToValueAtTime(0, t + length + 1.6);
    lp.connect(gain);
    gain.connect(musicBus);
    chord.pad.forEach(function (midi) {
      [-6, 6].forEach(function (cents) {                // two slightly different copies = warm and wobbly
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = note(midi);
        osc.detune.value = cents;
        osc.connect(lp);
        osc.start(t);
        osc.stop(t + length + 1.8);
      });
    });
  }

  // ---------- 6. Ambience: a soft breeze and birds in the cherry trees ----------
  function startAmbience() {
    const breeze = ctx.createGain();
    breeze.gain.value = 0.012;
    breeze.connect(musicBus);
    hissBed(breeze, { type: "lowpass", f: 380, vol: 1 });
    const sway = ctx.createOscillator();              // the breeze slowly comes and goes
    sway.frequency.value = 0.07;
    const swayAmount = ctx.createGain();
    swayAmount.gain.value = 0.008;
    sway.connect(swayAmount);
    swayAmount.connect(breeze.gain);
    sway.start();

    (function nextBird() {
      setTimeout(function () {
        if (prefs.music && ctx.state === "running") birdSong();
        nextBird();
      }, rand(7000, 16000));
    })();
  }

  function birdSong() {
    const pan = rand(-0.8, 0.8);
    const high = rand(3000, 4200);
    const chirps = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < chirps; i++) {
      const at = i * rand(0.1, 0.16);
      tone({ f: high, to: high * rand(1.2, 1.5), at, a: 0.01, d: 0.06, vol: 0.018, pan, bus: musicBus });
      tone({ f: high * 1.4, to: high * 0.9, at: at + 0.05, a: 0.005, d: 0.04, vol: 0.012, pan, bus: musicBus });
    }
  }


  // ---------- 7. The ♫ and 🔈 buttons ----------
  function setPref(name, value) {
    prefs[name] = value;
    savePrefs();
    const button = document.getElementById(name === "music" ? "btn-music" : "btn-sfx");
    if (button) button.setAttribute("aria-pressed", String(value));
    if (!ctx) return;
    const bus = name === "music" ? musicBus : sfxBus;
    bus.gain.setTargetAtTime(value ? (name === "music" ? MUSIC_LEVEL : 1) : 0, ctx.currentTime, 0.2);
    if (name === "sfx" && !value) { stopFlow(); stopMachine(); }
  }
  ["music", "sfx"].forEach(function (name) {
    const button = document.getElementById(name === "music" ? "btn-music" : "btn-sfx");
    if (!button) return;
    button.setAttribute("aria-pressed", String(prefs[name]));
    button.addEventListener("click", function () {
      setPref(name, !prefs[name]);
      if (name === "sfx" && prefs.sfx) setTimeout(() => sounds.pop(), 30);
    });
  });


  // ---------- 8. All the sounds the game can ask for ----------
  // Each one checks on() first, so nothing happens before your first click
  // or when the sounds are turned off.
  let lastSwipe = 0, lastSift = 0;

  const sounds = {
    flow, stopFlow,

    // a cute bubbly "pop" (the thought cloud, buttons)
    pop() {
      if (!on()) return;
      tone({ f: rand(380, 440), to: 1100, a: 0.004, d: 0.08, vol: 0.09 });
    },

    // a gentle wooden "tok" (a new tool lands on the table, picking something up)
    tok(soft) {
      if (!on()) return;
      tone({ f: soft ? 900 : 520, to: soft ? 700 : 380, d: soft ? 0.03 : 0.07, vol: soft ? 0.04 : 0.09, type: "triangle" });
    },

    // dropping things in
    drop(tool) {
      if (!on()) return;
      if (tool === "ice") {                          // ice: clink clink against the glass, then a splash
        [2600, 3900, 5150].forEach((f, i) => tone({ f: f * rand(0.97, 1.03), d: 0.25 - i * 0.06, vol: 0.05 - i * 0.012 }));
        tone({ f: 3100, at: 0.07, d: 0.14, vol: 0.025 });
        bubble(rand(500, 700), 0.05, 0.06);
        hiss({ type: "bandpass", f: 2200, at: 0.02, d: 0.12, vol: 0.04 });
      } else if (tool === "tin") {                   // a scoop of matcha powder: a soft "pfff" and a tap on the bowl
        hiss({ type: "lowpass", f: 1400, to: 500, a: 0.02, d: 0.2, vol: 0.08 });
        tone({ f: 820, d: 0.06, vol: 0.05, type: "triangle" });
      } else if (tool === "sakuraBowl") {            // a flower landing on the tea: a tiny plip and a sparkle
        bubble(rand(900, 1100), 0.05, 0.06);
        bell(2093, { at: 0.04, vol: 0.02, d: 0.5 });
      } else {                                       // a strawberry: a soft juicy plop
        tone({ f: 190, to: 90, d: 0.12, vol: 0.12 });
        bubble(rand(380, 480), 0.07, 0.08);
        hiss({ type: "lowpass", f: 900, d: 0.05, vol: 0.04 });
      }
    },

    // one swish of the spoon, the bamboo whisk or the masher
    stir(tool) {
      if (!on()) return;
      if (tool === "whisk") {                        // a bamboo whisk: a quick frothy "shk-shk"
        hiss({ type: "bandpass", f: rand(2200, 2800), to: 4200, q: 0.9, a: 0.01, d: 0.12, vol: 0.14 });
        if (Math.random() < 0.5) bubble(rand(1200, 1800), 0.025, 0.03);
      } else if (tool === "masher") {                // squishing strawberries
        hiss({ type: "lowpass", f: 650, a: 0.01, d: 0.12, vol: 0.09 });
        tone({ f: 210, to: 110, d: 0.1, vol: 0.08, type: "triangle" });
        bubble(rand(300, 400), 0.04, 0.05);
      } else {                                       // a spoon: a little swirl and a clink against the glass
        hiss({ type: "bandpass", f: 1400, a: 0.02, d: 0.12, vol: 0.03 });
        if (Math.random() < 0.6) {
          const f = rand(2300, 2700);
          tone({ f, d: 0.3, vol: 0.035 });
          tone({ f: f * 2.7, d: 0.1, vol: 0.012 });
        }
      }
    },

    // the sugar sifter: a soft "shh"
    sift() {
      if (!on() || ctx.currentTime - lastSift < 0.07) return;
      lastSift = ctx.currentTime;
      hiss({ type: "highpass", f: 5500, a: 0.01, d: 0.07, vol: 0.035 });
      if (Math.random() < 0.3) tone({ f: 1600, d: 0.01, vol: 0.02, type: "triangle" });   // tap tap
    },

    // one turn of the coffee grinder: crunchy beans
    grind() {
      if (!on()) return;
      hiss({ type: "lowpass", f: 300, a: 0.03, d: 0.35, vol: 0.06 });
      for (let i = 0; i < 16; i++) hiss({ type: "bandpass", f: rand(1800, 4000), q: 1.5, at: i * 0.024 + rand(0, 0.01), d: 0.012, vol: rand(0.05, 0.12) });
      tone({ f: 1200, at: 0.38, d: 0.02, vol: 0.03, type: "triangle" });   // the handle clicks round
    },

    // folding, rolling and slicing
    swipe(tool) {
      if (!on() || ctx.currentTime - lastSwipe < 0.2) return;
      lastSwipe = ctx.currentTime;
      if (tool === "knife") {                        // a soft "shhk" through sponge cake
        hiss({ type: "highpass", f: 2600, to: 5200, a: 0.02, d: 0.14, vol: 0.05 });
      } else {                                       // a soft, papery whoosh
        hiss({ type: "bandpass", f: 900, to: 450, q: 0.8, a: 0.04, d: 0.22, vol: 0.05 });
      }
    },

    // the dessert goes into the oven, or the bread into the toaster
    load(appliance) {
      if (!on()) return;
      if (appliance === "oven") {                    // the tray slides in and the door closes
        hiss({ type: "bandpass", f: 1500, to: 800, d: 0.25, vol: 0.04 });
        tone({ f: 130, to: 70, at: 0.25, d: 0.12, vol: 0.14 });
        hiss({ type: "lowpass", f: 500, at: 0.25, d: 0.08, vol: 0.08 });
      } else {                                       // bread slides into the slot
        hiss({ type: "bandpass", f: 1800, to: 900, d: 0.15, vol: 0.04 });
      }
    },

    // Start ▶ / Push down ▶ / Turn on ▶
    timerStart(kind) {
      if (!on()) return;
      if (kind === "oven") {                         // click the knob… whoomph, it warms up
        tone({ f: 1500, d: 0.01, vol: 0.05 }); tone({ f: 800, at: 0.03, d: 0.02, vol: 0.05 });
        hiss({ type: "lowpass", f: 300, at: 0.05, a: 0.12, d: 0.45, vol: 0.07 });
      } else if (kind === "toaster") {               // push the lever down: clunk-chk
        hiss({ type: "lowpass", f: 900, d: 0.08, vol: 0.08 });
        tone({ f: 170, to: 90, d: 0.12, vol: 0.12 });
        tone({ f: 2200, at: 0.08, d: 0.02, vol: 0.03 });
      } else if (kind === "pan") {                   // batter hits the hot pan: tsssss
        hiss({ type: "highpass", f: 2000, a: 0.01, d: 0.7, vol: 0.08 });
      } else {                                       // the espresso machine's switch
        tone({ f: 1000, d: 0.02, vol: 0.05, type: "triangle" });
      }
      startMachine(kind);
    },

    // Take out! / Stop
    timerStop(kind) {
      stopMachine();
      if (!on()) return;
      if (kind === "oven") {                         // ding! and the door opens
        bell(1568, { vol: 0.1, d: 1.6 });
        tone({ f: 120, to: 70, at: 0.15, d: 0.1, vol: 0.1 });
        hiss({ type: "lowpass", f: 600, at: 0.15, d: 0.1, vol: 0.06 });
      } else if (kind === "brew") {                  // click, and a little puff of steam
        tone({ f: 900, d: 0.02, vol: 0.05, type: "triangle" });
        hiss({ type: "highpass", f: 3000, at: 0.03, a: 0.02, d: 0.4, vol: 0.05 });
      }
    },

    // flip the crêpe: whoosh up… and a soft pat as it lands
    flip() {
      stopMachine();
      if (!on()) return;
      hiss({ type: "bandpass", f: 600, to: 1600, a: 0.03, d: 0.18, vol: 0.06 });
      tone({ f: 170, to: 80, at: 0.28, d: 0.1, vol: 0.12 });
      hiss({ type: "lowpass", f: 500, at: 0.28, d: 0.07, vol: 0.07 });
      hiss({ type: "highpass", f: 3000, at: 0.3, d: 0.4, vol: 0.04 });   // a little sizzle as it lands
    },

    // the toast pops up! (boing + clack + a tiny ding)
    toasterPop() {
      stopMachine();
      if (!on()) return;
      hiss({ type: "bandpass", f: 2000, d: 0.03, vol: 0.1 });
      tone({ f: 900, d: 0.03, vol: 0.06, type: "triangle" });
      tone({ f: 300, to: 900, a: 0.005, d: 0.18, vol: 0.06, type: "triangle" });
      bell(2093, { at: 0.08, vol: 0.04, d: 0.5 });
    },

    // put it on the plate: a little china clink
    plate() {
      if (!on()) return;
      tone({ f: 160, to: 90, d: 0.08, vol: 0.08 });
      tone({ f: 2400, d: 0.2, vol: 0.03 });
      tone({ f: 3500, d: 0.12, vol: 0.015 });
    },

    // a step is finished: two music-box notes (and a sparkle if it was perfect)
    stepDone(perfect) {
      if (!on()) return;
      bell(note(84), { vol: 0.06, d: 0.9 });
      bell(note(88), { at: 0.11, vol: 0.06, d: 1.1 });
      if (perfect) [91, 96, 100].forEach((n, i) => bell(note(n), { at: 0.24 + i * 0.07, vol: 0.035, d: 0.8, pan: (i - 1) * 0.3 }));
    },

    // start over: a soft whoosh backwards
    whoosh() {
      if (!on()) return;
      hiss({ type: "bandpass", f: 1800, to: 500, q: 0.7, a: 0.05, d: 0.25, vol: 0.05 });
    },

    // decorating: the knife chops a strawberry on the wooden board
    chop(cut) {
      if (!on()) return;
      tone({ f: 240, to: 120, d: 0.08, vol: 0.13, type: "triangle" });
      hiss({ type: "bandpass", f: 1600, d: 0.03, vol: 0.08 });
      hiss({ type: "lowpass", f: 800, at: 0.01, d: 0.05, vol: 0.04 });     // juicy
      if (cut) for (let i = 0; i < 4; i++) tone({ f: rand(500, 700), to: 300, at: 0.12 + i * 0.06, d: 0.04, vol: 0.05, type: "triangle" });
    },

    // a topping lands on the dessert
    topping(kind) {
      if (!on()) return;
      if (kind === "cream") { LIQUIDS.cream.event(); hiss({ type: "bandpass", f: 900, d: 0.1, vol: 0.05 }); return; }
      if (kind === "choco") { tone({ f: 400, to: 700, d: 0.1, vol: 0.06 }); return; }
      tone({ f: rand(500, 650), to: rand(1000, 1300), a: 0.004, d: 0.07, vol: 0.08 });
      tone({ f: 120, to: 80, d: 0.05, vol: 0.05 });
    },

    // a customer opens the cafe door: the little bell above it jingles
    doorbell(quiet) {
      if (!on()) return;
      const vol = quiet ? 0.035 : 0.07;
      [1760, 2217, 1760, 2217, 1976].forEach((f, i) => bell(f, { at: i * 0.075 + rand(0, 0.02), vol: vol * (1 - i * 0.12), d: 1.1, pan: 0.5 }));
    },

    // the recipe card: a paper rustle
    paper() {
      if (!on()) return;
      hiss({ type: "bandpass", f: 3200, q: 0.7, a: 0.03, d: 0.12, vol: 0.05 });
      hiss({ type: "bandpass", f: 2600, q: 0.7, at: 0.12, a: 0.02, d: 0.1, vol: 0.035 });
    },

    // the customer's reaction
    happy(big) {
      if (!on()) return;
      const notes = big ? [72, 76, 79, 84, 88] : [72, 76, 79];
      notes.forEach((n, i) => bell(note(n), { at: i * 0.09, vol: 0.06, d: 1 }));
    },
    sad() {
      if (!on()) return;
      tone({ f: note(64), to: note(62), at: 0, a: 0.05, d: 0.5, vol: 0.06, type: "triangle", glide: 0.4 });
      tone({ f: note(60), to: note(57), at: 0.4, a: 0.05, d: 0.7, vol: 0.06, type: "triangle", glide: 0.6 });
    },

    // coins into the till: clink-clink!
    coins(howMany = 3) {
      if (!on()) return;
      for (let i = 0; i < Math.min(5, howMany); i++) {
        const at = i * 0.11;
        tone({ f: 1975, at, d: 0.08, vol: 0.05 });
        tone({ f: 2637, at: at + 0.06, d: 0.35, vol: 0.05 });
        tone({ f: 5274, at: at + 0.06, d: 0.1, vol: 0.012 });
      }
    },

    // end of the day: a little music-box fanfare
    fanfare() {
      if (!on()) return;
      [72, 76, 79, 76, 81, 79, 84].forEach((n, i) => bell(note(n), { at: i * 0.16, vol: 0.07, d: 1.3 }));
      bell(note(88), { at: 7 * 0.16, vol: 0.05, d: 2 });
    },

    // good morning! birds and a bright chime
    morning() {
      if (!on()) return;
      bell(note(84), { vol: 0.06, d: 1.4 });
      bell(note(91), { at: 0.15, vol: 0.05, d: 1.6 });
      if (ctx) birdSong();
    },

    // Chef Bloom hops: a tiny boing
    boing() {
      if (!on()) return;
      tone({ f: 260, to: 520, a: 0.01, d: 0.16, vol: 0.05, type: "triangle", glide: 0.08 });
    },

    // Mochi: "mrrrow?" A buzzy tone through a filter that opens and closes,
    // like a cat's mouth going "mi-aow".
    meow() {
      if (!on()) return;
      const t = now();
      const len = rand(0.45, 0.6);
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const pitch = rand(520, 620);
      osc.frequency.setValueAtTime(pitch * 0.85, t);
      osc.frequency.linearRampToValueAtTime(pitch * 1.25, t + len * 0.35);
      osc.frequency.linearRampToValueAtTime(pitch * 0.8, t + len);
      const mouth = ctx.createBiquadFilter();
      mouth.type = "bandpass";
      mouth.Q.value = 4;
      mouth.frequency.setValueAtTime(700, t);
      mouth.frequency.linearRampToValueAtTime(1700, t + len * 0.4);
      mouth.frequency.linearRampToValueAtTime(800, t + len);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.06);
      gain.gain.setValueAtTime(0.14, t + len * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(mouth); mouth.connect(gain); gain.connect(sfxBus);
      osc.start(t);
      osc.stop(t + len + 0.05);
    },

    // stop anything still running (leaving the station, starting over)
    hush() {
      if (!ctx) return;
      stopFlow();
      stopMachine();
    },
  };

  return sounds;
})();
