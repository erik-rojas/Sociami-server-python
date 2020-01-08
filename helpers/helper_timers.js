const async = require('async');
const TimerModel = require('../models/timer');
const CooldownTrackerModel = require('../models/cooldownTracker');
const _ = require('lodash')

exports.refreshTracker = (refresh) => {
  async.waterfall([
    async.apply(TimerModel.find.bind(TimerModel), {refresh}),
    (timers, callback) => {
      console.log(`Successfully update ${refresh} refresh`)
      const ids = _.map(timers, (timer) => _.get(timer, 'id'))
      CooldownTrackerModel.deleteMany({ _timer: {$in: ids}}, callback)
    }
  ], (err, data) => {
    if (err) {
      console.log(err);  // handle errors!
    }
  })
}