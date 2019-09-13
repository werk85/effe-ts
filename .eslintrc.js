module.exports = {
  extends: [
    'werk85/modern'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  settings: {
    "import/resolver": {
      ts: {
        directory: 'src'
      }
    }
  }
}