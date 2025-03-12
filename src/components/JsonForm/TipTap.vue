<template>
    <div v-if="editor" class="tiptap">
        
        <bubble-menu
      class="bubble-menu"
      :tippy-options="{ duration: 100 }"
      :editor="editor"
    >
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        Bold
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        Italic
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        Strike
      </button>
      <button @click="setLink" :class="{ 'is-active': editor.isActive('link') }">
        Link
      </button>
    </bubble-menu>



    <h4 style="background-color:#fff; padding: 5px;">TipTap Editor : try using markdown in here :) will add wysiwyg later</h4>
     <p style="padding: 5px; border:1px solid #424242">
      <editor-content :editor="editor" />
     </p> 
    </div>
  </template>
  
  <script>
  import { Color } from '@tiptap/extension-color'
  import ListItem from '@tiptap/extension-list-item'
  import TextStyle from '@tiptap/extension-text-style'
  import StarterKit from '@tiptap/starter-kit'
  import { BubbleMenu ,Editor, EditorContent } from '@tiptap/vue-3'
  import Link from '@tiptap/extension-link'
  export default {
    components: {
      EditorContent,
      BubbleMenu,
    },
    props: {
      modelValue: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        editor: null,
      }
    },
    watch: {
      modelValue(newValue) {
        if (this.editor && this.editor.getHTML() !== newValue) {
          this.editor.commands.setContent(newValue, false)
        }
      },
    },
    mounted() {
      this.editor = new Editor({
        extensions: [
          Color.configure({ types: [TextStyle.name, ListItem.name] }),
          TextStyle.configure({ types: [ListItem.name] }),
          StarterKit,
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              target: '_blank',
            },
        }),
        ],
        content: this.modelValue,
        onUpdate: ({ editor }) => {
          this.$emit('update:modelValue', editor.getHTML())
        },
      })
    },
    beforeUnmount() {
      this.editor.destroy()
    },
    methods:{
        setLink() {
      const url = prompt('Enter the URL')   
      if (url) {
        this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    }
    }
  }
  </script>


<style >
/* Basic editor styles */
.tiptap {
	/* List styles */
	/* Heading styles */
	/* Code and preformatted text styles */
}
 .tiptap :first-child {
	 margin-top: 0;
}
 .tiptap ul, .tiptap ol {
	 padding: 0 1rem;
	 margin: 1.25rem 1rem 1.25rem 0.4rem;
}
 .tiptap ul li p, .tiptap ol li p {
	 margin-top: 0.25em;
	 margin-bottom: 0.25em;
}
 .tiptap h1, .tiptap h2, .tiptap h3, .tiptap h4, .tiptap h5, .tiptap h6 {
	 line-height: 1.1;
	 margin-top: 2.5rem;
	 text-wrap: pretty;
}
 .tiptap h1, .tiptap h2 {
	 margin-top: 3.5rem;
	 margin-bottom: 1.5rem;
}
 .tiptap h1 {
	 font-size: 1.4rem;
}
 .tiptap h2 {
	 font-size: 1.2rem;
}
 .tiptap h3 {
	 font-size: 1.1rem;
}
 .tiptap h4, .tiptap h5, .tiptap h6 {
	 font-size: 1rem;
}
 .tiptap code {
	 background-color: var(--accent1);
	 border-radius: 0.4rem;
	 color: #000;
	 font-size: 0.85rem;
	 padding: 0.25em 0.3em;
}
 .tiptap pre {
	 background: #000;
	 border-radius: 0.5rem;
	 color: #fff;
	 margin: 1.5rem 0;
	 padding: 0.75rem 1rem;
}
 .tiptap pre code {
	 background: none;
	 color: inherit;
	 font-size: 0.8rem;
	 padding: 0;
}
 .tiptap blockquote {
	 border-left: 3px solid #777;
	 margin: 1.5rem 0;
	 padding-left: 1rem;
}
 .tiptap hr {
	 border: none;
	 border-top: 1px solid #ccc;
	 margin: 2rem 0;
}
/* Bubble menu */
 .bubble-menu {
	 background-color: #fff;
	 border: 1px solid #aaa;
	 border-radius: 0.7rem;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
	 display: flex;
	 padding: 0.2rem;
}
 .bubble-menu button {
	 background-color: unset;
   border: 1px solid #ccc;
   font-size: 12px;
   height:24px;
}
 .bubble-menu button:hover {
	 background-color: #777;
}
 .bubble-menu button.is-active {
	 background-color: var(--accent1);
}
 .bubble-menu button.is-active:hover {
  background-color: var(--accent1);
}
/* Floating menu */
 .floating-menu {
	 display: flex;
	 background-color: var(--accent1);
	 padding: 0.1rem;
	 border-radius: 0.5rem;
}
 .floating-menu button {
	 background-color: unset;
	 padding: 0.275rem 0.425rem;
	 border-radius: 0.3rem;
}
 .floating-menu button:hover {
	 background-color: #777;
}
 .floating-menu button.is-active {
	 background-color: #fff;
	 background-color: var(--accent1);
}
 .floating-menu button.is-active:hover {
  background-color: var(--accent1);
}
 </style>
 