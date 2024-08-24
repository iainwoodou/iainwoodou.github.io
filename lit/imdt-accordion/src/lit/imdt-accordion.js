import { LitElement, html, css, unsafeCSS } from 'lit';
import styles from './imdt-accordion.css?raw';

class Accordion extends LitElement {
  static styles = css`${unsafeCSS(styles)}`;

  render() {
    return html`
      <div class="accordion-container">
        <slot></slot>
      </div>
    `;
  }

  firstUpdated() {
    this.addEventListener('accordion-toggle', this.handleToggle);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('accordion-toggle', this.handleToggle);
  }

  handleToggle(event) {
    const item = event.detail.item;
    const isSingleOpen = this.hasAttribute('single-open');
    const items = Array.from(this.children).filter(
      (child) => child.tagName.toLowerCase() === 'imdt-accordion-item'
    );

    if (isSingleOpen) {
      items.forEach((i) => {
        if (i !== item && i.hasAttribute('open')) {
          i.removeAttribute('open');
        }
      });
    }

    if (item.hasAttribute('open')) {
      item.removeAttribute('open');
    } else {
      item.setAttribute('open', '');
    }
  }
}

class AccordionItem extends LitElement {
  static styles = css`${unsafeCSS(styles)}`;

  static properties = {
    header: { type: String },
    open: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.open = false;
  }

  render() {
    return html`
      <div class="item-container">
        <button
          class="header"
          role="button"
          aria-live="polite"
          aria-expanded="${this.open}"
          @click="${this.toggleOpen}"
        >
          ${this.header} <span class="arrow" aria-hidden="true">▾</span>
        </button>
        <div class="content ${this.open ? 'opening' : 'closing'}">
          <slot></slot>
        </div>
      </div>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('open')) {
      this.updateOpenState();
    }
  }

  toggleOpen() {
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('accordion-toggle', {
        detail: { item: this },
        bubbles: true,
        composed: true,
      })
    );
  }

  updateOpenState() {
    const content = this.shadowRoot.querySelector('.content');
    if (this.open) {
      content.style.display = 'block';
      requestAnimationFrame(() => {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.classList.add('opening');
        content.classList.remove('closing');
        content.addEventListener(
          'transitionend',
          () => {
            content.classList.remove('opening');
            content.style.maxHeight = 'none';
          },
          { once: true }
        );
      });
    } else {
      content.classList.add('closing');
      content.classList.remove('opening');
      content.style.maxHeight = content.scrollHeight + 'px';
      requestAnimationFrame(() => {
        content.style.maxHeight = '0';
      });
      content.addEventListener(
        'transitionend',
        () => {
          if (!this.open) {
            content.style.display = 'none';
          }
          content.classList.remove('closing');
        },
        { once: true }
      );
    }
  }
}

customElements.define('imdt-accordion', Accordion);
customElements.define('imdt-accordion-item', AccordionItem);
