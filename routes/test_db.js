const Routes = require('express').Router();

var UserProfile = require('../models/userProfile');

Routes.get('/getUsers', function (req, res) {
   UserProfile.find(function (err, users) {
    if (!err) {
      res.send(users);
    }
    else {
      console.log(err);
      res.sendStatus(500);
    }
  })
});

Routes.get('/deleteUser', function (req, res) {
  if (!req.query.id) {
    res.sendStatus(400);
  }
  else {
    UserProfile.remove({_id: req.query.id}, function(err) { 
      if (!err) {
        res.status(200);
        res.send(`User with id: '${req.query.id}' dropped`);
      }
      else {
        console.log(err);
        res.sendStatus(500);
      }
    });
  }
});
//


module.exports = Routes;