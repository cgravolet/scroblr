(function ($) {

	var plugin = scroblr.registerHost('pandora');

	plugin.scrape = function () {

		function stripChildrensLabel (string) {
			return string.replace(/\s+\(Children's\)$/i, '');
		}

		function stripHolidayLabel (string) {
			return string.replace(/\s+\(Holiday\)$/i, '');
		}

		function cleanseArtist (string) {
			var artist = stripChildrensLabel(string);
			return stripHolidayLabel(artist);
		}

		return {
			album: $('#playerBar .playerBarAlbum').text(),
			artist: cleanseArtist($('#playerBar .playerBarArtist').text()),
			duration: scroblr.utilities.calculateDuration($('#playbackControl .elapsedTime').text(), $('#playbackControl .remainingTime').text()),
			elapsed: scroblr.utilities.calculateDuration($('#playbackControl .elapsedTime').text()),
			stopped: $('#playerBar .playButton').is(':visible'),
			title: $('#playerBar .playerBarSong').text()
		};
	};
}(jQuery));
