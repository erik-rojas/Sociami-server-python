var UserProfile = require('../models/userProfile');

let HelperLinkedIn = {
}

HelperLinkedIn.createOrUpdateLinkedInProfile = function(token, tokenSecret, profile_ln, done) {
  return done(null, profile_ln);
}

module.exports = HelperLinkedIn;