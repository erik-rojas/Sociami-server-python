const async = require('async');
const _ = require('lodash');

const UserAchievementModel = require('../models/userAchievement')
const AchievementModel = require('../models/achievement')
const taskTemplate = require('./conditionTemplate/task.json')
const levelTemplate = require('./conditionTemplate/level.json')

/**
 * Get or create a UserAchievement. This will use to track each user's achievement
 * 
 * @param {*} userId 
 * @param {*} callback 
 */
const getUserAchievement = (userId, callback) => {
  async.waterfall([
    async.apply(UserAchievementModel.findOne.bind(UserAchievementModel), {userId}),
    (userAchievement, callback) => {
      if (userAchievement) {
        callback(null, userAchievement)
      } else {
        const newUserAchievementModel = new UserAchievementModel({userId})
        newUserAchievementModel.save((err, data) => callback(err, data))
      }
    }
  ], callback);
}

/**
 * Get the achievements base on the query
 * AchievementTypes - [task, level]
 * 
 * @param {*} body 
 * @param {*} callback 
 */
const getAchievements = (body, callback) => {

  /**
   * Sample:
   * body = {
        achievementType: "task",
        taskType: "Deepdive",
        taskId: "1234"
      }
   *
   * will check if an achievement has
   * conditions.taskType = 'Deepdive' (line: 56. condition that does not check whatever roadmap the user finished)
   * or conditions._roadmap = '1234' (line: 57. condition that does check whatever type of task it is (either Illuminate, Deepdive, etc))
   * or [conditions.taskType = 'Deepdive' and conditions._roadmap = '1234'] (line: 58. condition that will strictly check the type of the task and roadmap)
   */
  if (_.get(body, 'achievementType') === 'task') {
    const taskQuery = taskTemplate.task;
    const progressionQuery = taskTemplate.progression;
    const taskAndProgressionQuery = taskTemplate.taskAndProgression;

    _.set(taskQuery, 'conditions.$elemMatch.taskType.$eq', _.get(body, 'taskType'))
    _.set(progressionQuery, 'conditions.$elemMatch._roadmap.$eq', _.get(body, 'taskId'))
    _.set(taskAndProgressionQuery, 'conditions.$elemMatch.taskType.$eq', _.get(body, 'taskType'))
    _.set(taskAndProgressionQuery, 'conditions.$elemMatch._roadmap.$eq', _.get(body, 'taskId'))
    AchievementModel.find({
      $or:[
        taskQuery,
        progressionQuery,
        taskAndProgressionQuery
      ]
    }, callback)
  } else if (_.get(body, 'achievementType') === 'level') {
    /**
     * simply check the level of the user
     */
    const levelQuery = levelTemplate.roadmap;

    _.set(levelQuery, 'conditions.$elemMatch._roadmap.$eq', _.get(body, '_roadmap'));

    AchievementModel.find({
      $or:[
        levelQuery
      ]
    }, callback)
  } else {
    callback(undefined, undefined);
  }
}

const updateConditionMatched = (data, body, callback) => {

  const achievements = _.get(data, 'achievements') // the list of possible achievement that can increment counts
  const userAchievement = _.get(data, 'userAchievement') // the user's achievement tracker

  if (_.size(achievements)) {
    _.each(achievements, achievement => {
      // AchievementType of Story is for incremental taks like (Chapter 1: Noob, Chapter 2: Explorer).
      // It requires to finish the previous chapter first before proceeding to next
      let storyCondition = _.find(achievement.conditions, {type: 'Story'});
      let userAchievementItem = _.find(userAchievement.achievements, {achievementId: achievement.id}); // get the current achievement from the user tracker
      let userAchievementStory = {};

      if (storyCondition) {
        storyCondition = storyCondition.toObject()
        userAchievementStory = _.find(userAchievement.achievements, {achievementId: _.get(storyCondition, '_story').toString()})
      }

      // if achievement has story it must complete the story achievement first before allowing to update the achievement counters
      if (!storyCondition || 
        ( storyCondition && _.size(_.get(userAchievementStory, 'conditions', []))
          && _.every(_.get(userAchievementStory, 'conditions', []), {status: 'Complete'}))) {
        
        // if the achievement is not existing in the userAchievement tracker, then create a new one.
        if (!userAchievementItem) {
          userAchievementItem = {
            achievementId: achievement.id,
            conditions: achievement.conditions.toObject()
          }
          userAchievement.achievements.push(userAchievementItem);
          userAchievementItem = _.find(userAchievement.achievements, {achievementId: achievement.id});
        }
        
        /**
         * Task, Progression and Task and Progression types of conditions are almost co-related in each other
         * because when a user finish a Task in front-end, it already has a task type and roadmap id that is
         * why it falls in the same update condition status block
         */
        _.map(userAchievementItem.conditions, condition => {
          if ( (condition.type === "Task" && condition.taskType === body.taskType)
            || (condition.type === "Progression" && condition._roadmap == body.taskId)
            || (condition.type === "Task and Progression" && condition._roadmap == body.taskId && condition.taskType === body.taskType)
          ) {
            updateTaskStatus(condition)
          } else if (condition.type === "Level") {
            updateLevelStatus(condition, body.newLevel);
          }
          return condition;
        });
      }
    });

    UserAchievementModel.update({_id: userAchievement.id}, userAchievement, callback)
  } else {
    callback(undefined, {});
  }

}

/**
 * Each task condition has attached 'count' field on it where in the user requires to reach that counter 
 * in order to finish a certain condition. For example is when an achievement requires to finish 3x Deepdive
 * to acquire the title of 'The Deepdiver' then the user needs to have 3 Deepdives of any kind of roadmap to
 * finish it
 * 
 * @param {*} condition 
 */
function updateTaskStatus(condition) {
  let ctr = condition.counter || 0;
  // condition.counter is for user's to track how many of a certain condition he already get
  // condition.count is the max/required number of condition to finish it

  if (ctr < condition.count) { // ignore if the condition.counter reach the max
    ctr++;
    condition.counter = ctr;
    condition.status = ctr === condition.count ? "Complete" : "In progress" // mark as complete when the counter reached the equal count
  }
}

/**
 * When the user reach a certain level then assign the level to counter
 * Mark as Complete when the newLevel match the count
 * 
 */
function updateLevelStatus(condition, level) {
  const newLevel = level || 0;
  condition.counter = newLevel;
  condition.status = newLevel >= condition.count ? "Complete" : "In progress"
}

exports.update_user_achievement = (opts, callback) => {
  const userId = opts.userId;
  console.log(opts)
  async.parallel({
    userAchievement: callback => getUserAchievement(userId, callback),
    achievements: callback => getAchievements(opts.body, callback)
  }, (err, data) => {
    if (err) {
      callback(err)
    } else {
      updateConditionMatched(data, opts.body, (err, res) => {
        console.log(res)
      });
    }
  })
}

exports.get_achievements = getAchievements;
exports.get_user_achievement = getUserAchievement;
exports.update_condition_matched = updateConditionMatched;