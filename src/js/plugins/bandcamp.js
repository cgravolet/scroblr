"use strict";

var $        = require("jquery");
var Plugin   = require("../modules/Plugin");
var Utils    = require("../modules/Utilities");
var bandcamp = Object.create(Plugin);

bandcamp.init("bandcamp", "Bandcamp");

bandcamp.scrape = function () {
    var discover = window.location.pathname.split("/")[1] === "discover";
    var isAlbum  = window.location.pathname.split("/")[1] === "album";
    var isTrack  = window.location.pathname.split("/")[1] === "track";

    var info = {
        stopped: !$(".inline_player .playbutton").hasClass("playing")
    };

    if (!info.stopped) {

        if (discover) {
            info.artist = $("#detail_body_container .itemsubtext a").text();
        } else {
            info.artist = $("span[itemprop=byArtist]").text();
        }

        if (isTrack) {
            info.album = $("#name-section h3 span a span").text();
        } else if (isAlbum) {
            info.album = $("#name-section > h2").text().trim();
        } else if (discover) {
            info.album = $("div.itemtext a").filter(function (i, e) {
              return e.href.match(/album/);
            }).text().trim();
        }

        info.title    = $(".track_info .title").first().text();
        info.duration = Utils.calculateDuration($(".inline_player .track_info .time_total").text());
        info.elapsed  = Utils.calculateDuration($(".inline_player .track_info .time_elapsed").text());

        if (!info.title) {
            info.title = $(".trackTitle").first().text();
        }
    }

    return info;
};

module.exports = bandcamp;

