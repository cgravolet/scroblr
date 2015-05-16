"use strict";

var $       = require("jquery");
var conf    = require("../conf.json");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var abacast = Object.create(Plugin).init("abacast", "Abacast");

abacast.test = function () {
    var test = (/player\.abacast\.net/i).test(document.location.href);
    return test;
};

abacast.scrape = function () {
    var info = {
        artist:   $(".current-artist").text(),
        title:    $(".current-track").text(),
        stopped:  !$("body").hasClass("is-playing")
    };

    if (conf.DEBUG) {
        console.debug("abacast.scrape", info);
    }

    return info;
};

module.exports = abacast;

