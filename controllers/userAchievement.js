const async = require("async");
const _ = require("lodash");

const UserAchievementHelper = require("../helpers/helper_userAchievement");
const UserAchievementModel = require("../models/userAchievement");
const AchievementGroup = require("../models/achievementGroup");
const Company = require("../models/company");
/*
  body: {
    achievementType: "task",
    taskType: "Deepdive",
    taskId: "taskId"
  }
*/
exports.update_user_achievement = function(req, res) {
  const userId = _.get(req, "params.userId");

  async.parallel(
    {
      userAchievement: callback =>
        UserAchievementHelper.get_user_achievement(userId, callback),
      achievements: callback =>
        UserAchievementHelper.get_achievements(req.body, callback)
    },
    (err, data) => {
      UserAchievementHelper.update_condition_matched(
        data,
        req.body,
        (err, result) => {
          res.status(200);
          res.send(result);
        }
      );
    }
  );
};

exports.get_user_achievement = (req, res) => {
  const userId = _.get(req, "params.userId");
  UserAchievementModel.findOne({ userId }, (err, data) => {
    res.status(200);
    res.send(data);
  });
};

exports.get_all_temporarily = (req, res) => {
  // const userId = _.get(req, "params.userId");

  let achievementsData = [];
  AchievementGroup.aggregate([
    {
      $lookup: {
        from: "companies",
        localField: "_company",
        foreignField: "_id",
        as: "company"
      }
    },
    {
      $lookup: {
        from: "achievements",
        localField: "_achievements",
        foreignField: "_id",
        as: "achievements"
      }
    }
  ])
    .then(data => {
      achievementsData = data;

      return Company.find({});
    })
    .then(companies => {
      res.status(200);
      res.json({
        achievementsData,
        companies,
      });
    })
    .catch(err => {
      res.status(200);
      res.send([]);
    });
};
