const ConditionTypes = require('./UnlockConditionTypes');

let UnlockConditions = {

}

UnlockConditions.CreateConditionStatic = (type, data) => {
    let unlockCondition = undefined;

    switch(type) {
        case ConditionTypes.USER_LEVEL_MIN: {
            unlockCondition = {type: type, value: data.value};
            break;
        }
        case ConditionTypes.USER_XP_MIN: {
            unlockCondition = {type: type, value: data.value};
            break;
        }
        case ConditionTypes.USER_PROGRESSION_TREE_LEVEL_MIN: {
            unlockCondition = {type: type, value: data};
            break;
        }
        default:
          break;
    }

    return unlockCondition;
};

UnlockConditions.CreateConditionDynamic = (conditionStatic) => {
    let unlockCondition = undefined;

    switch(conditionStatic.type) {
        case ConditionTypes.USER_LEVEL_MIN: {
            unlockCondition = Object.assign({}, conditionStatic);
            unlockCondition.checkUnlocked = function(userProfile) {
                console.dir(this);
                return userProfile.level >= this.value;
            }
            break;
        }
        case ConditionTypes.USER_XP_MIN: {
            unlockCondition = Object.assign({}, conditionStatic, {
                checkUnlocked: (userProfile) => { return userProfile.totalXP >= this.value;}
            });
            break;
        }
        case ConditionTypes.USER_PROGRESSION_TREE_LEVEL_MIN: {
            unlockCondition = Object.assign({}, conditionStatic, {
                checkUnlocked: (userProfile) => {
                    let foundTreeLevel = userProfile.profile.progressionTreeLevels ? userProfile.profile.progressionTreeLevels.find(function(treeLevel) {
                        return treeLevel._id == this.value.treeId;
                    }) : undefined;

                   return foundTreeLevel && foundTreeLevel.level >= this.value.minLevel;
                }
            });
            break;
        }
        default:
          break;
    }

    return unlockCondition;
};

module.exports = UnlockConditions;