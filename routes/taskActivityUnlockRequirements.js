const Routes = require('express').Router();

const Controller = require('../controllers/taskActivityUnlockRequirements');
Routes.post('/taskActivityUnlockRequirementsSet', Controller.set_requirements);
Routes.get('/taskActivityUnlockRequirementsGet', Controller.get_requirements);
Routes.get('/taskActivityUnlockRequirementGet', Controller.get_requirement);

module.exports = Routes;

/*
{
	"requirementsPerTaskType": [
		{"type": "illuminate", "requirements": {"minLevel": 1}},
		{"type": "deepdive", "requirements": {"minLevel": 1}},
		{"type": "decode", "requirements": {"minLevel": 5}},
		{"type": "brainstorm", "requirements": {"minLevel": 9}}
	]
}
*/