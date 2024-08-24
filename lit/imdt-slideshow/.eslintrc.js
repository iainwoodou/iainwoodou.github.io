/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')
module.exports = {
    root: true,
    "ignorePatterns": ["vleapi.1.js"],
    'extends': [
        'eslint:recommended',
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    }
}