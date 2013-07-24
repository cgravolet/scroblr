(function ($) {

	var plugin = scroblr.registerHost("turntable");

	plugin.hostre = new RegExp("turntable\\.fm", "i");
	plugin.scrape = function () {
		var info = {};
		if ($('.songboard-title.songboard-main').length && $('.songboard-title.songboard-main').text().length) {
			info.artist = $('#song-log-panel .song:first-child .details > span').contents();
			info.duration = scroblr.utilities.calculateDuration(info.artist[info.artist.length - 1].textContent);
			info.artist = info.artist[0].textContent;
			info.title = $('#song-log-panel .song:first-child .title').text();
			info.score = parseFloat($('#song-log-panel .song:first-child .score').text().replace(/[^0-9]+/g, ''));
		}
		return info;
	};
}(Zepto));
