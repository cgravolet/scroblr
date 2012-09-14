(function ($) {

	var plugin = scroblr.registerHost("songza");

	plugin.scrape = function () {
		var info = {
			stopped: $('#playPause').hasClass('paused')
		};

		if (!info.stopped) {
			info.artist   = $('#artist-name').text();
			info.duration = scroblr.utilities.calculateDuration($('#totalTime').text().substring(3));
			info.elapsed  = scroblr.utilities.calculateDuration($('#currentTime').text());
			info.title    = $('#track-title').text();
		}

		return info;
	};
}(jQuery));
