const _ = require('lodash');
const async = require('async');
const HouseModel = require('../models/house');
const Busboy = require('busboy');
const AWS = require('aws-sdk');

exports.save_house = (req, res) => {
  const house = new HouseModel(req.body);

  async.waterfall([
    (callback) => {
      if (_.get(req, 'body.type') != 'House') {
        return callback(null, undefined);
      }
      getHouseByConditions(req, callback);
    },
    (data, callback) => {
      if (data) {
        return callback(`Duplicate generic house exists! House name: ${_.get(data, 'name')}`)
      }
      house.save(callback)
    }
  ], (error, data) => {
    if (error) {
      res.status(500);
      res.send(error);
    } else {
      res.status(200);
      res.send(data);
    }
  })
}

exports.upload_house_image = (req, res) => {
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('finish', function() {
    console.log('Upload finished');
    const file = req.files.image;

    const images = [
      'image/gif',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]
    const mimetype = file.mimetype;
    if (images.indexOf(mimetype) == -1) {
      res.status(500);
      return res.json({
          success: false,
          error: 'Invalid file format!'
        });
    }

    file.name = _.get(req, 'params.id');
    uploadToS3(file, (err, data) => {
      if(err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        HouseModel.update({_id: req.params.id}, {
          imageUrl: data.Location
        }, (err) => {
          if(!err) {
            res.status(200);
            res.send(data);
          } else {
            res.status(500);
            res.send(err);
          }
        })
      }
    });
  });

  req.pipe(busboy);
}

exports.get_houses = (req, res) => {
  const email = _.get(req, 'query.email');
  const query = {};

  if(email) {
    query.admin = email
  }

  HouseModel.find(query, (err, docs) => {
    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(docs);
    }
  })
}

exports.delete_house = (req, res) => {
  HouseModel.deleteOne({
    _id: req.params.id
  }, (err, doc) => {
    if (!err) {
      console.log('House removed');
      res.status(200);
      res.send(doc);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
  })
}

exports.update_house = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    async.waterfall([
      (callback) => {
        if (_.get(req, 'body.type') != 'House') {
          return callback(null, undefined);
        }

        getHouseByConditions(req, callback);
      }, (house, callback) => {
        if (house) {
          return callback(`Duplicate generic house exists! House name: ${_.get(house, 'name')}`)
        }
        HouseModel.update({_id}, req.body, callback)
      }
    ], (error, data) => {
      if (error) {
        res.status(500);
        res.send(error);
      } else {
        res.status(200);
        res.send(data);
      }
    })
  }
}

function getHouseByConditions(req, callback) {
  const conditions = _.get(req, 'body.conditions', []);
  const conditionsQuery = [];
  _.each(conditions, c => {
    delete c._id;
    delete c.id;
    conditionsQuery.push({conditions:{ $elemMatch: c }})
  });
  conditionsQuery.push({conditions:{$size: _.size(conditions)}})
  const query = {
    generic: true,
    type: 'House',
    $and: conditionsQuery
  }
  HouseModel.findOne(query, callback)
}

function uploadToS3(file, callback) {
  const BUCKET_NAME = 'admin.soqqle.com'
  let s3bucket = new AWS.S3({
    accessKeyId: 'AKIAJQTXVEWBQJYDATVQ',
    secretAccessKey: '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',
    Bucket: BUCKET_NAME,
    region: 'us-east-2'
  });
  s3bucket.createBucket(() =>{
      var params = {
        Bucket: BUCKET_NAME,
        Key: `houseImages/${file.name}`,
        Body: file.data
      };
      s3bucket.upload(params, callback);
  });
}