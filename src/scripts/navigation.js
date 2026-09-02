import { animate } from 'animejs';

export function initNavigation() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const menuLinks = menu.querySelectorAll('nav a');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    header.classList.toggle('menu-active', open);

    if (reduceMotion) {
      menu.style.visibility = open ? 'visible' : 'hidden';
      menu.style.transform = open ? 'translateY(0)' : 'translateY(-102%)';
      return;
    }

    if (open) {
      menu.style.visibility = 'visible';
      animate(menu, { y: ['-102%', '0%'], duration: 720, ease: 'outExpo' });
      animate(menuLinks, { y: [35, 0], opacity: [0, 1], delay: (_, i) => 170 + i * 55, duration: 620, ease: 'outExpo' });
    } else {
      animate(menu, {
        y: [0, '-102%'],
        duration: 560,
        ease: 'inOutQuart',
        onComplete: () => { menu.style.visibility = 'hidden'; },
      });
    }
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
}
