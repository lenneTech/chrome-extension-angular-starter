const {CheckerPlugin} = require('awesome-typescript-loader');
const {join} = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    background: join(__dirname, 'src/background.ts'),
    site: join(__dirname, 'src/site.ts')
  },
  output: {
    path: join(__dirname, '../angular/dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'awesome-typescript-loader?{configFileName: "chrome/tsconfig.json"}'
      }
    ]
  },
  plugins: [new CheckerPlugin()],
  resolve: {
    extensions: ['.ts', '.js']
  }
};
