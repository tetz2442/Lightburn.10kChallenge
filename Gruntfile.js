/// <binding ProjectOpened='watch' />
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            production: {
                options: {
                    banner: '/* <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */',
                    plugins: [
                        new (require('less-plugin-autoprefix'))({ browsers: ['last 2 versions', 'last 4 Android versions'] }),
                        new (require('less-plugin-clean-css'))({ advanced: true })
                    ]
                },
                files: {
                    'dist/css/global.min.css': 'css/global.less'
                }
            }
        },
        /* Deletes folders/items */
        clean: {
            src: [
                'scripts/public/compiled'
            ]
        },
        uglify: {
            production: {
                options: {
                    // remove console.* calls
                    compress: {
                        drop_console: true
                    },
                    banner: '/* <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
                },
                files: {
                    'dist/js/global.min.js': [
                        'js/global.js'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'index-critical.html'
                }
            }
        },
        critical: {
            dist: {
                options: {
                    base: './',
                    css: [
                        'dist/css/global.min.css'
                    ]
                },
                src: 'index.html',
                dest: 'index-critical.html'
            }
        },
        watch: {
            less: {
                files: ['css/*.less'],
                tasks: ['less']
            },
            uglify: {
                files: [
                    'js/**/*.js',
                    '!js/dist/*.js'
                ],
                tasks: ['uglify']
            },
            htmlmin: {
                files: ['*.html', '!index-critical.html'],
                tasks: ['critical', 'htmlmin']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-critical');

    grunt.registerTask('default', ['less', 'uglify', 'critical', 'htmlmin', 'clean']);
};