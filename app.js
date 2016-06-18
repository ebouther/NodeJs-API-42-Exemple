var express = require('express'),
		session = require('express-session'),
		app = express(),
		path = require('path'),
		bodyParser = require('body-parser');

app.use(session({
	secret: '1234567890QWERTY',
	resave: true,
	saveUninitialized: false
}));

var auth = require('./auth.js');


app.set('view engine', 'ejs');

app.get('/auth', function (req, res) {
	res.redirect('https://api.intra.42.fr/oauth/authorize?client_id=5284cfb5413709653c7e281061b105061ae975f92984eb8c11ed34b39582dcc6&redirect_uri=http%3A%2F%2F142.4.211.71%3A4545%2Fcallback&response_type=code');
});


app.get('/callback', function (req, res) {
	auth.oauth2.authCode.getToken({
		code: req.query.code,
		redirect_uri: 'http://142.4.211.71:4545/callback'
	}, save_token);
	
	function save_token(error, result) {
		if (error) {
			console.log('Access Token Error', error.message);
		} else {
			req.session.token = auth.oauth2.accessToken.create(result);
		} 
		res.redirect('/request');
	}
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/request', function(req, res){

	console.log(req.body.request);
	var token = req.session.token;
	if (token)
	{
		auth.oauth2.api('GET', req.body.request, {
			access_token: token.token.access_token
		}, function (err, data) {
			if (err) {
				console.log("Bad request.")
				res.render(path.join(__dirname + '/request.ejs'), {req_ret: 'Bad request.'});
			} else {
				res.render(path.join(__dirname + '/request.ejs'), {req_ret: JSON.stringify(data)});
			}
		});
	}
});

app.get('/request', function (req, res) {
	if (!req.session.token)
		res.redirect('/');
	else
		res.render(path.join(__dirname + '/request.ejs'), {req_ret: ''});
});

app.get('/', function (req, res) {

	var token = req.session.token;
	if (token && token.expired()) {
		token.refresh(function(err, res) {
			if (err) {
				token = -1;
			} else {
				token = res;
			}
		})
	}
	res.render(path.join(__dirname + '/index.ejs'));
});

app.listen(4545);
