function ensureContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, variant = 'info', duration = 4000) {
  const container = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;
  toast.role = 'status';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

export { showToast };

