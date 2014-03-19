"use strict";

var $ = require("jquery");

var Track = {

    /**
     * Initialization method.
     *
     * @param {Object} params
     */
    init: function (params, host, hostid) {
        $.extend(this, params || {});

        this.host   = host;
        this.hostid = hostid;

        if (this.hasOwnProperty("album") && this.album !== null) {
            this.album = $.trim(this.album);
        }

        if (this.hasOwnProperty("artist") && this.artist !== null) {
            this.artist = $.trim(this.artist);
        }

        if (this.hasOwnProperty("title") && this.title !== null) {
            this.title = $.trim(this.title);
        }

        this.dateTime = (new Date()).valueOf();
    },

    /**
     * Returns a string representation of the Track object.
     * Usually "artist - title".
     *
     * @returns {String}
     */
    toString: function () {

        if (this.artist && this.title) {
            return this.artist + " - " + this.title;
        } else if (this.title && this.host === "youtube") {
            return this.title;
        } else {
            return "";
        }
    }
};

module.exports = Track;