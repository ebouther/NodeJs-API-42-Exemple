var express = require('express'),
		app = express(),
		path = require('path'),
		bodyParser = require('body-parser');

var oauth2 = require('simple-oauth2')({
  clientID: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  site: 'https://api.intra.42.fr',
  authorizationPath: 'https://api.intra.42.fr/oauth',
  tokenPath: 'https://api.intra.42.fr/oauth/token'
});
var token;
var tokenConfig = {};


app.set('view engine', 'ejs');

app.get('/auth', function (req, res) {
	res.redirect('https://api.intra.42.fr/oauth/authorize?client_id=fee8032a5bf833fc26bd7881b7e649f0c965b9f1318328949371b6ff67188ca4&redirect_uri=http%3A%2F%2F142.4.211.71%3A4242%2Fcallback&response_type=code');
});


app.get('/callback', function (req, res) {

	oauth2.authCode.getToken({
		code: req.query.code,
		redirect_uri: 'http://142.4.211.71:4242/callback'
	}, saveToken);

	function saveToken(error, result) {
		if (error) {
			console.log('Access Token Error', error.message);
		} else {
			token = oauth2.accessToken.create(result);
		} 
	}
	res.redirect('/request');
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/request', function(req, res){

	console.log(req.body.request);
	if (token)
	{
		oauth2.api('GET', req.body.request, {
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
	if (!token)
		res.redirect('/');
	else
		res.render(path.join(__dirname + '/request.ejs'), {req_ret: ''});
});

app.get('/', function (req, res) {

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

app.listen(4242);

