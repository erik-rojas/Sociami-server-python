const Routes = require('express').Router();

const Controller = require('../controllers/taskBonuses');
Routes.get('/taskBonusGet', Controller.get_bonus);
Routes.post('/taskBonusesSet', Controller.set_bonuses);

module.exports = Routes;

/*
{
	"bonuses": [
		{"difficulty": 1,  "factor": 1},
		{"difficulty": 2,  "factor": 1.2},
		{"difficulty": 3,  "factor": 1.4}
	]
}
*/