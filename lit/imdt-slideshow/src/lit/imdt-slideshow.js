import { LitElement, html, css, unsafeCSS } from 'lit';
import styles from './imdt-slideshow.css?raw';

class SlideShow extends LitElement {
  static styles = css`${unsafeCSS(styles)}`;
  static properties = {
    currentSlide: { type: Number },
    slides: { type: Array }
  };

  constructor() {
    super();
    this.currentSlide = 0;
    this.slides = [];
  }

  firstUpdated() {
    this.slides = Array.from(this.querySelectorAll('.slide'));
    this.currentSlide = parseInt(this.getAttribute('slide')) || 0;
    

    const slideContainer = this.shadowRoot.querySelector('.slide-container');
    slideContainer.addEventListener('scroll', () => {
      this.slides.forEach((item) => {
        item.style.visibility = 'visible';
      });
      this.scrollcatcher = true;
      setTimeout(() => {
        if (this.scrollcatcher) {
          this.slides.forEach((item, i) => {
            if (i != this.currentSlide) {
              item.style.visibility = 'hidden';
            }
          });
        }
      }, 5000);
    });

    slideContainer.addEventListener('scrollend', () => {
      this.scrollcatcher = false;
      this.slides.forEach((item, i) => {
        if (i != this.currentSlide) {
          item.style.visibility = 'hidden';
        }
      });
    });


    this.updateNavigationButtons();
    this.updateScreenReaderFeedback();
    this.goToSlide(this.currentSlide)

  }

  updateNavigationButtons() {
    const navigationBar = this.shadowRoot.querySelector('.navigation-bar');
    this.slides.forEach((item, i) => {
      const navigationbtn = document.createElement('button');
      navigationbtn.innerHTML = `<span class='sr-only'>go to slide</span>${i + 1}`;
      navigationbtn.className = 'navigation-btn';
      navigationbtn.addEventListener('click', () => {
        this.goToSlide(i);
      });
      navigationBar.append(navigationbtn);
    });
  }

  updateScreenReaderFeedback() {
    const slideContainer = this.shadowRoot.querySelector('.slide-container');
    const screenReaderFeedback = this.shadowRoot.querySelector('.sr-only');

    slideContainer.addEventListener('focus', () => {
      screenReaderFeedback.innerText = `Slide ${this.currentSlide + 1} of ${this.slides.length}`;
    });

  }

  goToSlide(v) {
    let nextslide = v;
    if (v === 'next') {
      nextslide = this.currentSlide === this.slides.length - 1 ? 0 : this.currentSlide + 1;
    } else if (v === 'prev') {
      nextslide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    }
    this.shadowRoot.querySelector('.sr-only').innerText = `Going to Slide ${nextslide + 1} of ${this.slides.length}`;
    this.currentSlide = nextslide;
    this.slides[this.currentSlide].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  render() {
    return html`
      <div class="slideshow">
        <div class="slide-container" tabindex="0">
          <slot></slot>
        </div>
        <button class="navbtn prevbtn" title="Go to previous slide" @click="${() => this.goToSlide('prev')}"><</button>
        <button class="navbtn nextbtn" title="Go to next slide" @click="${() => this.goToSlide('next')}">></button>
        <div class="navigation-bar"></div>
        <div class="sr-only" role="alert"></div>
      </div>
    `;
  }
}

customElements.define('imdt-slideshow', SlideShow);
