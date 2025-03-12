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
    <img 
      :src="`icons/192.png`" 
      alt="logo" 
      style="width: 100px">
    <h1>IMD File Manager</h1>

<p>This is a proof of concept for a new filetype - (.imd)  it is purely a ZIP file with the extension changed</p>
<p>The aim is that they will contain a file strucure that will allow a tool like this to edit them easily</p>
<p>
  I have created a .imd file you can download and try out <a href="accordion.imd" download>here</a>
</p>
<p>Just change the file extension back to .zip and you can open it up and look around - Note : once installed the PWA will associate itself with .imd files so a double click on one will open it up in this app</p>
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
    Or sharepoint link (No I havent got this working yet - but pretty sure its doable)
    <input v-model="splink" type="text" style="width: 100%" />
    <button class="file-upload-label" @click="$root.fetchIMDfile(splink)">Get File</button>
  </div>
</template>

<style>

</style>
