import './styles.css';
import { initNavigation } from './scripts/navigation.js';
import { initAnimations } from './scripts/animations.js';
import { initCursor } from './scripts/cursor.js';

document.documentElement.classList.add('js');
document.getElementById('year').textContent = new Date().getFullYear();

initNavigation();
initCursor();

if (document.fonts?.ready) {
  document.fonts.ready.then(initAnimations);
} else {
  initAnimations();
}
