const Botkit = require("botkit")
const config = require("./config.js")
const blacklist = require("./blocklist.js")
const triggers = require("./triggers.js")
const request = require("request")
const scraper = require('google-search-scraper');

let response = "Hello there :)"
let controller = Botkit.slackbot({
	debug: false
})


let bot = controller.spawn({

	token: config.token,
	retry: Infinity

}).startRTM();

controller.hears('hello','direct_message,direct_mention,mention',function(bot,message) { 
	bot.reply(message, "Hey there! How can I help you?")
})

controller.on('bot_channel_join',function(bot,message){

	bot.reply(message,"Hello! I am the @google bot and I'm here to be your personal assistant. I still suck thought so blame @matejmecka on GitHub for that.")


})


controller.on('user_channel_join',function(bot,message){

bot.reply("Hello there! Welcome to the [SLACK TEAM HERE] I'm your personal assistant. I still suck though so blame @matejmecka for that.")

})


controller.hears('search (.*)','direct_message,direct_mention,mention',function(bot,message) { 
         let term = message.match[1];

	if(triggers.search) {bot.reply(message, "Go outside you piece of shit and also don't be an akward piece of shit and ask her out for fuck sake.")}
	else{

 let  options = {
  query: term,
  host: 'www.google.com',
  lang: 'en',
  limit: '3',
  params: {} // params will be copied as-is in the search URL query string 
};

bot.reply(message,"Here is what i found: ")

scraper.search(options, function(err, url) {
  // This is called for each result 
  if(err) throw err;
  bot.reply(message,url)		


});

}

})

controller.hears('weather (.*)','direct_message,direct_mention,mention',function(bot,message) { 
	 let city = message.match[1];
	 let api = "http://api.openweathermap.org/data/2.5/weather?q=" + city +  "&units=metric&appid=" + config.weathertoken
	 request(api, function(error, response, body) {
         if (!error && response.statusCode == 200) {
        // Try to parse the json. If it errors it gets caught.
         let weatherjson = JSON.parse(body);
         let weather = weatherjson['weather'][0]['main'];
         let temperaturejson =  weatherjson['main']['temp']
         let temperature = Math.round(temperaturejson)
         bot.reply(message, "The weather for " + city + " is: " + weather + " with a temperature of " + temperature + "°C");
            } 
         else  {
              console.error(error);
              console.log(response);
             }
	  });
})


controller.hears('define (.*)','direct_message,direct_mention,mention',function(bot,message) { 

	let word = message.match[1];
	let api = "https://od-api.oxforddictionaries.com:443/api/v1/entries/"  + config.language + '/' + word.toLowerCase()

	var options = {
 		 url: api,
  		 headers: {
    			'app_id': config.app_id ,
			'app_key': config.app_key
  			 }
           };

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    bot.reply(message, word + "\n" + info['results'][0]['lexicalEntries'][0]['pronunciations'][0]['phoneticSpelling'] + "\n" + "/ "  + "_" + info['results'][0]['lexicalEntries'][0]['lexicalCategory'] + "_" )
    bot.reply(message, "1. " + info['results'][0]['lexicalEntries'][0]['entries'][0]['senses'][0]['definitions'])	
  }
}

request(options, callback);


})





controller.hears('date','direct_message,direct_mention,mention',function(bot,message) { 
	let datetime = new Date();	  
        bot.reply(message, "Today is: " + datetime)
})

controller.hears(triggers.info,'direct_message,direct_mention,mention',function(bot,message) { 
        bot.reply(message, "Hello there! I'm the @google bot and i'm here to help you with your searches on this slack chat! I'm made by @MatejMecka. You can learn more about me or contribute to my code on Github at https://github.com/MatejMecka/GoogleAssistantSlack/. I'm powered by Google, Dark Sky(For weather), Oxford's Dictionary API for the define command ")
})

controller.hears(triggers.love,'direct_message,direct_mention,mention',function(bot,message) { 
	bot.reply(message,"No.")
})





controller.hears('exit','direct_message,direct_mention,mention',function(bot,message) { 
        if(message.user == config.admin){
	bot.reply(message, "Ok. Shutting down")
	console.log("Shutted down 'by admin...")	
	process.exit(1);
	}
	else{
	bot.reply(message, ":warning: I'm sorry I'm afraid I can't let you do that")
	console.log("User: " + message.user + " Tried to shut me down :c")
}
})

controller.hears('translate (.*) ','direct_message,direct_mention,mention',function(bot,message) { 

let totranslate = message.match[1];

translate(totranslate, {to: targetlang}).then(res => {

bot.reply(message, "Translated from: " + res.from.language.iso + ". It means: " + res.text)


}).catch(err => {

    console.error(err);

});

})

controller.hears('lmgtfy (.*)','direct_message,direct_mention,mention',function(bot,message) { 
         let term = message.match[1];
         term = term.replace(" ", "+")
         console.log(term) 
         let url = "http://lmgtfy.com/?q=" + term
         bot.reply(message, "Here: " + url);
})
