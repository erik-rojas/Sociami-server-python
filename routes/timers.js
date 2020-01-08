const Routes = require('express').Router();

const TimersController = require('../controllers/timers');

Routes.post('/timers', TimersController.save_timer);
Routes.delete('/timers', TimersController.delete_timer);
Routes.get('/timers', TimersController.get_timers);
Routes.get('/timersAggregated', TimersController.get_aggregated_timers)
Routes.put('/timers/:id', TimersController.update_timer);

Routes.get('/timer', TimersController.get_timer)

Routes.get('/timers/track', TimersController.get_tracker)
Routes.get('/timers/track/all', TimersController.get_tracker_all)
Routes.get('/timers/track/wipe/all', TimersController.wipe_tracker_all)
Routes.put('/timers/track/incrementCount', TimersController.increment_count)
Routes.delete('/timers/track/:refreshType', TimersController.delete_tracker)

module.exports = Routes;