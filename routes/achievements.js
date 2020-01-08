const Routes = require('express').Router();
const AchievementsController = require('../controllers/achievements');

Routes.get('/achievements', AchievementsController.get_achievements)
Routes.post('/achievements', AchievementsController.save_achievement);
Routes.delete('/achievements/:id', AchievementsController.delete_achievement)
Routes.put('/achievements/:id', AchievementsController.update_achievement)
Routes.post('/achievements/:id/upload-image', AchievementsController.upload_achievement_image)

// groups
Routes.post('/achievement/group', AchievementsController.save_achievement_group)
Routes.get('/achievement/group', AchievementsController.get_achievement_group)
Routes.put('/achievement/group/:id', AchievementsController.update_achievement_group)
Routes.delete('/achievement/group', AchievementsController.delete_achievement_group)

module.exports = Routes;