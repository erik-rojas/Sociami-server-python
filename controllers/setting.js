const Setting = require('../models/setting');
const ObjectHelper = require('../helpers/object_helper')

exports.save_setting = function(req, res) {
  if (!req.body.defaultBonus) {
    res.sendStatus(400);
  }
  else {
    let newSetting = new Setting({
    });
    
    ObjectHelper.copyProperties(req.body, newSetting, {_id: "", __v:""});
    
    newSetting.save(function(err, setting) {
      if(err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        console.log(`Setting: has been saved.`);
        res.status(200);
        res.send(setting);
      }
    });
  }
};

exports.get_all_settings = function(req, res) {
  Setting.find({}, function(err, foundSetting) {
    if (err) { 
      console.error(err);
      res.sendStatus(500);
    }
    if (foundSetting) {
      res.status(200);
      res.send(foundSetting);
    }
    else {
      res.status(404);
      res.send([]);
    }
  }).sort({ insdt: -1 });
};

exports.update_setting = function(req, res) {
  let _settingId = req.body._id;

  if (!_settingId) {
    res.sendStatus(400);
  }
  else {
    let data = {};
    ObjectHelper.copyProperties(req.body, data, {_id: "", __v:""});

    Setting.findOneAndUpdate({ _id: _settingId}, data, {upsert:true, new: true}, function(err, foundSetting) {
      if (err) { 
        console.error(err);
        res.sendStatus(500);
      }
      if (foundSetting) {
        res.status(200);
        res.send(foundSetting);
      }
      else {
        res.status(404);
        res.send({});
      }
    });
  }
};