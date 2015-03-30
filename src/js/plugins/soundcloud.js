"use strict";

var $          = require("jquery");
var Plugin     = require("../modules/Plugin");
var Utils      = require("../modules/Utilities");
var soundcloud = Object.create(Plugin);

/* allows us to clean arrays of specified values */
Array.prototype.clean = function(deleteValues) {
    for (var i = deleteValues.length - 1; i >= 0; i--) {
        for (var j = 0; j < this.length; j++) {
            if (this[j] === deleteValues[i]) {
                this.splice(j, 1);
                j--;
            }
        }
    }
    return this;
};

function getTrackDetails(player, trackTitleClass) {
    return player.find(trackTitleClass).text().trim().split(/-(.+)?/);
}

function setInfo(compactArr, info) {
    /* we are unsure what to use for a an artist and title values so we clean the array of empty and undefined values
       and pick the last item in an array as a title since this is normally how it goes */
    compactArr = compactArr.clean(["",undefined]);

    info.artist   = compactArr[compactArr.length-2];
    info.title    = compactArr[compactArr.length-1];

    return info;
}

soundcloud.init("soundcloud", "SoundCloud");

soundcloud.scrape = function () {
    var info, player, playing, soundcloudNext, compactArr, trackTitleClass, metaContent, isSet;

    soundcloudNext = !!$("body > #app").length;

    if (soundcloudNext) {
        playing = $(".sc-button-play.sc-button-pause").not(".sc-button-medium").last();
        info = {
            stopped: !playing.length
        };

        if (!info.stopped) {
            if (playing.parents(".streamContext").length && playing.parents(".playlist").length) {  /* see if track is in a playlist */
                player        = playing.parents(".playlist").find(".active");
                compactArr    = getTrackDetails(player, ".compactTrackListItem__content");

                if (compactArr.length > 1) { /* see if this is a reposted playlist*/
                    info = setInfo(compactArr, info);
                } else {
                    // the title only contains one value so the track is by a repostee and the title is the title of the track
                    info.artist   = player.parents(".soundList__item").find(".soundTitle__username").text();
                    info.title    = (player.find(".compactTrackListItem__trackTitle").length > 0) ? player.find(".compactTrackListItem__trackTitle").text() : compactArr[0];
                }

            } else { /* track is not in a playlist */
                player = playing.parents(playing.parents(".sound").length ? ".sound" : ".trackList__item");
                metaContent = $("meta[property='og:type']");
                isSet = metaContent.length && (metaContent.attr("content") === "soundcloud:set");

                if (isSet) { /* see if track is being played from a set */
                    trackTitleClass = ".trackItem__trackTitle";
                } else {
                    trackTitleClass = ".soundTitle__title";
                }
                compactArr = getTrackDetails(player, trackTitleClass);

                if (player.find(".soundTitle").find(".sc-ministats-reposts").length) { /* see if this is a reposted track */
                    if (compactArr.length > 1) {
                        info = setInfo(compactArr, info);
                    } else {
                        // only one value in the repost title, so this is definitely the title of the song
                        // artist name is contained elsewhere
                        info.artist   = player.find(".soundTitle__username").text();
                        info.title    = compactArr[0];
                    }
                } else { /* just an regular track posted by the artist */
                    /* sometimes an artist will put his name in the title of the song which is unnecessary. we must
                        account for this here or else we will get the wrong track title */
                    if (compactArr.length > 1) {
                        info = setInfo(compactArr, info);
                    } else {
                        info.artist   = player.find(".soundTitle__username").text() || $(".soundTitle__username")[0].text;
                        info.title    = player.find(".soundTitle__title").text() || compactArr[0];
                    }
                }
            }
            info.elapsed = Utils.calculateDuration($(".playbackTimeline__timePassed").text());
            info.duration = Utils.calculateDuration($(".playbackTimeline__duration").text());
        }
    } else {
        playing = $(".play.playing");
        info = {
            stopped: !playing.length
        };

        if (!info.stopped) {
            player        = playing.parents("div.player");
            info.artist   = player.find(".user-name").text();
            info.title    = player.find("h3 a").text();
        }
    }

    return info;
};

module.exports = soundcloud;