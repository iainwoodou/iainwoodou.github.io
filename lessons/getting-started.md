# Creating a Custom Web Component

## **Objective:**

By the end of this guide, you will be able to create a custom web component
 `<my-textarea></my-textarea>` 

that includes a **resizable textarea**, **character limit** with countdown, and **word counter**.

### **Tools Needed:**

* Code editor (e.g., VSCode)
* Web browser (e.g., Chrome, Firefox)

## 1. Introduction to Web Components

Web components allow you to build custom, reusable html elements.We're not covering the theory here, you can ask around or google if you want to know a lot more about them, this is a practical how to guide to get you started. We will not even be using a build system here but will be doing it "old school" :)

If you have used Vue you will probably find a lot of familar concepts here just with slightly different names

If you want to know more you would want to

* Custom elements
* Shadow Dom
* HTML Templates

Handy Links

* [Using custom elements - mozilla.orf](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
* [w3schools - HTML templates](https://www.w3schools.com/tags/tag_template.asp)

## 2.  Lets create two files to start

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Textarea</title>
</head>
<body>
  <my-textarea maxlength="255" resize wordcount>The value for my textarea here</my-textarea>
  <script src="my-textarea.js"></script>
</body>
</html>
```

### my-textarea.js

```javascript
class MyTextarea extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow DOM tree to this instance
    this.attachShadow({ mode: 'open' });
  }
}
customElements.define('my-textarea', MyTextarea);
```

You can go ahead and run this with live server ( or whatever you use ) and have a look at whats generated - i doubt anything there will surprise you

## 3. Creating the Basic Structure

* **Explanation:** Set up the basic structure of the custom element.
* **Code Example:**

```javascript
class MyTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        textarea {
          width: 100%;
          box-sizing: border-box;
        }
      </style>
      <textarea></textarea>
      <div id="charCount"></div>
      <div id="wordCount"></div>
    `;
  }
}
customElements.define('my-textarea', MyTextarea);
```

Or you can build the html programatically - I'm not sure which method I prefer myself the above one feels more "vue like"

```javascript
class MyTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const styles =  document.createElement("style")
    styles.textContent = `
        textarea {
          width: 100%;
          box-sizing: border-box;
        }
    `
    this.shadowRoot.append(styles)

    this.textarea =  document.createElement("textarea")
    this.charcount =  document.createElement("div")
    this.wordcount =  document.createElement("div")

    this.shadowRoot.append(this.textarea)
    this.shadowRoot.append(this.charcount)
    this.shadowRoot.append(this.wordcount)
  }
}
customElements.define('my-textarea', MyTextarea);
```

## 4. Implementing Auto-Resize Functionality

* **Explanation:** Add functionality to resize the textarea based on content.
* **Code Example:**

```javascript
class MyTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

    // get property added to the tag properties
    this.resize = this.hasAttribute('resize');  // this is true/false 

    // Apply initial settings to resize it to fit starting content
    if (this.resize) {
      this.autoResize();
    }

    // add an event listener to to the textarea
    this.textarea = this.shadowRoot.querySelector('textarea');
    this.textarea.addEventListener('input', () => {
      if (this.resize) {
        this.autoResize();
      }
    });
  }

  autoResize() {
    // a simple function to resize the textarea to the content
    this.textarea.style.height = 'auto';
    this.textarea.style.height = `${this.textarea.scrollHeight + 5}px`;
  }
}
customElements.define('my-textarea', MyTextarea);
```

## 5. Adding Character Limit and Countdown

* **Explanation:** Implement character limit and countdown functionality.
* **Code Example:**

```javascript
class MyTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

    this.textarea = this.shadowRoot.querySelector('textarea');
    // get a variable set up to hold the reference to the charcount div
    this.charCount = this.shadowRoot.querySelector('#charCount');


    this.resize = this.hasAttribute('resize'); 

    /*
    We look for a maxlength attribute and if its there
    we set this.maxlength value to be used later 
    and we add the maxlength attribute and value to our textarea
     */
    if(this.hasAttribute('maxlength')){
      this.maxlength = parseInt(this.getAttribute('maxlength'), 10)
      //add this to the textarea as maxlength
      this.textarea.setAttribute("maxlength", this.maxlength)
    }else{ 
      this.maxlength= null
    };


    if (this.resize) {
      this.autoResize();
    }
    // just doing a first run of the function for setting up the values
    if (this.maxlength !== null) {
      this.updatecharlength();
    }

    this.textarea.addEventListener('input', () => {
      if (this.resize) {
        this.autoResize();
      }
      // add calculate remaining characters call to the textarea listener
      if (this.maxlength !== null) {
        this.updatecharlength();
      }
    });
  }

  autoResize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = `${this.textarea.scrollHeight + 5}px`;
  }

  // Function to update character limit display
  updatecharlength() {
    const charsLeft = this.maxlength - this.textarea.value.length;
    this.charCount.textContent = `Characters left: ${charsLeft}`;
   }
}
customElements.define('my-textarea', MyTextarea);
```

## 6. Implementing Word Counter

* **Explanation:** Add functionality to count words in the textarea.
* **Code Example:**

```javascript
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
    this.charCount = this.shadowRoot.querySelector("#charCount");
    // get a variable set up to hold the reference
    this.wordCount = this.shadowRoot.querySelector("#wordCount");

    this.resize = this.hasAttribute("resize");
    if (this.hasAttribute("maxlength")) {
      this.maxlength = parseInt(this.getAttribute("maxlength"), 10);
      this.textarea.setAttribute("maxlength", this.maxlength);
    } else {
      this.maxlength = null;
    }

    // the wordcount is a boolean option 
    // so true or false - easy to handle
    this.wordcount = this.hasAttribute('wordcount');

    if (this.resize) {
      this.autoResize();
    }

    if (this.maxlength !== null) {
      this.updatecharlength();
    }

    // just doing a first run of the function 
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
      // added it to the event listener too
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
    this.charCount.textContent = `Characters left: ${charsLeft}`;
  }

  // Function to update word count
  updateWordCount() {
    const words = this.textarea.value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    this.wordCount.textContent = `Words: ${words}`;
  }
}
customElements.define("my-textarea", MyTextarea);
```

## 8. Getting stuff In and OUT of the component

So it works but how do you start it out with content?  Well its surprisingly easy. You can get whatever is in the element and pop it into the value of the textarea you have, you could pass it as the value like an inline input - remember you are often extending an element - so try to use the method most similar to the way you would normally do it.

```js
   // Set initial content
    const initialText = this.textContent.trim();
    this.textarea.value = initialText;
```

In the same way you can have it pass out a value like so (getter and setters )

```js
  get value() {
    return this.textarea.value;
  }
```

**Emitting events**

It might be nice to have an additional function that emits info out - say you wanted to trigger an event in the main page that fires when the character limit is hit - you can call this in the  updatecharlength function like so

```js
  updatecharlength() {
    const charsLeft = this.maxlength - this.textarea.value.length;
    if (charsLeft === 0) {
      this.dispatchEvent(
        new CustomEvent("limit-hit", { detail: this.textarea.value })
      );
    }
    this.charCount.textContent = `Characters left: ${charsLeft}`;
  }
```

Adding a listener for this is exactly how you would expect in the index.html

```html
  <my-textarea maxlength="255" resize wordcount>
  The value for my textarea here
  </my-textarea>

  <script>
    document.querySelector("my-textarea").addEventListener('limit-hit', (event) => {
        alert("NO MORE TYPING FOR YOU")
        console.log('Current text:', event.detail);
      });
  </script>
```

## Whats next

This is not a great version of this tool - this is a get you going version. when building something re-usable you really need to think of the scenarios it might be used by another IMD.

- what other textarea properties do we need to pass on - what stuff should we make sure we deal with? [Textarea specs :(](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)
- What about styling - how will that work (we'll cover that later)
- Who's going to document this goddam thing!