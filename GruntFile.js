module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Cleaning
		clean: ['build'],

		// Concatenation
		concat: {
			options: {
				separator: ';'
			},
			build: {
				src: [
					'src/js/lib/zepto.js',
					'src/js/scroblr-injection.js',
					'src/js/plugins/*.js',
					'src/js/scroblr-injection-init.js'
				],
				dest: 'build/<%= pkg.name %>.chrome/js/<%= pkg.name %>.js'
			}
		},

		// JS Minification
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: ['js/**/*.js','!js/scroblr*.js','!js/plugins/*.js'],
						dest: 'build/<%= pkg.name %>.chrome/'
					},
					{
						src: 'build/<%= pkg.name %>.chrome/js/<%= pkg.name %>.js',
						dest: 'build/<%= pkg.name %>.chrome/js/<%= pkg.name %>.js'
					}
				]
			}
		},

		// File copying
		copy: {
			build: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: ['js/lib/*.js','css/*.css','*.html','img/**/*'],
						dest: 'build/<%= pkg.name %>.chrome/'
					}
				]
			},
			safari: {
				files: [
					{
						expand: true,
						cwd: 'build/<%= pkg.name %>.chrome/',
						src: ['**/*'],
						dest: 'build/<%= pkg.name %>.safariextension/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['*.plist','*.png'],
						dest: 'build/<%= pkg.name %>.safariextension/'
					}
				]
			},
			chrome: {
				src: 'src/manifest.json',
				dest: 'build/<%= pkg.name %>.chrome/manifest.json'
			}
		},

		// Compression
		compress: {
			chrome: {
				options: {
					archive: 'build/<%= pkg.name %>.chrome.zip'
				},
				files: [
					{
						expand: true,
						cwd: 'build/<%= pkg.name %>.chrome/',
						src: ['**']
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['clean','concat','uglify','copy','compress']);

};
