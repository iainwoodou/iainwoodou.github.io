class MyTextarea extends HTMLElement {
    constructor() {
      super();
      // Attach a shadow DOM tree to this instance
      this.attachShadow({ mode: 'open' });
    }
  }

  customElements.define('my-textarea', MyTextarea);