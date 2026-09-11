import { gsap } from "gsap";

const ranks = [
  ["branca", "#eeeee4", "Todo caminho começa no primeiro treino."],
  ["azul", "#397dcc", "Técnica transforma força em controle."],
  ["roxa", "#9a67ba", "Seu movimento ganha identidade."],
  ["marrom", "#986747", "Precisão antes da velocidade."],
  ["preta", "#171a18", "A faixa preta não encerra o caminho."],
];

export function initBelt() {
  const bay = document.querySelector(".belt-bay");
  const handle = document.querySelector(".belt-handle");
  const wrap = document.querySelector(".belt-wrap");
  const main = document.querySelector(".belt-main-tail");
  const back = document.querySelector(".belt-back-tail");
  const buttons = [...document.querySelectorAll("[data-rank]")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const abort = new AbortController();
  let rank = 0,
    drag = null,
    position = 0,
    velocity = 0,
    target = 0,
    running = false;
  const setY = gsap.quickSetter(wrap, "y", "px");
  const setScale = gsap.quickSetter(main, "scaleY");
  const setSwing = gsap.quickSetter(back, "rotation", "deg");
  const setMainSwing = gsap.quickSetter(main, "rotation", "deg");
  gsap.set([main, back], { svgOrigin: "130 52" });

  function select(next) {
    next = Math.max(0, Math.min(4, next));
    if (next === rank) return;
    rank = next;
    const [name, color, copy] = ranks[rank];
    bay.style.setProperty("--belt-color", color);
    document.getElementById("rank-count").textContent = `0${rank + 1} / 05`;
    document.getElementById("rank-name").textContent = `Faixa ${name}`;
    document.getElementById("rank-copy").textContent = copy;
    handle.setAttribute("aria-valuenow", String(rank));
    handle.setAttribute("aria-valuetext", `Faixa ${name}`);
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === rank)),
    );
  }

  // A damped spring runs only while held or settling. No layout reads per frame.
  function tick(_time, delta) {
    const dt = Math.min(delta / 1000, 1 / 30);
    velocity += ((target - position) * 205 - velocity * 19) * dt;
    position += velocity * dt;
    setY(position * 0.14);
    setScale(1 + position * 0.0018);
    setSwing(-position * 0.2 + velocity * 0.008);
    setMainSwing(velocity * -0.003);
    if (!drag && Math.abs(position) < 0.03 && Math.abs(velocity) < 0.08) stop();
  }
  function start() {
    if (reduced.matches || running) return;
    running = true;
    wrap.style.willChange = "transform";
    gsap.ticker.add(tick);
  }
  function stop() {
    gsap.ticker.remove(tick);
    running = false;
    position = velocity = target = 0;
    setY(0);
    setScale(1);
    setSwing(0);
    setMainSwing(0);
    wrap.style.removeProperty("will-change");
  }
  function release(event) {
    if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id))
      return;
    const id = drag.id;
    drag = null;
    target = 0;
    if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
  }
  handle.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, y: event.clientY, advanced: false };
      handle.setPointerCapture(event.pointerId);
      handle.focus({ preventScroll: true });
      start();
    },
    { signal: abort.signal },
  );
  handle.addEventListener(
    "pointermove",
    (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const distance = Math.max(0, event.clientY - drag.y);
      target = Math.min(48, distance * 0.26);
      if (distance >= 40 && !drag.advanced) {
        drag.advanced = true;
        select((rank + 1) % ranks.length);
      }
    },
    { signal: abort.signal },
  );
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
    handle.addEventListener(type, release, { signal: abort.signal }),
  );
  handle.addEventListener(
    "keydown",
    (event) => {
      const values = {
        ArrowDown: (rank + 1) % ranks.length,
        ArrowRight: (rank + 1) % ranks.length,
        ArrowUp: rank - 1,
        ArrowLeft: rank - 1,
        Home: 0,
        End: 4,
        " ": (rank + 1) % ranks.length,
        Enter: (rank + 1) % 5,
      };
      if (!(event.key in values)) return;
      event.preventDefault();
      select(values[event.key]);
    },
    { signal: abort.signal },
  );
  buttons.forEach((button, index) =>
    button.addEventListener("click", () => select(index), {
      signal: abort.signal,
    }),
  );
  reduced.addEventListener("change", stop, { signal: abort.signal });
  window.addEventListener(
    "blur",
    () => {
      drag = null;
      stop();
    },
    { signal: abort.signal },
  );
  return () => {
    abort.abort();
    stop();
  };
}
