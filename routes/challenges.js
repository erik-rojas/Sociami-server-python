const Routes = require('express').Router();
const ChallengesController = require('../controllers/challenges');

Routes.post('/challenges', ChallengesController.create);
Routes.get('/challenges', ChallengesController.get_all);
Routes.get('/challenges/:id', ChallengesController.get_by_id);
Routes.delete('/challenges/:id', ChallengesController.delete_by_id);
Routes.put('/challenges/:id', ChallengesController.update_by_id);

module.exports = Routes;