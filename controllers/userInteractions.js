const UserInteraction = require('../models/userInteractions');

const UserInteractionsHelper = require("../helpers/UserInteractions");

exports.add_interaction = function(req, res) {
  if (!req.body.userID || !req.body.type || !req.body.subType) {
    res.sendStatus(400);
  }
  else {
    UserInteractionsHelper.pushInteraction(req.body.type, req.body.subType, req.body.userID, req.body.data ? req.body.data : null)
    .then((document) => {
      res.status(200);
      res.send(document);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500)
    });
  }
}

exports.delete_interactions = function(req, res) {
  if (!req.body.userID) {
    res.sendStatus(400);
  }
  else {
    UserInteraction.remove({userID: req.body.userID})
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500)
    });
  }
}

exports.get_user_interactions = function(req, res) {
  if (!req.query.userID) {
    res.sendStatus(400);
  }
  else {
    const sortOrder = Number(req.query.sortOrder) ? Number(req.query.sortOrder) : -1;
    const limit = Number(req.query.limit) ? Number(req.query.limit) : 0;

    UserInteraction.find({ userID: req.query.userID }).sort({ timeStamp: sortOrder }).limit(limit)
    .then((results) => {
      res.status(200);
      res.send(results);
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
  }
};

exports.get_interactions_all = function(req, res) {
  UserInteraction.find({}).sort({ timeStamp: -1 })
  .then((results) => {
    res.status(200);
    res.send(results);
  })
  .catch((error) => {
    console.error(error);
    res.sendStatus(500);
  });
};