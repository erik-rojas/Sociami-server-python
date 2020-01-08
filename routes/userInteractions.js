const Routes = require('express').Router();

const Controller = require('../controllers/userInteractions');

Routes.post('/userInteractionAdd', Controller.add_interaction);
Routes.get('/userInteractionsGet', Controller.get_user_interactions);
Routes.get('/userInteractionsGetAll', Controller.get_interactions_all);

Routes.post('/userInteractionsDelete', Controller.delete_interactions);

module.exports = Routes;