const UserLevel = require('../../models/progression/userLevels');

const UnlockConditionTypes = require('./UnlockConditionTypes');
const UnlockConditions = require('./UnlockConditions');

const TaskBonus = require('../../models/taskBonuses');
const XpRanges = require('../../models/progression/xpRange');
const TimerModel = require('../../models/timer');
const CooldownTrackerModel = require('../../models/cooldownTracker');

const Roadmap = require('../../models/deepdive/roadmap');

const PubSub = require('pubsub-js');
const async = require('async');
const _ = require('lodash');

const BroadcastEventAccountingUpdated = (userIds, data) => {
    const eventObj = {
      eventType: "accounting_updated",
      userIdList: userIds,
      ...data,
    };
  
    PubSub.publish("EVENT", eventObj);
  };

const get_xp_ranomized = function get_xp_ranomized(xpRange) {
    return new Promise((resolve, reject) => {
        return XpRanges.findOne({index: xpRange})
        .then(function(foundRange){
            let result = undefined;
            if (foundRange) {
                result = Math.floor(Math.random() * (foundRange.max - foundRange.min + 1)) + foundRange.min;
            }
            resolve(result);
        })
        .catch(function(error){
            reject(error);
        })
    });
};

const get_xp_range_from_level = function get_xp_range_from_level(level) {
    return new Promise((resolve, reject) => {
        return UserLevel.findOne({level: level})
        .then(function(foundLevel){
            if (foundLevel) {
                resolve(foundLevel.range);
            }
            else {
                resolve(undefined);
            }
        })
        .catch(function(error){
            reject(error);
        })
    });
};

const get_task_bonus_factor = function get_task_bonus_factor(difficulty) {
    return new Promise((resolve, reject) => {
        return TaskBonus.findOne({difficulty: difficulty})
        .then(function(foundBonus){
            let result = 1;
            if (foundBonus) {
                result = foundBonus.factor;
            }
            resolve(result);
        })
        .catch(function(error){
            reject(error);
        })
    });
};

const get_progression_tree = function get_progression_tree(treeId) {
    return new Promise((resolve, reject) => {
        return Roadmap.findById(treeId)
        .then(function(foundRoadmap){
            if (foundRoadmap) {
                resolve(foundRoadmap);
            }
            else {
                resolve({});
            }
            
        })
        .catch(function(error){
            reject(error);
        })
    });
};

const check_roadmap_unlock_condition = (condition, userProfile) => {
    const ConditionDynamic = UnlockConditions.CreateConditionDynamic(condition);
    return ConditionDynamic.checkUnlocked(userProfile.profile);
}

exports.get_level_from_experience = function(experience) {
    return new Promise((resolve, reject) => {
        return UserLevel.find().sort({level: 1})
        .then(function(userLevels){
            let level = 1;
    
            if (userLevels) {
                for (let i = 0; i < userLevels.length; ++i) {
                    if (experience >= userLevels[i].experience) {
                        level = userLevels[i];
                    }
                    else {
                        break;
                    }
                }
            }
            resolve(level);
        })
        .catch(function(error){
            reject(error);
        })
    });
};

exports.check_roadmap_unlock_conditions = function(roadmap, userId) {
    return new Promise((resolve, reject) => {
        let isLocked = false;
        const UserProfile = require('../../models/userProfile');
        return UserProfile.findOne({_id: userId})
          .then(function(foundProfile) {
            if (foundProfile) {
                for (let i = 0; i < roadmap.unlockConditions.length; ++i) {
                    if (!check_roadmap_unlock_condition(roadmap.unlockConditions[i], foundProfile)) {
                        isLocked = true;
                        break;
                    }
                }
            }            
            resolve(isLocked);
        })
        .catch(function(error){
            reject(error);
        });
    });
};

exports.add_user_xp_for_progression_tree = function add_user_xp_for_progression_tree (userId, tree) {
    return new Promise((resolve, reject) => {
        const UserProfile = require('../../models/userProfile');
        return UserProfile.findOne({_id: userId})
          .then(async function(foundProfile) {
            if (foundProfile) {
                let currentLevel = 0;

                if (foundProfile.profile.progressionTreeLevels) {
                    let foundTreeLevel = foundProfile.profile.progressionTreeLevels.find(function(treeLevel) {
                        return treeLevel._id == tree._id;
                    });

                    if (foundTreeLevel) {
                        currentLevel = foundTreeLevel.level;
                    }
                }

                if (isNaN(currentLevel) || currentLevel === null || currentLevel === undefined) {
                    currentLevel  = 0; //=> fix issue with level being set to null
                }

                const treeLevelMax = await get_progression_tree(tree._id).then((tree) => tree.levelMax ? tree.levelMax : 1);

                if (currentLevel >= treeLevelMax) {
                    resolve();
                }
                else {
                    const xpRange = await get_xp_range_from_level(currentLevel).then((range) => range);
                    const awardXP = await get_xp_ranomized(xpRange).then((xp) => xp);
                    const taskBonusFactor = await get_task_bonus_factor(tree.difficulty).then((bonusFactor) => bonusFactor);

                    foundProfile.addXpPerProgressionTree(awardXP * taskBonusFactor, tree)
                    .then(function() {
                       resolve();
                    })
                }
            }
            else {
                reject(`User ${userId} not found!`);
            }            
        })
        .catch(function(error){
            reject(error);
        });
    });
};

const add_tokens_to_users = async function add_tokens_to_users (count, userIds, data) {
    if (!count || count <= 0 || !userIds || (Array.isArray(userIds) && userIds.length === 0)) {
        return new Promise((resolve, reject) => {
            reject("Invalid argument");
        });
    }

    const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];

    const UserAccounting = require('../../models/accounting/userAccounting');
    const UserTransactions = require('../../models/accounting/transactions');

    let foundUserAccountings = await UserAccounting.find({userId: {$in: userIdsArray}}).
    then((results) => results);

    if (foundUserAccountings.length < userIdsArray.length) {
        //if there are new users that don't have accounting records yet - create new record for each of them
        userIdsArray.forEach((currentUserId) => {
            if (!foundUserAccountings.find((userAccounting) => {
                return userAccounting._id.toString() === currentUserId;
            })) {
                foundUserAccountings.push(
                    new UserAccounting({
                        userId: currentUserId,
                    })
                );
            }
        })   
    }

    //if found - add token to each of them
    let promises = [];

    const timestamp = Date.now();

    foundUserAccountings.forEach(userAccounting => {
        userAccounting.set('numTokens', userAccounting.numTokens + count);
        promises.push(userAccounting.save());

        const transactionData = data || {};
        promises.push(new UserTransactions({
            receiverId: userAccounting.userId.toString(),
            numTokens: count,
            timestamp: timestamp,
            ...transactionData
        }).save());
    });

    await Promise.all(promises);

    const UserProfile = require('../../models/userProfile');

    let foundUserProfiles = await UserProfile.find({_id: {$in: foundUserAccountings.map((accounting) => {
        return accounting.userId;
    })}}).
    then((results) => results);

    BroadcastEventAccountingUpdated(foundUserProfiles.map((userProfile) => {
        return userProfile._id.toString();
    }), {...data, numTokens: count});

    return new Promise((resolve, reject) => {
        resolve();
    })
}

exports.increment_task_count = function (roadmapId, userId, type, callback) {
  const _roadmap = roadmapId;
  async.waterfall([
    async.apply(TimerModel.findOne.bind(TimerModel), {_roadmap, type}),
    (timer, callback) => {
      if (timer) {
        callback(null, timer._id)
      } else {
        TimerModel.findOne({name: 'All', type}, (err, t) => {
          if (!t) {
            return callback('No timers and cooldowns found')
          }
          callback(err, _.get(t, '_id'))
        })
      }
    },
    (timerId, callback) => {
      CooldownTrackerModel.findOneAndUpdate({
        _timer: timerId,
        _userProfile: userId
      },
      { $inc: {
          count: 1
        }
      },
      { upsert: true },
      callback);
    }
  ], callback)
}

exports.add_tokens_to_users = add_tokens_to_users;

exports.get_task_bonus_factor = get_task_bonus_factor;

exports.get_xp_ranomized = get_xp_ranomized;