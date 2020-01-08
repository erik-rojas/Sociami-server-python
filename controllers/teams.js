const TeamModel = require('../models/teams');
var UserProfile = require('../models/userProfile');

const _ = require('lodash');

exports.get_teams = (req, res) => {
  TeamModel.find({}, (err, teams) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.status(200)
      res.send(teams)
    }
  });
}
  
exports.get_team = (req, res) => {
  const _id = _.get(req, 'params.id');
  TeamModel.findOne({ _id }, (err, team) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.status(200)
      res.send(team)
    }
  });
}
  
exports.save_team = (req, res) => {
  const params = {
    name: _.get(req, 'body.name', ''),
    emails: _.get(req, 'body.emails', ''),
    date: _.get(req, 'body.date', '')
  };
  const team = new TeamModel(params);
  team.save((err, team) => {
    if(err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      console.log(`Team _id: ${team._id} name: ${team.name} emails: ${team.emails} date: ${team.date} saved!`);
      res.status(200);
      res.send(team);
    }
  });
}
exports.update_team_email = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    if( !req.body.prevEmail || !req.body.newEmail) {
      res.sendStatus(400);
      return;
    }
    UserProfile.findOne({ 'profile.email': req.body.newEmail }, function (err, profile) {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      } else {
        TeamModel.findById(_id, function(err,team) {
          if (err) {
            console.log(err)
            res.sendStatus(500)
          } else {
            const index = _.findIndex(team.emails, function(o) { return o.email == req.body.prevEmail; });
            if (index === -1) {
              res.sendStatus(404);
            } else {
              team.emails.splice(index, 1, { email: req.body.newEmail, accepted: !!profile });
              team.save(function(err,updateTeam) {
                if (err) {
                  console.log(err)
                  res.sendStatus(500)
                } else {
                  res.status(200);
                  res.send(updateTeam);
                }
              });
            }
          }
        });
      }
    });
  }
}
exports.update_team = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    if( !req.body.email && !req.body.name) {
      res.sendStatus(400);
      return;
    }
    if(req.body.email) {
      UserProfile.findOne({ 'profile.email': req.body.email }, function (err, profile) {
        if (err) {
          console.log(err)
          res.sendStatus(500)
        } else {
          TeamModel.findByIdAndUpdate(_id, { '$addToSet': { emails: { email: req.body.email, accepted: !!profile } } }, (err, team) => {
            if (err) {
              console.log(err)
              res.sendStatus(500)
            } else {
              TeamModel.findById(team._id, function(err,team) {
                if (err) {
                  console.log(err)
                  res.sendStatus(500)
                } else {
                  res.status(200);
                  res.send(team);
                }
              });
            }
          });
        }
      });
    }
    if(req.body.name) {
      TeamModel.findByIdAndUpdate(_id, { '$set': { name: req.body.name } }, (err, team) => {
        if (err) {
          console.log(err)
          res.sendStatus(500)
        } else {
          TeamModel.findById(team._id, function(err,team) {
            if (err) {
              console.log(err)
              res.sendStatus(500)
            } else {
              res.status(200);
              res.send(team);
            }
          });
        }
      });
    }
    
  }
}

exports.delete_team = (req, res) => {
  const _teamId = _.get(req, 'params.id')
  TeamModel.findByIdAndRemove(_teamId, (err) => {
    if (!err) {
      console.log(`Team with ID ${_teamId} removed`);
      res.sendStatus(200);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
  });
}