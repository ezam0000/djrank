const root = document.documentElement;

function handleFirstTab(event) {
  if (event.key !== 'Tab') return;
  root.classList.add('user-tabbing');
  window.removeEventListener('keydown', handleFirstTab);
  window.addEventListener('mousedown', handleMouseDownOnce);
}

function handleMouseDownOnce() {
  root.classList.remove('user-tabbing');
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
}

window.addEventListener('keydown', handleFirstTab);

