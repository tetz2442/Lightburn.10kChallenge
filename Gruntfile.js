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
                    'c/g.min.css': 'src/css/global.less'
                }
            }
        },
        /* Deletes folders/items */
        clean: {
            src: [
                'src'
            ]
        },
        uglify: {
            production: {
                options: {
                    // remove console.* calls
                    compress: {
                        drop_console: true
                    },
                    sourceMap: true
                },
                files: {
                    'j/g.min.js': [
                        'src/js/global.js'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true
                },
                files: {
                    'index.html': 'src/index.html'
                }
            }
        },
        svgmin: {
            options: {
                plugins: [
                    {
                        removeViewBox: false
                    }
                ]
            },
            dist: {
                files: {
                    's/cl.svg': 'src/svgs/cloud.svg',
                    's/cl2.svg': 'src/svgs/cloud2.svg',
                    's/r.svg': 'src/svgs/rocket.svg',
                    's/c-m.svg': 'src/svgs/command-module.svg',
                    's/c-a-l-m.svg': 'src/svgs/command-and-lunar-module.svg',
                    's/l-m.svg': 'src/svgs/lunar-module.svg',
                    's/c-l-m.svg': 'src/svgs/command-large-module.svg',
                    's/fl.svg': 'src/svgs/flag.svg'
                }
            }
        },
        watch: {
            less: {
                files: ['src/css/*.less'],
                tasks: ['less']
            },
            uglify: {
                files: [
                    'src/js/**/*.js'
                ],
                tasks: ['uglify']
            },
            htmlmin: {
                files: ['src/*.html'],
                tasks: ['htmlmin']
            },
            svgmin: {
                files: ['src/svgs/*.svg'],
                tasks: ['svgmin']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-svgmin');

    grunt.registerTask('default', ['less', 'uglify', 'svgmin', 'htmlmin']);
    grunt.registerTask('prod', ['clean']);
};