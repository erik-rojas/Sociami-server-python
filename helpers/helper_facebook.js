
var UserProfile = require('../models/userProfile');

let HelperFaceBook = {
}

HelperFaceBook.createOrUpdateFaceBookProfile = function(accessToken, refreshToken, profile_fb, cb) {
    return cb(null, profile_fb);
}

module.exports = HelperFaceBook;