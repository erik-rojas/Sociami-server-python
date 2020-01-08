const _ = require("lodash");
const async = require("async");
const AchievementModel = require("../models/achievement");
const AchievementGroupModel = require("../models/achievementGroup");
const Busboy = require("busboy");
const AWS = require("aws-sdk");

exports.save_achievement = (req, res) => {
  const achievement = new AchievementModel(req.body);
  // comment out duplicate checker
  async.waterfall(
    [
      // (callback) => {
      //   if (_.get(req, 'body.type') != 'Achievement') {
      //     return callback(null, undefined);
      //   }
      //   // getAchievementByConditions(req, callback);
      //   callback(null, undefined);
      // },
      callback => {
        // if (data) {
        //   return callback(
        //     `Duplicate generic achievement exists! Achievement name: ${_.get(data, 'name')}`
        //   );
        // }
        achievement.save(callback);
      }
    ],
    (error, data) => {
      if (error) {
        res.status(500);
        res.send(error);
      } else {
        res.status(200);
        res.send(data);
      }
    }
  );
};

exports.save_achievement_group = (req, res) => {
  const achievement = new AchievementGroupModel(req.body);

  achievement.save((err, achievement) => {
    if (err) {
      console.log(err); // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(achievement);
    }
  });
};

exports.upload_achievement_image = (req, res) => {
  var busboy = new Busboy({ headers: req.headers });
  const isGroup = _.get(req, "query.group", "") === "Y";

  busboy.on("finish", function() {
    console.log("Upload finished");
    const file = req.files.image;

    const images = ["image/gif", "image/jpeg", "image/jpg", "image/png"];
    const mimetype = file.mimetype;
    if (images.indexOf(mimetype) == -1) {
      res.status(500);
      return res.json({
        success: false,
        error: "Invalid file format!"
      });
    }

    file.name = _.get(req, "params.id");
    uploadToS3(file, isGroup, (err, data) => {
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

exports.get_achievement_group = (req, res) => {
  const query = {};
  let findQuery = "find";
  const _company = _.get(req, "query.company");
  if (_company) {
    _.set(query, "_company", _company);
    findQuery = "findOne";
  }

  AchievementGroupModel[findQuery](query)
    .populate("_company")
    .populate({
      path: "_achievements",
      populate: {
        path: "conditions._story",
        model: "Achievements"
      }
    })
    .exec((err, agroup) => {
      if (err) {
        console.log(err); // handle errors!
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send(agroup);
      }
    });
};

exports.get_achievements = (req, res) => {
  const type = _.get(req, "query.type");
  const generic = _.get(req, "query.generic");
  const query = {};

  if (type) {
    query.type = type;
  }

  if (generic) {
    if (generic == "true") {
      query.generic = true;
    } else {
      query.$or = [
        { generic: { $exists: false } },
        { generic: { $eq: false } }
      ];
    }
  }

  AchievementModel.find(query, (err, docs) => {
    if (err) {
      console.log(err); // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(docs);
    }
  });
};

exports.delete_achievement = (req, res) => {
  AchievementModel.deleteOne(
    {
      _id: req.params.id
    },
    (err, doc) => {
      if (!err) {
        console.log("Achievement removed");
        res.status(200);
        res.send(doc);
      } else {
        console.log("Error: " + err);
        res.sendStatus(500);
      }
    }
  );
};

exports.delete_achievement_group = (req, res) => {
  AchievementGroupModel.deleteMany(
    {
      _id: {
        $in: req.body.ids
      }
    },
    (err, doc) => {
      if (!err) {
        console.log("Achievement group removed");
        res.status(200);
        res.send(doc);
      } else {
        console.log("Error: " + err);
        res.sendStatus(500);
      }
    }
  );
};

exports.update_achievement = (req, res) => {
  const _id = _.get(req, "params.id");
  if (!_id) {
    res.sendStatus(404);
  } else {
    async.waterfall(
      [
        // (callback) => {
        //   if (_.get(req, 'body.type') != 'Achievement') {
        //     return callback(null, undefined);
        //   }

        //   // getAchievementByConditions(req, callback);
        //   callback(null, {});
        // },
        callback => {
          // if (achievement) {
          //   return callback(
          //     `Duplicate generic achievement exists! Achievement name: ${_.get(
          //       achievement,
          //       'name'
          //     )}`
          //   );
          // }
          AchievementModel.update({ _id }, req.body, callback);
        }
      ],
      (error, data) => {
        if (error) {
          res.status(500);
          res.send(error);
        } else {
          res.status(200);
          res.send(data);
        }
      }
    );
  }
};

/**
 * Find achievement per conditions. Use to check if there is a duplicate achievement
 *
 * @param {*} req
 * @param {*} callback
 */
function getAchievementByConditions(req, callback) {
  const conditions = _.get(req, "body.conditions", []);
  const conditionsQuery = [];
  _.each(conditions, c => {
    delete c._id;
    delete c.id;
    conditionsQuery.push({ conditions: { $elemMatch: c } });
  });
  conditionsQuery.push({ conditions: { $size: _.size(conditions) } });
  const query = {
    generic: true,
    type: "Achievement",
    $and: conditionsQuery
  };
  AchievementModel.findOne(query, callback);
}

exports.update_achievement_group = (req, res) => {
  const _id = _.get(req, "params.id");
  if (!_id) {
    res.sendStatus(404);
  } else {
    AchievementGroupModel.update({ _id }, req.body, (err, data) => {
      if (err) {
        console.log(err); // handle errors!
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send(data);
      }
    });
  }
};

function uploadToS3(file, isGroup, callback) {
  const BUCKET_NAME = "admin.soqqle.com";
  const keyPrefix = isGroup ? "achievementGroupImages" : "achievementImages";
  let s3bucket = new AWS.S3({
    accessKeyId: "AKIAJQTXVEWBQJYDATVQ",
    secretAccessKey: "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",
    Bucket: BUCKET_NAME,
    region: "us-east-2"
  });
  s3bucket.createBucket(() => {
    var params = {
      Bucket: BUCKET_NAME,
      Key: `${keyPrefix}/${file.name}`,
      Body: file.data
    };
    s3bucket.upload(params, callback);
  });
}
