<script>
import { useGlobalStore } from '@/store/store.js';
import * as hljs from 'highlight.js';
import CodeEditor from 'simple-code-editor';
export default {
  components: {
    CodeEditor
  },
  setup() {
    const store = useGlobalStore();
    return {
      store
    };
  },
  data() {
    return {
      hljs
    };
  },
  methods: {}
};
</script>

<template>
  <div class="container">
    <h1>Css Editor</h1>
    <p>Ok this is a CL thing, we have been including an overrides.css to allow the IMD to provide custom Css
      This prob needs to be under an "Advances" tab or something
    </p>
    <CodeEditor
      v-model="store.zipfiles['overrides.css'].data"
      theme="github-dark"
      :line-nums="true"
      :languages="[['css', 'css']]"
      width="100%"
      height="600px"
    />
  </div>
</template>

<style></style>
