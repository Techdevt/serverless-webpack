'use strict';

process.env.NODE_ENV = 'production';
const BbPromise = require('bluebird');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

module.exports = {
  compile() {
    this.serverless.cli.log('Bundling with Webpack...');

    const compiler = webpack(this.webpackConfig);
    const statsConfig = {
      colors: true,
      hash: false,
      version: false,
      chunks: false,
      children: false,
    };
    const options = {
      stats: statsConfig,
      noInfo: true,
    };
    const context = webpackDevServer.prototype;

    return BbPromise
      .fromCallback(cb => webpackDevServer.call(context, compiler, options, cb))
      .then(stats => {
        console.log('we back');
        // this.serverless.cli.consoleLog('Compiling done, Spinning up static server on port...');
        // this.serverless.cli.consoleLog(stats.toString(statsConfig));

        // let serviceIndex = 0;

        // if (!Array.isArray(stats.stats) && stats.compilation.errors.length) {
        //   throw new Error('Webpack compilation error, see above');
        // } else if (Array.isArray(stats.stats)) {
        //   stats = stats.stats;
        //   let hasErrors = false;
        //   stats.forEach((stat, index) => {
        //     if (Array.isArray(this.webpackConfig) && this.webpackConfig[index].service) {
        //       serviceIndex = index;
        //     }
        //     if (stat.compilation.errors.length) {
        //       hasErrors = true;
        //       this.serverless.cli.consoleLog(stat.toString({
        //         colors: true,
        //         hash: false,
        //         version: false,
        //         chunks: false,
        //         children: false
        //       }));
        //     }
        //   });

        //   if (hasErrors) {
        //     throw new Error('Webpack compilation error, see above');
        //   }
        // }
        // let outputPath;
        // if (Array.isArray(stats)) {
        //   outputPath = stats[serviceIndex].compilation.compiler.outputPath;
        // } else {
        //   outputPath = stats.compilation.compiler.outputPath;
        // }
        // this.webpackOutputPath = outputPath;
        // this.originalServicePath = this.serverless.config.servicePath;
        // this.serverless.config.servicePath = outputPath;
        // return stats;
      }).catch(e => this.serverless.cli.consoleLog(e));
  },
};
