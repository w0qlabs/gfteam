import "@fontsource/archivo/latin-600.css";
import "@fontsource/archivo/latin-800.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "./styles.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initNavigation } from "./scripts/navigation.js";
import { initBelt } from "./scripts/belt.js";
import { initTechnique } from "./scripts/technique.js";

gsap.registerPlugin(ScrollTrigger);
document.getElementById("year").textContent = new Date().getFullYear();
const message = encodeURIComponent(
  "Olá! Quero agendar meu primeiro treino na GFTeam Avaré.",
);
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = `https://wa.me/5514996924473?text=${message}`;
});
const cleanups = [initNavigation(), initBelt(), initTechnique()];
const media = gsap.matchMedia();
media.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".hero h1", {
    y: 20,
    opacity: 0.65,
    duration: 0.85,
    ease: "power3.out",
  });
  gsap.from(".hero-photo img", {
    scale: 1.04,
    duration: 1.2,
    ease: "power3.out",
  });
  gsap.from(".professor-portrait img", {
    y: 22,
    scale: 1.03,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".professor-portrait",
      start: "top 85%",
      once: true,
    },
  });
});
document.fonts.ready.then(() => ScrollTrigger.refresh());
const refresh = () => ScrollTrigger.refresh();
window.addEventListener("load", refresh, { once: true });
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    cleanups.forEach((cleanup) => cleanup?.());
    media.revert();
    window.removeEventListener("load", refresh);
  });
