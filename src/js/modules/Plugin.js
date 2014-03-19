"use strict";

var Plugin = {

    /**
     * Initialization method.
     *
     * @param {String} name
     */
    init: function (name, hostregex) {
        this.hostre = hostregex || new RegExp(name + "\\.com", "i");
        this.name   = name;
    },

    /**
     *Tests whether the plugin should be active or not.
     *
     * @returns {Boolean}
     */
    test: function () {
        return this.hostre.test(document.location.hostname);
    }
};

module.exports = Plugin;