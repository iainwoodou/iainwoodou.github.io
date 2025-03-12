<script>
import { useGlobalStore } from '@/store/store.js';
export default {
  setup() {
    const store = useGlobalStore();
    return {
      store
    };
  },
  data() {
    return {
      splink: null
    };
  },
  methods: {
  }
};
</script>

<template>
  <div class="container">
    <h1>IMD File Manager</h1>
    <h2>Upload .imd file</h2>
    <div class="file-upload">
      <label for="file-input" class="file-upload-label">
        <span>Choose a file</span>
        <input
          id="file-input"
          type="file"
          accept=".imd"
          class="file-input"
          @change="$root.handleFileChooser($event)"
        />
      </label>
    </div>
    Or sharepoint link
    <input v-model="splink" type="text" style="width: 100%" />
    <button class="file-upload-label" @click="$root.fetchIMDfile(splink)">Get File</button>
  </div>
</template>

<style>

</style>
