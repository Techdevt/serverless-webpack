'use strict';
process.env.NODE_ENV = 'production';
const BbPromise = require('bluebird');
const path = require('path');
const fse = require('fs-extra');

function configureOutput(config) {
  if (config.output) return config;
  const outputPath = path.join(this.serverless.config.servicePath, '.webpack');
  const outputFilename = path.basename(
    Array.isArray(config.entry) ? config.entry[config.entry.length - 1] : config.entry
  ) || 'handler.js';
  config.output = {
    libraryTarget: 'commonjs',
    path: outputPath,
    filename: outputFilename,
  };
  return config;
}

module.exports = {
  validate() {
    this.webpackConfig = (
      this.serverless.service.custom &&
      this.serverless.service.custom.webpack ||
      'webpack.config.js'
    );

    if (typeof this.webpackConfig === 'string') {
      const webpackConfigFilePath = path.join(this.serverless.config.servicePath, this.webpackConfig);
      if (!this.serverless.utils.fileExistsSync(webpackConfigFilePath)) {
        throw new this.serverless.classes
          .Error('The webpack plugin could not find the configuration file at: ' + webpackConfigFilePath);
      }
      this.webpackConfig = require(webpackConfigFilePath);
    }

    // Default context
    if (!this.webpackConfig.context) {
      this.webpackConfig.context = this.serverless.config.servicePath;
    }

    // Default output
    if (!Array.isArray(this.webpackConfig)) this.webpackConfig = [this.webpackConfig];
    let configs = Array.prototype.slice.call(this.webpackConfig);
    configs = configs.map(config => configureOutput.call(this, config));

    // Custom output path
    if (this.options.out) {
      configs = configs.map(config => {
        config.output.path = path.join(this.serverless.config.servicePath, this.options.out)
      });
    }

    // remove existing files at output
    configs.forEach(config => fse.removeSync(config.output.path));

    return BbPromise.resolve();
  },
};
