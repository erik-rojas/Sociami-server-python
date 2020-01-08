const Routes = require('express').Router();

var UserProfile = require('../models/userProfile');

var ConfigMain = require('../config/main');

var RoadmapHelper = require('../helpers/helper_roadmaps');

const RecommendationSystemController = require('../controllers/recommendationSystem');

Routes.post('/roadmapSave', RecommendationSystemController.save_roadmap);
Routes.post('/roadmapUpdate', RecommendationSystemController.update_roadmap);
Routes.get('/roadmapGet', RecommendationSystemController.get_roadmap); //by 'id' /roadmapGet?id=<id_here>
Routes.get('/roadmapsGet', RecommendationSystemController.get_all_roadmaps);
Routes.get('/roadmapRemove', RecommendationSystemController.remove_roadmap); //by 'id'
Routes.get('/roadmapsGetForUser', RecommendationSystemController.get_user_started_roadmaps);
Routes.get('/roadmapsRemoveForUser', RecommendationSystemController.remove_user_started_roadmaps);
Routes.delete('/roadmapsRemove', RecommendationSystemController.remove_roadmaps);

Routes.get('/findRoadmaps',
function(req, res) {
  let query = req.query.query;

  let roadmaps = RoadmapHelper.findMatchingRoadmaps(query);
    
  res.send({results: roadmaps});
});

Routes.get('/getRoadmapsByIds',
function(req, res) {

  if (!req.query.roadmaps) {
    res.sendStatus(400);
  }

  let userRoadmaps = [];

  let roadmapNotParsed = req.query.roadmaps;

  if (roadmapNotParsed.length) {
    userRoadmaps = userRoadmaps.concat(roadmapNotParsed);
  }
  else {
    userRoadmaps.push(roadmapNotParsed);
  }

  console.log("Roadmaps are: ");
  console.dir(userRoadmaps);

  console.log("Using RoadmapHelper");

  let result = RoadmapHelper.findRoadmapByIds(userRoadmaps);

  console.log("RoadmapHelper returned: " + result);

  res.status(200);
  res.send(result);
});

module.exports = Routes;