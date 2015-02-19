//Defines Angular Application and Dependencies
angular.module('ionicApp', ['ionic', 'ngCordova'])

.config(function($urlRouterProvider, $stateProvider, $sceProvider) {

	$sceProvider.enabled(false);

	//Routing (views)
	$stateProvider

		.state('app', {
		url: "/app",
		abstract: true,
		templateUrl: "templates/menu.html",
		controller: 'AppCtrl'
	})

	.state('app.home', {
		url: "/home",
		views: {
			'menuContent': {
				templateUrl: "templates/main.html",
				controller: 'MainCtrl'
			}
		}
	})

	.state('app.release', {
		url: "/release",
		views: {
			'menuContent': {
				templateUrl: "templates/newrelease.html",
				controller: 'NewVidCtrl'
			}
		}
	})

	.state('app.artists', {
		url: "/artists",
		views: {
			'menuContent': {
				templateUrl: "templates/artists.html",
				controller: 'ArtistsCtrl'
			}
		}
	})

	.state('app.bugs', {
		url: "/bugs",
		views: {
			'menuContent': {
				templateUrl: "templates/bugs.html"
			}
		}
	})

	.state('app.reddit', {
		url: "/reddit",
		views: {
			'menuContent': {
				templateUrl: "templates/reddit.html",
				controller: 'FeedCtrl'
			}
		}
	})

	.state('app.wiki', {
		url: "/wiki",
		views: {
			'menuContent': {
				templateUrl: "templates/wiki.html"
			}
		}
	})

	.state('app.credits', {
			url: "/credits",
			views: {
				'menuContent': {
					templateUrl: "templates/credits.html",
				}
			}
		})
		// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
})

//On App Launch
.run(function($rootScope, $http, $ionicLoading) {
	//TODO: Transfer to background thread.
	$rootScope.latestReddit = "N/A";
	$rootScope.latestTrack = "N/A";
	//Gets JSON Data from the Soundcloud API.
	$http.get(
			'http://api.soundcloud.com/users/Monstercat/tracks.json?client_id=54970813fe2081a104a874f0f870bcfe', {}
		)
		.success(function(data, status, headers, config) {
			//$rootScope is a global variable, saves the data from the response.
			$rootScope.tracks = data;
			//For Dashboard info
			$rootScope.latestTrack = data[0].title;
			$rootScope.latestTrackThumbnail = data[0].artwork_url.replace("large.jpg",
				"t500x500.jpg")
		})
		//Gets Reddit Posts
	$http.get("http://reddit.com/r/monstercat.json", {})
		.success(function(data) {
			$rootScope.redditPosts = data.data.children;
			$rootScope.latestReddit = data.data.children[1].data.title;
			$rootScope.latestRedditThumbnail = data.data.children[1].data.thumbnail;
		})
})

//"Now Playing" bar control
.controller('AppCtrl', function($scope, $rootScope, $cordovaInAppBrowser) {
	$rootScope.nowPlaying = "Not Playing Anything..."
	$scope.stopHammerTime = function() {
		console.log("Stop... HAMMER TIME");
		$rootScope.media.stop();
		$rootScope.nowPlaying = "Not Playing Anything...";
	}
})

//Main Page Control
.controller('MainCtrl', function($scope) {

})

//Latest Releases
.controller("NewVidCtrl", function($scope, $cordovaMedia, $http, $rootScope,
	$cordovaProgress) {
	$scope.isPlaying = false;
	$scope.tracks = $rootScope.tracks;
	//Replace default soundcloud small artwork with 500x500 artwork
	for (var i = 0; i < $rootScope.tracks.length; i++) {
		$scope.tracks[i].artwork_url = $scope.tracks[i].artwork_url.replace(
			"large.jpg", "t500x500.jpg");
	}

	//TODO: Reconfigure loading (removed on accident after iOS)
	$scope.prePlay = function(src, nowPlaying) {
		$scope.play(src, nowPlaying);
	}
	$scope.play = function(src, nowPlaying) {
		//Check if a song is playing first.
		if ($scope.isPlaying) {
			$rootScope.media.stop()
			$rootScope.nowPlaying = nowPlaying;
			//New URL with soundcloud API key.
			var newSRC = src + '?client_id=54970813fe2081a104a874f0f870bcfe';
			//Defines Global media variable from Media Plugin
			$rootScope.media = new Media(newSRC, console.log("Media Set"), console.log(
				"Well crap"));
			$rootScope.media.play({
				playAudioWhenScreenIsLocked: true
			});

			$scope.isPlaying = true;
		} else {
			$rootScope.nowPlaying = nowPlaying;
			var newSRC = src + '?client_id=54970813fe2081a104a874f0f870bcfe';
			$rootScope.media = new Media(newSRC, console.log("Media Set"), console.error(
				"Ya dun goofed"));
			$rootScope.media.play({
				playAudioWhenScreenIsLocked: true
			});

			$scope.isPlaying = true;
		}

	}
})

//Reddit Posts
.controller("FeedCtrl", function($http, $scope, $rootScope) {

	$scope.posts = $rootScope.redditPosts;

	//Reddit mobile site to permalink
	$scope.browse = function(v) {
		v = 'http://i.reddit.com/' + v
		window.open(v, "_blank", "location=yes");
	}

})

//List of Artists
.controller("ArtistsCtrl", function($timeout) {
	//Finds normal a links and replaces them with InAppBrowser
	$timeout(function() {
		$('#replace a').click(function() {
			console.log("Click")
			var url = $(this).attr('href');
			window.open(encodeURI(url), '_blank', 'location=yes');
			return false;
		})
	})
});
