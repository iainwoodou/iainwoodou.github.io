<script>
import { useGlobalStore } from '@/store/store.js';
import FormElement from './FormComponents/FormElement.vue';

export default {
  components: {
    FormElement
  },
  setup() {
    const store = useGlobalStore();
    return {
      store
    };
  },
  data() {
    return {
      model: {},
      schema: {}
    };
  },
  mounted() {
    this.model = this.store.zipfiles['data.json'].data;
    let schemafile = this.store.zipfiles['metadata.json'].data.schemafile;
    this.schema = this.store.zipfiles[schemafile].data;

  }
};
</script>

<template>
  <div>
    <form>
      <div v-for="(value, key) in schema.properties" :key="key">
      <FormElement
        :model="model"
        :schema="value"
        :name="key"
      />
    </div>
    </form>
  </div>
</template>

<style>

.inset{
  border-left:10px solid var(--accent1);
  padding:10px;
  background-color: #0000000f;
}
</style>
