var Mongoose = require('mongoose');

var UserLevel = require('../models/progression/userLevels');

exports.set_levels = function(req, res) {
  const levels = req.body.levels;
  
  if (!levels) {
    res.sendStatus(400);
  }

  UserLevel.remove({})
    .then(function() {
    
      let levelDocs = [];
    
      for (let i = 0; i < levels.length; ++i) {
         levelDocs.push(new UserLevel({
           level: levels[i].level,
           experience: levels[i].experience,
           range: levels[i].range,
         }));
      }

      UserLevel.insertMany(levelDocs)
        .then(function(docs) {
           res.sendStatus(200);
        })
        .catch(function(err) {
          console.log(err);
          res.sendStatus(500);
        });
      })
      .catch(function(err) {
         console.log(err);
         res.sendStatus(500);
      });
}

exports.get_levels = function(req, res) {
    UserLevel.find({}, function (err, userLevels) {
    if (err)
    {
      console.error(err);
      res.sendStatus(500);
    }
    
    res.send(userLevels);
  })
};