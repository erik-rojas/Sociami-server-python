const Routes = require('express').Router();

const LogoutController = require('../controllers/logout');

Routes.post('/logout', LogoutController.logout);

module.exports = Routes;