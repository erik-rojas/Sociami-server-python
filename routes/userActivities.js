const Routes = require('express').Router();

const UserActivitiesController = require('../controllers/userActivitiesController');

Routes.post('/userActivityAdd', UserActivitiesController.add_activity);
Routes.get('/userActivitiesGet', UserActivitiesController.get_activities); //id as userID

Routes.get('/userActivitiesGetAll', UserActivitiesController.get_activities_all);

Routes.get('/userActivitiesDrop', UserActivitiesController.drop_activities_for_user); //id as userID

Routes.post('/userActivityMarkSeenByUser', UserActivitiesController.mark_activity_seen_by_user);

module.exports = Routes;