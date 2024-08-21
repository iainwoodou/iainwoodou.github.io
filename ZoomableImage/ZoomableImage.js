export default class ZoomableImage extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
  
      // Initial properties
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.dragging = false;
      this.startX = 0;
      this.startY = 0;
      this.minZoom = parseFloat(this.getAttribute("min-zoom")) || 0.5; // Read minZoom attribute or use default
      this.maxZoom = parseFloat(this.getAttribute("max-zoom")) || 3;   // Read maxZoom attribute or use default
  
  this.css= `.zoomable-image-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    
    .zoomable-image {
      position: absolute;
      top: 0;
      left: 0;
      cursor: grab;
    }
  
  .viewer-container {
      position: relative;
      overflow: hidden;
    }
    
    #imageContainer {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      background-color: #efefef;
    }
    
    img {
      width: 100%;
      height: auto;
      display: block;
      cursor: move;
      transition: transform 0.1s ease-out;
    }
    
    .buttoncontrols {
      position: relative;
  
      background-color: var(--accent1 , #af216b);
      padding: 5px;
      text-align: right;
    }
   
    
    button {
      background-color: var(--accent1 , #af216b);
      fill:#fff;
      border: none;
      padding: 3px;
      cursor: pointer;
      outline: none;
      width:30px;
      height: 30px;
      transition: background 0.3s;
      margin:4px;
      border-radius: 3px;
    }
    
    button:focus ,
    button:active ,
    button:hover {
      outline-offset: 2px;
      outline: 1px solid #fff;
      background: #ffffff;
      fill: #212121;
    }
    
    button svg {
      fill: inherit;
      width: 15px;
      height: 15px;
    }
    
    .no-select {
      -webkit-user-select: none; /* Safari */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently supported by Chrome, Opera, and Edge */
    }`
    
  
  
        this.shadowRoot.innerHTML = `
            <style>
            ${this.css}</style>
            <div tabindex="0" class="viewer-container">
              <div id="imageContainer">
                <img
                width="${this.getAttribute("width")}"
                height="${this.getAttribute("height")}"
                  id="scrollImage"
                  draggable="false"
                  src="${this.getAttribute("src")}"
                  alt="${this.getAttribute("alt") || "Zoomable Image"}"
                  title="${this.getAttribute("title") || "Zoomable Image"}"
                />
              </div>
              <div class="buttoncontrols">
                  <button tabindex='0' id="zoomIn" title="Zoom in">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM184 296c0 13.3 10.7 24 24 24s24-10.7 24-24V232h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24v64H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64z"/></svg>
                  </button>
                  <button tabindex='0' id="zoomOut" title="Zoom out">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM136 184c-13.3 0-24 10.7-24 24s10.7 24 24 24H280c13.3 0 24-10.7 24-24s-10.7-24-24-24H136z"/></svg>
                  </button>
                  <button tabindex='0' id="moveUp" title="Pan up">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>
                  </button>
                  <button tabindex='0' id="moveDown" title="Pan down">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                  </button>
                  <button tabindex='0' id="moveLeft" title="Pan left">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                  </button>
                  <button tabindex='0' id="moveRight" title="Pan right">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <p> Press shift+mousewheel to zoom</p>
          `;
        this.setupEventListeners();
      
    }
  
    disconnectedCallback() {
      this.cleanupEventListeners()
  }
  /*
  I was using this but decided to lock in the css as its basically just the toolbar
    async loadCSS() {
      const response = await fetch("zoomable-image.css");
      return await response.text();
    }
  */
    setupEventListeners() {
      this.imageContainer = this.shadowRoot.querySelector("#imageContainer");
      this.image = this.shadowRoot.querySelector("#scrollImage");
      this.zoomInButton = this.shadowRoot.querySelector("#zoomIn");
      this.zoomOutButton = this.shadowRoot.querySelector("#zoomOut");
      this.moveUpButton = this.shadowRoot.querySelector("#moveUp");
      this.moveDownButton = this.shadowRoot.querySelector("#moveDown");
      this.moveLeftButton = this.shadowRoot.querySelector("#moveLeft");
      this.moveRightButton = this.shadowRoot.querySelector("#moveRight");
  
      this.zoomInButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.zoom(1.2);
    });
    this.zoomOutButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.zoom(0.8);
    });
    this.moveUpButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.pan(0, -20);
    });
    this.moveDownButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.pan(0, 20);
    });
    this.moveLeftButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.pan(-20, 0);
    });
    this.moveRightButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.pan(20, 0);
    });
  
    this.imageContainer.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this),{passive:true}
    );
    this.imageContainer.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this),{passive:true}
    );
    this.imageContainer.addEventListener(
      "pointerup",
      this.onPointerUp.bind(this),{passive:true}
    );
    this.imageContainer.addEventListener("wheel", this.onWheel.bind(this),{passive:true});
    }
  
    cleanupEventListeners(){
      // I may have gone overboard here?
      this.imageContainer = this.shadowRoot.querySelector("#imageContainer");
      this.image = this.shadowRoot.querySelector("#scrollImage");
      this.zoomInButton = this.shadowRoot.querySelector("#zoomIn");
      this.zoomOutButton = this.shadowRoot.querySelector("#zoomOut");
      this.moveUpButton = this.shadowRoot.querySelector("#moveUp");
      this.moveDownButton = this.shadowRoot.querySelector("#moveDown");
      this.moveLeftButton = this.shadowRoot.querySelector("#moveLeft");
      this.moveRightButton = this.shadowRoot.querySelector("#moveRight");
  
      this.zoomInButton.removeEventListener("click");
    this.zoomOutButton.removeEventListener("click");
    this.moveUpButton.removeEventListener("click")
    this.moveDownButton.removeEventListener("click")
    this.moveLeftButton.removeEventListener("click")
    this.moveRightButton.removeEventListener("click")
  
    this.imageContainer.removeEventListener("pointerdown")
    this.imageContainer.removeEventListener("pointermove")
    this.imageContainer.removeEventListener("pointerup");
    this.imageContainer.removeEventListener("wheel");
    }
  
  
    zoom(factor) {
      this.scale *= factor;
      // Ensure zoom is within the min and max limits
      if (this.scale < this.minZoom) this.scale = this.minZoom;
      if (this.scale > this.maxZoom) this.scale = this.maxZoom;
      this.updateTransform();
    }
  
    pan(x, y) {
      this.startX = this.translateX;
      this.startY = this.translateY;
      this.translateX += x;
      this.translateY += y;
      this.updateTransform();
    }
  
    updateTransform() {
      // Calculate scaled dimensions
      const scaledWidth = this.image.offsetWidth * this.scale;
      const scaledHeight = this.image.offsetHeight * this.scale;
  
      // Get container dimensions
      let containerWidth = this.imageContainer.offsetWidth;
      let containerHeight = this.imageContainer.offsetHeight;
  
      if (this.scale === 1) {
          // Ignore this if not scaled
          containerWidth = 0;
          containerHeight = 0;
      }
  
      // Calculate boundary limits
      const borderCalc = 50 + 10 * this.scale;
      let minX, minY, maxX, maxY;
  
      if (this.scale < 1) {
          minX = -(containerWidth - scaledWidth) - borderCalc;
          minY = -(containerHeight - scaledHeight) - borderCalc;
          maxX = containerWidth - scaledWidth + borderCalc;
          maxY = containerHeight - scaledHeight + borderCalc;
      } else {
          minX = containerWidth - scaledWidth + borderCalc;
          minY = containerHeight - scaledHeight + borderCalc;
          maxX = scaledWidth - containerWidth - borderCalc;
          maxY = scaledHeight - containerHeight - borderCalc;
      }
  
      // Clamp translate values within boundaries
      this.translateX = Math.max(minX, Math.min(maxX, this.translateX));
      this.translateY = Math.max(minY, Math.min(maxY, this.translateY));
  
      // Apply the transformation
      this.image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }
  
    onPointerDown(event) {
      this.dragging = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      this.imageContainer.setPointerCapture(event.pointerId);
    }
  
    onPointerMove(event) {
      if (this.dragging) {
        this.translateX = event.clientX - this.startX;
        this.translateY = event.clientY - this.startY;
        this.updateTransform();
      }
    }
  
    onPointerUp(event) {
      this.dragging = false;
      this.imageContainer.releasePointerCapture(event.pointerId);
    }
  
    onWheel(event) {
      if(event.shiftKey){
      const zoomFactor = event.deltaY < 0 ? 1.2 : 0.8;
      this.zoom(zoomFactor);
      }
    }
  }
  
  customElements.define("imdt-zoomable-image", ZoomableImage);
  