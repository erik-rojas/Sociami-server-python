var UserProfile = require('../models/userProfile');

var ConfigMain = require('../config/main');

//var RoadmapHelper = require('../helpers/helper_roadmaps');

const Skills = require('../models/deepdive/skills');
const Routes = require('express').Router();
const fs = require('fs-extra');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const csv = require('csvtojson');


// Routes.get('/', function (req, res) {
// 	res.render('../views/fileUpload.ejs');
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

				if (textArr[i].Skill != '' || textArr[i].skill != '') {

					textArr[i].subCategory = textArr[i]['Sub Category']
					delete textArr[i]['Sub Category']

					textArr[i].relatedTopics = textArr[i]['Related Topics']
					delete textArr[i]['Related Topics']

					textArr[i].skill = textArr[i]['Skill']
					delete textArr[i]['Skill']

					textArr[i].description = textArr[i]['Description']
					delete textArr[i]['Description']

					textArr[i].category = textArr[i]['Category']
					delete textArr[i]['Category']

					results.push(textArr[i])
				}
			}
			if (results.length) {

				Skills.insertMany(results, function(err, skills) {

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
			res.sendStatus(200);
			res.send(JSON.stringify({status: 'bad file format'}));
		}
	})
});

module.exports = Routes;