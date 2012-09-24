(function ($) {

	var plugin = scroblr.registerHost("soundcloud");

	plugin.scrape = function () {
		var info, player, playing, soundcloudNext;

		soundcloudNext = !!$("body > #app").length;

		if (soundcloudNext) {
			playing = $(".sc-button-play.sc-button-pause"),
			info = {
				stopped: !playing.length
			};

			if (!info.stopped) {
				player        = playing.parents(".sound");
				info.artist   = player.find(".soundTitle__username").text();
				info.duration = scroblr.utilities.calculateDuration(player.find(".timeIndicator__total").text().replace(".", ":"));
				info.elapsed  = scroblr.utilities.calculateDuration(player.find(".timeIndicator__current").text().replace(".", ":"));
				info.title    = player.find(".soundTitle__title").text();
			}
		} else {
			playing = $(".play.playing"),
			info = {
				stopped: !playing.length
			};

			if (!info.stopped) {
				player        = playing.parents("div.player");
				info.artist   = player.find(".user-name").text();
				info.duration = scroblr.utilities.calculateDuration(player.find(".timecodes span:last").text().replace(".", ":"));
				info.elapsed  = scroblr.utilities.calculateDuration(player.find(".timecodes span:first").text().replace(".", ":"));
				info.title    = player.find("h3 a").text();
			}
		}

		return info;
	};
}(jQuery));
