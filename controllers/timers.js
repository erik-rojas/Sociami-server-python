const TimerModel = require('../models/timer');
const CooldownTrackerModel = require('../models/cooldownTracker');
const _ = require('lodash');
const async = require('async');

exports.save_timer = (req, res) => {
  const params = {
    name: _.get(req, 'body.name', ''),
    type: _.get(req, 'body.type', ''),
    quota: _.get(req, 'body.quota', ''),
    refresh: _.get(req, 'body.refresh', ''),
    _roadmap: _.get(req, 'body._roadmap'),
  };
  
  const timer = new TimerModel(params);

  timer.save((err, timer) => {
    if(err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      console.log(`Timer _id: ${timer._id} _roadmap: ${timer._roadmap} quota: ${timer.quota} refresh: ${timer.refresh} saved!`);
      res.status(200);
      res.send(timer);
    }
  });

}

exports.delete_timer = (req, res) => {
  console.log(req.body.ids)
  TimerModel.deleteMany({
    _id: {
      $in: req.body.ids
    }
  }, (err, doc) => {
    if (!err) {
      console.log('Timers and Cooldowns removed');
      res.status(200);
      res.send(doc);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
  })
}

exports.get_timers = (req, res) => {
  TimerModel.find()
    .populate({
      path: '_roadmap',
      select: 'name'
    })
    .exec((err, timers) => {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send(timers);
      }
    })
}

exports.get_tracker = (req, res) => {
  const _timer = _.get(req, 'query.timerId')
  const _userProfile = _.get(req, 'query.userId')

  CooldownTrackerModel.findOne({_timer, _userProfile}, (err, tracker) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.status(200)
      res.send(tracker)
    }
  })
}

exports.get_tracker_all = (req, res) => {
  CooldownTrackerModel.find({}, (err, trackers) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.status(200)
      res.send(trackers)
    }
  })
}

exports.wipe_tracker_all = (req, res) => {
  CooldownTrackerModel.remove({})
    .then(() => {
      CooldownTrackerModel.collection.dropIndexes()
        .then(() => {
            res.sendStatus(200);
        })
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(500);
    });
}

function fetchAggregatedTimer(_roadmap, type, _userProfile, callback) {
  async.waterfall([
    async.apply(TimerModel.findOne.bind(TimerModel), {_roadmap, type}),
    (timer, callback) => {
      !timer ? TimerModel.findOne({type, name: 'All'}, callback) : callback(null, timer);
    },
    (timer, callback) => {
      CooldownTrackerModel.findOne( {_timer: timer._id, _userProfile},
      (err, tracker) => {
        if (err) {
          callback(null, {});
        } else {
          callback(null, {timer, tracker});
        }
      })
    }
  ], (err, data) => {
    callback(null, data);
  });
}

exports.get_aggregated_timers = (req, res) => {
  const _roadmap = _.get(req, 'query.roadmapId');
  const _userProfile = _.get(req, 'query.userId')
  async.parallel([
    async.apply(fetchAggregatedTimer, _roadmap, 'Illuminate', _userProfile),
    async.apply(fetchAggregatedTimer, _roadmap, 'Deepdive', _userProfile),
    async.apply(fetchAggregatedTimer, _roadmap, 'Decode', _userProfile)   
  ], (err, results) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(results);
    }
  });
}

exports.get_timer = (req, res) => {
  const _roadmap = _.get(req, 'query.roadmapId');
  const type = _.get(req, 'query.type');

  console.log(_roadmap)
  if (!_roadmap && !type) {
    res.send(404)
    return true;
  }

  async.waterfall([
    async.apply(TimerModel.findOne.bind(TimerModel), {_roadmap, type}),
    (timer, callback) => {
      if (timer) {
        return callback(null, timer)
      } else {
        TimerModel.findOne({type, name: 'All'}, callback)
      }
    }
  ], (err, data) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(data);
    }
  })
}
exports.update_timer = (req, res) => {
  const _id = _.get(req, 'params.id');
  console.log(_id)
  if (!_id) {
    res.sendStatus(404);
  } else {
    TimerModel.update({_id}, req.body, (err, data) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      } else {
        TimerModel.findById(_id)
        .populate({
          path: '_roadmap',
          select: 'name'
        })
        .exec((err, timers) => {
          if (err) {
            console.log(err);  // handle errors!
            res.sendStatus(500);
          } else {
            res.status(200);
            res.send(timers);
          }
        })
      }
    })
  }
}

exports.increment_count = (req, res) => {
  const _roadmap = _.get(req, 'body.roadmapId');
  const userId = _.get(req, 'body.userId');
  const type = _.get(req, 'body.type');
  async.waterfall([
    async.apply(TimerModel.findOne.bind(TimerModel), {_roadmap, type}),
    (timer, callback) => {
      if (timer) {
        callback(null, timer._id)
      } else {
        TimerModel.findOne({name: 'All', type}, (err, t) => {
          if (!t) {
            return callback('No timers and cooldowns found')
          }
          callback(err, _.get(t, '_id'))
        })
      }
    },
    (timerId, callback) => {
      CooldownTrackerModel.findOneAndUpdate({
        _timer: timerId,
        _userProfile: userId
      },
      { $inc: {
          count: 1
        }
      },
      { upsert: true },
      callback);
    }
  ], (err, data) => {

    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(data);
    }
  })
}

exports.delete_tracker = (req, res) => {
  const refresh = _.get(req, 'params.refreshType');

  async.waterfall([
    async.apply(TimerModel.find.bind(TimerModel), {refresh}),
    (timers, callback) => {
      const ids = _.map(timers, (timer) => _.get(timer, 'id'))
      CooldownTrackerModel.deleteMany({ _timer: {$in: ids}}, callback)
    }
  ], (err, data) => {
    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(data);
    }
  })
  
}