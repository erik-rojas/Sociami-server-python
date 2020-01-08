const Routes = require('express').Router();

const HangoutsController = require('../controllers/hangouts');

Routes.post('/hangoutJoin', HangoutsController.join);
Routes.post('/hangoutLeave', HangoutsController.leave);

Routes.get('/DEPRECATEDsocialrequestsGet', HangoutsController.get_social_requests); //DEPRECATED
Routes.get('/DEPRECATEDsocialrequestsRemove', HangoutsController.remove_social_requests); //DEPRECATED

Routes.post('/hangoutJoinStatusChange', HangoutsController.join_status_change);
Routes.get('/hangoutsGetById', HangoutsController.get_all_by_id);

Routes.post('/hangoutRateParticipant', HangoutsController.rate_participant);

module.exports = Routes;