'use strict';

process.env.NODE_ENV = 'production';
const BbPromise = require('bluebird');
const webpack = require('webpack');

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

    return BbPromise
      .fromCallback(cb => compiler.run(cb))
      .then(stats => {
        this.serverless.cli.consoleLog(stats.toString(statsConfig));

        let serviceIndex, staticIndex;

        if (!Array.isArray(stats.stats) && stats.compilation.errors.length) {
          throw new Error('Webpack compilation error, see above');
        } else if (Array.isArray(stats.stats)) {
          stats = stats.stats;
          let hasErrors = false;
          stats.forEach((stat, index) => {
            if (Array.isArray(this.webpackConfig) && this.webpackConfig[index].service) {
              serviceIndex = index;
            }
            if (Array.isArray(this.webpackConfig) && this.webpackConfig[index].static) {
              staticIndex = index;
            }
            if (stat.compilation.errors.length) {
              hasErrors = true;
              this.serverless.cli.consoleLog(stat.toString({
                colors: true,
                hash: false,
                version: false,
                chunks: false,
                children: false
              }));
            }
          });

          if (hasErrors) {
            throw new Error('Webpack compilation error, see above');
          }
        }
        let outputPath, staticOutputPath;
        if (serviceIndex || staticIndex) {
          if (serviceIndex) outputPath = stats[serviceIndex].compilation.compiler.outputPath;
          if (staticIndex) {
            staticOutputPath = stats[staticIndex].compilation.compiler.outputPath;
            this.serverless.config.staticPath = staticOutputPath;
          }
        } else {
          outputPath = stats.compilation.compiler.outputPath;
        }
        this.webpackOutputPath = outputPath;
        this.originalServicePath = this.serverless.config.servicePath;
        this.serverless.config.servicePath = outputPath;
        return stats;
      });
  },
};
