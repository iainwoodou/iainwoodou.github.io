export default class TextareaPlus extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create and append style
    const style = document.createElement('style');
    style.textContent = `
      div {
        font-family: Arial, sans-serif;
      }
      textarea {
        font-family: Arial, sans-serif;
        width: 100%;
        height: 100px;
        padding: 10px;
        box-sizing: border-box;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: none;
      }
      .counter {
        margin-top: 10px;
        color: #555;
      }
      .char-limit {
        margin-top: 5px;
        color: #888;
        font-size: 14px;
      }
    `;
    this.shadowRoot.append(style);

    const wrapper = document.createElement('div');
    this.textarea = document.createElement('textarea');
    const counter = document.createElement('div');
    const charLimitDisplay = document.createElement('div');

    // Set initial content
    const initialText = this.textContent.trim();
    this.textarea.value = initialText;

    // Append elements to the shadow DOM
    wrapper.appendChild(this.textarea);
    wrapper.appendChild(counter);
    wrapper.appendChild(charLimitDisplay);
    this.shadowRoot.append(wrapper);

    // Initialize properties
    this.resize = this.hasAttribute('resize');
    this.wordcount = this.hasAttribute('wordcount');
    this.charlimit = this.hasAttribute('charlimit') ? parseInt(this.getAttribute('charlimit'), 10) : null;
    this.minHeight = this.hasAttribute('min-height') ? this.getAttribute('min-height') : '42px';
    this.maxHeight = this.hasAttribute('max-height') ? this.getAttribute('max-height') : null;

    // Apply initial settings
    if (this.resize) {
      this.autoResize(this.textarea);
    }
    if (this.wordcount) {
      this.updateWordCount(this.textarea.value, counter);
    }
    if (this.charlimit !== null) {
      this.updateCharLimitDisplay(this.textarea.value, charLimitDisplay);
    }

    // Event listener for textarea input
    this.textarea.addEventListener('input', () => {
      if (this.charlimit !== null && this.textarea.value.length > this.charlimit) {
        this.textarea.value = this.textarea.value.substring(0, this.charlimit);
      }
      if (this.wordcount) {
        this.updateWordCount(this.textarea.value, counter);
      }
      if (this.resize) {
        this.autoResize(this.textarea);
      }
      if (this.charlimit !== null) {
        this.updateCharLimitDisplay(this.textarea.value, charLimitDisplay);
      }
      this.dispatchEvent(new CustomEvent('text-changed', { detail: this.textarea.value }));
    });
  }

 // apparently you can just do this to have a value property made available to jas
 get value() {
  return this.textarea.value;
}

  // Function to update word count
  updateWordCount(text, counter) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    counter.textContent = `Words: ${words}`;
  }
  

  // Function to update character limit display
  updateCharLimitDisplay(text, charLimitDisplay) {
    const charsLeft = this.charlimit - text.length;
    charLimitDisplay.textContent = `Characters left: ${charsLeft}`;
  }

  // Function to auto-resize textarea
  autoResize(textarea) {
    textarea.style.minHeight = this.minHeight;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 5}px`;
    if (this.maxHeight && textarea.scrollHeight > parseInt(this.maxHeight, 10)) {
      textarea.style.height = this.maxHeight;
    }
  }
}

// Define the custom element
customElements.define('imdt-textarea-plus', TextareaPlus);

/*
  <imdt-textarea-plus resize wordcount charlimit="100" min-height="50px" max-height="200px">
    This is some initial text content.
  </imdt-textarea-plus>

<script>
  const myTextArea = document.querySelector('imdt-textarea-plus');
  myTextArea.addEventListener('text-changed', (event) => {
    console.log('Current text:', event.detail);
  });
</script>
*/
