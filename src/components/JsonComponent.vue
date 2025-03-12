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
      model: {},
      schema: {
        $id: 'https://example.com/arrays.schema.json',
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        description: 'Arrays of strings and objects',
        title: 'Arrays',
        type: 'object',
        properties: {
          fruits: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          vegetables: {
            type: 'array',
            items: { $ref: '#/$defs/veggie' }
          }
        },
        $defs: {
          veggie: {
            type: 'object',
            required: ['veggieName', 'veggieLike'],
            properties: {
              veggieName: {
                type: 'string',
                description: 'The name of the vegetable.'
              },
              veggieLike: {
                type: 'boolean',
                description: 'Do I like this vegetable?'
              }
            }
          }
        }
      }
    };
  },
  methods: {}
};
</script>

<template>
  <div class="container">
    <h1>Json</h1>
    <h2>Ok Slap the JSON structure editor here</h2>
    <FormBuilder :schema="schema" :model="model" />
  </div>
</template>

<style></style>
