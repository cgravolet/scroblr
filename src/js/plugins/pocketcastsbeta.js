"use strict";

var Plugin      = require("../modules/Plugin"),
    Utils       = require("../modules/Utilities"),
    pocketcastsbeta = Object.create(Plugin);

pocketcastsbeta.init("pocketcastsbeta", "Pocket Casts Beta", new RegExp("playbeta\\.pocketcasts\\.com", "i"));

pocketcastsbeta.scrape = function () {
    var elapsed = Utils.calculateDuration(document.getElementsByClassName('current-time')[0].innerText),
        remaining = Utils.calculateDuration(document.getElementsByClassName('time-remaining')[0].innerText),
        percent = elapsed / (elapsed - remaining);

	var state = {
		artist:   document.getElementsByClassName('podcast-title')[0].innerText,
		title:    document.getElementsByClassName('episode-title')[0].innerText,
		elapsed:  elapsed,
		duration: (elapsed - remaining),
		percent:  percent,
		stopped:  document.getElementsByClassName('pause_button').length === 0
	};

	return state;
};

module.exports = pocketcastsbeta;
