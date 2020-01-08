const TaskRef = require('../models/taskRef');
const _ = require('lodash')

exports.save = (req, res) => {
  new TaskRef(req.body)
    .save((err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500)
      }

      res.status(200);
      res.send(data);
    })
}

exports.get_all = (req, res) => {
  TaskRef.find({}, (err, data) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500)
    }

    res.status(200);
    res.send(data);
  });
}

exports.update = (req, res) => {
  const _id = _.get(req, 'params.id')

  TaskRef.findOneAndUpdate({_id}, req.body, (err, data) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500)
    }

    if (data) {
      res.status(200);
      return res.send(data);
    }

    res.sendStatus(404);
  })
}

exports.delete = (req, res) => {
  TaskRef.deleteMany({
    _id: {
      $in: _.get(req, 'body.ids', '')
    }
  }, (err, data) => {
    if (!err) {
      res.status(200);
      res.send(data);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
  }
  );
}