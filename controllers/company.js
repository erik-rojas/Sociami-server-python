const Company = require('../models/company');
const _ = require('lodash');
const Busboy = require('busboy');
const AWS = require('aws-sdk');

exports.save_company = (req, res) => {
  const comp = new Company(req.body);

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

exports.fetch_company = (req, res) => {
  const email = _.get(req, 'query.email');
  const query = {};

  if(email) {
    query.emails = email
  }
  Company.find(query).then(result => {
      res.status(200);
      res.send(result);
    }).catch(err => {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    });
}

exports.update_company = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    Company.update({_id}, req.body, (err, data) => {
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

exports.upload_company_image = (req, res) => {
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
        Company.update({_id: req.params.id}, {
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

exports.delete_company = (req, res) => {
  console.log(req.body.ids)
  Company.deleteMany({
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
        Key: `companyImages/${file.name}`,
        Body: file.data
      };
      s3bucket.upload(params, callback);
  });
}