class MyTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        textarea {
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          resize: none;
        }
      </style>
      <textarea></textarea>
      <div id="charCount"></div>
      <div id="wordCount"></div>
    `;

    this.textarea = this.shadowRoot.querySelector("textarea");
    const initialText = this.textContent.trim();
    this.textarea.value = initialText;

    this.charCount = this.shadowRoot.querySelector("#charCount");
    this.wordCount = this.shadowRoot.querySelector("#wordCount");

    this.resize = this.hasAttribute("resize");
    if (this.hasAttribute("maxlength")) {
      this.maxlength = parseInt(this.getAttribute("maxlength"), 10);
      this.textarea.setAttribute("maxlength", this.maxlength);
    } else {
      this.maxlength = null;
    }

    this.wordcount = this.hasAttribute("wordcount");

    if (this.resize) {
      this.autoResize();
    }

    if (this.maxlength !== null) {
      this.updatecharlength();
    }

    if (this.wordcount) {
      this.updateWordCount();
    }

    this.textarea.addEventListener("input", () => {
      if (this.resize) {
        this.autoResize();
      }
      if (this.maxlength !== null) {
        this.updatecharlength();
      }
      if (this.wordcount) {
        this.updateWordCount();
      }
    });
  }

  autoResize() {
    this.textarea.style.height = "auto";
    this.textarea.style.height = `${this.textarea.scrollHeight + 5}px`;
  }

  updatecharlength() {
    const charsLeft = this.maxlength - this.textarea.value.length;
    if (charsLeft === 0) {
      this.dispatchEvent(
        new CustomEvent("limit-hit", { detail: this.textarea.value })
      );
    }
    this.charCount.textContent = `Characters left: ${charsLeft}`;
  }
  
  updateWordCount() {
    const words = this.textarea.value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    this.wordCount.textContent = `Words: ${words}`;
  }

  get value() {
    return this.textarea.value;
  }
}
customElements.define("my-textarea", MyTextarea);
