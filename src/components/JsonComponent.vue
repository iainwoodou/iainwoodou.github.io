<script>
import { useGlobalStore } from '@/store/store.js';
import FormBuilder from './JsonForm/FormBuilder.vue';
export default {
  components: {
    FormBuilder
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
  <div class="container">
    <h1>Json Schema Form Thingy</h1>
    <FormBuilder />
  </div>
</template>

<style></style>
