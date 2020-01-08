const Routes = require('express').Router();

const ConversationController = require('../controllers/conversation');
Routes.get('/fetchConversationByParticipants', ConversationController.fetch_by_participants)

module.exports = Routes;