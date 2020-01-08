const UserProfile = require('../models/userProfile');

const add_illuminate_to_user_profile = function add_illuminate_to_user_profile(id, illuminate) {
  console.log(id)
    return new Promise((resolve, reject) => {
        return UserProfile.findById(id)
          .then((foundUserProfile) => {
            if (foundUserProfile) {
                foundUserProfile.illuminates.push({_id: illuminate._id, name: illuminate.name, 
                    treeId: illuminate.metaData.subject.roadmap._id, dateJoined: Date.now()});
    
                foundUserProfile.save()
                .then((savedUserProfile) => {
                    resolve(savedUserProfile.illuminates[savedUserProfile.illuminates.length-1]);
                })
                .catch((error) => {
                    reject(error);
                });
            }
            else {
                reject("User not found");
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
};

exports.add_illuminate_to_user_profile = add_illuminate_to_user_profile;