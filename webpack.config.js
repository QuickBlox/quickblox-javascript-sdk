var path = require('path');

// const pkg = require('./package.json');
// let libraryName = pkg.name;

module.exports = {
  entry: './src/qbMain.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-quickblox.js',
    library: 'QB',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    'node-xmpp-client': 'XMPP'
  }
};
