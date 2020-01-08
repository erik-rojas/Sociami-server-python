
var UserProfile = require('../models/userProfile');

var ConfigMain = require('../config/main');

//var RoadmapHelper = require('../helpers/helper_roadmaps');

const Roadmap = require('../models/deepdive/roadmap');
const Routes = require('express').Router();
const fs = require('fs-extra');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const csv = require('csvtojson');


// Routes.get('/', function (req, res) {
// 	res.render('../views/roadmaps.ejs');
// });

Routes.post('/', upload.single('csv'), function(req, res, next) {
	let textArr = [];
	let results = [];

	csv()
	.fromFile('./uploads/'+ req.file.filename)
	.on('json', (jsonObj) => {
		textArr.push(jsonObj);
	})
	.on('done',(error)=> {
		fs.unlinkSync('./uploads/'+ req.file.filename);
		console.log('end') // <=======dell for production
		if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
			for (let i = 0; i < textArr.length; i++) {

				if (textArr[i].Name != '') {

					textArr[i].name = textArr[i]['Name']
					delete textArr[i]['Name']

					textArr[i].description = textArr[i]['Description']
					delete textArr[i]['Description']

					textArr[i].weightage1 = textArr[i]['Weightage 1']
					delete textArr[i]['Weightage 1']

					textArr[i].weightage2 = textArr[i]['Weightage 2']
					delete textArr[i]['Weightage 2']

					textArr[i].weightage3 = textArr[i]['Weightage 3']
					delete textArr[i]['Weightage 3']

					textArr[i].keywords = textArr[i]['Keywords']
					delete textArr[i]['Keywords']

					textArr[i].relatedRoadmaps = textArr[i]['Related Roadmaps']
					delete textArr[i]['Related Roadmaps'],
					
					textArr[i].category = textArr[i]['Category']
					delete textArr[i]['Category'],

					textArr[i].backgroundimg = textArr[i]['Background Image']
					delete textArr[i]['Background Img']

					textArr[i].heroimg = textArr[i]['Hero Image']
					delete textArr[i]['Hero Image']

					results.push(textArr[i])
				}
			}
	
			if (results.length) {

				Roadmap.insertMany(results, function(err, skills) {

					if (err) {

						console.log(err);  // handle errors!
						res.sendStatus(500);

					} else {

						res.status(200);
						res.send(JSON.stringify({status: results.length}));
					}
				});
			}
		} else {
			res.status(200);
			res.send(JSON.stringify({status: 'bad file format'}));
		}
	})
});

module.exports = Routes;