const Routes = require('express').Router();

const Controller = require('../controllers/xpRanges');
Routes.get('/xpRangeGet', Controller.get_range);
Routes.post('/xpRangesSet', Controller.set_ranges);

module.exports = Routes;

/*
{
	"ranges": [
		{"index": 1, "min": 1,   "max": 5},
		{"index": 2, "min": 5,   "max": 16},
		{"index": 3, "min": 16,  "max": 44},
		{"index": 4, "min": 44,  "max": 112},
		{"index": 5, "min": 112, "max": 272},
		{"index": 6, "min": 272, "max": 640},
		{"index": 7, "min": 640, "max": 1472}
	]
}
*/