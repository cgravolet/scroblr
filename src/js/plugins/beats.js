(function ($) {

	var plugin = scroblr.registerHost("beats");

	plugin.hostre = /listen\.beatsmusic\.com/i;

	plugin.scrape = function () {
		var player = $("#app__transport");
		var durationElapsed = $.trim($(".horizontal_bar__handle").text()).split(" | ");
		var info = {};

		if (!player.length) {
			return false;
		}

		if (durationElapsed.length === 2) {
			info.duration = scroblr.utilities.calculateDuration(durationElapsed[1]);
			info.elapsed  = scroblr.utilities.calculateDuration(durationElapsed[0]);
		}

		info.artist   = $(".artist-track-target .artist", player).text();
		info.stopped  = $("#play_pause_icon").hasClass("icon-bicons_play");
		info.title    = $(".artist-track-target .track", player).text();

		return info;
	};
}(Zepto));
