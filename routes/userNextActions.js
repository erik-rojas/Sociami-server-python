const Routes = require('express').Router();

const Controller = require('../controllers/userNextActions');

Routes.post('/userNextActionsGet', Controller.get_next_interaction);

module.exports = Routes;