"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var somafm = Object.create(Plugin);

somafm.init("somafm", "SomaFM");

somafm.test = function () {	
	return document.location.href.indexOf("somafm.com/player/#/now-playing") >= 0;
};

somafm.scrape = function () {
	var info = {
		artist: $("p.ng-binding").eq(2).text(),
		title:  $("p.ng-binding").eq(3).text()
	};

	return info;
};

module.exports = somafm;