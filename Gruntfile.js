module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      options: {
        baseUrl: 'js',
        mainConfigFile: 'js/main.js',
        optimize: 'none',
        wrap: true
      },
      browser: {
        options: {
          name: 'main',
          out: 'quickblox.js',
          almond: true
        }
      },
      amd: {
        options: {
          name: 'qbMain',
          out: 'quickblox-amd.js',
          onModuleBundleComplete: function(data) {
            var file = grunt.file.read(data.path);
            grunt.file.write(data.path, file.replace("'"+data.name+"',", ''));
          }
        }
      }
    },

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
    'requirejs',
    'uglify'
  ]);
};
