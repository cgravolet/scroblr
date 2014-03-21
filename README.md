#scroblr
[http://scroblr.fm](http://scroblr.fm "scroblr homepage")

##What is scroblr?

scroblr is a lightweight browser extension that scrobbles the music you listen to on the web to your [Last.fm](http://last.fm "Last.fm") account.

##Currently supports scrobbling from:

- 8tracks
- AccuRadio
- Amazon Cloud Player
- Bandcamp
- Beats Music
- Earbits
- Focus@Will
- Google Play
- Indie Shuffle
- Jango
- Pandora
- Player.fm
- plug.dj
- Rhapsody
- Songza
- Sony Music Unlimited
- Soundcloud
- VK
- YouTube

##What's "scrobbling?"

[scrobble](http://en.wiktionary.org/wiki/scrobble "scrobble definition") *(third-person singular simple present scrobbles, present participle scrobbling, simple past and past participle scrobbled)*
1. (Internet, slang) To publish one's music-listening habits via software, as counted events when songs or albums are played, to selected internet services in order to track them over time, out of curiosity and/or to make them visible to others.

##Development

Development requires [node.js](http://nodejs.org), [browserify](http://browserify.org), and the [grunt](http://gruntjs.com) command-line interface to be installed globally. You can skip those steps if they are already installed on your machine. For help configuring and installing npm and node.js, please see [http://nodejs.org](http://nodejs.org).

    $ npm install -g grunt-cli
    $ npm install -g browserify
	$ git clone https://github.com/cgravolet/scroblr.git
	$ cd scroblr
    $ npm install
	$ grunt build

Because scroblr uses browserify to provide node-style requires in the browser, the javascript files need to be compiled after each change is made. During development you can run `grunt watch` to spin up a daemon that watches for changes to any js file and compiles a new bundle whenever it detects a modification.

##License

scroblr is licensed under the terms of the MIT License, see the included MIT-LICENSE file.
