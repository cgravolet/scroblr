(function ($) {

	var plugin = scroblr.registerHost("youtube");

	plugin.test = function () {
		return document.location.href.indexOf("youtube.com/watch") >= 0;
	}

	plugin.scrape = function () {
		var title;

		title = $.trim($("#watch-headline-title").text());
		title = title.replace(/^(.+)(\s*[-–:]\s*)(.+)$/i, "$1_,_$3").split("_,_");

		if (title.length > 1) {
			return cleanseTrack(title[0], title[1]);
		} else {
			return {
				title: title[0]
			};
		}
	};

	/**
	 * Cleanse method inspired by the Chrome Last.fm Scrobbler extension
	 * by David Sabata (https://github.com/david-sabata/Chrome-Last.fm-Scrobbler)
	 *
	 * @param {String} artist
	 * @param {String} title
	 */
	function cleanseTrack(artist, title) {
		title = title.replace(/\s*\*+\s?\S+\s?\*+$/, ''); // **NEW**
		title = title.replace(/\s*\[[^\]]+\]$/, ''); // [whatever]
		title = title.replace(/\s*\([^\)]*version\)$/i, ''); // (whatever version)
		title = title.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ''); // video extensions
		title = title.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ''); // (official)? (music)? video
		title = title.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ''); // (ALBUM TRACK)
		title = title.replace(/\s*\(\s*of+icial\s*\)/i, ''); // (official)
		title = title.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ''); // (1999)
		title = title.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ''); // HD (HQ)
		title = title.replace(/\s+(HD|HQ)\s*$/, ''); // HD (HQ)
		title = title.replace(/\s*video\s*clip/i, ''); // video clip
		title = title.replace(/\s+\(?live\)?$/i, ''); // live
		title = title.replace(/\(\s*\)/, ''); // Leftovers after e.g. (official video)
		title = title.replace(/^(|.*\s)"(.*)"(\s.*|)$/, '$2'); // Artist - The new "Track title" featuring someone
		title = title.replace(/^(|.*\s)'(.*)'(\s.*|)$/, '$2'); // 'Track title'
		title = title.replace(/^[\/\s,:;~-\s"]+/, ''); // trim starting white chars and dash
		title = title.replace(/[\/\s,:;~-\s"\s!]+$/, ''); // trim trailing white chars and dash 

		return {
			artist: artist,
			title:  title
		};
	}
}(Zepto));
