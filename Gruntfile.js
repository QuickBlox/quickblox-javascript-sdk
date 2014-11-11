module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      options: {
        baseUrl: 'js',
        mainConfigFile: "js/main.js",
        name: 'main',
        optimize: 'none',
        out: "quickblox.js",
        
        paths: {
          strophe: 'lib/strophe/strophe'
        },
        
        almond: true,
        preserveLicenseComments: false
      }
    },

    uglify: {
      options: {
        banner: '/* <%= pkg.description %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      files: {
        'quickblox.min.js': ['quickblox.js']
      }
    }

  });

  grunt.registerTask('default', [
    'requirejs',
    'uglify'
  ]);
};
