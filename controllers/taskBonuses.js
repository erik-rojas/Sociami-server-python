var Mongoose = require('mongoose');

var TaskBonus = require('../models/taskBonuses');

exports.set_bonuses = function(req, res) {
  const bonuses = req.body.bonuses;
  
  if (!bonuses) {
    res.sendStatus(400);
  }

  TaskBonus.remove({})
    .then(function() {
    
      let bonusDocs = [];
    
      for (let i = 0; i < bonuses.length; ++i) {
        bonusDocs.push(new TaskBonus({
           difficulty: bonuses[i].difficulty,
           factor: bonuses[i].factor,
         }));
      }

      TaskBonus.insertMany(bonusDocs)
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

exports.get_bonus = function(req, res) {
  if (!req.query.difficulty) {
    res.sendStatus(400);
  }
  else {
    TaskBonus.findOne({difficulty: req.query.difficulty}, function (err, foundBonus) {
      if (err)
      {
        console.error(err);
        res.sendStatus(500);
      }
      if (foundBonus) {
        res.status(200);
        res.send({factor: foundBonus.factor});
      }
      else {
        res.status(404);
        res.send({});
      }
    })
  }
};