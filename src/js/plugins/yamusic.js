"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var yamusic = Object.create(Plugin);

yamusic.init("yamusic", "Yandex Music");

yamusic.test = function() {
    return (/music\.yandex\.ru/i).test(document.location.href);
};

yamusic.scrape = function() {
    return {
        title:    $(".player-controls .track__title").text(),
        artist:   $(".player-controls .track__artists a").first().text(),
        duration: Utils.calculateDuration($(".progress__text progress__right").text() || ""),
        elapsed:  Utils.calculateDuration($(".progress__text progress__right").text() || ""),
        stopped:  $(".player-controls__btn_play").hasClass("player-controls__btn_pause"),
    };
};

module.exports = yamusic;
