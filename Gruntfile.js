module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    notify: {
      browserify: {
        options: {
          message: '"Browserify task is done "'
        }
      },
      uglify: {
        options: {
          message: '"Uglify task is done"'
        }
      }
    },
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
      files: ['js/*.js', 'js/modules/*.js', 'js/modules/webrtc/*.js'],
      tasks: ['browserify', 'notify:browserify', 'uglify', 'notify:uglify'],
      options: {
        spawn: false,
        debounceDelay: 250,
        livereload: true
      }
    },
    connect: {
      server: {
        options: {
          protocol: 'https',
          hostname: 'localhost',
          port: 8080,
          open: true,
          keepalive: true
        }
      }
    },
    parallel: {
      assets: {
        options: {
          grunt: true
        },
        tasks: ['watch', 'connect']
      }
    },
    jasmine : {
      test: {
        src: 'quickblox.min.js',
        options: {
          vendor: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
          helpers: 'spec/config.js',
          specs: [
            'spec/QB-CoreSpec.js',
            'spec/QB-HelpersSpec.js',
            // 'spec/QB-ChatSpec.js'
          ],
          keepRunner: true,
          summary: true
        }
      }
    }
  });

  grunt.registerTask('default', [
    'browserify',
    'uglify'
  ]);
  grunt.registerTask('server', ['connect']);
  grunt.registerTask('develop', ['parallel']);

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-parallel');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
