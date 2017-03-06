var webpack = require('webpack');
var path = require('path');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    'kostyl': path.resolve(__dirname, './src/kostyl.js')
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'kostyl.js',
    library: 'Kostyl',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: 'static', generateStatsFile: true }),
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
  ]
};
