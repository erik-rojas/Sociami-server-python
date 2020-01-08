const Axios = require('axios');

const ConfigMain = require('../config/main');
const ConfigSocial = require('../config/social');

const UserProfile = require('../models/userProfile');
const SettingModel = require('../models/setting');

exports.profile = function(req, res) {
  const facebookID = (req.user.facebook && req.user.facebook._id) ? req.user.facebook._id : req.user.facebookID;
  const RedirectURL = `${ConfigMain.getFrontEndUrl(req.session)}/authorize?facebookID=${facebookID}`;
  req.session.frontEndURL = undefined;
  res.redirect(RedirectURL);
};

exports.callback = function(req, res) {
    console.log(`LOG: /auth/facebook/callback`);
    res.redirect('/profile');
}

exports.friends_get_for_user = function(req, res) {

  //TODO: What if token expires?
  if (!req.query.currentUserID || !req.query.facebookID) {
    res.sendStatus(400);
  }

  UserProfile.findOne({ _id: req.query.currentUserID }, function (err, foundUserProfile) {
    if (err) {
        console.error(err);
        res.status(500);
        res.send({});
    }
    if (foundUserProfile) {

      const facebookID = req.query.facebookID;
      const accesToken = (foundUserProfile.facebook && foundUserProfile.facebook.token) ? foundUserProfile.facebook.token : undefined;

      if(accesToken != undefined){
        const url = `${ConfigSocial.FacebookGraphApiURL}/${facebookID}/friends?access_token=${accesToken}`;
        return (Axios.get(url)
        .then((response)=>{
          console.log(response.data)
          res.status(200);
          res.send(response.data);
        })
        .catch((err) => {
          console.error(err);
          res.status(500);
          res.send({});
        }));
      }

    }
    else {
        res.status(404);
        res.send({});
    }
  })
}