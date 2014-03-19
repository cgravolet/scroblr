"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var Songza = Object.create(Plugin);

Songza.init("songza");

Songza.test = function () {
    var domainTest = this.hostre.test(document.location.hostname);
    var playerTest = $("#player").length > 0;

    return domainTest && playerTest;
};

Songza.scrape = function () {
    var info = {
        artist:  $("#player .szi-artist").text(),
        percent: parseFloat($("#player .szi-progress .szi-bar").width() / $("#player .szi-progress").width()),
        stopped: $("#player .player-play").css("display") === "none" ? false : true,
        title:   $("#player .szi-title").text()
    };

    return info;
};