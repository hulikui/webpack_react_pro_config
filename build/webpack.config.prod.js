/**
 * @file build webpack配置
 */
/**
 node webpack.config.prod.js
 --watch         实时发布
 --uglify        压缩
 release 发布到生产环境
 NODE_ENV=production node build/webpack.config.prod.js --watch --uglify release
 */
var childProcess = require('child_process');
var path = require('path');
var webpack = require('webpack');
var WebpackMd5Hash = require('webpack-md5-hash');
var HashedModuleIdsPlugin = require('./HashedModuleIdsPlugin');

/*
 html-webpack-plugin插件，重中之重，webpack中生成HTML的插件，
 具体可以去这里查看https://www.npmjs.com/package/html-webpack-plugin
 */
var HtmlwebpackPlugin = require('html-webpack-plugin');

/*
 extract-text-webpack-plugin插件，
 样式提取到单独的css文件里，
 */
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// 项目根路径
var ROOT_PATH = path.resolve(__dirname, '../');

// 项目源码路径
var SRC_PATH = ROOT_PATH + '/src';
// 产出路径
var DIST_PATH = ROOT_PATH + '/release';

var args = process.argv;

var isUglify = args.indexOf('--uglify') > -1;

var isWatch = args.indexOf('--watch') > -1;
var isOnline = args.indexOf('--release') > -1;

// 测试环境静态资源 domain
var testPublicPath = '/';
// 生产环境静态资源 domain
var onlinePublicPath = '/';

var webpackConfig = {
  context: SRC_PATH,
  entry: {
    app: ["babel-polyfill", SRC_PATH + '/entry.js'],
    vendor: [
      'react',
      'react-dom',
      'react-router',
      'redux',
      'react-redux',
      'redux-thunk',
      'lodash'
    ]
  },
  output: {
    path: DIST_PATH,
    filename: 'js/[name].js?[chunkhash:8]',
    chunkFilename: 'js/[name].js?[chunkhash:8]',
    publicPath: isOnline ? onlinePublicPath : testPublicPath
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      },
      { // 解析 .less
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'less-loader']
        })
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['url-loader?limit=1000&name=files/[name].[ext]?[hash:8]']
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
      chunks: ['app', 'vendor']
    }),
    // 使用 hash 作模块 ID，文件名作ID太长了，文件大小剧增
    new HashedModuleIdsPlugin(),
    // 根据文件内容生成 hash
    new WebpackMd5Hash(),
    new ExtractTextPlugin('css/[name].css?[contenthash:8]'),
    // 压缩 js, css
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    new HtmlwebpackPlugin({
      filename: 'index.html',
      template: SRC_PATH + '/app.tpl.html',
      chunks: ['app', 'vendors'],
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeComments: true
      },
      cdnPath: '/release',
      title: 'webpack test'
    }),
    // 浏览器加前缀
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [require('autoprefixer')({browsers: ['last 5 versions']})]
      }
    })
  ]
};

var compiler = webpack(webpackConfig);

if (isWatch) {
  compiler.watch({}, callback);
} else {
  compiler.run(callback);
}


/**
 * 拷贝一个目录到制定目录
 * @param src 被拷贝的目录
 * @param dist 目标的目录
 */
// function copyDir(src, dist) {
//
//   if (!/^win/.test(process.platform)) {
//     childProcess.spawn('cp', ['-r', src, dist]);
//   } else { // windows
//     const excmd = 'xcopy ' + path.normalize(src) + ' ' + path.normalize(dist + '/assets/') + ' /y /s /e';
//     console.log('windows copy cmd', excmd);
//     childProcess.exec(excmd);
//   }
//
// }
//
// // 打包完毕后拷贝assets目录到dist目录下
// compiler.plugin('done', function () {
//   copyDir(SRC_PATH + '/assets', DIST_PATH);
// });

function callback(err, stats) {
  if (err) {
    console.log(err);
  } else {
    console.log(stats.toString({
      colors: true,
      chunks: false,
      children: false
    }));
  }
}