const Routes = require('express').Router();

const UserAchievementsController = require('../controllers/userAchievement');

Routes.put('/userAchievement/:userId', UserAchievementsController.update_user_achievement);
Routes.get('/userAchievement/:userId', UserAchievementsController.get_user_achievement);
Routes.get('/userAchievementTemp', UserAchievementsController.get_all_temporarily);

module.exports = Routes;
