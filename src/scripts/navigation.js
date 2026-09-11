import { gsap } from "gsap";

export function initNavigation() {
  const abort = new AbortController();
  const header = document.querySelector(".site-header");
  const updateHeader = () => {
    header.classList.toggle("is-compact", window.scrollY > 16);
  };
  window.addEventListener("scroll", updateHeader, {
    passive: true,
    signal: abort.signal,
  });
  updateHeader();
  const menu = document.getElementById("mobile-menu");
  const toggle = document.querySelector(".menu-toggle");
  const closeButton = document.querySelector(".menu-close");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let entry;
  function close() {
    menu.close();
  }
  toggle.addEventListener(
    "click",
    () => {
      menu.showModal();
      document.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      if (!reduced.matches)
        entry = gsap.fromTo(
          menu.querySelectorAll("nav a"),
          { x: 18, opacity: 0.4 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
            clearProps: "all",
          },
        );
    },
    { signal: abort.signal },
  );
  closeButton.addEventListener("click", close, { signal: abort.signal });
  menu.addEventListener(
    "close",
    () => {
      entry?.kill();
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    },
    { signal: abort.signal },
  );
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener(
      "click",
      () => {
        const target = document.querySelector(link.hash);
        close();
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      },
      { signal: abort.signal },
    ),
  );
  const desktop = matchMedia("(min-width: 601px)");
  desktop.addEventListener(
    "change",
    () => {
      if (desktop.matches && menu.open) close();
    },
    { signal: abort.signal },
  );
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-10% 0px -55% 0px", threshold: 0 },
  );
  navLinks.forEach((link) =>
    observer.observe(document.querySelector(link.hash)),
  );
  return () => {
    abort.abort();
    entry?.kill();
    observer.disconnect();
    if (menu.open) close();
  };
}
