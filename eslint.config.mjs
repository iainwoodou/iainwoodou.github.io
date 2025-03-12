import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ["public/vleapi.1.js", "dist/",  "**/.*"],
  },
  {
    files: ["**/*.js", "**/*.vue", "**/*.jsx", "**/*.mjs"],
  },
  {
    languageOptions:{ ecmaVersion: "latest", sourceType: "module", globals: {
      ...globals.browser, ...globals.node, VLE: "readonly"
  } }
  },
  ...compat.extends("eslint:recommended", "prettier"),
  ...pluginVue.configs['flat/recommended']
];