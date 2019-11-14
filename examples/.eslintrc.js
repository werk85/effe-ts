const path = require('path')

module.exports = {
  extends: [
    'werk85/modern'
  ],
  parserOptions: {
    project: path.join(__dirname, './src/tsconfig.json')
  },
  settings: {
    "import/resolver": {
      typescript: {
        directory: 'src'
      }
    }
  }
}