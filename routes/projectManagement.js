const Routes = require('express').Router();

const ProjectsController = require('../controllers/projectManagement');

Routes.post('/projectSave', ProjectsController.save_project);
Routes.get('/projectsGet', ProjectsController.get_projects);
Routes.get('/projectsDelete', ProjectsController.delete_projects);
Routes.get('/projectGet', ProjectsController.get_project);
Routes.get('/projectDelete', ProjectsController.delete_project);

module.exports = Routes;