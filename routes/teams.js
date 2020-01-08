const Routes = require('express').Router();

const TeamsController = require('../controllers/teams');

Routes.get('/team/all', TeamsController.get_teams);
Routes.get('/team/:id', TeamsController.get_team)
Routes.post('/team', TeamsController.save_team);
Routes.put('/team/:id', TeamsController.update_team);
Routes.put('/team/:id/email', TeamsController.update_team_email);
Routes.delete('/team/:id', TeamsController.delete_team);

module.exports = Routes;