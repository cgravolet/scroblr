(function ($) {

	var plugin = scroblr.registerHost('we7');

	plugin.scrape = function () {
		return {
			artist: $('#fpw-player .artist').text(),
			percent: parseFloat($('#fpw-player-timeline .played-bar').width() / $('#fpw-player-timeline').width()),
			stopped: ($('#fpw-player .fpw-controls .play').length ? true : false),
			title: $('#fpw-player .track').text()
		};
	};
}(jQuery));
