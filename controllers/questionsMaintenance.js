const Questions = require('../models/deepdive/questions');
const ObjectHelper = require('../helpers/object_helper');

exports.save_question = function(req, res) {
  if (!req.body.question) {
    res.sendStatus(400);
  } else {
    let newQuestions = new Questions({});
    req.body.insdt = new Date();
    ObjectHelper.copyProperties(req.body, newQuestions, { _id: '', __v: '' });

    newQuestions.save(function(err, question) {
      if (err) {
        console.log(err); // handle errors!
        res.sendStatus(500);
      } else {
        console.log(
          `Questions: ${question._id} ${question.name} has been saved.`
        );
        res.status(200);
        res.send(question);
      }
    });
  }
};

exports.get_question = function(req, res) {
  const _questionId = req.query.id;
  const _questionName = req.query.name;

  if (!_questionId && !_questionName) {
    res.sendStatus(400);
  } else {
    const query = _questionId
      ? { _id: _questionId }
      : { question: _questionName };
    Questions.findOne(query, function(err, foundQuestion) {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
      if (foundQuestion) {
        res.status(200);
        res.send(foundQuestion);
      } else {
        res.status(404);
        res.send({});
      }
    });
  }
};

exports.get_questions = function(req, res) {
  let query = {};

  if (req.query.roadmapSkill) {
    query = { roadmapSkill: req.query.roadmapSkill };
  }

  let type;
  let sampleSize = 10;

  if (req.query.type) {
    type = req.query.type;
    if (type === 'illuminate') {
      sampleSize = 3;
    }
  }

  Questions.aggregate()
    .sample(sampleSize)
    .exec()
    .then(function(foundQuestions) {
      if (foundQuestions) {
        res.status(200);
        return res.send(foundQuestions);
      }
      res.status(404);
      res.send([]);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

exports.remove_question = function(req, res) {
  let _questionId = req.query.id;

  if (!_questionId) {
    res.sendStatus(400);
  } else {
    Questions.findByIdAndRemove(_questionId, function(err, doc) {
      if (!err) {
        console.log('Question removed');
        res.status(200);
        res.send(doc);
      } else {
        console.log('Error: ' + err);
        res.sendStatus(500);
      }
    });
  }
};

exports.update_question = function(req, res) {
  let _questionId = req.body._id;

  if (!_questionId) {
    res.sendStatus(400);
  } else {
    let data = {};
    ObjectHelper.copyProperties(req.body, data, { _id: '', __v: '' });

    Questions.findOneAndUpdate(
      { _id: _questionId },
      data,
      { upsert: true, new: true },
      function(err, foundQuestion) {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        }
        if (foundQuestion) {
          res.status(200);
          res.send(foundQuestion);
        } else {
          res.status(404);
          res.send({});
        }
      }
    );
  }
};

exports.remove_questions = function(req, res) {
  Questions.remove({}, function(err, doc) {
    if (!err) {
      console.log('Questions removed');
      res.sendStatus(200);
    } else {
      console.log('Error: ' + err);
      res.sendStatus(500);
    }
  });
};
