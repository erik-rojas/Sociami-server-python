const Routes = require('express').Router();

var UserProfile = require('../models/userProfile');

const QuestionMaintenanceController = require('../controllers/questionsMaintenance');

Routes.post('/questionSave', QuestionMaintenanceController.save_question);
Routes.post('/questionUpdate', QuestionMaintenanceController.update_question);
Routes.get('/questionGet', QuestionMaintenanceController.get_question); 
Routes.get('/questionsGet', QuestionMaintenanceController.get_questions);
Routes.get('/questionRemove', QuestionMaintenanceController.remove_question);
Routes.delete('/questionsRemove', QuestionMaintenanceController.remove_questions); 

module.exports = Routes;