const Routes = require('express').Router();

var Passport = require('passport');

var passportLinkedIn = require('../auth/passportLinkedIn');

const LinkedInLoginController = require('../controllers/linkedin');

var ConfigMain = require('../config/main');

/**************LINKEDIN******************/

Routes.get('/auth/linkedin/authenticate', Passport.authenticate('linkedin'));

Routes.get('/auth/linkedin', function(req, res) {
  if (req.query.characterName) {
    req.session.character = req.query;
  }

  if (req.query.frontEndURL) {
    req.session.frontEndURL = req.query.frontEndURL;
  }

  res.redirect('/auth/linkedin/authenticate');
});

Routes.get('/auth/linkedin/callback', (req, res, next) => {
  Passport.authenticate('linkedin', (err, user, info) => {
    if (err) {
      // failureRedirect
      const RedirectURL = `${ConfigMain.getFrontEndUrl(req.session)}/`;
      return res.redirect(RedirectURL);
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      // successRedirect
      LinkedInLoginController.callback_success(req, res)
    });
  })(req, res, next);
});

Routes.get('/linkedIn/account', ensureAuthenticated, LinkedInLoginController.account);

Routes.get('/linkedIn/login', LinkedInLoginController.login);


Routes.get('/linkedIn/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send("not_authorized");
}

module.exports = Routes;