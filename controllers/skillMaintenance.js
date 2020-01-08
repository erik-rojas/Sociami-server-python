const Skills = require('../models/deepdive/skills');
const ObjectHelper = require('../helpers/object_helper');
const Busboy = require('busboy');
const AWS = require('aws-sdk');
const _ = require('lodash');

exports.save_skill = function (req, res) {
  if (!req.body.skill) {
    res.sendStatus(400);
  } else {
    let newSkills = new Skills({});
    req.body.insdt = new Date();
    ObjectHelper.copyProperties(req.body, newSkills, { _id: '', __v: '' });

    newSkills.save(function (err, skill) {
      if (err) {
        console.log(err); // handle errors!
        res.sendStatus(500);
      } else {
        console.log(`Skills: ${skill._id} ${skill.name} has been saved.`);
        res.status(200);
        res.send(skill);
      }
    });
  }
};

exports.get_skill = function (req, res) {
  const _skillId = req.query.id;
  const _skillName = req.query.name;

  if (!_skillId && !_skillName) {
    res.sendStatus(400);
  } else {
    const query = _skillId ? { _id: _skillId } : { skill: _skillName };
    Skills.findOne(query)
      .populate({
        path: '_achievements'
      })
      .populate({
        path: '_objective'
      })
      .populate({
        path: 'reward._achievement'
      })
      .exec(function (err, foundSkill) {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        }
        if (foundSkill) {
          res.status(200);
          res.send(foundSkill);
        } else {
          res.status(404);
          res.send({});
        }
      });
  }
};

exports.get_all_skills = function (req, res) {
  Skills.find({})
    .sort({ insdt: -1 })
    .populate({
      path: '_achievements'
    })
    .populate({
      path: '_objective'
    })
    .populate({
      path: 'reward._achievement'
    })
    .exec(function (err, foundSkills) {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
      if (foundSkills) {
        res.status(200);
        res.send(foundSkills);
      } else {
        res.status(404);
        res.send([]);
      }
    });
};

exports.remove_skill = function (req, res) {
  let _skillId = req.query.id;

  if (!_skillId) {
    res.sendStatus(400);
  } else {
    Skills.findByIdAndRemove(_skillId, function (err, doc) {
      if (!err) {
        console.log('Skill removed');
        res.status(200);
        res.send(doc);
      } else {
        console.log('Error: ' + err);
        res.sendStatus(500);
      }
    });
  }
};

exports.update_skill = function (req, res) {
  let _skillId = req.body._id;

  if (!_skillId) {
    res.sendStatus(400);
  } else {
    let data = {};
    ObjectHelper.copyProperties(req.body, data, { _id: '', __v: '' });
    Skills.findOneAndUpdate({ _id: _skillId }, data, { upsert: true, new: true }, function (
      err,
      foundSkill
    ) {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
      if (foundSkill) {
        res.status(200);
        res.send(foundSkill);
      } else {
        res.status(404);
        res.send({});
      }
    });
  }
};

exports.remove_skills = function (req, res) {
  Skills.remove({}, function (err, doc) {
    if (!err) {
      console.log('Skills removed');
      res.sendStatus(200);
    } else {
      console.log('Error: ' + err);
      res.sendStatus(500);
    }
  });
};

exports.upload_skill_image = function (req, res) {
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('finish', function () {
    console.log('Upload finished');
    const file = req.files.image;

    const images = [ 'image/gif', 'image/jpeg', 'image/jpg', 'image/png' ];
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
      if (err) {
        console.log(err); // handle errors!
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send(data);
      }
    });
  });

  req.pipe(busboy);
};

function uploadToS3 (file, callback) {
  const BUCKET_NAME = 'admin.soqqle.com';
  let s3bucket = new AWS.S3({
    accessKeyId: 'AKIAJQTXVEWBQJYDATVQ',
    secretAccessKey: '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',
    Bucket: BUCKET_NAME,
    region: 'us-east-2'
  });
  s3bucket.createBucket(() => {
    var params = {
      Bucket: BUCKET_NAME,
      Key: `skillImages/${file.name}`,
      Body: file.data
    };
    s3bucket.upload(params, callback);
  });
}
