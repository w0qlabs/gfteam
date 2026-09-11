import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFinishPicker } from "./finishes.js";
import { entry } from "./grappling-poses.js";
import { createRig, interpolatePose } from "./grappling-rig.js";

export function initTechnique() {
  const abort = new AbortController();
  const media = gsap.matchMedia();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const svg = document.getElementById("grappling");
  const button = document.getElementById("play-technique");
  const controls = [...document.querySelectorAll("[data-step]")];
  const principles = [...document.querySelectorAll("[data-principle]")];
  const caption = document.getElementById("technique-caption");
  const title = document.getElementById("grappling-title");
  const rig = createRig(svg);
  const display = svg.querySelector("#fighter-render");
  const pickFinish = createFinishPicker();
  const clock = { time: 0 };
  const captions = [
    "Base antes do movimento.",
    "A pegada encontra o controle.",
    "A alavanca transforma o movimento.",
    "Controle, respeito e um novo começo.",
  ];
  let current = -1, playing = false, manual = false, pausedByUser = false;
  let scrollTween, resetTween, scrollTrigger, scrollFrame, finish, frames = [], times = [], duration = 0;
  const timeline = gsap.timeline({
    id: "grappling-sequence",
    paused: true,
    onUpdate: () => render(clock.time),
    onComplete: () => {
      playing = false;
      pausedByUser = false;
      setButton("Ver outra", "arrow-counter-clockwise");
    },
  });

  function setButton(label, icon) {
    button.innerHTML = `${label} <i class="ph ph-${icon}" aria-hidden="true"></i>`;
  }
  function update(step) {
    if (step === current) return;
    current = step;
    document.getElementById("technique-step").textContent = `0${step + 1}`;
    caption.textContent = step === 3 ? `${finish.name}. Controle e respeito.` : captions[step];
    title.textContent = step === 3
      ? `Representação conceitual de ${finish.name.toLowerCase()} entre dois praticantes de Jiu-Jitsu`
      : "Dois praticantes em uma sequência conceitual de Jiu-Jitsu";
    controls.forEach((control, i) => control.setAttribute("aria-pressed", String(i === step)));
    principles.forEach((principle, i) => principle.classList.toggle("is-active", i === step));
  }
  function render(time) {
    // Stateless sampling also works when scrubbing backward or skipping stages.
    let index = frames.findIndex(frame => time < frame.end + frame.hold);
    if (index < 0) index = frames.length - 1;
    const frame = frames[index];
    const previous = frames[Math.max(0, index - 1)];
    const progress = frame.duration ? gsap.utils.clamp(0, 1, (time - frame.start) / frame.duration) : 1;
    const t = frame.ease(progress);
    rig.render(frame.pair.map((pose, i) => interpolatePose(previous.pair[i], pose, t)));
    svg.dataset.pose = frame.name;
    // Keep the previous stage selected until the next readable key pose lands.
    const step = time >= times[3] ? 3 : time >= times[2] ? 2 : time >= times[1] ? 1 : 0;
    update(step);
  }
  function chooseSequence() {
    scrollTween?.kill();
    timeline.pause().clear();
    clock.time = 0;
    finish = pickFinish();
    svg.dataset.finish = finish.id;
    duration = 0;
    frames = [...entry, ...finish.frames].map(frame => {
      const start = duration;
      const end = start + frame.duration;
      duration = end + frame.hold;
      timeline.addLabel(frame.name, end);
      return { ...frame, start, end, ease: gsap.parseEase(frame.ease || "sine.inOut") };
    });
    times = [0, frames[1].end, frames[4].end, frames.at(-1).end];
    timeline.to(clock, { time: duration, duration, ease: "none" }, 0);
    svg.dataset.duration = duration.toFixed(2);
    current = -1;
    render(0);
  }
  chooseSequence();

  function cancelReset() {
    resetTween?.kill();
    gsap.set(display, { opacity: 1 });
  }
  function select(step) {
    playing = false;
    pausedByUser = false;
    manual = true;
    cancelReset();
    scrollTween?.kill();
    timeline.pause(times[step]);
    clock.time = times[step];
    render(clock.time);
    if (reduced.matches) setButton(step === 3 ? "Ver outra" : "Próxima etapa", step === 3 ? "arrow-counter-clockwise" : "arrow-right");
    else setButton("Ver técnica", "play");
  }
  controls.forEach((control, index) => control.addEventListener("click", () => select(index), { signal: abort.signal }));
  button.addEventListener("click", () => {
    manual = true;
    scrollTween?.kill();
    if (reduced.matches) {
      if (current === 3) {
        chooseSequence();
        setButton("Próxima etapa", "arrow-right");
      } else select(current + 1);
    } else if (playing) {
      cancelReset();
      timeline.pause();
      playing = false;
      pausedByUser = true;
      setButton("Continuar técnica", "play");
    } else if (pausedByUser && timeline.time() < timeline.duration()) {
      pausedByUser = false;
      playing = true;
      setButton("Pausar técnica", "pause");
      timeline.play();
    } else {
      playing = true;
      setButton("Pausar técnica", "pause");
      // A clean reset between unrelated finishes, never an anatomical morph.
      resetTween = gsap.to(display, {
        opacity: 0, duration: 0.12, ease: "power1.out",
        onComplete: () => {
          chooseSequence();
          timeline.restart();
          resetTween = gsap.to(display, { opacity: 1, duration: 0.18, ease: "power1.out" });
        },
      });
    }
  }, { signal: abort.signal });

  function syncScroll(progress) {
    if (playing || manual) return;
    pausedByUser = false;
    scrollTween?.kill();
    // Map the four articles to each finish's own key-pose times.
    const phase = progress * 3;
    const i = Math.min(2, Math.floor(phase));
    const time = gsap.utils.interpolate(times[i], times[i + 1], phase - i);
    scrollTween = gsap.to(timeline, { time, duration: 0.35, ease: "power1.out", overwrite: true });
  }
  media.add("(min-width: 601px) and (prefers-reduced-motion: no-preference)", () => {
    scrollTrigger = ScrollTrigger.create({
      trigger: ".principles",
      start: "top 45%",
      end: "bottom 70%",
      onUpdate: self => syncScroll(self.progress),
    });
    return () => { scrollTrigger.kill(); scrollTrigger = null; scrollTween?.kill(); };
  });
  const resumeScroll = () => {
    const wasManual = manual;
    manual = false;
    // Passive wheel/touch events can arrive after the compositor's scroll
    // update. Reconcile once so that the first gesture also resumes scrubbing.
    if (wasManual) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => { if (scrollTrigger) syncScroll(scrollTrigger.progress); });
    }
  };
  window.addEventListener("wheel", resumeScroll, { passive: true, signal: abort.signal });
  window.addEventListener("touchmove", resumeScroll, { passive: true, signal: abort.signal });
  window.addEventListener("keydown", event => {
    if (["PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"].includes(event.key) &&
      !event.target.closest('button, [role="slider"], input, textarea, select')) resumeScroll();
  }, { signal: abort.signal });
  reduced.addEventListener("change", () => select(Math.max(0, current)), { signal: abort.signal });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden || !playing) return;
    cancelReset();
    timeline.pause();
    playing = false;
    pausedByUser = true;
    setButton("Continuar técnica", "play");
  }, { signal: abort.signal });
  if (reduced.matches) setButton("Próxima etapa", "arrow-right");

  return () => {
    abort.abort();
    media.revert();
    scrollTween?.kill();
    resetTween?.kill();
    cancelAnimationFrame(scrollFrame);
    timeline.kill();
    rig.destroy();
  };
}
