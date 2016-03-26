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
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-jpm');

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		clean: ["build"],

		jshint: {
            options: {
                browser: true,
                globals: {
                    chrome: true,
                    safari: true,
                    firefox: true,
                    self: true
                },
                node: true
            },
			build: {
				src: ["src/js/**/*.js"]
			}
		},

		jpm: {
			options: {
				src: "./build/scroblr.firefox",
				xpi: "./build"
			}
		},

        browserify: {
            dev: {
                files: {
                    "build/scroblr.chrome/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.chrome/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.chrome/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.chrome/js/bundle-popup.js": ["src/js/main-popup.js"],
                    "build/scroblr.safariextension/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.safariextension/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.safariextension/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.safariextension/js/bundle-popup.js": ["src/js/main-popup.js"],
                    "build/scroblr.firefox/data/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.firefox/data/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.firefox/data/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.firefox/data/js/bundle-popup.js": ["src/js/main-popup.js"]
                },
                options: {debug: true}
            },
            release: {
                files: {
                    "build/scroblr.chrome/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.chrome/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.chrome/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.chrome/js/bundle-popup.js": ["src/js/main-popup.js"],
                    "build/scroblr.safariextension/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.safariextension/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.safariextension/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.safariextension/js/bundle-popup.js": ["src/js/main-popup.js"],
                    "build/scroblr.firefox/data/js/bundle-background.js": ["src/js/main-background.js"],
                    "build/scroblr.firefox/data/js/bundle-content-script.js": ["src/js/main-content-script.js"],
                    "build/scroblr.firefox/data/js/bundle-options.js": ["src/js/main-options.js"],
                    "build/scroblr.firefox/data/js/bundle-popup.js": ["src/js/main-popup.js"]
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
						cwd: "build/scroblr.chrome/",
						src: ["js/bundle-*.js"],
						dest: "build/scroblr.chrome/"
					}
				]
			},
			safari: {
				files: [
					{
						expand: true,
						cwd: "build/scroblr.safariextension/",
						src: ["js/bundle-*.js"],
						dest: "build/scroblr.safariextension/"
					}
				]
			},
			firefox: {
				files: [
					{
						expand: true,
						cwd: "build/scroblr.firefox/",
						src: ["data/js/bundle-*.js"],
						dest: "build/scroblr.firefox/"
					}
				]
			}
		},

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
			},
			firefox: {
				files: [
					{
						expand: true,
						cwd: "src/",
						src: ["css/*.css", "*.html", "img/**", "js/*.json", "js/bundle-*.js", "js/firefox/*.js", "manifest.json"],
						dest: "build/scroblr.firefox/data"
					}
				]
			}
		},

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
		},

        watch: {
            files: ["src/js/**/*.js", "src/css/**/*.css"],
            tasks: ["compile"]
        }
	});

	// Custom tasks
	grunt.registerTask("getmanifest", function () {
		var manifest = require("./src/manifest.json");

        manifest.version = pjson.version;
		fs.writeFileSync("./build/scroblr.chrome/manifest.json",
                JSON.stringify(manifest, null, 2));
	});

	grunt.registerTask("getplist", function () {
		var doc = plist.parseFileSync("./src/Info.plist");

        doc.CFBundleShortVersionString = pjson.version;
        doc.CFBundleVersion = pjson.version;
		doc = plist.build(doc);
		doc = doc.replace(/<(\/)?integer>/g, "<$1real>");
		doc = doc.replace(/>\s+<\//g, "><\/");
		fs.writeFileSync("./build/scroblr.safariextension/Info.plist", doc);
	});

	// Copy modified package.json to Firefox addon folder
	grunt.registerTask("getpackage", function() {
		var pkg = require("./package.json");

		pkg['main'] = 'data/js/firefox/main.js';
		pkg['id'] = "scroblr@scroblr.fm";
		pkg['private'] = false;
		pkg['engines'] = {
			"firefox": ">=38.0a1"
		};
		pkg['permissions'] = {
			"cross-domain-content": ["http://www.last.fm"]
		};

		fs.writeFileSync("./build/scroblr.firefox/package.json",
                JSON.stringify(pkg, null, 2));
	});

    grunt.registerTask("build", ["clean", "jshint", "browserify:dev", "copy",
            "getmanifest", "getplist", "getpackage", "jpm:xpi"]);

    grunt.registerTask("release", ["clean", "jshint", "browserify:release",
            "uglify", "copy", "getmanifest", "getplist", "getpackage", 
            "compress", "jpm:xpi"]);

    grunt.registerTask("compile", ["jshint", "browserify:dev", "copy"]);

    grunt.registerTask("default", ["build"]);
};
