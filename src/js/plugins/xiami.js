"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var xiami = Object.create(Plugin);

xiami.init("xiami", "Xiami");

xiami.test = function () {
    return (/www\.xiami\.com\/play/i).test(document.location.href);
};

xiami.scrape = function () {
    return {
        artist:   $('#J_trackName + a').text(),
        duration: Utils.calculateDuration($('#J_durationTime').text() || ""),
        elapsed:  Utils.calculateDuration($('#J_positionTime').text() || ""),
        title:    $('#J_trackName').text(),
        album:    $('.ui-track-current .c3 a').text(),
        stopped:  !$('#J_playBtn').hasClass('pause-btn')
    };
};

module.exports = xiami;
