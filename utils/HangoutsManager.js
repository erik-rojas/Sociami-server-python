const UserProfile = require('../models/userProfile');

const add_hangout_to_user_profile = function add_hangout_to_user_profile(id, hangout) {
    return new Promise((resolve, reject) => {
        return UserProfile.findById(id)
          .then((foundUserProfile) => {
            if (foundUserProfile) {
                foundUserProfile.hangouts.push({_id: hangout._id, name: hangout.name, 
                    treeId: hangout.metaData.subject.roadmap._id, dateJoined: Date.now()});
    
                foundUserProfile.save()
                .then((savedUserProfile) => {
                    resolve(savedUserProfile.hangouts[savedUserProfile.hangouts.length-1]);
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

exports.add_hangout_to_user_profile = add_hangout_to_user_profile;