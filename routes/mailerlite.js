const Routes = require('express').Router();

const MailerLite = require('../helpers/mailerlite');

Routes.post('/addSubscriberToGroup', MailerLite.add_subscriber_to_group);
Routes.delete('/deleteSubscriberFromGroup', MailerLite.delete_subscriber_from_group);
Routes.get('/getGroupById', MailerLite.getGroupById);
Routes.get('/getGroupSubscribers', MailerLite.getGroupSubscribers);

module.exports = Routes;