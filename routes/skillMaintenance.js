const Routes = require('express').Router();

var UserProfile = require('../models/userProfile');

const SkillMaintenanceController = require('../controllers/skillMaintenance');

Routes.post('/skillSave', SkillMaintenanceController.save_skill);
Routes.post('/skillUpdate', SkillMaintenanceController.update_skill);
Routes.get('/skillGet', SkillMaintenanceController.get_skill); 
Routes.get('/skillsGet', SkillMaintenanceController.get_all_skills);
Routes.get('/skillRemove', SkillMaintenanceController.remove_skill);
Routes.delete('/skillsRemove', SkillMaintenanceController.remove_skills);

Routes.post('/skill/:id/upload-image', SkillMaintenanceController.upload_skill_image)

module.exports = Routes;