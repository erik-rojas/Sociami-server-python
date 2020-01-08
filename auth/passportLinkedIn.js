var Passport = require('passport');
var Strategy = require('passport-linkedin-oauth2').Strategy;

var ConfigMain = require('../config/main');
var ConfigSocial = require('../config/social');

var HelperLinkedIn = require('../helpers/helper_linkedin');

Passport.use(new Strategy({
  clientID: ConfigSocial.LinkedInConsumerKey,
  clientSecret: ConfigSocial.LinkedInConsumerSecret,
  callbackURL: `${ConfigMain.getThisUrl()}/auth/linkedin/callback`,
  profileFields: ConfigSocial.LinkedInProfileIDs
},
function(req, token, tokenSecret, profile_ln, done) {
  return HelperLinkedIn.createOrUpdateLinkedInProfile(token, tokenSecret, profile_ln, done);
}
));

module.exports = Passport;