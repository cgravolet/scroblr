"use strict";

module.exports = function (grunt) {
	var fs    = require("fs");
	var plist = require("plist");
    var pjson = require("./package.json");

    // npm tasks
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		clean: ["build"],

		jshint: {
            options: {node: true},
			build: {
				src: ["src/js/**/*.js", "!src/js/lib/**/*.js"]
			}
		},

        browserify: {
            dev: {
                files: {
                    "build/scroblr.chrome/js/bundle-access-granted.js": ["src/js/main-access-granted.js"],
                    "build/scroblr.chrome/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.chrome/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.chrome/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.chrome/js/bundle-popup.js": ["src/js/main-popup.js"],
                    "build/scroblr.safariextension/js/bundle-access-granted.js": ["src/js/main-access-granted.js"],
                    "build/scroblr.safariextension/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.safariextension/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.safariextension/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.safariextension/js/bundle-popup.js": ["src/js/main-popup.js"]
                },
                options: {debug: true}
            },
            release: {
                files: {
                    "build/scroblr.chrome/js/bundle-access-granted.js": ["src/js/main-access-granted.js"],
                    "build/scroblr.chrome/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.chrome/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.chrome/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.chrome/js/bundle-popup.js": ["src/js/main-popup.js"],
                    "build/scroblr.safariextension/js/bundle-access-granted.js": ["src/js/main-access-granted.js"],
                    "build/scroblr.safariextension/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.safariextension/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.safariextension/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.safariextension/js/bundle-popup.js": ["src/js/main-popup.js"]
                },
                options: {debug: false}
            }
        },

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			chrome: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["js/bundle-*.js"],
						dest: "build/scroblr.chrome/"
					}
				]
			},
			safari: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["js/bundle-*.js"],
						dest: "build/scroblr.safariextension/"
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
						src: ["_locales/**/*.json","css/*.css","*.html","img/**/*"],
						dest: "build/scroblr.chrome/"
					}
				]
			},
			safari: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["css/*.css","*.html","img/**/*"],
						dest: "build/scroblr.safariextension/"
					},
					{
						src: "src/icon-48.png",
						dest: "build/scroblr.safariextension/icon-48.png"
					}
				]
			}
		},

		// Compression
		compress: {
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
	});

	// Custom tasks
	grunt.registerTask("getmanifest", function () {
		var manifest = require("./src/manifest.json");

		manifest.content_scripts[0].js = ["js/scroblr.js"];
        manifest.version = pjson.version;
		fs.writeFileSync("./build/scroblr.chrome/manifest.json", JSON.stringify(manifest, null, 2));
	});

	grunt.registerTask("getplist", function () {
		var doc = plist.parseFileSync("./src/Info.plist");

		doc.Content.Scripts.End = ["js/scroblr.js"];
        doc.CFBundleShortVersionString = pjson.version;
        doc.CFBundleVersion = pjson.version;
		doc = plist.build(doc);
		doc = doc.replace(/<(\/)?integer>/g, "<$1real>");
		doc = doc.replace(/>\s+<\//g, "><\/");
		fs.writeFileSync("./build/scroblr.safariextension/Info.plist", doc);
	});

    grunt.registerTask("build", ["clean", "jshint", "browserify:dev", "uglify",
        "copy", "getmanifest", "getplist"]);

    grunt.registerTask("release", ["clean", "jshint", "browserify:release", "uglify",
        "copy", "getmanifest", "getplist", "compress"]);
};
