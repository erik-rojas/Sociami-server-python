const Axios = require('axios');
const ConfigAPIs = require('../config/apis');

var Mongoose = require('mongoose');

var UserProfile = require('../models/userProfile');

var ConfigMain = require('../config/main');

const ObjectHash = require('object-hash');

const defaultSkills = [
    "JavaScript", 
    "AJAX", 
    "Blockchain", 
    "Full-Stack", 
    "NodeJS", 
    "ReactJS", 
    "XML", 
    "NoSQL", 
    "MySQL", 
    "PHP", 
    "HTML5",
    "CSS3", 
    "Internet Security", 
    "Unix", 
    "NPM", 
    "Crypto-Currency", 
    "Python", 
    "Bitcoin", 
    "Machine Learning",
    "Spring",
    "JDK",
    "Java"];
    
    let defaultRoadmaps = [];
    
    function generateRoadmap(newName, newSkills) {
        return {_id: ObjectHash({name: newName, skills: newSkills}),
        name: newName, 
        skills: newSkills};
    }

    function fillDummyRoadmaps() {
        defaultRoadmaps.push(generateRoadmap("Blockchain", [defaultSkills[15], defaultSkills[17], defaultSkills[16]]));
        defaultRoadmaps.push(generateRoadmap("Blockchain", [defaultSkills[15], defaultSkills[17], defaultSkills[16], defaultSkills[18]]));
        defaultRoadmaps.push(generateRoadmap("Java", [defaultSkills[19], defaultSkills[20], defaultSkills[21]]));
        defaultRoadmaps.push(generateRoadmap("JavaScript", [defaultSkills[0], defaultSkills[1], defaultSkills[5], defaultSkills[6]]));
        defaultRoadmaps.push(generateRoadmap("HTML", [defaultSkills[0], defaultSkills[1], defaultSkills[5], defaultSkills[6], defaultSkills[10]]));
        defaultRoadmaps.push(generateRoadmap("HTML", [defaultSkills[0], defaultSkills[6], defaultSkills[8], defaultSkills[9], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("PHP", [defaultSkills[0], defaultSkills[1], defaultSkills[13], defaultSkills[9], defaultSkills[6], defaultSkills[10]]));
        defaultRoadmaps.push(generateRoadmap("PHP", [defaultSkills[0], defaultSkills[1], defaultSkills[9], defaultSkills[6], defaultSkills[10]]));
        defaultRoadmaps.push(generateRoadmap("NodeJS", [defaultSkills[4], defaultSkills[0]]));
        defaultRoadmaps.push(generateRoadmap("Node", [defaultSkills[4], defaultSkills[0]]));
        defaultRoadmaps.push(generateRoadmap("Back-End", [defaultSkills[4], defaultSkills[0]]));
        defaultRoadmaps.push(generateRoadmap("Backend", [defaultSkills[9], defaultSkills[0]]));
        defaultRoadmaps.push(generateRoadmap("Backend", [defaultSkills[4], defaultSkills[1]]));
        defaultRoadmaps.push(generateRoadmap("Backend", [defaultSkills[1], defaultSkills[6], defaultSkills[7], defaultSkills[20], defaultSkills[21]]));
        defaultRoadmaps.push(generateRoadmap("Back-End", [defaultSkills[4], defaultSkills[1]]));
        defaultRoadmaps.push(generateRoadmap("Back-End", [defaultSkills[1], defaultSkills[6], defaultSkills[7], defaultSkills[20], defaultSkills[21]]));
        defaultRoadmaps.push(generateRoadmap("Front-End", [defaultSkills[5], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("FrontEnd", [defaultSkills[0], defaultSkills[5], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("ReactJS", [defaultSkills[0], defaultSkills[5], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("React", [defaultSkills[0], defaultSkills[5], defaultSkills[10], defaultSkills[11]]));

        defaultRoadmaps.push(generateRoadmap("Full-Stack", [defaultSkills[3], defaultSkills[0], defaultSkills[4], 
        defaultSkills[5], defaultSkills[7], defaultSkills[8]]));

        defaultRoadmaps.push(generateRoadmap("FullStack", [defaultSkills[3], defaultSkills[0], defaultSkills[4], defaultSkills[5], 
        defaultSkills[7], defaultSkills[8]]));

        defaultRoadmaps.push(generateRoadmap("Machine Learning", [defaultSkills[16], defaultSkills[7]]));
        defaultRoadmaps.push(generateRoadmap("Blockchain", [defaultSkills[15], defaultSkills[17], defaultSkills[16], defaultSkills[2]]));
        defaultRoadmaps.push(generateRoadmap("Java", [defaultSkills[19], defaultSkills[20]]));
        defaultRoadmaps.push(generateRoadmap("JavaScript", [defaultSkills[0], defaultSkills[1], defaultSkills[5], defaultSkills[10]]));
        defaultRoadmaps.push(generateRoadmap("JavaScript", [defaultSkills[0], defaultSkills[1], defaultSkills[5], defaultSkills[6], defaultSkills[10]]));
        defaultRoadmaps.push(generateRoadmap("Java", [defaultSkills[4], defaultSkills[0], defaultSkills[21]]));
        defaultRoadmaps.push(generateRoadmap("Front-End", [defaultSkills[0], defaultSkills[5], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("FrontEnd", [defaultSkills[5], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("ReactJS", [defaultSkills[5], defaultSkills[10], defaultSkills[11]]));
        defaultRoadmaps.push(generateRoadmap("React", [defaultSkills[0], defaultSkills[5], defaultSkills[10], defaultSkills[11]]));

        defaultRoadmaps.push(generateRoadmap("Full-Stack",
         [defaultSkills[3], defaultSkills[0], defaultSkills[4], defaultSkills[5], defaultSkills[7], defaultSkills[8]])
        );

        defaultRoadmaps.push(generateRoadmap("FullStack",
         [defaultSkills[3], defaultSkills[0], defaultSkills[4],defaultSkills[5], defaultSkills[7], defaultSkills[8]])
        );

        defaultRoadmaps.push(generateRoadmap("Machine Learning", [defaultSkills[18], defaultSkills[16], defaultSkills[7]]));
    }
    
    fillDummyRoadmaps();
    
    let RoadmapHelper = {
        findMatchingRoadmaps(name) {
            console.log("findMatchingRoadmaps: " + name);

            if (!name || name =="") {
                return defaultRoadmaps;
            }

            let matchingRoadmaps = [];
    
            
            for (let i = 0; i < defaultRoadmaps.length; ++i) {
                if (defaultRoadmaps[i].name.toLowerCase().indexOf(name.toLowerCase()) != -1){
                    matchingRoadmaps.push(defaultRoadmaps[i]);
                }
            }
    
            return matchingRoadmaps;
        },
        findRoadmapById(id) {
            console.log("findRoadmapById: " + id);

            for (let i = 0; i < defaultRoadmaps.length; ++i) {
                if (defaultRoadmaps[i]._id == id) {
                    return defaultRoadmaps[i];
                }
            }
    
            return {name: undefined};
        }
    }

        /********INDEED********/
        RoadmapHelper.makeRoadmapFromIndeedJob = function(jobKey) {
    
        //TODO: use NLP for skills fetching, for now, just split job title
        let roadmapWithStatusCode = {code:200, roadmap: {}};
    
        if (jobKey) {
            const queryParams = `&jobkeys=${jobKey}&v=2&format=json`;
            const url = `${ConfigAPIs.Indeed.BaseURL}/ads/apigetjobs?publisher=${ConfigAPIs.Indeed.Publisher}` + queryParams;

            return (Axios.get(url)
            .then((response)=>{
              let jobFound = response.data.results[0];
    
              if (jobFound) {
    
                let skills = jobFound.jobtitle.split(" ");
                roadmapWithStatusCode.roadmap = generateRoadmap(skills[0], skills);
              }
    
              return roadmapWithStatusCode;
            })
            .catch((err)=>{
                console.log(err);
                roadmapWithStatusCode.code = 500;
                return roadmapWithStatusCode;
            }));
        }
    
        
        roadmapWithStatusCode.code = 403;
        return roadmapWithStatusCode;
    }
      /**********************/

      RoadmapHelper.saveUserRoadmaps = function(userId, roadmaps) {
        UserProfile.findOne({ _id: userId }, function(err, userProfile) {
            if(err) {
              console.log(err);  // handle errors!
              return 500;
            }
            if (!err && userProfile !== null) {
              console.log(`User with id: '${userId}' exists`);

              if (userProfile.roadmaps.length > 0) {
                  for (let i = 0; i < roadmaps.length; ++i) {
                      if (userProfile.roadmaps.indexOf(roadmaps[i]) == -1) {
                        userProfile.roadmaps.push(roadmaps[i]);
                      }
                  }
              }
              else {
                userProfile.roadmaps = userProfile.roadmaps.concat(roadmaps);
              }

              userProfile.save(function(err) {
                if(err) {
                  console.log(err);  // handle errors!
                  return 500;
                } else {
                  console.log(`Updated roadmaps for user id: '${userId}' success!`);
                  return 200;
                }
              });
            } else {
                return 404;
            }
          });
      }

      RoadmapHelper.findRoadmapByIds = function(arrayIds) {
          if (arrayIds.length > 0) {
              let results = [];

              for (let i = 0; i < arrayIds.length; ++i) {
                  const foundRoadmap = RoadmapHelper.findRoadmapById(arrayIds[i]);
                  if (foundRoadmap.name != undefined) {
                    results.push(foundRoadmap);
                  }
              }
              return results;
          }
          else {
              return [];
          }
      }
    
module.exports = RoadmapHelper;