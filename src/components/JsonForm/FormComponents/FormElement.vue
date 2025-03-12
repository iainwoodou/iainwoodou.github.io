<script>
import { useGlobalStore } from '@/store/store.js';
import TipTap from '@/components/JsonForm/TipTap.vue';
export default {
    components: {
    TipTap
    },
  props: {
    schema: {
      type: Object,
      required: true
    },
    model: {
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  setup() {
    const store = useGlobalStore();
    return {
      store
    };
  },
  methods: {}
};
</script>
<template>
  <div>
    <label>{{ name }} </label>
    <div v-if="schema.type === 'string'">
      <input v-if="!schema.tool" type="text" v-model="model[name]" />
        <TipTap v-if="schema.tool === 'html'" v-model="model[name]" />
    </div>
    <div v-else-if="schema.type === 'number'">
      <input type="number" v-model="model[name]" />
    </div>
    <div v-else-if="schema.type === 'boolean'">
      <input type="checkbox" v-model="model[name]" />
    </div>
    <div v-else-if="schema.type === 'object'">
      <div class="inset" v-for="(value, key) in schema" :key="key">
        <FormElement :schema="value" :model="model[name]" :name="key" />
      </div>
    </div>
    <div v-else-if="schema.type === 'array'">
        <div v-if="schema.items.$ref">
        <div class="inset" v-for="(value, key) in store.zipfiles[schema.items.$ref].data.properties" :key="key">
          <FormElement :model="model" :schema="value" :name="key" />
        </div>
      </div>

      <div class="inset" v-for="(item, index) in model[name]" :key="index">
        <FormElement  :schema="schema" :model="model[name][index]" :name="index" />
      </div>
    </div>
    <div v-else>
      <input type="text" v-model="model[name]" />
    </div>
  </div>
</template>

<style></style>
