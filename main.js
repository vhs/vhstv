var fs = require('fs');

var debug = fs.existsSync('debug');

if (debug) console.log('Starting in debug mode');

var urlregex = /\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i;
var latest = 'http://i.imgur.com/2MuKYuw.gif';

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

bot.addListener('message', function (from, to, message) {
    console.log('%s => %s: %s', from, to, message);
    
    var handleChat = function(message, to) {
        var url = message.match(urlregex);
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
        } else {
            bot.say(to, "I don't know what to say about that..");
        }
    };

    if (to.match(/^[#&]/)) {
        // channel message
        if (message.match("^"+nick)) {
            handleChat(message, to);
        }
    } else {
        // private message
        if (to.match("^"+nick)) {
            handleChat(message, from);
        }
    }
});
