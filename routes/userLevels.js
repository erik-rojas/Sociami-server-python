const Routes = require('express').Router();

const UserLevelsController = require('../controllers/userLevels');
Routes.get('/userLevelsGet', UserLevelsController.get_levels);
Routes.post('/userLevelsSet', UserLevelsController.set_levels);

module.exports = Routes;

/*
{
	"levels": [
	  {"level": 0,  "experience": 0,         "range": 1},
	  {"level": 1,  "experience": 1,         "range": 1},
	  {"level": 2,  "experience": 5,         "range": 1},
	  {"level": 3,  "experience": 12.50,     "range": 2},
	  {"level": 4,  "experience": 23,        "range": 2},
	  {"level": 5,  "experience": 48,        "range": 2},
	  {"level": 6,  "experience": 93,        "range": 3},
	  {"level": 7,  "experience": 235,       "range": 3},
	  {"level": 8,  "experience": 513,       "range": 3},
	  {"level": 9,  "experience": 1218,      "range": 4},
	  {"level": 10, "experience": 3268,      "range": 4},
	  {"level": 11, "experience": 8138,      "range": 4},
	  {"level": 12, "experience": 21208,     "range": 5},
	  {"level": 13, "experience": 61895,     "range": 5},
	  {"level": 14, "experience": 167993,    "range": 5},
	  {"level": 15, "experience": 477408,    "range": 6},
	  {"level": 16, "experience": 1485003,   "range": 6},
	  {"level": 17, "experience": 4349448,   "range": 6},
	  {"level": 18, "experience": 13259463,  "range": 7},
	  {"level": 19, "experience": 43705595,  "range": 7},
	  {"level": 20, "experience": 136521833, "range": 7}
  ]
}
*/