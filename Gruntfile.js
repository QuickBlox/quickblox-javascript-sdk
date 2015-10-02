module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      options: {
        banner: '/* <%= pkg.description %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        ignore: ['request'],
        browserifyOptions: {
          standalone: 'QB'
        }
      },
      all: {
        files: {
          'quickblox.js': ['js/qbMain.js']
        }
      }
    },

    uglify: {
      options: {
        banner: '/* <%= pkg.description %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      all: {
        files: {
          'quickblox.min.js': ['quickblox.js']
        }
      }
    },

    watch: {
      files: ['js/*.js', 'js/modules/*.js'],
      tasks: ['browserify', 'uglify']
    },

    connect: {
      server: {
        options: {
          // protocol: 'https',
          hostname: 'localhost',
          port: 8080,
          open: true,
          keepalive: true
        }
      }
    }

  });

  grunt.registerTask('default', [
    'browserify',
    'uglify'
  ]);

  grunt.registerTask('server', [
    'connect'
  ]);

  grunt.loadNpmTasks('grunt-contrib-watch');
};
