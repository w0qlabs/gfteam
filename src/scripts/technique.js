import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFinishPicker } from "./finishes.js";

// Conceptual poses, not instruction: head, shoulders, hips, elbows, hands, knees, feet.
const poses = [
  [
    [
      [240, 150],
      [240, 190],
      [246, 248],
      [214, 225],
      [280, 221],
      [236, 243],
      [296, 232],
      [215, 286],
      [272, 287],
      [195, 324],
      [287, 325],
    ],
    [
      [380, 150],
      [376, 190],
      [365, 248],
      [341, 220],
      [406, 225],
      [327, 235],
      [384, 244],
      [342, 287],
      [390, 286],
      [328, 325],
      [411, 324],
    ],
  ],
  [
    [
      [266, 153],
      [260, 193],
      [248, 250],
      [270, 219],
      [290, 203],
      [313, 216],
      [333, 188],
      [220, 287],
      [276, 289],
      [202, 326],
      [287, 326],
    ],
    [
      [354, 153],
      [360, 193],
      [371, 250],
      [331, 203],
      [350, 220],
      [289, 189],
      [305, 216],
      [344, 290],
      [395, 287],
      [331, 326],
      [410, 326],
    ],
  ],
  [
    [
      [285, 185],
      [281, 218],
      [274, 271],
      [281, 242],
      [307, 226],
      [332, 230],
      [351, 207],
      [239, 293],
      [307, 290],
      [219, 327],
      [327, 327],
    ],
    [
      [346, 160],
      [349, 199],
      [364, 248],
      [325, 216],
      [330, 226],
      [296, 211],
      [284, 239],
      [358, 288],
      [402, 277],
      [345, 326],
      [426, 310],
    ],
  ],
  [
    [
      [292, 224],
      [307, 254],
      [297, 292],
      [293, 275],
      [334, 263],
      [310, 300],
      [359, 291],
      [273, 313],
      [327, 314],
      [249, 332],
      [348, 332],
    ],
    [
      [364, 267],
      [380, 286],
      [425, 287],
      [358, 293],
      [383, 313],
      [340, 306],
      [363, 331],
      [454, 273],
      [438, 315],
      [488, 280],
      [469, 330],
    ],
  ],
  [
    [
      [338, 243],
      [340, 275],
      [302, 296],
      [338, 305],
      [367, 292],
      [354, 323],
      [390, 310],
      [275, 320],
      [322, 321],
      [252, 335],
      [339, 335],
    ],
    [
      [387, 312],
      [365, 314],
      [410, 317],
      [342, 296],
      [351, 330],
      [327, 287],
      [326, 337],
      [438, 292],
      [443, 324],
      [470, 306],
      [475, 337],
    ],
  ],
  [
    [
      [343, 253],
      [337, 282],
      [299, 298],
      [351, 298],
      [367, 290],
      [376, 307],
      [389, 309],
      [275, 320],
      [318, 322],
      [251, 337],
      [338, 337],
    ],
    [
      [391, 309],
      [367, 316],
      [413, 318],
      [344, 291],
      [349, 330],
      [362, 275],
      [325, 337],
      [439, 293],
      [444, 326],
      [470, 308],
      [476, 338],
    ],
  ],
];

function geometry(pose) {
  const [
    head,
    shoulder,
    hip,
    elbowL,
    elbowR,
    handL,
    handR,
    kneeL,
    kneeR,
    footL,
    footR,
  ] = pose;
  const dx = hip[0] - shoulder[0],
    dy = hip[1] - shoulder[1];
  const length = Math.hypot(dx, dy) || 1;
  const side = [-dy / length, dx / length];
  const offset = (point, distance) => [
    point[0] + side[0] * distance,
    point[1] + side[1] * distance,
  ];
  const sl = offset(shoulder, 17),
    sr = offset(shoulder, -17),
    hl = offset(hip, 23),
    hr = offset(hip, -23);
  const waist = [shoulder[0] + dx * 0.83, shoulder[1] + dy * 0.83];
  const wl = offset(waist, 21),
    wr = offset(waist, -21);
  const path = (...points) =>
    points.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return {
    ".neck": { d: path(head, shoulder) },
    ".head": { cx: head[0], cy: head[1] },
    ".gi-body": { d: `${path(sl, sr, hr, hl)}Z` },
    ".lapel": {
      d: path(sl, [shoulder[0] + dx * 0.55, shoulder[1] + dy * 0.55], sr),
    },
    ".arm-back": { d: path(sl, elbowL, handL) },
    ".arm-front": { d: path(sr, elbowR, handR) },
    ".leg-back": { d: path(hl, kneeL, footL) },
    ".leg-front": { d: path(hr, kneeR, footR) },
    ".figure-belt": {
      d: `${path(wl, wr)} ${path(waist, [hip[0] + 5, hip[1] + 18])} ${path(waist, [hip[0] - 9, hip[1] + 14])}`,
    },
    ".foot": {
      d: `${path([footL[0] - 8, footL[1] + 3], [footL[0] + 9, footL[1]])} ${path([footR[0] - 8, footR[1]], [footR[0] + 10, footR[1] + 3])}`,
    },
  };
}

export function initTechnique() {
  const abort = new AbortController();
  const media = gsap.matchMedia();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const button = document.getElementById("play-technique");
  const controls = [...document.querySelectorAll("[data-step]")];
  const principles = [...document.querySelectorAll("[data-principle]")];
  const times = [0, 1, 3, 5];
  const captions = [
    "Base antes do movimento.",
    "A pegada encontra o controle.",
    "A alavanca transforma o movimento.",
    "Controle, respeito e um novo começo.",
  ];
  let current = -1,
    playing = false,
    manual = false,
    scrollTween;
  const pickFinish = createFinishPicker();
  let finish;
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 1, ease: "power1.inOut" },
    onUpdate: () => {
      const t = timeline.time();
      update(t < 0.85 ? 0 : t < 2.5 ? 1 : t < 4.25 ? 2 : 3);
    },
    onComplete: () => {
      playing = false;
      button.innerHTML =
        'Ver outra <i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i>';
    },
  });
  document.querySelectorAll(".fighter").forEach((root) => {
    const neck = document.createElementNS("http://www.w3.org/2000/svg", "path");
    neck.classList.add("neck");
    root.prepend(neck);
  });
  function chooseSequence() {
    scrollTween?.kill();
    timeline.pause(0, true).clear();
    finish = pickFinish();
    document.getElementById("grappling").dataset.finish = finish.id;
    const sequence = [...poses.slice(0, 4), ...finish.poses];
    sequence.forEach((pair, phase) =>
      pair.forEach((pose, index) => {
        const root = document.getElementById(
          index === 0 ? "fighter-a" : "fighter-b",
        );
        Object.entries(geometry(pose)).forEach(([selector, attr]) => {
          if (phase === 0) gsap.set(root.querySelector(selector), { attr });
          else timeline.to(root.querySelector(selector), { attr }, phase - 1);
        });
      }),
    );
    current = -1;
    update(0);
  }
  chooseSequence();

  function update(step) {
    if (step === current) return;
    current = step;
    document.getElementById("technique-step").textContent = `0${step + 1}`;
    document.getElementById("technique-caption").textContent =
      step === 3 ? `${finish.name}. Controle e respeito.` : captions[step];
    document.getElementById("grappling-title").textContent =
      step === 3
        ? `Representação conceitual de ${finish.name.toLowerCase()} entre dois praticantes de Jiu-Jitsu`
        : "Dois praticantes em uma sequência conceitual de Jiu-Jitsu";
    controls.forEach((control, i) =>
      control.setAttribute("aria-pressed", String(i === step)),
    );
    principles.forEach((principle, i) =>
      principle.classList.toggle("is-active", i === step),
    );
  }
  function select(step) {
    playing = false;
    manual = true;
    scrollTween?.kill();
    timeline.pause(times[step]);
    update(step);
    button.innerHTML =
      'Ver técnica <i class="ph ph-play" aria-hidden="true"></i>';
  }
  controls.forEach((control, index) =>
    control.addEventListener("click", () => select(index), {
      signal: abort.signal,
    }),
  );
  button.addEventListener(
    "click",
    () => {
      manual = true;
      scrollTween?.kill();
      if (reduced.matches) {
        if (current === 3) chooseSequence();
        else {
          select((current + 1) % 4);
        }
        button.innerHTML =
          current === 3
            ? 'Ver outra <i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i>'
            : 'Próxima etapa <i class="ph ph-arrow-right" aria-hidden="true"></i>';
      } else if (playing) {
        timeline.pause();
        playing = false;
        button.innerHTML =
          'Ver novamente <i class="ph ph-play" aria-hidden="true"></i>';
      } else {
        chooseSequence();
        playing = true;
        button.innerHTML =
          'Pausar técnica <i class="ph ph-pause" aria-hidden="true"></i>';
        timeline.restart();
      }
    },
    { signal: abort.signal },
  );
  media.add(
    "(min-width: 601px) and (prefers-reduced-motion: no-preference)",
    () => {
      const trigger = ScrollTrigger.create({
        trigger: ".principles",
        start: "top 45%",
        end: "bottom 70%",
        onUpdate: (self) => {
          if (playing || manual) return;
          scrollTween?.kill();
          scrollTween = gsap.to(timeline, {
            time: self.progress * 5,
            duration: 0.35,
            ease: "power1.out",
            overwrite: true,
          });
        },
      });
      return () => {
        trigger.kill();
        scrollTween?.kill();
      };
    },
  );
  // Layout refresh and click-induced scrolling must not undo an explicit choice.
  const resumeScroll = () => {
    manual = false;
  };
  window.addEventListener("wheel", resumeScroll, {
    passive: true,
    signal: abort.signal,
  });
  window.addEventListener("touchmove", resumeScroll, {
    passive: true,
    signal: abort.signal,
  });
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        ["PageDown", "PageUp", "Home", "End"].includes(event.key) &&
        !event.target.closest('button, [role="slider"]')
      )
        resumeScroll();
    },
    { signal: abort.signal },
  );
  reduced.addEventListener(
    "change",
    () => {
      playing = false;
      timeline.pause();
      select(current);
    },
    { signal: abort.signal },
  );
  update(0);
  return () => {
    abort.abort();
    media.revert();
    scrollTween?.kill();
    timeline.kill();
  };
}
