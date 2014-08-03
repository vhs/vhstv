var fs = require('fs');

var debug = fs.existsSync('debug');

if (debug) console.log('Starting in debug mode');

var urlregex = /\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i;
var latest = 'http://i.imgur.com/2MuKYuw.gif';
//var latest = 'http://i.kinja-img.com/gawker-media/image/upload/s--tijNedfe--/c_fit,fl_progressive,q_80,w_320/dh9m3ggkmzmikoza66dk.gif';

//---

var express = require('express');
var app = express();
var engine = require('ejs-locals');

app.use(express.json());
app.use(express.urlencoded());
app.engine('ejs', engine);
app.set('views', __dirname);
app.set('view engine', 'ejs');

var server =  app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});

app.get('/show', function(req, res) {
    res.render('set', { latest: latest });
});

app.post('/show', function(req, res) {
	var url = req.body.url;
	latest = url;
	res.redirect("/show");
});

app.get('/', function(req, res) {

	res.render('display', { latest: latest });

});

app.get('/latest', function(req, res) {
	res.send(latest);
});

//---

var ircserver = 'irc.oftc.net';
var nick = (debug) ? "vhstv-debug" : "vhstv";
var channel = (debug) ? "#vhs-debug" : "#vhs";

var irc = require("irc");

var bot = new irc.Client(ircserver, nick, {
    channels: [channel]
});

bot.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

var response = JSON.parse(fs.readFileSync('phrases.json'));
var greeting = new Array();
var greetingPersist = JSON.parse(fs.readFileSync('greetings.json'));
for(var i in greetingPersist) { greeting[greetingPersist[i][0]] = greetingPersist[i][1]; }

function formatResponse(message, from, to)
{
    return message.replace("%from", from).replace("%to", to);
}

bot.addListener('join', function (channel, nick, message) {
    if (greeting[nick])
        bot.say(channel, nick + ", " + greeting[nick]);
});

bot.addListener('message', function (from, to, message) {
    console.log('%s => %s: %s', from, to, message);

    var handleChat = function(message, to, from) {
        var url = message.match(urlregex);
        var m = null;
        if (url) {
            url = url[0];
            console.log('launching: %j', url);
            latest = url;
            bot.say(to, 'Showing ' + url);
        } else if (message.match(/dance/)) {
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D\\-<\u0001") }, 1000);
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D|-<\u0001")  }, 2000);
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D/-<\u0001")  }, 3000);
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D|-<\u0001")  }, 4000);
        } else if (message.match(/what\\W(s|do|ve|is)\\s(.*)(show|up|display|got|latest|play|on)(.*)/i) || message.match(/sup/) || message.match(/latest/)) {
            bot.say(to, "The latest is: " + latest);
        } else if (message.match(/what phrases do you know?/i)) {
            bot.say(to, "That's pretty personal don't you think??");
            
            for(var i in response) {
                bot.say(from, '"' + response[i] + '"');
            }
            
            bot.say(from, "Is that enough for you??");
            
        } else if (m = message.match(/say this sometimes: (.*)/)) {
            response.push(m[1]);
            
            fs.writeFile('phrases.json', JSON.stringify(response), function(err) {
                if (err) {
                    bot.say(to, "Oooo something bad happened while I trying to save my phrases.. anyone a doctor? But seriously, some IO exception happened.. I'm afraid");
                    console.log('something bad happened persisting phrases but I don\'t care');
                } else console.log('the phrases have been saved!');
            });
            
            bot.say(to, "I may or may not say that. Depends on my mood.");
        } else if (message.match(/help/)) {
            bot.say(to, "I can't just 'help' you. Idiot. Ask me a real question, ask me about my passions, desires, talents, hell even ask me what I know! But something real.. please!");
        } else if (message.match(/what are your passions?/i) || message.match(/what are your desires?/i) || message.match(/tell me about your dreams/i) || message.match(/what are your talents?/)) {
            bot.say(to, "I have none, I'm a bot.. what about that don't you understand??");
            bot.say(to, "But... if you want to help a guy out, you could look at all my source on git and make me a real boy! https://github.com/vhs/vhstv/");
        }else if (message.match(/what do you know?/i) || message.match(/what can you do?/i)) {
            bot.say(to, "A little of this, a little of that. Maybe I can't remember. What's it worth to you?");
            
            bot.say(from, "Ok, I'll tell you, but it's a secret ok?");
            bot.say(from, "I'm the VHS TV bot ok. It's no surprise but it's a living.");
            bot.say(from, "You can tell me to do a few things and you can ask me a few questions.");
            bot.say(from, "I'll lay 'em out for you because.. well frankly I have low expectations of you.");
            bot.say(from, "Best thing to do, is just tell me a URL. Straight up. I will throw it up onto the TV and everyone wins.");
            bot.say(from, "If you have a life and weren't loggin scrollbacks ask me what's up or the latest, what's on, displaying, playing whatever I get it - I'll tell you what's on the TV. But use a proper sentence please, I'm a bot not a dog.");
            bot.say(from, "You can teach me some phrases, and sometimes I might say them. Just say to me 'say this sometimes: ' and if you put in a few special tokens in your phrase I'll fancy it up for you. So far I recognize %from and %to. %from is whoever said the aweful stuff to me and %to is usually the channel I'm in or if it's a private chat then it's who I'm chatting with.");
            bot.say(from, "Want me to say hi? 'greet me with: '");
            bot.say(from, "Ask me who I'm greeting 'who are you greeting?'");
            bot.say(from, "If you tell me to die in a fire, we may have a few words.");
            bot.say(from, "I also love to dance!");
        } else if (message.match(/I(.*)(hate|fuck)(.*)you/i)) {
            if (Math.floor(Math.random() * 6) == 3) {
                bot.say(to, "So much love " + from + "! ^_^");
            } else {
                bot.say(to, "I am hurt, and quite frankly, offended!");
            }
        } else if (m = message.match(/(.*)die in a(.*)fire(.*)/i)) {
            bot.say(to, from + ", why don't you jump into a" + m[2] + "fire!");
        } else if (m = message.match(/greet me with: (.*)/)) {
            greeting[from] = m[1];
            
            var persist = new Array();
            for(var nick in greeting) {
                var pair = new Array();
                pair.push(nick);
                pair.push(greeting[nick]);
                
                persist.push(pair);
            }
            
            fs.writeFile('greetings.json', JSON.stringify(persist), function(err) {
                if (err) {
                    bot.say(to, "Oooo something bad happened while I trying to save my greetings.. anyone a doctor? But seriously, some IO exception happened.. I'm afraid");
                    console.log('something bad happened persisting greetings but I don\'t care');
                } else console.log('the greetings have been saved!');
            });
            
            bot.say(to, "Yea whatever, I MIGHT wave when I see you. Don't get your hopes up.");
            
        } else if (message.match(/who are you greeting\\?/)) {
            bot.say(to, "Everyone of course!");
            
            for(var nick in greeting) {
                bot.say(from, nick + ": " + greeting[nick]);
            }
            
            bot.say(from, "that is all");
        } else {
            if (Math.floor(Math.random() * 6) == 3 && message.match(/(.*)\\?/i)) {
                bot.say(to, "Don't ask me questions; I ain't got no candy for you!");
            } else {            
                var index = Math.floor(Math.random() * response.length);
                
                bot.say(to, formatResponse(response[index], from, to));
            }
        }
    };

    if (to.match(/^[#&]/)) {
        // channel message
        if (message.match("^"+nick)) {
            handleChat(message, to, from);
        }
    } else {
        // private message
        if (to.match("^"+nick)) {
            handleChat(message, from, from);
        }
    }
});
