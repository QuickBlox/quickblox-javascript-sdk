module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    

    uglify: {
      all: {
        options: {
          banner: '/* <%= pkg.description %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: {
          'quickblox.min.js': ['quickblox.js']
        }
      }
    }

  });

  grunt.registerTask('default', [
    'uglify'
  ]);
};
