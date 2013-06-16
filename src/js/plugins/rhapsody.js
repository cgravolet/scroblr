(function ($) {

	var plugin = scroblr.registerHost("rhapsody");

	plugin.test = function () {
		var napster  = /napster\.[A-Z\.]{2,}/i.test(document.location.hostname);
		var rhapsody = /rhapsody\.com/i.test(document.location.hostname);
		return (rhapsody || napster);
	};

	plugin.scrape = function () {
		return {
			artist:   $("#player-artist-link").text(),
			duration: scroblr.utilities.calculateDuration($("#player-total-time").text()),
			elapsed:  scroblr.utilities.calculateDuration($("#player-current-time").text()),
			stopped:  $("#player-play").css("display") === "block",
			title:    $("#player-track-link").text()
		};
	};
}(Zepto));
