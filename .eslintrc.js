module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    node: true,
    mocha: true,
  },
  extends: ["eslint:recommended", "plugin:prefer-arrow/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    _logger: "readonly",
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    requireConfigFile: false,
  },
  plugins: ["prefer-arrow"],
  rules: {
    semi: ["error", "always"],
    "no-warning-comments": [
      "warn",
      { terms: ["todo", "fixme", "xxx", "debug"], location: "start" },
    ],
    "prefer-arrow/prefer-arrow-functions": [
      "error",
      { singleReturnOnly: true, disallowPrototype: true },
    ],
    "object-curly-newline": ["error", { multiline: true }],
    "arrow-parens": ["error", "as-needed"],
    "arrow-body-style": ["error", "as-needed"],
    "operator-linebreak": ["error", "after"],
    indent: [
      "error",
      2,
      { ignoredNodes: ["TemplateLiteral > *"], SwitchCase: 1 },
    ],
    "no-unused-expressions": "off",
  },
};
