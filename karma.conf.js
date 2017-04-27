module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'quickblox.min.js',
      'spec/config.js',
      'spec/QB-HelpersSpec.js',
      'spec/QB-ChatSpec.js'
    ],
    browsers: ['PhantomJS'],
    singleRun: true,
    reporters: ['progress', 'coverage'],
    preprocessors: { '*.js': ['coverage'] }
  });
};
