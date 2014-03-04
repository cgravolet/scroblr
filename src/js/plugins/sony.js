(function ($) {

	var plugin = scroblr.registerHost("sony");

	plugin.hostre = /music\.sonyentertainmentnetwork\.com/i;

	plugin.test = function () {
		var domainTest, pathnameTest;

		domainTest = this.hostre.test(document.location.hostname);
		pathnameTest = !/\.html$/.test(document.location.pathname);
		return domainTest && pathnameTest;
	};

	plugin.scrape = function () {
		if ($(".GEKKVSQBLV").length === 0) {
			// Player has not been rendered yet
			return {stopped: true};
		}
		var xy = $("#PlayerPlayPause").css("background-position");
		// Paused: "-433px -25px" or "-387px -62px"
		// Playing: "-479px -25px" or "-433px -62px"
		var stopped = xy === "-433px -25px" || xy === "-387px -62px";
		var elapsed = $("#PlayerPosition").text();
		if (stopped && elapsed === "0:00") {
			// No track has started yet
			return {stopped: true};
		}

		return {
			artist: $(".GEKKVSQBCY .gwt-InlineLabel").text(),
			elapsed: scroblr.utilities.calculateDuration(elapsed),
			duration: scroblr.utilities.calculateDuration($("#PlayerDuration").text()),
			stopped: stopped,
			album: $(".GEKKVSQBH- .gwt-InlineLabel").text(),
			title: $(".GEKKVSQBP- .gwt-InlineLabel").text()
		};
	};
}(Zepto));
