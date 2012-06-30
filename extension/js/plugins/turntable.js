(function ($) {

	var plugin = scroblr.registerHost('turntable');

	plugin.scrape = function () {
		var info = {};
		if ($('#songboard_artist').text().length) {
			info.artist = $('#room-info-tab .song:first-child .details div:first-child').text().split(' - ');
			info.duration = calculateDuration(info.artist.pop());
			info.artist = info.artist.join(' - ');
			info.score = parseFloat($('#room-info-tab .song:first-child .details div.score').text().replace(/[^0-9]+/g, ''));
			info.title = $('#room-info-tab .song:first-child .title').text();
		}
		return info;
	};
}(jQuery));
