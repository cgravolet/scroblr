(function ($) {

	var plugin = scroblr.registerHost("turntable");

	plugin.hostre = new RegExp("turntable\\.fm", "i");
	plugin.scrape = function () {
		var info = {};
		if ($('.songboard-artist.songboard-main').length && $('.songboard-artist.songboard-main').text().length) {
			info.artist = $('.songboard-artist.songboard-main')[0].textContent;
			info.title = $('.songboard-song.songboard-main')[0].textContent;

			time = $('.songboard-time').contents()[0].textContent;
			time_left = $('.songboard-time-left').contents()[0].textContent;
			info.duration = scroblr.utilities.calculateDuration(time) + scroblr.utilities.calculateDuration(time_left)
		}
		return info;
	};
}(Zepto));
