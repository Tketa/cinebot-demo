var TelegramBot = require('node-telegram-bot-api');
var CineApi = require('./cine-api.js')
var fs = require('fs')

var telegramToken = process.env.CINEBOT_TELEGRAM_TOKEN;
var telegramToken = '227262380:AAHKvbAC7J2oQr2mguie6oNZNbUNSyGF2oM';
var introText = fs.readFileSync('introduction-en.txt').toString()

// Setup polling way
var bot = new TelegramBot(telegramToken, {polling: true});
var cineApi = new CineApi();
//var cineApi = new CineApiMock()

bot.getMe().then(function(botSelf) {
  console.log('Bot up and running.. ', botSelf)
});

bot.onText(/\/start/, function(msg, match) {
  var chatId = msg.from.id;
  bot.sendMessage(chatId, introText);

  var opts = {
    reply_markup: {
      keyboard: [[{'text': 'Yes', 'request_location':true} ], ['No']],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  }

  setTimeout(function() {
    bot.sendMessage(chatId, 'I need your location to help you! Can you send me your location?', opts)
  }, 3000);
});

bot.onText(/\/showtimes (.+)/, function (msg, match) {
  var queryText = match[1]
  var chatId = msg.from.id

  cineApi.query(queryText, null, function(results) {
    var seances = results.hits;
    var response = ''
    for(var i = 0; i < seances.length; i++) {
      var seance = seances[i]
      var response = cineApi.formatTitle(seance) + '\n' + cineApi.formatDescription(seance) + '\n'

      bot.sendPhoto(chatId, seance.movie.posterUrl, {caption: response})
    }
  });
});

bot.on('location', function(message) {
  var chatId = message.chat.id

  // Doesn't hurt being polite'
  bot.sendMessage(chatId, 'Thanks for your location!')

  cineApi.query(' ', message.location, function (content) {
    var seances = content.hits;
    var response = ''
    for(var i = 0; i < seances.length; i++) {
      var seance = seances[i]
      var response = cineApi.formatTitle(seance) + '\n' + cineApi.formatDescription(seance) + '\n'
      bot.sendPhoto(chatId, seance.movie.posterUrl, {caption: response});
    }
  });
});


bot.on('inline_query', function(query) {
	var queryText = query.query;
  var queryLocation = query.location
	var inline_query_id = query.id;
	cineApi.query(queryText, queryLocation, function (content) {
		var hits = content.hits;
    console.log('hits', hits);
		var inlineResults = []

		for(var i = 0; i < hits.length; i++) {
			var inlineResult = hitToInlineResult(hits[i]);
			inlineResults.push(inlineResult);
		}

		bot.answerInlineQuery(inline_query_id, inlineResults);
	});
});

var hitToInlineResult = function(hit) {
	inlineResult = {}
	inlineResult.type = 'article';
	inlineResult.id = hit.objectID;

	inlineResult.title = cineApi.formatTitle(hit)

	var message = hit.movie.url + '\n' +
	'This movie is playing at "' + hit.place.name +
	'" at the following times: ' + Object.keys(hit.times).join(' , ')

	var inputMC = {
		'message_text':message
	}

	inlineResult.input_message_content = inputMC;
	inlineResult.url = hit.movie.url;
	inlineResult.hide_url = true;

	inlineResult.description = cineApi.formatDescription(hit)
	inlineResult.thumb_url = hit.movie.posterUrl;
	inlineResult.thumb_width = 40;
	inlineResult.thumb_height = 40;

	return inlineResult;
}
