var Mongoose = require('mongoose');

const Project = require('../models/project');

const Task = require('../models/task');

const ActivitiesHelper = require('../helpers/helper_activities');
const ActivityTypes = require('../helpers/activityTypes');

exports.save_project = function(req, res) {
    let _projectId = req.body._id;
    let _userId = req.body.userId;
    let _name = req.body.name;
    let _description = req.body.description;
    let _nature = req.body.nature;
    let _milestones = req.body.milestones;
    let _creationDate = req.body.creationDate;

    if (!_userId || !_name || !_description || !_nature) {
      res.sendStatus(400);
    }
    else {
      if (Mongoose.Types.ObjectId.isValid(_projectId)) {
        Project.findOneAndUpdate({'_id': _projectId}, {
          userID: _userId,
          name: _name,
          description: _description,
          nature: _nature,
          milestones: _milestones
        }, 
        {upsert:true, new: true}, function(err, doc){
          if (err) { 
            console.log("err: " + err);
            return res.sendStatus(500); 
          }

          if (_milestones.length > 0) {
            for (let i = 0; i < _milestones.length; ++i) {
              Task.findOneAndUpdate({'_id': _milestones[i]._id}, {
                metaData: {projectId: _projectId, projectName: _name}
              }, 
              {upsert:true, new: true}, function(err, doc){
                if (err) { 
                  console.log("Task.findOneAndUpdate err: " + err);
                }
              });
            }
          }

          console.log(`Project userID: ${_userId} roadmapID: ${_name} type: ${_description} saved!`);
          res.status(200);
          return res.send(doc);
      });
      }
      
      else {
        let newProject = new Project({
          userID: _userId,
          name: _name,
          description: _description,
          nature: _nature,
          milestones: _milestones,
          creationDate: _creationDate,
        });
        newProject.save(function(err, projectSaved) {
          if(err) {
            console.log(err);  // handle errors!
            res.sendStatus(500);
          } else {
            console.log(`Project userID: ${_userId} roadmapID: ${_name} type: ${_description} saved!`);
            //TODO: Uncomment this, make same for progression trees and new friends, and remove pushNewActivity from front-end
            ActivitiesHelper.addActivity(_userId, ActivitiesHelper.generateActivity(ActivityTypes.FRIEND_NEW_PROJECT_CREATED, {
              userID: _userId, 
              project: projectSaved._doc
            }));

            if (_milestones.length > 0) {
              for (let i = 0; i < _milestones.length; ++i) {
                Task.findOneAndUpdate({'_id': _milestones[i]._id}, {
                  metaData: {projectId: projectSaved._doc._id.toString(), projectName: projectSaved._doc.name}
                }, 
                {upsert:true, new: true}, function(err, doc){
                  if (err) { 
                    console.log("Task.findOneAndUpdate err: " + err);
                  }
                });
              }
            }
            
            res.status(200);
            res.send(projectSaved);
          }
        });
      }
    }
};

exports.get_projects = function(req, res) {
  let _userId = req.query.userId;

  const query = _userId ? {userID: _userId} : undefined;

  Project.find(query, function (err, projects) {
    if (err)
    {
      console.error(err);
      res.sendStatus(500);
    }
    // console.log("Found projects");
    // console.log(projects);
    res.send(projects);
  })
};

exports.delete_projects = function(req, res) {
  Project.remove({}, function(err) { 
    console.log('collection removed') 
   Project.collection.dropAllIndexes(function (err, results) {
      console.log('Indexes dropped') 
    });
  });
  
  res.send("Collection dropped");
};

exports.get_project = function(req, res) {
  if (!req.query.id || !Mongoose.Types.ObjectId.isValid(req.query.id)) {
    res.sendStatus(400);
  }
  else {
    Project.findOne({_id: req.query.id}, function (err, projectFound) {
      if (err)
      {
        console.error(err);
        res.sendStatus(500);
      }
      if (projectFound) {
        res.send(projectFound);
      }
      else {
        res.send({});
      }
    })
  }
};

exports.delete_project = function(req, res) {
  let _projectId = req.query.id;

  if (!_projectId) {
    res.sendStatus(400);
    return;
  }

  Project.remove({_id: _projectId}, function(err) { 
    console.log('Project deleted');
    res.status(200);
    res.send("Project deleted");
  
  });
};