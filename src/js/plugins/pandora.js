(function ($) {

	var plugin = scroblr.registerHost("pandora");

	plugin.test = function () {
		var domainMatch = plugin.hostre.test(document.location.hostname);
		var playerFound = $("#playerBar").length > 0;
		return domainMatch && playerFound;
	};

	plugin.scrape = function () {
		return {
			album:    $("#playerBar .playerBarAlbum").text(),
			artist:   cleanseArtist($("#playerBar .playerBarArtist").text()),
			duration: scroblr.utilities.calculateDuration($("#playbackControl .elapsedTime").text(), $("#playbackControl .remainingTime").text()),
			elapsed:  scroblr.utilities.calculateDuration($("#playbackControl .elapsedTime").text()),
			stopped:  $("#playerBar .playButton").css("display") === "block",
			title:    $("#playerBar .playerBarSong").text()
		};
	};

	function cleanseArtist(string) {
		var artist = stripChildrensLabel(string);
		return stripHolidayLabel(artist);
	}

	function stripChildrensLabel(string) {
		return string.replace(/\s+\(Children's\)$/i, "");
	}

	function stripHolidayLabel(string) {
		return string.replace(/\s+\(Holiday\)$/i, "");
	}
}(Zepto));
