customElements.define('vertical-timeline', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, -apple-system, sans-serif; }
        .timeline-container { display: grid; grid-template-columns: 60px 1fr; position: relative; }
        .ruler {
          border-right: 1px solid #e0e0e0;
          padding-right: 8px;
          text-align: right;
          font-size: 0.75rem;
          color: #666;
        }
        .tick {
          position: absolute;
          width: 100%;
          border-top: 1px solid #f0f0f0;
          box-sizing: border-box;
        }
        .tick span {
            position: relative;
            top: -0.5em;
            background: var(--timeline-bg, #fff);
            padding: 0 2px;
        }
        .content { position: relative; }
        ::slotted([slot="item"]) {
          position: absolute;
          width: calc(100% - 10px);
          left: 5px;
          cursor: grab;
          user-select: none;
          border-left: 3px solid var(--item-accent-color, #007bff);
          background: var(--item-bg-color, #f8f9fa);
          transition: top 0.1s ease-out, box-shadow 0.1s ease-out;
        }
        :host(:not([read-only])) ::slotted(.dragging) {
            opacity: 0.6;
            cursor: grabbing;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 10;
        }
      </style>
      <div class="timeline-container">
        <div class="ruler"></div>
        <div class="content">
          <slot name="item"></slot>
        </div>
      </div>
    `;
    this.draggedItem = null;
  }

  connectedCallback() {
    this.units = JSON.parse(this.getAttribute('units') || '[]');
    this.stepHeight = parseInt(this.getAttribute('step-height') || '60', 10);
    this.isReadOnly = this.hasAttribute('read-only');

    this._render();
    if (!this.isReadOnly) {
      this._setupDragEvents();
    }
  }

  _render() {
    const rulerEl = this.shadowRoot.querySelector('.ruler');
    const contentEl = this.shadowRoot.querySelector('.content');
    const totalHeight = this.units.length * this.stepHeight;
    rulerEl.style.height = `${totalHeight}px`;
    contentEl.style.height = `${totalHeight}px`;

    rulerEl.innerHTML = ''; // Clear previous ticks
    this.units.forEach((label, i) => {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.top = `${i * this.stepHeight}px`;
      tick.innerHTML = `<span>${label}</span>`;
      rulerEl.appendChild(tick);
    });

    this.shadowRoot.querySelector('slot[name="item"]').assignedElements().forEach(item => {
      const startIndex = this.units.indexOf(item.dataset.start);
      if (startIndex !== -1) {
        item.style.top = `${startIndex * this.stepHeight}px`;
      }
    });
  }

  _setupDragEvents() {
    this.addEventListener('pointerdown', e => {
      const item = e.target.closest('[slot="item"]');
      if (item && e.button === 0) {
        this.draggedItem = item;
        this.draggedItem.classList.add('dragging');
        this.offsetY = e.clientY - this.draggedItem.getBoundingClientRect().top;
        this.setPointerCapture(e.pointerId);
      }
    });

    this.addEventListener('pointermove', e => {
      if (!this.draggedItem) return;
      const contentRect = this.shadowRoot.querySelector('.content').getBoundingClientRect();
      const newTop = e.clientY - contentRect.top - this.offsetY;
      this.draggedItem.style.top = `${Math.max(0, Math.min(newTop, contentRect.height - this.draggedItem.offsetHeight))}px`;
    });

    this.addEventListener('pointerup', e => {
      if (!this.draggedItem) return;
      this.releasePointerCapture(e.pointerId);
      this.draggedItem.classList.remove('dragging');

      const newTop = Math.round(parseFloat(this.draggedItem.style.top) / this.stepHeight) * this.stepHeight;
      const newIndex = Math.min(Math.floor(newTop / this.stepHeight), this.units.length - 1);
      const newUnit = this.units[newIndex];

      this.draggedItem.style.top = `${newIndex * this.stepHeight}px`;
      this.draggedItem.dataset.start = newUnit;

      this.dispatchEvent(new CustomEvent('item-moved', {
        bubbles: true, composed: true,
        detail: { id: this.draggedItem.id, newStart: newUnit }
      }));
      this.draggedItem = null;
    });
  }
});

