class Modal {
  constructor(selector) {
    this.root = document.querySelector(selector);
    if (!this.root) throw new Error(`Modal root not found: ${selector}`);
    this.backdrop = this.root.querySelector('.modal-backdrop');
    this.dialog = this.root.querySelector('.modal-dialog');
    this.closeButtons = this.root.querySelectorAll('[data-modal-close]');
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.init();
  }

  init() {
    this.closeButtons.forEach(btn => btn.addEventListener('click', () => this.close()));
    if (this.backdrop) {
      this.backdrop.addEventListener('click', event => {
        if (event.target === this.backdrop) this.close();
      });
    }
  }

  open() {
    this.root.classList.add('open');
    document.addEventListener('keydown', this.handleKeyDown);
    this.dialog.focus({ preventScroll: true });
  }

  close() {
    this.root.classList.remove('open');
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') this.close();
  }
}

export { Modal };

