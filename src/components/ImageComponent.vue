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
      selectedFile: null
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = e.target.result;
          const fileName = `images/${this.selectedFile.name}`;
          this.store.zipfiles[fileName] = {
            type: 'img',
            data: fileData
          };
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }
  }
};
</script>

<template>
  <div class="container">
    <h1>Images</h1>
    <input type="file" @change="handleFileUpload" />

    <pre>
      {{ Object.keys(store.zipfiles) }}
    </pre>
  </div>
</template>

<style>

</style>