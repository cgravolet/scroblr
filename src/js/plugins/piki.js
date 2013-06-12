(function ($) {

	var plugin = scroblr.registerHost("piki");

	plugin.hostre = new RegExp("piki\\.fm", "i");
	plugin.scrape = function () {
		return {
			artist: $(".song-info .artist-name").text(),
			duration: scroblr.utilities.calculateDuration($(".song-progress .song-time-past").text(), $(".song-progress .song-time-left").text()),
			elapsed: scroblr.utilities.calculateDuration($(".song-progress .song-time-past").text()),
			stopped: $(".navbar-player-controls .btn-player-pause").css("display") === "none",
			title: $(".song-info .song-name").text()
		};
	};
}(Zepto));
