import { animate, createTimeline, stagger } from 'animejs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateHero() {
  const timeline = createTimeline({ defaults: { ease: 'outExpo' } });
  timeline
    .add('.hero-media', { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], duration: 1050 }, 0)
    .add('.hero-line b', { y: ['110%', '0%'], duration: 900, delay: stagger(95) }, 180)
    .add('.hero-enter', { y: [24, 0], opacity: [0, 1], duration: 720, delay: stagger(70) }, 520);
}

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  const startTime = performance.now();
  const duration = 1300;

  const tick = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function revealSection(element) {
  if (element.classList.contains('image-reveal')) {
    element.classList.add('is-revealed');
    animate(element, { opacity: [0, 1], duration: 720, ease: 'outExpo' });
    const image = element.querySelector('img');
    if (image) animate(image, { scale: [1.08, 1], duration: 1200, ease: 'outExpo' });
  } else {
    animate(element, { y: [48, 0], opacity: [0, 1], duration: 760, ease: 'outExpo' });
  }

  element.querySelectorAll('[data-count]').forEach(animateCounter);
}

function initReveals() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealSection(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  elements.forEach((element) => observer.observe(element));

  const belts = document.querySelectorAll('.belt-lines span');
  const beltObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    animate(belts, { scaleX: [0, 1], duration: 900, delay: stagger(110), ease: 'outExpo' });
    beltObserver.disconnect();
  }, { threshold: 0.3 });
  beltObserver.observe(document.querySelector('.belt-section'));
}

function initProfessorStory() {
  const section = document.querySelector('[data-professors-story]');
  if (!section) return;

  const sticky = section.querySelector('.professors-sticky');
  const current = section.querySelector('[data-professor-current]');
  const progress = section.querySelector('[data-professor-progress]');
  const progressGroup = section.querySelector('.professors-progress');

  const storyTimeline = createTimeline({
    autoplay: false,
    defaults: { duration: 1000, ease: 'linear' },
  })
    .add('.professor-cesinha .professor-photo', {
      clipPath: ['inset(0% 0 0 0)', 'inset(0% 0 100% 0)'],
      scale: [1, 0.97],
      opacity: [1, 0.86],
    }, 0)
    .add('.professor-cesinha .professor-photo img', { y: [-18, 20] }, 0)
    .add('.professor-cesinha .professor-name-line b', {
      y: ['0%', '-110%'],
      opacity: [1, 0],
      duration: 700,
    }, 0)
    .add('.professor-cesinha .professor-content', {
      y: [0, -22],
      opacity: [1, 0],
      duration: 560,
    }, 0)
    .add('.professor-julio .professor-photo', {
      clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      scale: [1.04, 1],
      opacity: [0.86, 1],
    }, 0)
    .add('.professor-julio .professor-photo img', { y: [20, -18] }, 0)
    .add('.professor-julio .professor-name-line b', {
      y: ['110%', '0%'],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(30),
    }, 270)
    .add('.professor-julio .professor-content', {
      y: [24, 0],
      opacity: [0, 1],
      duration: 560,
    }, 440)
    .add('.professors-accent-blue', { x: ['0vw', '-9vw'], scaleX: [1, 1.4] }, 0)
    .add('.professors-accent-yellow', { rotate: [0, 90], scale: [1, 0.72] }, 0)
    .add(progress, { scaleY: [0, 1] }, 0);

  let sectionStart = 0;
  let scrollDistance = 1;
  let storyProgress = 0;
  let frameRequested = false;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const transitionStart = 0.25;
  const transitionEnd = 0.55;
  const transitionMidpoint = (transitionStart + transitionEnd) / 2;

  function measure() {
    sectionStart = section.getBoundingClientRect().top + window.scrollY;
    scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
  }

  function updateProfessorProgress() {
    const sectionProgress = clamp((window.scrollY - sectionStart) / scrollDistance);
    const transitionProgress = smoothstep(clamp(
      (sectionProgress - transitionStart) / (transitionEnd - transitionStart),
    ));
    const activeIndex = sectionProgress < transitionMidpoint ? '01' : '02';

    storyProgress = sectionProgress;
    storyTimeline.seek(storyTimeline.duration * transitionProgress, true);
    sticky.style.setProperty('--professor-progress', sectionProgress.toFixed(4));
    current.textContent = activeIndex;
    progressGroup.setAttribute('aria-label', `Professor ${activeIndex === '01' ? '1' : '2'} de 2`);
    frameRequested = false;
  }

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateProfessorProgress);
  }

  function handleResize() {
    const wasPinned = window.scrollY >= sectionStart - 1
      && window.scrollY <= sectionStart + scrollDistance + 1;
    const preservedProgress = storyProgress;

    measure();
    if (wasPinned) {
      window.scrollTo({
        top: sectionStart + scrollDistance * preservedProgress,
        behavior: 'instant',
      });
    }
    requestUpdate();
  }

  measure();
  updateProfessorProgress();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
}

function initScrollMotion() {
  const progress = document.querySelector('.page-progress span');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  let queued = false;

  const update = () => {
    const scrollRange = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${scrollRange > 0 ? scrollY / scrollRange : 0})`;

    parallaxItems.forEach((item) => {
      const bounds = item.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      const speed = Number(item.dataset.parallax || 0.05);
      const shift = (bounds.top + bounds.height / 2 - innerHeight / 2) * speed;
      const image = item.querySelector('img');
      if (image) image.style.transform = `translate3d(0, ${shift}px, 0) scale(1.025)`;
    });
    queued = false;
  };

  window.addEventListener('scroll', () => {
    if (!queued) { requestAnimationFrame(update); queued = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

export function initAnimations() {
  if (reducedMotion) {
    document.querySelectorAll('.image-reveal').forEach((element) => element.classList.add('is-revealed'));
    return;
  }
  animateHero();
  initProfessorStory();
  initReveals();
  initScrollMotion();
}
