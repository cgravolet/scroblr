(function ($) {

	var plugin = scroblr.registerHost("rhapsody");

	plugin.scrape = function () {
		return {
			artist:   $("#player-artist-link").text(),
			duration: scroblr.utilities.calculateDuration($("#player-total-time").text()),
			elapsed:  scroblr.utilities.calculateDuration($("#player-current-time").text()),
			stopped:  $("#player-play").css("display") === "block",
			title:    $("#player-track-link").text()
		};
	};
}(jQuery));
