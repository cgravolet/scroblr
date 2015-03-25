"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var Utils       = require("../modules/Utilities");
var thedrop = Object.create(Plugin);

thedrop.init("thedrop", "The Drop", new RegExp("thedrop\\.club", "i"));

thedrop.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $(".music-player").css("display") === "block";
    return domainMatch && playerFound;
};

thedrop.scrape = function () {
    var info =  {
        artist:   $(".playing-artist").text(),
        title:    $(".playing-title").text(),
        stopped:  $(".audio-scrobbler .pause-button").css("display") === "block",
        percent:  parseFloat($(".elapsed-bar").width() / $(".audio-scrubber").width())
    };
    return info;
};

module.exports = thedrop;
