# Creating a Custom Web Component

## **Objective:**

By the end of this guide, you will be able to create a custom web component `<my-textarea>` that includes a resizable textarea, character limit with countdown, and word counter.

### **Tools Needed:**

* Code editor (e.g., VSCode)
* Web browser (e.g., Chrome, Firefox)

## **1. Introduction to Web Components**

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
  <my-textarea charlimit="255" resize wordcount>The value for my textarea here</my-textarea>
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

### **2. Creating the Basic Structure**

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

### **3. Implementing Auto-Resize Functionality**

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
    this.textarea = this.shadowRoot.querySelector('textarea');
    this.textarea.addEventListener('input', this.autoResize.bind(this));
  }

  autoResize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}
customElements.define('my-textarea', MyTextarea);
```

### **4. Adding Character Limit and Countdown**

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
    this.charCount = this.shadowRoot.querySelector('#charCount');
    this.charLimit = this.getAttribute('charlimit') || 255;
    this.textarea.addEventListener('input', this.updateCharCount.bind(this));
    this.updateCharCount();
  }

  updateCharCount() {
    const remaining = this.charLimit - this.textarea.value.length;
    this.charCount.textContent = `Characters remaining: ${remaining}`;
    this.autoResize();
  }

  autoResize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}
customElements.define('my-textarea', MyTextarea);
```

### **5. Implementing Word Counter**

* **Explanation:** Add functionality to count words in the textarea.
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
    this.charCount = this.shadowRoot.querySelector('#charCount');
    this.wordCount = this.shadowRoot.querySelector('#wordCount');
    this.charLimit = this.getAttribute('charlimit') || 255;
    this.textarea.addEventListener('input', this.updateCounts.bind(this));
    this.updateCounts();
  }

  updateCounts() {
    const remaining = this.charLimit - this.textarea.value.length;
    this.charCount.textContent = `Characters remaining: ${remaining}`;
    const words = this.textarea.value.trim().split(/\s+/).filter(word => word.length > 0).length;
    this.wordCount.textContent = `Words: ${words}`;
    this.autoResize();
  }

  autoResize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}
customElements.define('my-textarea', MyTextarea);
```

### **6. Using the Custom Element**

* **Explanation:** Show how to use the custom element in an HTML file.
* **Code Example:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Textarea</title>
</head>
<body>
  <my-textarea charlimit="255" resize wordcount>The value for my textarea here</my-textarea>
  <script src="my-textarea.js"></script>
</body>
</html>
```

### **7. Conclusion and Q&A**

* **Explanation:** Summarize the lesson and open the floor for questions.

Feel free to adjust the steps and explanations to fit your teaching style and the needs of your you. Good luck with your lesson!