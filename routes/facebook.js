const Routes = require('express').Router();
const PassportFacebook = require('../auth/passportFacebook');
const FacebookLoginController = require('../controllers/facebook');
const ConfigMain = require('../config/main');
const ConfigSocial = require('../config/social');

Routes.get('/profile',
require('connect-ensure-login').ensureLoggedIn(), FacebookLoginController.profile);

Routes.get('/auth/facebook/auth', PassportFacebook.authenticate('facebook', { authType: 'rerequest', scope : ['email', 'user_friends'] }), 
function(req, res){ });

Routes.get('/auth/facebook', function(req, res) {
  if (req.query.characterName) {
    req.session.character = req.query;
  }

  if (req.query.frontEndURL) {
    req.session.frontEndURL = req.query.frontEndURL;
  }
  res.redirect('/auth/facebook/auth');
});

Routes.get('/login', PassportFacebook.authenticate('facebook', { authType: 'rerequest', scope : ['email', 'user_friends'] }), 
function(req, res) {
  res.redirect('/auth/facebook');
});

Routes.get('/auth/facebook/callback', PassportFacebook.authenticate('facebook', 
  { 
    failureRedirect: `${ConfigMain.getThisUrl()}/auth/facebook/failure`,
    scope: ConfigSocial.FaceBookProfileIDs 
  }), FacebookLoginController.callback);

  Routes.get('/auth/facebook/failure', function(req, res) {
    const RedirectURL = `${ConfigMain.getFrontEndUrl(req.session)}/`;
    req.session.frontEndURL = undefined;
    res.redirect(RedirectURL);
  });

  //TODO: is ensureLoggedIn() needed here? 
Routes.get('/facebookFriendsForUserID'
  , FacebookLoginController.friends_get_for_user);

module.exports = Routes;