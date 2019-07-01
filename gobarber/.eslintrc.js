module.exports = {
  env: {
    es6:true,
    node: true,
  },
  extends: 'wesbos',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion:2018,
    sourceType: 'module'
  },
  rules: {
    "no-shadow": "off",
    "class-methods-use-this": "off",
    "no-param-reassign": "off",
    "camelcase": "off",
    "no-unused-vars": ["error", {"argsIgnorePattern": "next"}]
  }
}
