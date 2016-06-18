var oauth2 = require('simple-oauth2')({
  clientID: 'YOUR_PUBLIC_ID',
  clientSecret: 'YOUR_PRIVATE_KEY',
  site: 'https://api.intra.42.fr',
  authorizationPath: 'https://api.intra.42.fr/oauth',
  tokenPath: 'https://api.intra.42.fr/oauth/token'
});
var tokenConfig = {};

exports.oauth2 = oauth2;
