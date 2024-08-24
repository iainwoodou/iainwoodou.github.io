export default class SlideShow extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.currentSlide = 0
    // STYLES
    const style = document.createElement('style')
    style.textContent = `
*, *:before, *:after {
  box-sizing: inherit;
}
    .slideshow {
      position: relative;
      width: 100%;
      overflow:hidden;
      padding: 0px 30px;
    }


.slide-container{
  display: flex;
  align-items: center; 
  overflow-x: hidden; /* Allows horizontal scrolling if content overflows */
  width: 100%; /* Ensures the container takes up the full width of its parent */
}

.slide-container:focus{
  outline: 2px solid #4A90E2; /* Blue outline */
    outline-offset: -2px; /* Space between the outline and the element */
}

::slotted(.slide){
    transition:left 0.5s ease-out;
  flex: 0 0 auto; /* Prevents the slides from shrinking or growing */
  width: 100%; /* Each slide takes up the full width of the container */
  box-sizing: border-box; /* Includes padding and border in the element's total width and height */
}


.navigation-bar{
text-align:center
}
.navigation-btn{
    border-radius:50%;
    width:30px;
    height:30px;
    padding:0px;
  margin:1px;
  background-color:#24285c;
  color:#fff;
  border: 1px solid #fff;
 cursor:pointer;

}

.navbtn {
    position: absolute;
    width: 30px;
    height: 30px;
    top: calc(50% - 20px);
    cursor: pointer
 
}
.nextbtn {
    right: 0px;
}

.prevbtn {
    left: 0px;
}
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }    
`
    this.shadowRoot.appendChild(style)

    // Create the slideshow div
    this.slideShow = document.createElement('div')
    this.slideShow.classList.add('slideshow')

    //slide container that holds the slides (this is focusable)
    this.slideContainer = document.createElement('div')
    this.slideContainer.classList.add('slide-container')
    this.slideContainer.setAttribute('tabindex', '0')

    // Add a slot for the slideshow content - this is where the content is put
    const slot = document.createElement('slot')
    this.slideContainer.appendChild(slot)
    this.slideShow.appendChild(this.slideContainer)

    // Adding the next and previous buttons
    // copying the tab order from here https://www.w3.org/WAI/tutorials/carousels/working-example/
    const prevbtn = document.createElement('button')
    prevbtn.innerText = '<'
    prevbtn.className = 'navbtn prevbtn'
    prevbtn.setAttribute('title', 'Go to previous slide')
    prevbtn.addEventListener('click', () => {
      this.goToSlide('prev')
    })
    this.slideShow.appendChild(prevbtn)

    // and the Next button after - again keeping the tab structure
    const nextbtn = document.createElement('button')
    nextbtn.innerText = '>'
    nextbtn.setAttribute('title', 'Go to next slide')
    nextbtn.className = 'navbtn nextbtn'
    nextbtn.addEventListener('click', () => {
      this.goToSlide('next')
    })
    this.slideShow.appendChild(nextbtn)

    // Adding a Navigation Bar
    this.navigationBar = document.createElement('div')
    this.navigationBar.classList.add('navigation-bar')
    this.slideShow.appendChild(this.navigationBar)

    // adding a Screen reader on
    this.screenReaderFeedback = document.createElement('div')
    this.screenReaderFeedback.setAttribute('role', 'alert')
    this.screenReaderFeedback.classList.add('sr-only')
    this.slideShow.appendChild(this.screenReaderFeedback)

    // add the content to the shadowRoot
    this.shadowRoot.appendChild(this.slideShow)
  }

  connectedCallback() {
    // set up an Array of all the slides for use all over the place
    this.slides = Array.from(this.querySelectorAll('.slide'))
    // get the provided "slide" value or just return 0 (its the array index of the slides array)
    this.currentSlide = parseInt(this.getAttribute('slide')) || 0

    // create navigation buttons
    this.slides.forEach((item, i) => {
      const navigationbtn = document.createElement('button')
      navigationbtn.innerHTML = `<span class='sr-only'>go to slide</span>${i + 1}`
      navigationbtn.className = 'navigation-btn'
      navigationbtn.addEventListener('click', () => {
        this.goToSlide(i)
      })
      this.navigationBar.append(navigationbtn)
    })

    // add a screen reader info for focus on the slide
    this.slideContainer.addEventListener('focus', () => {
      // on focus set the Screen reader alert text
      this.screenReaderFeedback.innerText = `Slide ${this.currentSlide + 1} of  ${this.slides.length}`
    })

    // these 2 events make use of the scrollend thingy which safari does not support soooo
    this.slideContainer.addEventListener('scroll', () => {
         // make em all visible
      this.slides.forEach((item) => {
        item.style.visibility = 'visible'
      })
  //scroll catcher is a fix for safari
  // if scrollend does not fire after 5 seconds the timeout handles the job
  this.scrollcatcher = true
      setTimeout(()=>{
        if(this.scrollcatcher){
               // make em all hidden
      this.slides.forEach((item, i) => {
        if (i != this.currentSlide) {
          item.style.visibility = 'hidden'
        }
      })
        }
      },5000)
    })

    this.slideContainer.addEventListener('scrollend', () => {
      this.scrollcatcher = false
      // make em all hiddne
      this.slides.forEach((item, i) => {
        if (i != this.currentSlide) {
          item.style.visibility = 'hidden'
        }
      })
    })

    this.slides[this.currentSlide].scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'center'
    })
  }

  goToSlide(v) {
    let direction = 'next'
    let nextslide = v
    console.log(v, this.currentSlide)
    if (v === 'next') {
      if (this.currentSlide === this.slides.length - 1) {
        nextslide = 0
      } else {
        nextslide = this.currentSlide + 1
      }
    }
    if (v === 'prev') {
      direction = 'prev'
      if (this.currentSlide === 0) {
        nextslide = this.slides.length - 1
      } else {
        nextslide = this.currentSlide - 1
      }
    }
    this.screenReaderFeedback.innerText = `Going to Slide ${nextslide + 1} of ${this.slides.length}`
    this.currentSlide = nextslide
    this.slides[this.currentSlide].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }
}
customElements.define('imdt-slideshow-native', SlideShow)
