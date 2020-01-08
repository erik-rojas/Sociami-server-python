const _ = require('lodash');
const Challenge = require('../models/challenge');
const async = require('async');

function hasMissingRequiredFields (body) {
  const requiredFields = ['userID', 'name', 'description', 'success'];
  return _.find(requiredFields, field => !_.get(body, field));
}

exports.create = (req, res) => {
  const body = _.get(req, 'body', {});

  if(hasMissingRequiredFields(body)) {
   return res.status(400).send('userID, name, description and success are required.');
  }

  async.waterfall([
    callback => new Challenge(body).save(callback)
  ], (err, data) => {
    if (err) {
      return res.status(500).send(err)
    }

    res.status(200).send(data);
  })
  
}

exports.update_by_id = (req, res) => {
  const _id = _.get(req, 'params.id');
  const body = _.get(req, 'body', {});

  if(hasMissingRequiredFields(body)) {
   return res.status(400).send('userID, name, description and success are required.');
  }

  async.waterfall([
    callback => Challenge.updateOne({ _id }, body, callback)
  ], (err, data) => {
    if (err) {
      return res.status(500).send(err)
    }

    res.status(200).send(data);
  });

}

exports.get_all = (req, res) => {
  Challenge.find({}, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.status(200).send(data);
  })
}

exports.get_by_id = (req, res) => {
  const _id = _.get(req, 'params.id');
  Challenge.findById(_id, (err, data) => {
    if (err) {
      return res.status(500).send(err)
    }

    if(!data) {
      return res.status(404).send('Challenge not found');
    }
    res.status(200).send(data);
  })
}

exports.delete_by_id = (req, res) => {
  const _id = _.get(req, 'params.id');
  Challenge.deleteOne({ _id }, (err, data) => {
    if (err) {
      return res.status(500).send(err)
    }
    res.status(200).send(data);
  })
}