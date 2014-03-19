"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var songza = Object.create(Plugin);

songza.init("songza");

songza.test = function () {
    var domainTest = this.hostre.test(document.location.hostname);
    var playerTest = $("#player").length > 0;

    return domainTest && playerTest;
};

songza.scrape = function () {
    var info = {
        artist:  $("#player .szi-artist").text(),
        percent: parseFloat($("#player .szi-progress .szi-bar").width() / $("#player .szi-progress").width()),
        stopped: $("#player .player-play").css("display") === "none" ? false : true,
        title:   $("#player .szi-title").text()
    };

    return info;
};

module.exports = songza;