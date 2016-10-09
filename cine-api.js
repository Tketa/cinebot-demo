var seances = require('./seances.json')

var CineApi = function() {}

CineApi.prototype.query = function(text, location, onResultCallback) {
	var seancesSnippet = [];

	var index = 0
	for(var i = 0; i < 10; i++) {
		index = parseInt(Math.floor(seances.length * Math.random()))
		seances[index].objectID = index.toString();
		seancesSnippet.push(seances[index]);
	}

	onResultCallback({hits: seancesSnippet});
}

CineApi.prototype.formatTitle = function(hit) {
	var stars = '';
	if(hit.movie.userRating) {
		var userRating = hit.movie.userRating - 1;
		var roundedRating = hit.movie.userRating.toFixed(1);
		stars = '(' + roundedRating + '\u{2B50})';
	}

	var VO = (hit.movie.vo == 'true')
	var lang = '(' + (VO ? 'VO' : '🇫🇷') + (hit.movie.is3D ? ' | 3D' : '') + ')'
	return lang + ' ' + hit.movie.title + ' ' + (stars);
}

CineApi.prototype.formatDescription = function(hit) {
	var distance = ''
	if(hit._rankingInfo && hit._rankingInfo.matchedGeoLocation) {
		var distance = hit._rankingInfo.matchedGeoLocation.distance;
		distance = '(' + distance + ' m)'
	} else {
		distance = '(' + hit.place.postalCode + ')'
	}

	return hit.place.name + " " + distance + '\n' + Object.keys(hit.times).join(' | ');
}

module.exports = CineApi;
