module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    sass: {
      options: {
        sourceMap: true,
        outputStyle: 'minified',
        sourceComments: true,
      },
      dist: {
        files: {
          'css/style.css': 'scss/style.scss'
        }
      }
    },
    // Run this beauty (grunt watch) to automatically compile you scss files everytime you save
    watch: {
      scripts: {
        files: 'scss/*.scss',
        tasks: ['sass'],
      }
    },
  });

  grunt.registerTask('default', ['sass']);
};