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
