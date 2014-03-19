"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var focusatwill = Object.create(Plugin);

focusatwill.init("focusatwill", "Focus@Will");

focusatwill.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#home-body .trackDetail").length > 0;

    return domainMatch && playerFound;
};

focusatwill.scrape = function () {
    var $body   = $("#home-body");
    var $header = $("#home-header");

    return {
        artist:  $(".trackDetail .artist", $body).text().split(":")[1],
        stopped: $(".playerControls .play", $header).data("player-state") === "stopped",
        title:   $(".trackDetail .track", $body).text()
    };
};

module.exports = focusatwill;
