(function ($) {

	var plugin = scroblr.registerHost("google");

	plugin.test = function () {
		return (/play\.google\.[A-Z\.]{2,}\/music\/listen/i).test(document.location.href);
	};

	plugin.scrape = function () {
		return {
			album: $(".player-album").text(),
			artist: $("#player-artist").text(),
			duration: scroblr.utilities.calculateDuration($("#duration").text()),
			title: $("#playerSongTitle .fade-out-content").text(),
			stopped: ($("#playPause").attr("title") == "Play")
		};
	};
}(Zepto));
