(function ($) {

	var plugin = scroblr.registerHost("turntable");

	plugin.hostre = new RegExp("turntable\\.fm", "i");
	plugin.scrape = function () {
		var info = {};

		if ($("#songboard-artist").text().length) {
			info.artist   = $("#song-log-panel .song:first-child .details").text().split(" - ");
			info.duration = scroblr.utilities.calculateDuration(info.artist.pop());
			info.artist   = info.artist.join(" - ");
			info.score    = parseFloat($("#song-log-panel .song:first-child .score").text().replace(/[^0-9]+/g, ""));
			info.title    = $("#song-log-panel .song:first-child .title").text();
		}

		return info;
	};
}(Zepto));
