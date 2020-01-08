const _ = require('lodash')
const Busboy = require('busboy');
const AWS = require('aws-sdk');

const UserProfile = require('../models/userProfile');
const SoqqlerConnections = require('../models/soqqlerConnections');
const ObjectHelper = require('../helpers/object_helper');

const ActivitiesHelper = require('../helpers/helper_activities');
const ActivityTypes = require('../helpers/activityTypes');

const Roadmap = require('../models/deepdive/roadmap');
const Company = require('../models/company');
const Follower = require('../models/follower');
const Following = require('../models/following');
const Content = require('../models/content');

const ProgressionManager = require('../utils/progression/ProgressionManager');
const UserInteractionsHelper = require("../helpers/UserInteractions");

exports.get_userProfile = function (req, res) {
    let _userProfileId = req.query.id;

    if (!_userProfileId) {
        res.sendStatus(400);
    }
    else {
        UserProfile.find({ _id: _userProfileId }, function (err, foundUserProfile) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            if (foundUserProfile) {
                res.status(200);
                res.send(foundUserProfile);
            }
            else {
                res.status(404);
                res.send([]);
            }
        }).sort({ insdt: -1 });
    }
};

exports.fetch_user_company = (req, res) => {
    let _userEmailId = req.query.emailId;

    if (!_userEmailId) {
        res.sendStatus(400);
    }
    Company.findOne({emails: _userEmailId})
      .then(result => {
        res.status(200);
        res.send(result);
      }).catch(err => {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      });
}

exports.get_all_userProfile = function (req, res) {
    UserProfile.find(function (err, foundUserProfile) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }
        if (foundUserProfile) {
            res.status(200);
            res.send(foundUserProfile);
        }
        else {
            res.status(404);
            res.send([]);
        }
    }).sort({ insdt: -1 });
};

exports.update_userProfile = function (req, res) {
    let _userProfileId = req.body._id;

    if (!_userProfileId) {
        res.sendStatus(400);
    }
    else {
        let data = {
            profile: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                education: req.body.education,
                experience: req.body.experience,
                interests: req.body.interests,
                skills: req.body.skills,
                balance:req.body.balance
            },
        };

        ObjectHelper.copyProperties(req.body, data, { _id: "", __v: "" });

        UserProfile.findOneAndUpdate({ _id: _userProfileId }, data, { upsert: true, new: true }, function (err, foundUserProfile) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            if (foundUserProfile) {
                res.status(200);
                res.send(foundUserProfile);
            }
            else {
                res.status(404);
                res.send({});
            }
        });
    }
};

exports.set_character = function (req, res) {
    const ProfileId = req.body.id;
    const СharacterData = req.body.characterData;

    if (!ProfileId || !СharacterData) {
        res.sendStatus(400);
    }
    else {
      follow_user(ProfileId, СharacterData.characterId)
      .then(() => {
        UserProfile.findById(ProfileId)
        .then((foundUserProfile) => {
            if (foundUserProfile) {
                foundUserProfile.set("profile", Object.assign({}, foundUserProfile.profile, {character: СharacterData}));

                foundUserProfile.save()
                .then((savedProfile)=> {

                    if(savedProfile.profile.character && savedProfile.profile.character.traitsName){
                        UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.CHARACTER_TRAIT_SELECTED, savedProfile._id, null)
                        .then((document) => {
                          console.log("UserInteraction of Character Trait selection after Login for User Id - " + savedProfile._id);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                      }
        
                      if(savedProfile.profile.character && savedProfile.profile.character.characterName){
                        UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.CHARACTER_NAME_SELECTED, savedProfile._id, null)
                        .then((document) => {
                          console.log("UserInteraction of Character Name selection after Login for for User Id - " + savedProfile._id);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                      }
      

                    res.status(200);
                    res.send(foundUserProfile);
                })
            }
            else {
                res.sendStatus(404);
            }
        })
        .catch((error)=> {
            console.log(error);
            res.sendStatus(500);
        });
      }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
    }
};

exports.progression_tree_start = (req, res) => {

    const userId = req.body.userId;
    const progressionTree = req.body.progTree;

    if (!userId || !progressionTree) {
        res.sendStatus(400);
    }
    else {
        Roadmap.findOne({_id: progressionTree._id}, function(err, roadmapFound) {
            if (!err) {
                if (roadmapFound) {
                    UserProfile.findOne({ _id: userId }, function(err, foundUserProfile) {
                        if(err) {
                          console.log(err);  // handle errors!
                          res.sendStatus(500);
                        }
                        else {
                          if (!foundUserProfile) {
                              res.sendStatus(404);
                          }
            
                          //TODO: Potential security-breach here
            
                          ProgressionManager.check_roadmap_unlock_conditions(roadmapFound, userId)
                          .then(function(isLocked) {
                            if (isLocked) {
                                res.sendStatus(403);
                            }
                            else {
                                if (foundUserProfile.progressionTrees.findIndex(function(tree) {
                                    return tree._id === progressionTree._id;
                                  }) === -1) {
                                    foundUserProfile.progressionTrees.push(progressionTree);
                    
                                    foundUserProfile.save(function(err) {
                                        if(err) {
                                          console.log(err);  // handle errors!
                                          res.sendStatus(500);
                                        } else {
                                        ActivitiesHelper.addActivity(
                                            userId, ActivitiesHelper.generateActivity(ActivityTypes.FRIEND_PROGRESSIONTREE_STARTED, {
                                            userID: userId,
                                            progressionTree: progressionTree
                                        }));
                                        
                                        let data = {
                                            progressionTreeId: progressionTree._id
                                        }

                                        UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.PROGRESSION_TREE_ADDED, userId, data)
                                            .then((document) => {
                                            console.log("UserInteraction of Progression Tree Start for User Id - " + userId);
                                            })
                                            .catch((error) => {
                                            console.log(error);
                                            });
                    
                                          res.status(200);
                                          res.send(progressionTree);
                                        }
                                      });
                                  }
                                  else {
                                    res.status(200);
                                    res.send({});
                                  }
                            }
                          })
                          .catch(function(err) {
                              console.log(err);
                              res.sendStatus(500);
                          });
                        } 
                    });
                }
                else {
                    res.sendStatus(404);
                }
            }
            else {
                res.sendStatus(500);
            }
        });
    }
};

exports.progression_tree_stop = (req, res) => {

    const userId = req.body.userId;
    const progressionTree = req.body.progTree;

    if (!userId || !progressionTree) {
        res.sendStatus(400);
    }
    else {
        UserProfile.findOne({ _id: userId }, function(err, foundUserProfile) {
            if(err) {
              console.log(err);  // handle errors!
              res.sendStatus(500);
            }
            else {
              if (!foundUserProfile) {
                  res.sendStatus(404);
              }

              if (foundUserProfile.progressionTrees.findIndex(function(tree) {
                return tree._id === progressionTree._id;
              }) != -1) {
                foundUserProfile.progressionTrees = foundUserProfile.progressionTrees.filter(function(tree) {
                    return tree._id != progressionTree._id;
                });

                foundUserProfile.save(function(err) {
                    if(err) {
                      console.log(err);  // handle errors!
                      res.sendStatus(500);
                    } else {
                        let data = {
                            progressionTreeId: progressionTree._id
                        }

                        UserInteractionsHelper.pushInteraction(UserInteractionsHelper.Types.ACTION_EXECUTE, UserInteractionsHelper.SubTypes.PROGRESSION_TREE_REMOVED, userId, data)
                        .then((document) => {
                        console.log("UserInteraction of Progression Tree Removed for User Id - " + userId);
                        })
                        .catch((error) => {
                        console.log(error);
                        });

                      res.status(200);
                      res.send(progressionTree);
                    }
                  });
              }
              else {
                res.status(200);
                res.send({});
              }
            } 
        });
    }
};
exports.upload_userprofile_image = (req, res) => {
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('finish', function() {
    console.log('Upload finished');
    const file = req.files.image;

    const images = [
      'image/gif',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]
    const mimetype = file.mimetype;
    if (images.indexOf(mimetype) == -1) {
      res.status(500);
      return res.json({
          success: false,
          error: 'Invalid file format!'
        });
    }
    var id = _.get(req, 'params.id');
    var type = _.get(req, 'params.type');
    if (!id) {
        res.sendStatus(400);
        return res.json({
          success: false,
          error: 'Missing Parameter!'
        });
    }
    if(type == 'avatar') {
        file.name = 'avatar_' + new Date().getTime();
    }else {
        file.name = 'cover_' + new Date().getTime();
    }
    uploadToS3(file, (err, data) => {
      if(err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        let profile_data = {};
        var filename = data.Location;
        UserProfile.findOne({ _id: id }, function(err, foundUserProfile) {
                if(err) {
                  console.log(err);  // handle errors!
                  res.sendStatus(500);
                }
                else {
                  if (!foundUserProfile) {
                      res.sendStatus(404);
                  }
                  else {
                    if(foundUserProfile.profile) {
                        if(type == 'avatar') {
                        foundUserProfile.profile.pictureURL = filename;
                        }else {
                            foundUserProfile.profile.coverBackgroundURL = filename;
                        }
                    }
                    }
                    foundUserProfile.save(function(err) {
                      if(err) {
                          console.log(err);  // handle errors!
                          res.sendStatus(500);
                      } else {
                          res.status(200);
                          res.send(foundUserProfile);
                      }
                  });
                } 
            });
      }
    });
  });

  req.pipe(busboy);
}

exports.progression_tree_clear_all = (req, res) => {
    
        const userId = req.query.userId;
    
        if (!userId) {
            res.sendStatus(400);
        }
        else {
            UserProfile.findOne({ _id: userId }, function(err, foundUserProfile) {
                if(err) {
                  console.log(err);  // handle errors!
                  res.sendStatus(500);
                }
                else {
                  if (!foundUserProfile) {
                      res.sendStatus(404);
                  }
                  else {
                    foundUserProfile.progressionTrees = [];
                    foundUserProfile.save(function(err) {
                      if(err) {
                          console.log(err);  // handle errors!
                          res.sendStatus(500);
                      } else {
                          res.sendStatus(200);
                      }
                  });
                  }
                } 
            });
        }
    };

    exports.hangouts_clear = (req, res) => {
    
        const userId = req.query.userId;
    
        if (!userId) {
            res.sendStatus(400);
        }
        else {
            UserProfile.findOne({ _id: userId }, function(err, foundUserProfile) {
                if(err) {
                  console.log(err);  // handle errors!
                  res.sendStatus(500);
                }
                else {
                  if (!foundUserProfile) {
                      res.sendStatus(404);
                  }
                  else {
                    foundUserProfile.hangouts = [];
                    foundUserProfile.save(function(err) {
                      if(err) {
                          console.log(err);  // handle errors!
                          res.sendStatus(500);
                      } else {
                          res.sendStatus(200);
                      }
                  });
                  }
                } 
            });
        }
    };

exports.fetch_user_profile = (req, res) => {
    const linkedInIDRequested = req.query.linkedInID;
    const faceBookIDRequested = req.query.faceBookID;
  
    if (linkedInIDRequested == "" && faceBookIDRequested == "") {
      res.sendStatus(400);
    }
    else {
      const queryUser = linkedInIDRequested ? { 'linkedInID': linkedInIDRequested } : { 'facebookID': faceBookIDRequested };
      
      UserProfile.findOne(queryUser, function(err, user) {
        if(err) {
          console.log(err);  // handle errors!
          res.sendStatus(500);
        }
        else {
          if (user != null) {
            console.log("User found");
            res.send(user);
          }
          else
          {
            res.sendStatus(404);
          }
        }
      });
    }
}

exports.fetch_user_profile_by_id = (req, res) => {
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
            //console.log("User found", user);
            const userToObject = user.toObject();
            setUserSoqqlerConnectionDetails(userToObject, (err) => {
              res.send(userToObject);
            })
          }
          else
          {
            res.sendStatus(404);
          }
        }
      });
    }
}

function setUserSoqqlerConnectionDetails(user, cb) {
  SoqqlerConnections.find({ $or: [{userID1: user._id }, {userID2: user._id}] })
  .limit(10000)
  .then(connectionDetails => {
    user.connectionDetails = connectionDetails;
    return cb(null, user);
  })
  .catch(connectionDetailsError => {
    console.log('connectionDetailsError', connectionDetailsError);
    return cb(null, user);
  })
}
function follow_user(userId, toUserId) {
  return new Promise((resolve, reject) => {
    Following.create({ _f: userId, _t: toUserId }, function (err, following) {
      if(err) {
        reject(err);
      } else {
        Follower.create({ _id: following._id, _f: toUserId, _t: userId }, 
            function (err, follower) {
                if(err) {
                  reject(err);
                } else {
                  resolve(follower);   
                }
        });
      }
    });
  });
}

/*/
 |
 | @param {*} req 
 | @param {*} res 
 */
exports.follow_user =  (req, res) => {
    const userId = _.get(req, 'params.userId');
    const toUserId = _.get(req, 'params.toUserId');
    if (!userId || !toUserId) {
        res.sendStatus(400);
    } else {
      follow_user(userId, toUserId)
      .then(() => { res.sendStatus(200); })
      .catch((err) => { console.log(err); res.sendStatus(500); });
    }
}

exports.unfollow_user =  (req, res) => {
    const userId = _.get(req, 'params.userId');
    const toUserId = _.get(req, 'params.toUserId');
    if (!userId || !toUserId) {
        res.sendStatus(400);
    } else {
        Following.deleteOne({ _f: userId, _t: toUserId }, function (err) {
            if(err) {
                console.log(err);  // handle errors!
                res.sendStatus(500);
            } else {
                Follower.deleteOne({ _f: toUserId, _t: userId }, 
                    function (err, follower) {
                        if(err) {
                            console.log(err);  // handle errors!
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                });
            }
        });
    }
}

exports.fetch_followers = (req, res) => {
    const userId = _.get(req, 'params.userId');
    if (!userId) {
        res.sendStatus(400);
    } else {
        Follower.find({'_f': userId}, function(err, user) {
            if(err) {
                console.log(err);  // handle errors!
                res.sendStatus(500);
            } else {
                if (user != null) {
                    console.log("User found");
                    res.send(user);
                } else {
                    res.sendStatus(404);
                }
            }
        });
    }
}

exports.fetch_following = (req, res) => {
    const userId = _.get(req, 'params.userId');
    if (!userId) {
        res.sendStatus(400);
    } else {
        Following.find({'_f': userId}, function(err, user) {
            if(err) {
                console.log(err);  // handle errors!
                res.sendStatus(500);
            } else {
                if (user != null) {
                    console.log("User found");
                    res.send(user);
                } else {
                    res.sendStatus(404);
                }
            }
        });
    }
}

exports.fetch_my_posts = (req, res) => {
  const userId = _.get(req, 'params.userId');
  if (!userId) {
    res.sendStatus(400);
  } else {
    Content.find({ author: userId })
    .sort({date: -1}).exec(function(err, contents) {
        if(err) {
            console.log(err);  // handle errors!
            res.sendStatus(500);
        } else {
            res.send(contents);
        }
    });
  }
}

exports.fetch_feeds = (req, res) => {
    const userId = _.get(req, 'params.userId');
    if (!userId) {
        res.sendStatus(400);
    } else {
        Following.find({'_f': userId}, function(err, users) {
            if(err) {
                console.log(err);  // handle errors!
                res.sendStatus(500);
            } else {
                if (users != null) {
                    const postsFrom = users.map(user => user._t);
                    postsFrom.push(userId);
                    Content.find({ author: { "$in": postsFrom }})
                    .sort({date: -1}).exec(function(err, contents) {
                        if(err) {
                            console.log(err);  // handle errors!
                            res.sendStatus(500);
                        } else {
                            res.send(contents);
                        }
                    });
                } else {
                    res.sendStatus(404);
                }
            }
        });
    }
}


exports.save_post = (req, res) => {
    const userId = _.get(req, 'params.userId');
    const message = _.get(req, 'body.message');
    const userName = _.get(req, 'body.userName');

    if (!userId || !message) {
        res.sendStatus(400);
    } else {
        Content.create({'author': userId, 'message': message, authorName: userName }, function(err, content) {
            if(err) {
                console.log(err);  // handle errors!
                res.sendStatus(500);
            } else {
                if (content != null) {
                    res.send(content);
                } else {
                    res.sendStatus(404);
                }
            }
        });
    }
}

function uploadToS3(file, callback) {
  const BUCKET_NAME = 'admin.soqqle.com'
  let s3bucket = new AWS.S3({
    accessKeyId: 'AKIAJQTXVEWBQJYDATVQ',
    secretAccessKey: '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',
    Bucket: BUCKET_NAME,
    region: 'us-east-2'
  });
  s3bucket.createBucket(() =>{
      var params = {
        Bucket: BUCKET_NAME,
        Key: `userProfile/${file.name}`,
        Body: file.data
      };
      s3bucket.upload(params, callback);
  });
}