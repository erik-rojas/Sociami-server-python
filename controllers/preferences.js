const _ = require('lodash');
const Preference = require('../models/preferences');

exports.get_preferences = function(req, res) {
  const userID = _.get(req, 'params.userId');
  if (!userID) {
      res.sendStatus(400);
  } else {
    Preference.findOne({ userID }, function(err, preference) {
      if (err) { 
        console.error(err);
        res.sendStatus(500);
      }
      if (preference) {
        res.status(200).send(preference);
      }
      else {
        res.sendStatus(404)
      }
    });
  }
};

exports.save_preferences = function(req, res) {
  const userID = _.get(req, 'params.userId');
  if (!userID) {
      res.sendStatus(400);
  } else {
    let data = { userID, theme: req.body.theme };    
    Preference.findOneAndUpdate({ userID }, data, {upsert:true, new: true}, function(err, preference) {
      if (err) { 
        console.error(err);
        res.sendStatus(500);
      }
      if (preference) {
        res.status(200).send(preference);
      }
      else {
        res.status(404);
        res.send({});
      }
    });
  }
};