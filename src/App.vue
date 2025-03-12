<script>
import { useGlobalStore } from '@/store/store.js';
import fileManager from '@/mixins/fileManager.js';
import InstallPopup from '@/InstallPopup.vue';
import UploadComponent from '@/components/UploadComponent.vue';
import ImageComponent from '@/components/ImageComponent.vue';
import JsonComponent from '@/components/JsonComponent.vue';
import CssComponent from '@/components/CssComponent.vue';
export default {
  components: { InstallPopup, UploadComponent, CssComponent, JsonComponent, ImageComponent },
  mixins: [fileManager],
  setup() {
    const store = useGlobalStore();
    return {
      store
    };
  },
  data() {
    return {
      splink: null,
      section: 1
    };
  },
  methods: {}
};
</script>

<template>
  <UploadComponent v-if="!store.dataloaded" />
  <div v-if="store.dataloaded" class="container">
    <button class="close" @click="store.dataloaded = null">Close</button>
    <button class="export" @click="exportIMDFile">Export .imd</button>

    <button class="tabbtn" @click="section = 1">Json</button>
    <button class="tabbtn" @click="section = 2">Css</button>
    <button class="tabbtn" @click="section = 3">Images</button>
    <div class="tabarea">
      <JsonComponent v-if="section === 1" />
      <CssComponent v-if="section === 2" />
      <ImageComponent v-if="section === 3" />
    </div>


  </div>
  <InstallPopup />
</template>

<style>
.tabbtn {
  background-color: var(--accent1);
  color: white;
  border: none !important;
  font-size: 20px;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  margin: 0px;
  margin-right: 2px;
  font-size: 14px;
}
.tabarea {
  border: 1px solid var(--accent1);
  margin: 0px;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f44336;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.export {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--accent1);
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
</style>
