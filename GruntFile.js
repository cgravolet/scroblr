module.exports = function(grunt) {
	"use strict";

	var fs, plist;

	fs    = require("fs");
	plist = require("plist");

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		// Cleaning
		clean: ["build"],

		// Lint
		jshint: {
			build: {
				src: ["src/js/**/*.js", "!src/js/lib/**/*.js"]
			}
		},

		// Concatenation
		concat: {
			options: {
				separator: ";"
			},
			chrome: {
				src: [
					"src/js/lib/zepto.js",
					"src/js/scroblr-injection.js",
					"src/js/plugins/*.js",
					"src/js/scroblr-injection-init.js"
				],
				dest: "build/scroblr.chrome/js/scroblr.js"
			},
			safari: {
				src: [
					"src/js/lib/zepto.js",
					"src/js/scroblr-injection.js",
					"src/js/plugins/*.js",
					"src/js/scroblr-injection-init.js"
				],
				dest: "build/scroblr.safariextension/js/scroblr.js"
			}
		},

		// JS Minification
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			chrome: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["js/**/*.js","!js/scroblr*.js","!js/plugins/*.js"],
						dest: "build/scroblr.chrome/"
					},
					{
						src: "build/scroblr.chrome/js/scroblr.js",
						dest: "build/scroblr.chrome/js/scroblr.js"
					}
				]
			},
			safari: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["js/**/*.js","!js/scroblr*.js","!js/plugins/*.js"],
						dest: "build/scroblr.safariextension/"
					},
					{
						src: "build/scroblr.safariextension/js/scroblr.js",
						dest: "build/scroblr.safariextension/js/scroblr.js"
					}
				]
			}
		},

		// File copying
		copy: {
			chrome: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["_locales/**/*.json","js/lib/*.js","css/*.css","*.html","img/**/*"],
						dest: "build/scroblr.chrome/"
					}
				]
			},
			safari: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["js/lib/*.js","css/*.css","*.html","img/**/*"],
						dest: "build/scroblr.safariextension/"
					},
					{
						src: "src/icon-48.png",
						dest: "build/scroblr.safariextension/icon-48.png"
					}
				]
			},
			developer: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["js/*.js","js/plugins/*.js","manifest.json"],
						dest: "build/scroblr.chrome/"
					},
					{
						expand: true,
						cwd: "src/",
						src: ["js/*.js","js/plugins/*.js","*.plist"],
						dest: "build/scroblr.safariextension/"
					}
				]
			}
		},

		// Compression
		compress: {
			chrome: {
				options: {
					archive: "build/scroblr.chrome.zip"
				},
				files: [
					{
						expand: true,
						cwd: "build/scroblr.chrome/",
						src: ["**"]
					}
				]
			}
		}
	});

	// Custom tasks
	grunt.registerTask("getmanifest", function () {
		var manifest = require("./src/manifest.json");

		manifest.content_scripts[0].js = ["js/scroblr.js"];
		fs.writeFileSync("./build/scroblr.chrome/manifest.json", JSON.stringify(manifest, null, 2));
	});

	grunt.registerTask("getplist", function () {
		var doc = plist.parseFileSync("./src/Info.plist");

		doc.Content.Scripts.End = ["js/scroblr.js"];
		doc = plist.build(doc);
		doc = doc.replace(/<(\/)?integer>/g, "<$1real>");
		doc = doc.replace(/>\s+<\//g, "><\/");
		fs.writeFileSync("./build/scroblr.safariextension/Info.plist", doc);
	});

	// npm tasks
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Default task(s).
	grunt.registerTask("default", ["clean", "jshint", "concat", "uglify",
			"copy:chrome", "copy:safari", "getmanifest", "getplist", "compress"]);

	grunt.registerTask("developer", ["clean", "jshint", "concat", "copy"]);

};
