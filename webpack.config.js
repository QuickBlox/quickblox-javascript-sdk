const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';

const webpackConfig = {
  entry: './src/index.js',
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
        loader: 'babel-loader'
      }
    ]
  },
  watch: NODE_ENV === 'development',
  devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    })
  ]
};

if (NODE_ENV === 'production') {
  webpackConfig.plugins.push(
    new MinifyPlugin(true, {
      comments: false,
      sourceMap: module.exports.devtool
    })
  );
}

console.log('The webpack is starting, environment: ' + NODE_ENV);

module.exports = webpackConfig;
