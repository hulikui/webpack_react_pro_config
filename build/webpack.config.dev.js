/**
 * @file webpack开发配置
 */
/**
 * node webpack.config.dev.js
 *
 * NODE_ENV=development node build/webpack.config.dev.js
 */
var webpack = require('webpack');
var path = require('path');

/*
 html-webpack-plugin插件，重中之重，webpack中生成HTML的插件，
 具体可以去这里查看https://www.npmjs.com/package/html-webpack-plugin
 */
var HtmlwebpackPlugin = require('html-webpack-plugin');

// 项目根路径
var ROOT_PATH = path.resolve(__dirname, '../');

// 项目源码路径
var SRC_PATH = ROOT_PATH + '/src';

// 产出路径
var DIST_PATH = ROOT_PATH + '/release';

var PORT = 4000;

var HOST = 'localhost';
// 打包的参数
var args = process.argv;

// 本地环境静态资源路径
var localPublicPath = 'http://' + HOST + ':' + PORT;

module.exports = {
  devtool: '#eval-cheap-module-source-map',
  context: SRC_PATH,
  entry: {
    app: [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?' + localPublicPath,
      'webpack/hot/only-dev-server',
      SRC_PATH + '/entry.js'
    ]
  },
  output: {
    path: DIST_PATH, // 输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
    publicPath: '/',
    filename: 'js/[name].js', // 每个页面对应的主js的生成配置
    chunkFilename: 'js/[name].js' // chunk生成的配置
  },
  module: {
    rules: [ // 加载器，关于各个加载器的参数配置
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader']
      },
      { // 解析 .css
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      { // 解析 .less
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['url-loader?limit=1000&name=files/[name].[ext]?[hash:8]']
      }
    ]
  },
  plugins: [
    // define env
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons', // commons chunk name
      chunks: ['app'] // common modules entrance
    }),
    // Autoprefixer CSS online
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [require('autoprefixer')({browsers: ['last 5 versions']})]
      }
    }),
    // html template plugin
    new HtmlwebpackPlugin({
      filename: 'index.html',
      template: SRC_PATH + '/app.tpl.html',
      inject: 'body',
      chunks: ['app', 'commons'],
      hash: true,
      minify: false,
      cdnPath: '',
      title: 'webpack project test'
    }),
    // hot replacement
    new webpack.HotModuleReplacementPlugin(),
    // console name
    new webpack.NamedModulesPlugin(),
    // error no emit
    new webpack.NoEmitOnErrorsPlugin()
  ],
  devServer: {
    contentBase: DIST_PATH,
    publicPath: '/',
    inline: true,
    compress: true,
    host: HOST,
    port: PORT,
    stats: {
      modules: false,
      chunks: false,
      children: false,
      colors: true
    },
    proxy: {
      '/api': {// api proxy
        target: 'http://' + HOST + ':4000',
        pathRewrite: {'^/api': ''}
      }
    },
    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    historyApiFallback: true
  }
};