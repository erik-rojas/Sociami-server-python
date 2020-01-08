const Task = require('../models/task');
const UserProfile = require('../models/userProfile');

const PubSub = require('pubsub-js');

const BroadcastEventTasksUpdated = () => {
    const eventObj = {
        eventType: "tasks_update",
        data: {},
    };

    PubSub.publish("EVENT", eventObj);
}

let HelperTasks = {
}

HelperTasks.clearExpiredTasks = () => {
    return Task.find({type: "hangout"})
    .then((foundTasks) => {
        if (foundTasks.length > 0) {
            let idsToRemove = [];

            const TimeNow = Date.now();
            const Hour = 60 * 60 * 1000;

            for (let i = 0; i < foundTasks.length; ++i) {

                const task = foundTasks[i];

                const TimeToStartHasExpired = (task.status == "None" && (TimeNow - task.metaData.time >= Hour));

                const LifeTimeHasExpired = (task.status =="cancelled" || task.status =="canceled" || task.status =="complete") 
                    && (TimeNow - task.timeStatusChanged >= Hour);

                if (TimeToStartHasExpired || LifeTimeHasExpired) {
                    idsToRemove.push(task._id);
                }
            }

            if (idsToRemove.length > 0) {
                
                /*let idsInUserProfileToRemove = [];

                UserProfile.find({ hangouts: { $exists: true, $not: {$size: 0} } })
                .then((foundUserProfiles) => {
                    if (foundUserProfiles.length > 0) {
                        let idsFromUserProfileToRemove = [];

                        for (let j = 0; j < foundUserProfiles.length; ++j) {
                            let idsInUserProfile = foundUserProfiles[j].hangouts.map((task) => {
                                return task._id;
                            })
    
                            for (let k = 0; k < idsToRemove.length; ++k) {
                                let foundIdInProfile = idsInUserProfile.find(idsToRemove[i]);
    
                                if (foundIdInProfile) {
                                    idsInUserProfileToRemove.push(foundIdInProfile);
                                }
                            }
    
                            if (idsInUserProfileToRemove.length > 0) {
                                return
                            }
                        }
                    }
                });*/

                return Task.remove({_id: {$in: idsToRemove}})
                .then((response) => {
                    return new Promise((resolve, reject) => {
                        BroadcastEventTasksUpdated();
                        resolve(response.result.n);
                    }); 
                });
            }
            else {
                return new Promise((resolve, reject) => {
                    resolve(0);
                });
            }
        }
        else {
            return new Promise((resolve, reject) => {
                resolve(0);
            });
        }
    })

    console.log("Cleared Expired Tasks");
}

module.exports = HelperTasks;