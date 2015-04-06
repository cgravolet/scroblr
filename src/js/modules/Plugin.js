"use strict";

var Plugin = {

    /**
     * Initialization method.
     *
     * @param {String} name
     * @param {String} displayName
     * @param {RegExp} hostregex
     */
    init: function (name, displayName, hostregex) {
        this.displayName = displayName;
        this.hostre      = hostregex || new RegExp(name + "\\.com", "i");
        this.name        = name;

        return this;
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
