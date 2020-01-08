const Routes = require('express').Router();

const PreferenceController = require('../controllers/preferences');

Routes.put('/preferences/:userId', PreferenceController.save_preferences);
Routes.get('/preferences/:userId', PreferenceController.get_preferences); 

module.exports = Routes;