const CharactersManager = require("../utils/character/CharactersManager");

exports.get_classes = function(req, res) {
  CharactersManager.get_characterclasses()
  .then((classes) => {
    res.status(200);
    res.send(classes);
  })
  .catch((error) => {
    console.log(error);
    res.sendStatus(500);
  })
};

exports.set_classes = function(req, res) {
  if (!req.body.characterClasses) {
    res.sendStatus(400);
  }
  else {
    CharactersManager.save_characterclasses(req.body.characterClasses)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
  }
};

exports.get_traits = function(req, res) {
  CharactersManager.get_character_traits()
  .then((classes) => {
    res.status(200);
    res.send(classes);
  })
  .catch((error) => {
    console.log(error);
    res.sendStatus(500);
  })
};

exports.set_traits = function(req, res) {
  if (!req.body.characterTraits) {
    res.sendStatus(400);
  }
  else {
    CharactersManager.save_character_traits(req.body.characterTraits)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
  }
};