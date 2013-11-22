var _gaq = _gaq || [];

(function ($) {

	/**
	 * Sets up custom tracking events
	 *
	 * @private
	 */
	function setupTracking() {
		var $body = $(document.body);

		// Chrome download
		$body.on("click", "#downloadChromeLink", function () {
			_gaq.push(['_trackPageview', '/download-chrome/']);
		});

		// Safari download
		$body.on("click", "#downloadSafariLink", function () {
			_gaq.push(['_trackPageview', '/download-safari/']);
		});

		// GitHub
		$body.on("click", "#forkGithubLink", function () {
			_gaq.push(['_trackPageview', '/github/']);
		});

		// Twitter
		$body.on("click", "#twitterLink", function () {
			_gaq.push(['_trackPageview', '/twitter/']);
		});
	}

	// Document ready
	$(function () {
		setupTracking();
	});

}(jQuery));
