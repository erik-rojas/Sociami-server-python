const Routes = require('express').Router();

const Controller = require('../controllers/userAccounting');
Routes.get('/usersAccountings', Controller.get_users_accountings);
Routes.get('/userAccounting', Controller.get_user_accountings);

Routes.get('/usersTransactions', Controller.get_users_transactions);
Routes.get('/userTransaction', Controller.get_user_transactions);

module.exports = Routes;