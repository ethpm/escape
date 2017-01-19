var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  entry: [
    'bootstrap-loader',
    './www-src/js/index.jsx',
  ],
  output: {
    path: './build',
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
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Tether: 'tether',
      'window.Tether': 'tether',
    }),
  ],
}
