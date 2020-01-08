const Mongoose = require('mongoose');

const UnlockRequirements = require('../models/progression/taskActivityUnlockRequirements');

exports.set_requirements = function (req, res) {
  const requirementsPerTaskType = req.body.requirementsPerTaskType;

  if (!requirementsPerTaskType) {
    res.sendStatus(400);
  }

  UnlockRequirements.remove({})
    .then(function () {

      let docs = [];

      for (let i = 0; i < requirementsPerTaskType.length; ++i) {
        docs.push(new UnlockRequirements({
          type: requirementsPerTaskType[i].type,
          requirements: requirementsPerTaskType[i].requirements,
        }));
      }

      UnlockRequirements.insertMany(docs)
        .then(function (docs) {
          res.sendStatus(200);
        })
        .catch(function (err) {
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch(function (err) {
      console.log(err);
      res.sendStatus(500);
    });
}

exports.get_requirements = function (req, res) {
  UnlockRequirements.find({})
    .then((results) => {
      res.status(200);
      res.send(results);
    })
    .catch((error) => {
      console.error(err);
      res.sendStatus(500);
    });
};

exports.get_requirement = function (req, res) {
  if (!req.query.type) {
    res.sendStatus(400);
  }
  else {
    UnlockRequirements.findOne({ type: req.query.type })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
  }
};