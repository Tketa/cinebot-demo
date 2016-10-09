var TelegramBot = require('node-telegram-bot-api');
var sleep = require('sleep')

var telegramToken = 'XXXXXX';

var bot = new TelegramBot(telegramToken, {polling: true});

var conversation_en = [
  'Hi! 😘',
  'I\'d love to go to the movies tonight, you down ?',
  'Not too far from my place at Opéra, so we can grab a drink later... 😉😘',
  'Oh awesome !! I\'ve been wanting to watch this so bad! See u tonight! ❤❤❤❤❤❤❤❤❤❤'
]

var counter = {}

var sendConversationText = function(chatId) {
  var msg = conversation_en[counter[chatId] % conversation_en.length];
  sleep.sleep(1)
  bot.sendMessage(chatId, msg);
  counter[chatId]++;
}

bot.on('message', function(message) {
  var chatId = message.chat.id
  if(!(chatId in counter)) { counter[chatId] = 0; }

  sendConversationText(chatId)
})
