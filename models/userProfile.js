const Mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = Mongoose.Schema;

const ProgressionManager = require('../utils/progression/ProgressionManager');
const UserAchievementHelper = require('../helpers/helper_userAchievement');

const UserProfileSchema = new Schema(
  {
    profile: {
      firstName: { type: String },
      lastName: { type: String },
      education: { type: String },
      experience: { type: String },
      interests: { type: String },
      skills: { type: String },
      progressionTreeLevels: [],
      level: { type: Number, default: 1 },
      currentLevelXP: { type: Number, default: 0 },
      totalXP: { type: Number, default: 0 },
      balance: { type: Number },
      numTokens: { type: Number, default: 0 },

      ratingsCount: {
        //record rating counts in [1..10] - e.g. - 2 x 5(2 x 5 stars), 4 x 7 (2 x 7 stars)
        type: Object,
        default: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
          '6': 0,
          '7': 0,
          '8': 0,
          '9': 0,
          '10': 0,
        },
      },
      character: {
        type: Object,
        default: null,
      },
      rating: {
        //calculate weighted-average stars from ratingsCount
        type: Number,
        default: 0,
      },
      pictureURL: {
        type: String,
        default: null,
      },
      coverBackgroundURL: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
    },
    facebookID: {
      type: String,
      unique: true,
    },
    linkedInID: {
      type: String,
      unique: true,
    },
    password: { type: String, select: false },
    //TODO: Gradually move from using facebook and linkedin ID to facebook._id and linkedin._id
    facebook: {
      _id: { type: String },
      token: { type: String, default: null },
      friends: { type: Array },
    },
    linkedin: {
      _id: { type: String },
      token: { type: String },
      friends: { type: Array },
    },
    roadmaps: [String],
    progressionTrees: [],
    hangouts: [],
    illuminates: [],
  },
  {
    usePushEach: true,
  }
);

UserProfileSchema.methods.getFacebookID = function getFacebookID() {
  return this.facebook && this.facebook._id
    ? this.facebook._id
    : this.facebookID;
};

UserProfileSchema.methods.getLinkedInID = function getLinkedInID() {
  return this.linkedin && this.linkedin._id
    ? this.linkedin._id
    : this.linkedInID;
};

UserProfileSchema.methods.recalculateRating = function addRate() {
  let nominator = 0;
  let denominator = 0;

  for (let key in this.profile.ratingsCount) {
    if (this.profile.ratingsCount[key] && this.profile.ratingsCount[key] > 0) {
      nominator += Number(key) * this.profile.ratingsCount[key];
    }
  }

  for (let key in this.profile.ratingsCount) {
    if (this.profile.ratingsCount[key] && this.profile.ratingsCount[key] > 0) {
      denominator += this.profile.ratingsCount[key];
    }
  }

  if (denominator > 0) {
    this.profile.rating = nominator / denominator;
  }
};

UserProfileSchema.methods.addRate = function addRate(rate) {
  if (typeof rate == 'number' && rate % 1 == 0 && (rate >= 1 && rate <= 10)) {
    //only accept integers in range [1..10]
    let ratingsCountCopy = Object.assign({}, this.profile.ratingsCount);
    ratingsCountCopy[rate.toString()] = ratingsCountCopy[rate.toString()] + 1; //add 1 to requested rate

    this.profile.ratingsCount = ratingsCountCopy;

    this.recalculateRating();
  }
};

UserProfileSchema.methods.addXpPerProgressionTree = function addXpPerProgressionTree(
  xp,
  tree
) {
  let progressionTreeLevel = this.profile.progressionTreeLevels.find(function(
    treeLevel
  ) {
    return treeLevel._id == tree._id;
  });

  //if this is first time progress for this progression tree
  if (!progressionTreeLevel) {
    //create and store new progressionTreeLevel into progressionTreeLevels
    progressionTreeLevel = {
      _id: tree._id,
      name: tree.name,
      currentLevelXP: 0,
      totalXP: 0,
      level: 0,
    };

    this.profile.progressionTreeLevels.push(progressionTreeLevel);
  }

  if (
    isNaN(progressionTreeLevel.currentLevelXP) ||
    progressionTreeLevel.currentLevelXP === undefined ||
    progressionTreeLevel.currentLevelXP === null
  ) {
    progressionTreeLevel.currentLevelXP = 0;
  }

  if (
    isNaN(progressionTreeLevel.totalXP) ||
    progressionTreeLevel.totalXP === undefined ||
    progressionTreeLevel.totalXP === null
  ) {
    progressionTreeLevel.totalXP = 0;
  }

  progressionTreeLevel.currentLevelXP += xp;
  progressionTreeLevel.totalXP += xp;

  const that = this;

  return ProgressionManager.get_level_from_experience(
    progressionTreeLevel.totalXP
  ).then(function(newLevel) {
    if (newLevel.level != progressionTreeLevel.level) {
      progressionTreeLevel.level = newLevel.level;
      progressionTreeLevel.currentLevelXP =
      progressionTreeLevel.totalXP - newLevel.experience;

      // update achievement type level
      const opts = {
        userId: that._id,
        body: {
          achievementType: 'level',
          _roadmap: progressionTreeLevel._id,
          newLevel: newLevel.level
        }
      }

      UserAchievementHelper.update_user_achievement(opts, (err, data) => {})
    }

    let profileCopy = Object.assign({}, that.profile);
    that.set('profile', profileCopy);

    return that.save();
  });
};

UserProfileSchema.methods.addTokens = function addTokens(count) {
  if (count <= 0) {
    return new Promise((resolve, reject) => {
      reject('Invalid argument');
    });
  }

  this.profile.numTokens += count;
  this.markModified('profile.numTokens');

  return this.save();
};

UserProfileSchema.methods.hashPassword = async function() {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        reject(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        resolve(hash);
      });
    });
  });
};

UserProfileSchema.methods.comparePassword = async function comparePassword(
  password,
  callback
) {
  return bcrypt.compare(password, this.password);
};

UserProfileSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.password;
    return ret;
  },
});

module.exports = Mongoose.model('UserProfile', UserProfileSchema);
