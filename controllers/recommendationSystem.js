const Roadmap = require('../models/deepdive/roadmap');
const ObjectHelper = require('../helpers/object_helper');
const UserProfile = require('../models/userProfile');

const ProgressionManager = require("../utils/progression/ProgressionManager");

exports.save_roadmap = function(req, res) {
  if (!req.body.name) {
    res.sendStatus(400);
  }
  else {
    let newRoadmap = new Roadmap({
    });
    req.body.insdt=new Date();
    ObjectHelper.copyProperties(req.body, newRoadmap, {_id: "", __v:""});
    
    newRoadmap.save(function(err, roadmap) {
      if(err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        console.log(`Roadmap: ${roadmap._id} ${roadmap.name} has been saved.`);
        res.status(200);
        res.send(roadmap);
      }
    });
  }
};

exports.get_roadmap = function(req, res) {
  let _roadmapId = req.query.id;

  if (!_roadmapId) {
    res.sendStatus(400);
  }
  else {
      Roadmap.findOne({ _id: _roadmapId}, function(err, foundRoadmap) {
      if (err) { 
        console.error(err);
        res.sendStatus(500);
      }
      if (foundRoadmap) {
        res.status(200);
        res.send(foundRoadmap);
      }
      else {
        res.status(404);
        res.send({});
      }
    });
  }
};

exports.get_all_roadmaps = function(req, res) {
  const userId = req.query.userId;
  Roadmap.find({}, function(err, foundRoadmaps) {
    if (err) { 
      console.error(err);
      res.sendStatus(500);
    }
    if (foundRoadmaps) {

      foundRoadmaps = foundRoadmaps.map(function(roadmap) {
        return Object.assign({}, roadmap._doc, {isLocked: false});
      });

      //set locked status
      if (userId) {
        let promises = [];
        
        for (let i = 0; i < foundRoadmaps.length; ++i) {
          let roadmapCurrent = foundRoadmaps[i];
          
          if (roadmapCurrent.unlockConditions.length > 0) {
              promises.push(ProgressionManager.check_roadmap_unlock_conditions(roadmapCurrent, userId).then(function(isLocked) {
                roadmapCurrent.isLocked = isLocked;
            }));
          }
        }

        if (promises.length > 0) {
          Promise.all(promises).then(values => { 
            res.status(200);
            res.send(foundRoadmaps);
          })
          .catch(function(err) {
            console.log(err);
            res.sendStatus(500);
          });
        }
        else {
          res.status(200);
          res.send(foundRoadmaps);
        }
      }
      else {
        res.status(200);
        res.send(foundRoadmaps);
      }
    }
    else {
      res.status(404);
      res.send([]);
    }
  }).sort({ insdt: -1 });
};

exports.remove_roadmap = function(req, res) {
  let _roadmapId = req.query.id;

  if (!_roadmapId) {
    res.sendStatus(400);
  }
  else {
    Roadmap.findByIdAndRemove(_roadmapId, function(err, doc) { 
      if (!err) {
        console.log('Roadmap removed');
        res.status(200);
        res.send(doc);
      }
      else {
        console.log("Error: " + err);
        res.sendStatus(500);
      }
   });
  }
};

exports.update_roadmap = function(req, res) {
  let _roadmapId = req.body._id;

  if (!_roadmapId) {
    res.sendStatus(400);
  }
  else {
    let data = {};
    ObjectHelper.copyProperties(req.body, data, {_id: "", __v:""});

    Roadmap.findOneAndUpdate({ _id: _roadmapId}, data, {upsert:true, new: true}, function(err, foundRoadmap) {
      if (err) { 
        console.error(err);
        res.sendStatus(500);
      }
      if (foundRoadmap) {
        res.status(200);
        res.send(foundRoadmap);
      }
      else {
        res.status(404);
        res.send({});
      }
    });
  }
};

exports.get_user_started_roadmaps = (req, res) => {
  if (!req.query.id || req.query.id == "") {
      res.status(400);
      res.send([]);
  }
  else {
      UserProfile.findOne({'_id': req.query.id}, function(err, user) {
      if(err) {
          console.log(err);  // handle errors!
          res.status(500);
          res.send([]);
      }
      else {
        if (user != null) {
          res.status(200);
          res.send(user.progressionTrees);
        }
        else
        {
          res.status(404);
          res.send([]);
        }
      }
    });
  }
}

exports.remove_user_started_roadmaps = (req, res) => {
  if (!req.query.id || req.query.id == "") {
      res.sendStatus(400);
  }
  else {
      UserProfile.findOne({'_id': req.query.id}, function(err, user) {
      if(err) {
          console.log(err);  // handle errors!
          res.sendStatus(500);
      }
      else {
        if (user != null) {
          user.progressionTrees = [];
          user.save(function(error) {
            if (err) {
              console.log(err);
              res.sendStatus(500);
            }
            else {
              res.sendStatus(200);
            }
          });
        }
        else
        {
          res.sendStatus(404);
        }
      }
    });
  }
}

exports.remove_roadmaps = function(req, res) {
  Roadmap.remove({}, function(err, doc) { 
    if (!err) {
      console.log('Roadmaps removed');
      res.sendStatus(200);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
 });
};