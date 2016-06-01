module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: ['src/*.js'],
        tasks: [
          'replace',
          'uglify'
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 9001
        }
      }
    },
    uglify: {
      options: {
        banner: '/**\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("mm/dd/yyyy") %>\n' +
                ' * <%= pkg.description %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' * Licensed <%= pkg.license %>\n' +
                ' */\n',
        beautify: {
          ascii_only: true
        }
      },
      build: {
        src: 'angular-emojify.js',
        dest: 'angular-emojify.min.js'
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'dict',
              replacement: grunt.file.read('emoji-dict.json')
            },
            {
              match: 'reg',
              replacement: function() {
                var emoji, reg, reg_keys = [];

                for (emoji in grunt.file.readJSON('emoji-dict.json')) {
                  reg_keys.push(emoji);
                }

                return new RegExp('(' + reg_keys.join('|') + ')', 'g');
              }
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/angular-emojify.js',
            dest: './'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('dev', [
    'replace',
    'uglify',
    'connect',
    'watch'
  ]);

  grunt.registerTask('default', [
    'replace',
    'uglify'
  ]);
}
