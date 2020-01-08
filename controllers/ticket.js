const Ticket = require('../models/ticket');
const _ = require('lodash');
const async = require('async');

exports.save_ticket = (req, res) => {
  const comp = new Ticket(req.body);

  comp.save((err, comp) => {
    if(err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(comp);
    }
  });
}

exports.fetch_ticket = (req, res) => {
  Ticket.find()
    .then(result => {
      res.status(200);
      res.send(result);
    }).catch(err => {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    });
}

exports.fetch_ticket_by_id = (req, res) => {
  Ticket.findById(req.params.id)
    .then(result => {
      res.status(200);
      res.send(result);
    }).catch(err => {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    });
}

exports.update_ticket = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    _.set(req, 'body.last_updated', new Date());
    Ticket.update({_id}, req.body, (err, data) => {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send(data);
      }
    })
  }
}

exports.add_comment = (req, res) => {
  const _id = _.get(req, 'params.id');
  const message = _.get(req, 'body.message', '');

  Ticket.updateOne({_id}, {
    $push: {
      comments: {
        date: new Date(),
        message
      }
    }
  }, (err, data) => {
    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(data);
    }
  })
}

exports.patch_ticket = (req, res) => {
  const _id = _.get(req, 'params.id');
  const changes = _.get(req, 'body');
  if (!_id) {
    res.sendStatus(404);
  } else {
    async.waterfall([
        async.apply(Ticket.findById.bind(Ticket), _id),
        (ticket, callback) => {
          if (!ticket) {
            return callback('No tickets found!')
          }

          const historyLog = {
            date: new Date(),
            log: []
          };
          
          _.each(changes, (value, key) => {
            historyLog.log.push(`${_.capitalize(key)} changed from ${_.get(ticket, key, 'none')} to ${value}`)
          });

          _.set(changes, '$push', {history: historyLog})
          _.set(changes, 'last_updated', new Date())
          Ticket.update({_id}, changes, callback);
        }
      ], (err, data) => {
        if (err) {
          console.log(err);  // handle errors!
          res.sendStatus(500);
        } else {
          res.status(200);
          res.send(data);
        }
      })
  }
}

exports.delete_ticket = (req, res) => {
  console.log(req.body.ids)
  Ticket.deleteMany({
    _id: {
      $in: req.body.ids
    }
  }, (err, doc) => {
    if (!err) {
      res.status(200);
      res.send(doc);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
  })
}