const UserAccounting = require('../models/accounting/userAccounting');
const UserTransactions = require('../models/accounting/transactions');

exports.get_users_accountings = function (req, res) {
  UserAccounting.find({})
    .then((results) => {
      if (results) {
        res.status(200);
        res.send(results);
      }
      else {
        res.sendStatus(404);
      }
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
};

exports.get_user_accountings = async function (req, res) {
  if (!req.query.id) {
    res.sendStatus(400);
  }
  else {
    const userTransactions = await UserTransactions.find({ receiverId: req.query.id }).then((results) => results);
    const userAccounting = await UserAccounting.findOne({ userId: req.query.id }).then((result) => result);

    let result = {};

    if (userTransactions && userTransactions.length > 0) {
      result.userTransactions = userTransactions;
    }

    if (userAccounting) {
      result.userAccounting = userAccounting;
    }

    if (!result.userTransactions && !result.userAccounting) {
      result = undefined;
    }

    if (!result) {
      res.sendStatus(404);
    }
    else {
      res.status(200);
      res.send(result);
    }
  }
};

exports.get_users_transactions = function (req, res) {
  UserTransactions.find({})
    .then((results) => {
      if (results) {
        res.status(200);
        res.send(results);
      }
      else {
        res.sendStatus(404);
      }
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
};

exports.get_user_transactions = function (req, res) {
  if (!req.query.id) {
    res.sendStatus(400);
  }
  else {
    UserTransactions.find({ receiverId: req.query.id })
      .then((results) => {
        if (results) {
          res.status(200);
          res.send(results);
        }
        else {
          res.sendStatus(404);
        }
      })
      .catch((error) => {
        console.log(error);
        res.sendStatus(500);
      })
  }
};