var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');
var path = require("path");

module.exports = {
  entry: [
    'bootstrap-loader',
    './www-src/js/index.jsx',
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'js/app.bundle.js',
    libraryTarget: 'var',
    library: 'initializeApplication',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css', '.html', 'index.js', 'index.jsx', 'index.html'],
  },
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'file-loader?name=[name].[ext]!extract-loader!html-loader',
      },
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract({fallbackLoader: "style-loader", loader: "css-loader!sass-loader", publicPath: '../'}),
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({fallbackLoader: "style-loader", loader: "css-loader!less-loader", publicPath: '../'}),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=images/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug'
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
          plugins: [
            ["transform-object-rest-spread", { "useBuiltIns": true }],
            ["transform-react-jsx-source"],
          ],
        },
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[hash].[ext]",
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=fonts/[hash].[ext]",
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin("css/stylesheet.css"),
    new CopyWebpackPlugin([
      {from: 'www-src/favicon-set', to: 'favicon-set'},
    ]),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Tether: 'tether',
      'window.Tether': 'tether',
    }),
  ],
}
