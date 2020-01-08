const Routes = require('express').Router();

const SupportController = require('../controllers/support');

Routes.post('/getUsersByName', SupportController.getUsersByName);
Routes.post('/getProgressionTreesData', SupportController.getProgressionTreesData);
Routes.post('/getCreatedTasks', SupportController.getCreatedTasks);
Routes.post('/getCanceledTasks', SupportController.getCanceledTasks);
Routes.post('/getJoinedTasks', SupportController.getJoinedTasks);
Routes.post('/getAcceptedTasks', SupportController.getAcceptedTasks);
Routes.post('/getStartedTasks', SupportController.getStartedTasks);
Routes.post('/getLoginLogoutInteractions', SupportController.getLoginLogoutInteractions);
Routes.post('/getCharacterCreation', SupportController.getCharacterCreation);


module.exports = Routes;