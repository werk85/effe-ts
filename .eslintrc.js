module.exports = {
  extends: [
    'werk85/modern'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  settings: {
    "import/resolver": {
      typescript: {
        directory: 'src'
      }
    }
  }
}