const Routes = require('express').Router();

const controller = require('../controllers/hangoutAnswers');

Routes.post('/hangoutAnswersSave', controller.save_answers);
Routes.get('/hangoutAnswersGet', controller.get_answers);
Routes.get('/hangoutAnswerGetForTask', controller.get_answer_for_task);
Routes.get('/hangoutAnswersForUsersGet', controller.get_answers_for_users);
Routes.get('/hangoutAnswersForQuestions', controller.get_answers_by_questions)
Routes.get('/hangoutAnswersDrop', controller.drop_answers);

Routes.get('/testGiveXP', controller.test_give_xp);

module.exports = Routes;