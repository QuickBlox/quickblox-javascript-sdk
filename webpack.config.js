const path = require('path');

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  output: {
    library: 'Quickblox',
    libraryTarget: 'umd',
    filename: 'quickblox.min.js',
    path: path.resolve(__dirname, './'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /\.test.js$/],
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      }
    ]
  }
};
