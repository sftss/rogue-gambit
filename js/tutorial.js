// ==================== TUTORIAL FLOW ====================

const Tutorial = {
  KEY_SEEN: 'rogue_gambit_v1_tutorial_seen',
  index: 0,
  steps: [
    {
      title: 'Welcome to Rogue Gambit',
      text: 'Each run follows this loop: Draft new pieces, fight a tactical battle, then shop for upgrades.',
      target: '#title-screen',
    },
    {
      title: 'Draft Phase',
      text: 'Pick up to 4 offers. Each card replaces one piece slot in your army.',
      target: '#draft-picks-container',
    },
    {
      title: 'Battle Controls',
      text: 'Click your piece, then click a highlighted square. Red corners are captures or special actions.',
      target: '#board-container',
    },
    {
      title: 'Shop and Relics',
      text: 'Buy pieces, relics, and life. Relics can completely change your strategy.',
      target: '#shop-screen',
    },
    {
      title: 'Run Goals',
      text: 'Watch the profile panel for missions and achievements. Boss rounds appear at 5, 10 and 15.',
      target: '#profile-panel',
    },
  ],

  _overlay() {
    return document.getElementById('tutorial-overlay');
  },

  hasSeen() {
    return localStorage.getItem(this.KEY_SEEN) === '1';
  },

  markSeen() {
    localStorage.setItem(this.KEY_SEEN, '1');
  },

  clearFocus() {
    document.querySelectorAll('.tutorial-focus').forEach(el => el.classList.remove('tutorial-focus'));
  },

  focusTarget(selector) {
    this.clearFocus();
    if (!selector) return;
    const el = document.querySelector(selector);
    if (el) el.classList.add('tutorial-focus');
  },

  render() {
    const overlay = this._overlay();
    if (!overlay) return;
    const step = this.steps[this.index];
    if (!step) return;

    const title = document.getElementById('tutorial-title');
    const body = document.getElementById('tutorial-body');
    const progress = document.getElementById('tutorial-progress');
    const prev = document.getElementById('tutorial-prev');
    const next = document.getElementById('tutorial-next');

    if (title) title.textContent = step.title;
    if (body) body.textContent = step.text;
    if (progress) progress.textContent = `Step ${this.index + 1}/${this.steps.length}`;
    if (prev) prev.disabled = this.index === 0;
    if (next) next.textContent = this.index === this.steps.length - 1 ? 'DONE' : 'NEXT';

    this.focusTarget(step.target);
  },

  start(force) {
    if (!force && this.hasSeen()) return;
    this.index = 0;
    const overlay = this._overlay();
    if (!overlay) return;
    overlay.classList.add('active');
    this.render();
  },

  close() {
    const overlay = this._overlay();
    if (overlay) overlay.classList.remove('active');
    this.markSeen();
    this.clearFocus();
  },

  next() {
    if (this.index >= this.steps.length - 1) {
      this.close();
      return;
    }
    this.index += 1;
    this.render();
  },

  prev() {
    if (this.index <= 0) return;
    this.index -= 1;
    this.render();
  },
};
