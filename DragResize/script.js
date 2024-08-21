class DragResize extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: auto;
                    border: 1px solid #ccc;
                    position: absolute;
                    cursor: move;
                    padding: 0px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }
          
img{
    user-select: none;
    pointer-events: none;
}

                .resize-handle {
                    width: 10px;
                    height: 10px;
                    background-color: #ccc;
                    position: absolute;
                    cursor: se-resize;
                }
                .resize-handle.top-left {
                    top: -5px;
                    left: -5px;
                    cursor: nw-resize;
                }
                .resize-handle.top-right {
                    top: -5px;
                    right: -5px;
                    cursor: ne-resize;
                }
                .resize-handle.bottom-left {
                    bottom: -5px;
                    left: -5px;
                    cursor: sw-resize;
                }
                .resize-handle.bottom-right {
                    bottom: -5px;
                    right: -5px;
                    cursor: se-resize;
                }
            </style>
            <slot></slot>
            <div class="resize-handle top-left"></div>
            <div class="resize-handle top-right"></div>
            <div class="resize-handle bottom-left"></div>
            <div class="resize-handle bottom-right"></div>
        `;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onResizeMouseDown = this.onResizeMouseDown.bind(this);
        this.onResizeMouseMove = this.onResizeMouseMove.bind(this);
        this.onResizeMouseUp = this.onResizeMouseUp.bind(this);
    }

    connectedCallback() {
        this.addEventListener('mousedown', this.onMouseDown);
        this.shadowRoot.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', this.onResizeMouseDown);
        });
    }

    disconnectedCallback() {
        this.removeEventListener('mousedown', this.onMouseDown);
        this.shadowRoot.querySelectorAll('.resize-handle').forEach(handle => {
            handle.removeEventListener('mousedown', this.onResizeMouseDown);
        });
    }

    onMouseDown(event) {
        if (event.target.classList.contains('resize-handle')) {
            return;
        }

        this.shiftX = event.clientX - this.getBoundingClientRect().left;
        this.shiftY = event.clientY - this.getBoundingClientRect().top;

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(event) {
        this.style.left = event.pageX - this.shiftX + 'px';
        this.style.top = event.pageY - this.shiftY + 'px';
    }

    onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    onResizeMouseDown(event) {
        event.stopPropagation(); // Prevent drag behavior
        this.resizeHandle = event.target;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this).width, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this).height, 10);

        document.addEventListener('mousemove', this.onResizeMouseMove);
        document.addEventListener('mouseup', this.onResizeMouseUp);
    }

    onResizeMouseMove(event) {
        let newWidth, newHeight;
        let buffer = 0

        if (this.resizeHandle.classList.contains('bottom-right')) {
            newWidth = this.startWidth + event.clientX - this.startX;
            newHeight = this.startHeight + event.clientY - this.startY;
        } else if (this.resizeHandle.classList.contains('bottom-left')) {
            newWidth = this.startWidth - event.clientX + this.startX;
            newHeight = this.startHeight + event.clientY - this.startY;
            if(newWidth>buffer){this.style.left = event.clientX + 'px';}
        } else if (this.resizeHandle.classList.contains('top-right')) {
            newWidth = this.startWidth + event.clientX - this.startX;
            newHeight = this.startHeight - event.clientY + this.startY;
            if(newHeight>buffer){this.style.top = event.clientY + 'px';}
        } else if (this.resizeHandle.classList.contains('top-left')) {
            newWidth = this.startWidth - event.clientX + this.startX;
            newHeight = this.startHeight - event.clientY + this.startY;

            if(newWidth>buffer){this.style.left = event.clientX + 'px';}
            if(newHeight>buffer){this.style.top = event.clientY + 'px';}
        
        }

        // Ensure the new width and height are not less than a minimum value
        if (newWidth > buffer) {
            this.style.width = newWidth + 'px';
        }
        if (newHeight > buffer) {
            this.style.height = newHeight + 'px';
        }
    }

    onResizeMouseUp() {
        document.removeEventListener('mousemove', this.onResizeMouseMove);
        document.removeEventListener('mouseup', this.onResizeMouseUp);
    }

       // Getter methods to access x, y, width, and height
       get x() {
        return this.offsetLeft;
    }

    get y() {
        return this.offsetTop;
    }

    get width() {
        return this.offsetWidth;
    }

    get height() {
        return this.offsetHeight;
    }
}

customElements.define('drag-resize', DragResize);
