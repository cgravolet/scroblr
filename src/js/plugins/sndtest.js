"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var sndtst = Object.create(Plugin);

function _playerStatusReader() {
    var el = $("#jplayer_1"), d = el.data(), status = {};
    if (d.jPlayer) {
        status = {
            title:       d.jPlayer.status.media.title,
            duration:    d.jPlayer.status.duration,
            currentTime: d.jPlayer.status.currentTime,
            paused:      d.jPlayer.status.paused
        };
    }
    el.attr("__status", JSON.stringify(status));
}
function inject(code) {
    var script = document.createElement("script");
    script.appendChild(document.createTextNode(code));
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
}
function parseStatus() {
    var jsonStr = $("#jplayer_1").attr("__status");
    return jsonStr ? JSON.parse(jsonStr) : {};
}

sndtst.init("sndtst", "SNDTST");
sndtst.initialize = function() {
    inject(_playerStatusReader.toString() + "; _playerStatusReader();");
};

sndtst.scrape = function () {
    inject("_playerStatusReader();");
    var status = parseStatus();
    if (status.paused) return { artist: null, title: null };

    // song page has title quoted, so trim quotes
    var game = $("h1").text().replace(/(^\"|\"$)/g, ""),
        platform = $("h3 small").text().replace("Platform: ", "");
    // song page lists song name in "h1", and game name in "h2 > a"
    if (game == status.title) game = $("h2 > a").text();
    return {
        artist:   platform + " - " + game,
        album:    game,
        duration: status.duration * 1000,
        elapsed:  status.currentTime * 1000,
        stopped:  status.paused,
        title:    status.title
    };
};

module.exports = sndtst;
