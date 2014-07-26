
var latest = 'http://www.google.ca';

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
	res.send('<html><body><form action="/show" method="POST"><label>URL</label><input name="url" id="url" type="text" /><input type="submit" value="Show" /></form></body></html>');
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

var irc = require("irc");

var bot = new irc.Client('irc.oftc.net', 'vhstv', {
    channels: ['#vhs']
});

bot.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

bot.addListener('message', function (from, to, message) {
    console.log('%s => %s: %s', from, to, message);

    if ( to.match(/^[#&]/) ) {
        // channel message
        if ( message.match(/^vhstv:\ /i) && message.match(/http/i) ) {
			var url = message.match(/((https?):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/i);
			if (url) {
				url = url[0];
				console.log('launching: %j', url);
				latest = url;
				bot.say(to, 'Showing ' + url);
			} else {
				bot.say(to, 'seriously not going to show that.');
			}
        }
        if ( message.match(/dance/) ) {
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D\\-<\u0001") }, 1000);
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D|-<\u0001")  }, 2000);
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D/-<\u0001")  }, 3000);
            setTimeout(function () { bot.say(to, "\u0001ACTION dances: :D|-<\u0001")  }, 4000);
        }
    }
    else {
        // private message
    }
});
