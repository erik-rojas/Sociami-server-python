const Axios = require('axios');
const Base64 = require('base-64');

const BaseUrl = 'http://api.mailerlite.com/api/v2';

const Headers = {"Content-Type": "application/json", "X-MailerLite-ApiKey": "8473836d4a17091c430e02c4d5df0ea2"};

exports.SoqqleUserListGroupID = "9336442";

exports.push_new_subscriber_to_group = function push_new_subscriber_to_group(groupId, email, name="") {
    const url = `${BaseUrl}/groups/${groupId}/subscribers`;

    const body = {email: email, name: name, fields: {email: email}};

    return Axios.post(url, body, {headers: Headers});
};

//This should be moved into helper to be used from back-end, or call it from the front-end, but end route for this, and parse req.body 
exports.add_subscriber_to_group = function(req, res) {
    if (!req.body.email || !req.body.name || !req.body.groupId) {
        res.sendStatus(400);
    }
    const url = `${BaseUrl}/groups/${req.body.groupId}/subscribers`;

    const body = {email: req.body.email, name: req.body.name, fields: {email: req.body.email}};
    
    Axios.post(url, body, { headers: {"Content-Type": "application/json", "X-MailerLite-ApiKey": "8473836d4a17091c430e02c4d5df0ea2"} })
    .then((response)=>{
        console.log("Added new subscriber");
        res.status(200);
        res.send(response.data);
    })
    .catch((err)=>{
        console.log("Error adding new subscriber: " + err);
        res.sendStatus(err.response.status);
    })
};

exports.delete_subscriber_from_group = function(req, res) {
    if (!req.query.groupId || !req.query.subscriberEmail) {
        res.sendStatus(400);
    }
    Axios({
        method: 'DELETE',
        url: `${BaseUrl}/groups/${req.body.groupId}/subscribers/${req.query.subscriberEmail}`,
        headers: {"Content-Type": "application/json", "X-MailerLite-ApiKey": "8473836d4a17091c430e02c4d5df0ea2"},
        data: {groupId: req.query.groupId, subscriberId: req.query.subscriberEmail},
      }).then((response)=>{
        console.log("Removed subscriber: " + req.query.subscriberId);
        res.status(200);
        res.send(response.data);
    })
    .catch((err)=>{
        console.log("Error removing new subscriber: " + err);
        console.dir(err);
        res.sendStatus(err.response.status);
    })
};

exports.getGroupById = function(req, res) {
    const groupId = req.query.id;

    if (!groupId) {
        res.sendStatus(400);
    }
    else {
        const url = `${BaseUrl}/groups/${groupId}`;
        
        Axios.get(url, { headers: {"Content-Type": "application/json", "X-MailerLite-ApiKey": "8473836d4a17091c430e02c4d5df0ea2"} })
        .then((response)=>{
           // exports.send_email_into_groupId(groupId, "demo@example.com", "Alex");
          res.send(response.data);
        })
        .catch((err)=>{
            console.dir(err.response);
            res.sendStatus(err.response.status);
        })
    }
};

exports.getGroupSubscribers = function(req, res) {
    const groupId = req.query.id;

    if (!groupId) {
        res.sendStatus(400);
    }
    else {
        const url = `${BaseUrl}/groups/${groupId}/subscribers`;
        
        Axios.get(url, { headers: {"Content-Type": "application/json", "X-MailerLite-ApiKey": "8473836d4a17091c430e02c4d5df0ea2"} })
        .then((response)=>{
          res.send(response.data);
        })
        .catch((err)=>{
            console.dir(err.response);
            res.sendStatus(err.response.status);
        })
    }
};