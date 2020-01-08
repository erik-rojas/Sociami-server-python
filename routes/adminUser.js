const AdminUser = require('../models/adminUsers');

const Routes = require('express').Router();

var Passport = require('passport');

const AdminUsersLimit = 1;

Routes.post('/signupAdmin', async (req, res, next) => {
  const numAdminUsers = await AdminUser.count({}).then((result) => result);

  if (numAdminUsers >= AdminUsersLimit) {
    return res.status(403).json({
      success: false,
      error: "Can't sign-up at the moment. Limit reached."
    });
  }

  if (!req.body.email || !req.body.password) {
    return res.status(404).json({
      success: false,
      error: 'Empty request.'
    });
  }
  return Passport.authenticate('local-signup', (err) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // the 11000 Mongo code is for a duplication email error
        // the 409 HTTP status code is for conflict error
        return res.status(409).json({
          success: false,
          error: "Email already taken."
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }

    return res.status(200).json({
      success: true
    });
  })(req, res, next);
});

Routes.post('/loginAdmin', (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(404).json({
      success: false,
      error: 'Empty request.'
    });
  }

  return Passport.authenticate('local-login', (err, token, userData) => {
    if (err) {
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }


    return res.status(200).json({
      success: true,
      token,
      user: userData
    });
  })(req, res, next);
});

Routes.get('/getAdmins', (req, res) => {
  AdminUser.find({})
    .then((results) => {
        if (results) {
            res.send(results);
        }
        else {
            res.sendStatus(404);
        }
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(500);
    });
});

Routes.post('/removeAdmins', (req, res) => {
  AdminUser.remove({})
    .then((results) => {
      AdminUser.collection.dropIndexes()
      .then(() => {
        res.sendStatus(200);
      })
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(500);
    });
})

module.exports = Routes;