var UserProfile = require('../models/userProfile');

var ConfigMain = require('../config/main');

const QuestionTypes = require('../helpers/questionTypes.js');

//var RoadmapHelper = require('../helpers/helper_roadmaps');


const Questions = require('../models/deepdive/questions');
const Routes = require('express').Router();
const fs = require('fs-extra');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const csv = require('csvtojson');


// Routes.get('/', function (req, res) {
// 	res.render('../views/fileUpload.ejs');
// });

Routes.post('/', upload.single('csv'), function (req, res, next) {
	let textArr = [];
	let results = [];

	csv()
		.fromFile('./uploads/' + req.file.filename)
		.on('json', (jsonObj) => {
			textArr.push(jsonObj);
		})
		.on('done', (error) => {
			fs.unlinkSync('./uploads/' + req.file.filename);
			console.log('end') // <=======dell for production
			if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
				for (let i = 0; i < textArr.length; i++) {

					if (textArr[i].Question != '') {

						textArr[i].question = textArr[i]['Question']
						delete textArr[i]['Question']

						textArr[i].roadmapSkill = textArr[i]['Roadmap/Skill']
						delete textArr[i]['Roadmap/Skill']

						textArr[i].category = textArr[i]['Category']
						delete textArr[i]['Category']

						textArr[i].subCategory = textArr[i]['SubCategory']
						delete textArr[i]['SubCategory']

						textArr[i].description = textArr[i]['Description']
						delete textArr[i]['Description']

						textArr[i].conditions = textArr[i]['Conditions']
						delete textArr[i]['Conditions']

						textArr[i].evaluation = textArr[i]['Evaluation']
						delete textArr[i]['Evaluation']

						textArr[i].complexity = textArr[i]['Complexity']
						delete textArr[i]['Complexity']
						
						//Different types of questions (TrueFalse, MultipleChoice)
						if (textArr[i]['Type']) {
							textArr[i].type = textArr[i]['Type'];
							delete textArr[i]['Type'];
						}

						let tempAnswers = [];
						let tempCorrectAnswers = [];

						if (textArr[i].type === QuestionTypes.TRUEFALSE) {
							if (textArr[i]['Right Answer']) {
								tempCorrectAnswers.push(textArr[i]['Right Answer'].toLowerCase() === "true" ? 0 : 1);
								delete textArr[i]['Right Answer'];
							}

							tempAnswers = [true, false];
						}
						else if (textArr[i].type === QuestionTypes.MULTIPLECHOICE) {
							//pick all right answers
							let rightAnswersTemp = [];
							for (let key in textArr[i]) {
								if (key.toLowerCase().startsWith("right answer")) {
									if (textArr[i][key]) {
										rightAnswersTemp.push(textArr[i][key].toLowerCase());
									}
									delete textArr[i][key];
								}
							}

							//go through each possible answer
			
							for (let key in textArr[i]) {
								if (key.toLowerCase().startsWith("answer")) {
									tempAnswers.push(textArr[i][key]);

									//check if current answer is cosidered correct, if it is - push it's index into correctAnswers
									if (rightAnswersTemp.indexOf(key.toLowerCase()) !== -1) {
										tempCorrectAnswers.push(rightAnswersTemp.length - 1);
										delete textArr[i]['Right Answer'];
									}

									delete textArr[i][key];
								}
							}
						}

						textArr[i].answers = tempAnswers;
						textArr[i].correctAnswers = tempCorrectAnswers;

						results.push(textArr[i]);
					}
				}

				if (results.length) {

					Questions.insertMany(results, function (err, skills) {

						if (err) {

							console.log(err);  // handle errors!
							res.sendStatus(500);

						} else {

							res.status(200);
							res.send(JSON.stringify({ status: results.length }));
						}
					});
				}
			} else {
				res.status(200);
				res.send(JSON.stringify({ status: 'bad file format' }));
			}
		})
});

module.exports = Routes;