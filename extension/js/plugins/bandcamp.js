(function ($) {

	var plugin = scroblr.registerHost("bandcamp");

	plugin.scrape = function () {
		var discover, info, isTrack, pageTitle;

		discover = window.location.pathname.slice(1) === "discover";
		info = {
			stopped: !$(".inline_player .playbutton").hasClass("playing")
		}

		if (!info.stopped) {
			if (discover) {
				info.artist = $("#detail_body_container .itemsubtext a").text();
			} else {
				info.artist = $("span[itemprop=byArtist]").text();
			}
			info.title    = $(".track_info .title").first().text();
			info.duration = scroblr.utilities.calculateDuration($(".inline_player .track_info .time_total").text());
			info.elapsed  = scroblr.utilities.calculateDuration($(".inline_player .track_info .time_elapsed").text());

			if (!info.title) {
				info.title = $(".trackTitle").first().text();
			}
		}

		return info;
	};
}(jQuery));
