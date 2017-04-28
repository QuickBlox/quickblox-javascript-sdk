module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'quickblox.min.js',
      'spec/config.js',
      'spec/QB-HelpersSpec.js',
      'spec/QB-ChatSpec.js',
      "spec/QB-CoreSpec.js",
      "spec/QB-UsersSpec.js",
      "spec/QB-ContentSpec.js",
      "spec/QB-DataSpec.js",
      "spec/QB-PushnotificationsSpec.js",
      "spec/QB-WebRTCSpec.js"
    ],
    browsers: ['PhantomJS'],
    singleRun: true,
    reporters: ['progress', 'coverage'],
    preprocessors: { '*.js': ['coverage'] }
  });
};
