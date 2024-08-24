export class Accordion extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("accordion-container");

    const slot = document.createElement("slot");
    container.appendChild(slot);

    const style = document.createElement("style");
    style.textContent = `
    .accordion-container {
    border:  2px solid var(--primary2-tint10, #D8D6E6);
    overflow: hidden;
    font-family: Arial, sans-serif;
}
   `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }

  connectedCallback() {
    // Set up event listeners for each immediate accordion item
    Array.from(this.children).forEach((child) => {
      if (child.tagName.toLowerCase() === "imdt-accordion-item") {
        child.addEventListener(
          "accordion-toggle",
          this.handleToggle.bind(this)
        );
      }
    });
  }

  disconnectedCallback() {
    // Clean up event listeners for each accordion item
    Array.from(this.children).forEach((child) => {
      if (child.tagName.toLowerCase() === "imdt-accordion-item") {
        child.removeEventListener(
          "accordion-toggle",
          this.handleToggle.bind(this)
        );
      }
    });
  }

  handleToggle(event) {
    const item = event.detail.item;
    const isSingleOpen = this.hasAttribute("single-open");
    const items = Array.from(this.children).filter(
      (child) => child.tagName.toLowerCase() === "imdt-accordion-item"
    );

    if (isSingleOpen) {
      console.log("single");
      items.forEach((i) => {
        if (i !== item && i.hasAttribute("open")) {
          i.removeAttribute("open");
        }
      });
    }

    if (item.hasAttribute("open")) {
      item.removeAttribute("open");
    } else {
      item.setAttribute("open", "");
    }
  }
}

export class AccordionItem extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("item-container");

    this.header = document.createElement("button");
    this.header.role = "button";
    this.header.ariaLive = "polite";
    this.header.ariaExpanded = "false";
    this.header.tabIndex = 0;
    this.header.classList.add("header");
    this.header.innerHTML = `${this.getAttribute(
      "header"
    )} <span class="arrow">&#9662;</span>`;

    const content = document.createElement("div");
    content.classList.add("content");
    content.innerHTML = `<slot></slot>`;

    container.appendChild(this.header);
    container.appendChild(content);

    const style = document.createElement("style");
    style.textContent = `
.item-container {
    border-bottom: 1px solid #ccc;
}

.item-container:last-child {
    border-bottom: none;
}

.header {
background-color: darkblue;
  cursor: pointer;
    padding: 3px 15px;
    background: var(--core1, #24285C);
    color:#ffffff;
    border: 0px;
    width:100%;
    display: flex;
    text-align: left;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-weight: normal;
    line-height: 1.6;
    padding-top:5px;
    padding-bottom:5px;
    border: 1px solid #ffffffff
}

.header:hover,
.header:focus{
    background: var(--accent2, #21A0B0);
    color:#ffffff;
  }

  .item-container .header .arrow {
    font-weight: normal;
    transition: transform 0.3s ease;
    font-size: 2em;
}

.item-container .header[aria-expanded="true"] .arrow {
    transform: rotate(180deg);
}
.content {
    border: 1px solid var(--border-color, #ddd);
    border-top: none;
    background: var(--content-bg, #f9f9f9);
    opacity: 1;
    display: none;
    padding: 10px;
    overflow: hidden;
    transition: max-height 0.05s ease-out;
    max-height: 0;
}

.content.opening {
    display: block;
    max-height: auto;
}

.content.closing {
    transition: max-height 0.3s ease-out;
}

        `;

    shadow.appendChild(style);
    shadow.appendChild(container);

    // Add click event listener to the header
    this.header.addEventListener("click", () => {
      // Stop the event from propagating up
      this.dispatchEvent(
        new CustomEvent("accordion-toggle", {
          detail: { item: this },
          bubbles: false, // Set bubbles to false to prevent propagation
        })
      );
    });
  }

  static get observedAttributes() {
    return ["open"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      this.updateOpenState();
    }
  }

  connectedCallback() {
    this.updateOpenState();
  }

  updateOpenState() {
    const content = this.shadowRoot.querySelector(".content");
    const isOpening = this.hasAttribute("open");

    // Toggle aria-expanded attribute based on open state
    this.header.setAttribute("aria-expanded", isOpening.toString());

    if (isOpening) {
      content.style.display = "block";
      requestAnimationFrame(() => {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.add("opening");
        content.classList.remove("closing");
        content.addEventListener(
          "transitionend",
          () => {
            content.classList.remove("opening");
            content.style.maxHeight = "none"; // Ensure max-height doesn't interfere
          },
          { once: true }
        );
      });
    } else {
      content.classList.add("closing");
      content.classList.remove("opening");
      content.style.maxHeight = content.scrollHeight + "px"; // Start closing from current height
      requestAnimationFrame(() => {
        content.style.maxHeight = "0";
      });
      content.addEventListener(
        "transitionend",
        () => {
          if (!this.hasAttribute("open")) {
            content.style.display = "none";
          }
          content.classList.remove("closing");
        },
        { once: true }
      );
    }
  }
}

customElements.define("imdt-accordion", Accordion);
customElements.define("imdt-accordion-item", AccordionItem);
