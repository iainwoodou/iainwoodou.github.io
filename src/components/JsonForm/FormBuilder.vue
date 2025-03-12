<script>
import { useGlobalStore } from '@/store/store.js';
import FormElement from './FormComponents/FormElement.vue';
export default {
  components: {
    FormElement
  },
  props: {
    schema: {
      type: Object,
      required: true
    },
    model: {
      type: Object,
      required: true
    }
  },
  setup() {
    const store = useGlobalStore();
    return {
      store
    };
  },
  data() {
    return {
    };
  },
  methods: {}
};
</script>

<template>
 <pre>{{ schema }}</pre>

 <FormElement v-for="(value, key) in schema.properties" :key="key" :model="model[key]" :schema="value" />
</template>

<style></style>
