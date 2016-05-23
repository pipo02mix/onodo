// Webpack configuration with asset fingerprinting in production.
'use strict';

var path = require('path');
var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');

// must match config.webpack.dev_server.port
var devServerPort = 3080;

// set TARGET=production on the environment to add asset fingerprints
var production = process.env.TARGET === 'production';

var config = {
  entry: {
    'app': './app/frontend/javascripts/app.js'
  },

  output: {
    // Build assets directly into public/webpack/, let webpack know
    // that all webpacked assets start with webpack/

    // must match config.webpack.output_dir
    path: path.join(__dirname, '..', 'public', 'webpack'),
    publicPath: '/webpack/',

    filename: production ? '[name]-bundle-[chunkhash].js' : '[name]-bundle.js',
    sourceMapFilename: "[name]-bundle.js.map"
  },

  resolve: {
    root: path.join(__dirname, '..', 'app','frontend','javascripts'),
    extensions: ['', '.coffee', '.js'],
    alias: {
      'handlebars': 'handlebars/runtime.js'
    }
  },
  
  externals: {
    handsontable: 'Handsontable'
  },

  module: {
    loaders: [
      { test: /\.coffee$/,     loader: 'coffee-loader' },
      { test: /\.handlebars$/, loader: 'handlebars-loader' }
    ]
  },

  plugins: [
    // must match config.webpack.manifest_filename
    new StatsPlugin('manifest.json', {
      // We only need assetsByChunkName
      chunkModules: false,
      source: false,
      chunks: false,
      modules: false,
      assets: true
    })]
};

if (production) {
  config.plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      sourceMap: false
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  );
} else {
  config.devServer = {
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' }
  };
  config.output.publicPath = '//localhost:' + devServerPort + '/webpack/';
  // Source maps
  config.devtool = 'cheap-module-eval-source-map';
}

module.exports = config;