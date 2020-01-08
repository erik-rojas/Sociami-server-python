var PubSub = require('pubsub-js');

let HelperPubSub = {
}

HelperPubSub.publishEvent = function (eventObj) {
    PubSub.publish("EVENT", eventObj);
}

const broadcastEventTaskUpdated = (data) => {
    const eventObj = {
        eventType: "task_updated",
        ...data,
    };

    PubSub.publish("EVENT", eventObj);
}

exports.broadcastEventTaskUpdated = broadcastEventTaskUpdated;

const broadcastEventAnswerUpdated = (data) => {
    const eventObj = {
        eventType: "answer_updated",
        ...data,
    };

    PubSub.publish("EVENT", eventObj);
}
exports.broadcastEventAnswerUpdated = broadcastEventAnswerUpdated;
