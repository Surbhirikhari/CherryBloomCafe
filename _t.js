window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
window.addEventListener("load", function () {
  document.getElementById("screen-title").hidden = true;
  scene.classList.add("inside");
  customer = makeCustomer(); customer.order = MENU.find(m => m.dessert === "sakura");
  showScreen("bake"); openBakeStation("sakura", serve);
  const stage = +location.hash.slice(1);
  for (let i = 0; i < stage; i++) { const s = bStep(); bake.done.add(s.id); bake.v[s.id] = s.target ? (s.target[0]+s.target[1])/2 : s.times || 1; bake.index++; }
  startStep();
  const s = bStep();
  const tool = bake.tools[s.tool];
  const pb = bPlate.getBoundingClientRect();
  const at = (x, y) => ({ clientX: pb.left + pb.width * x / 200, clientY: pb.top + pb.height * y / 200 });
  const tb = tool.getBoundingClientRect();
  tool.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, pointerType: "mouse", clientX: tb.left + 40, clientY: tb.top + 40 }));
  const path = stage === 0 ? [[100, 70]] : stage === 1 ? [[96, 30]] : stage === 2 ? [[70,130],[130,130],[70,130],[130,130],[70,130],[130,130]] : [[70,40],[90,40],[110,40],[130,40]];
  let t = 0;
  const iv = setInterval(() => { const p = path[Math.min(path.length - 1, Math.floor(t / 6))]; document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, pointerType: "mouse", ...at(p[0], p[1]) })); t++;
    if (location.search === "?drop" && t === 8) document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    if (t > 60) clearInterval(iv); }, 30);
});
