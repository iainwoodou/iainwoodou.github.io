export default class ImageBlur extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    
  
        // Initialize properties
        this.height = this.hasAttribute('height') ? this.getAttribute('height') : "auto";
        this.width = this.hasAttribute('width') ? this.getAttribute('width') : "100%";
        this.src = this.hasAttribute('src') ? this.getAttribute('src') : null;
        this.alt = this.hasAttribute('alt') ? this.getAttribute('alt') : null;
        this.title = this.hasAttribute('title') ? this.getAttribute('title') : null;
        this.message = this.hasAttribute('message') ? this.getAttribute('message') : "Click to reveal";
        this.blurMessage = this.hasAttribute('blur-message') ? this.getAttribute('blur-message') : "Click to blur";
        this.blurLevel = this.hasAttribute('blur-level') ? this.getAttribute('blur-level') : null;
        this.blurred = this.hasAttribute('blurred');
        this.bgColor = this.hasAttribute('bgColor') ? this.getAttribute('bgColor') : "#424242";
        

        const style = document.createElement('style');
        style.textContent = `
        .imgHolder{
               border: 5px solid var(--accent2, #000);
               overflow:hidden;
               background-color:${this.bgColor} ;
         }
         
         .imgHolder:hover,    
         .imgHolder:focus-within{
               border: 5px solid var(--accent1, #000);
            }
          img{
            cursor: pointer;
          }
     
            .blur {
            filter: blur(${this.blurLevel});
          }
            .message{
            background-color:var(--accent2, #000);
            color:#fff;
            padding:10px;
            margin:0px}
        `;
        this.shadowRoot.append(style);
        // Create the image
        this._image = document.createElement('img');
        this._image.className = "blurImage";
        this._image.src = this.src;
        this._image.alt = this.alt.toString();
        this._image.title = this.title.toString();
        this._image.style.height = this.height.toString();
        this._image.style.width = this.width.toString();
        this._image.setAttribute("tabIndex", "0")
  
        this._imageHolder = document.createElement('div');
        this._imageHolder.className = "imgHolder";
        this._imageHolder.append(this._image)
        this.shadowRoot.append(this._imageHolder);
    
        // Create the message block
        this._message = document.createElement('p');
        this._message.className = "message";
        this._message.textContent = this.message;
        this.shadowRoot.append(this._message);

        console.log(this)
      }
    
      connectedCallback() {
    
          this.updateBlur();
         this._message.textContent = this.blurred ? this.message : this.blurMessage ;

         this._image.addEventListener('click', this.toggleBlur.bind(this));
         this._image.addEventListener('keydown', (event) => {
           if (event.key === 'Enter' || event.key === ' ') {
             this.toggleBlur();
           }
         });
         
      }
    

      toggleBlur() {
            this.blurred = !this.blurred;
            this.updateBlur();
            this._message.textContent = this.blurred ? this.message : this.blurMessage;
            this.dispatchEvent(new CustomEvent('blurred', { detail: this.blurred }));
          }

      updateBlur() {
        this._image.className = this.blurred ? 'blur' : '';
      }
    }
    
    customElements.define('imdt-image-blur', ImageBlur);
  
    