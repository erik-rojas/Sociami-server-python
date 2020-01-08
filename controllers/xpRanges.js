var Mongoose = require('mongoose');

var XpRanges = require('../models/progression/xpRange');

exports.set_ranges = function(req, res) {
  const ranges = req.body.ranges;
  
  if (!ranges) {
    res.sendStatus(400);
  }

  XpRanges.remove({})
    .then(function() {
    
      let rangeDocs = [];
    
      for (let i = 0; i < ranges.length; ++i) {
        rangeDocs.push(new XpRanges({
           index: ranges[i].index,
           min: ranges[i].min,
           max: ranges[i].max,
         }));
      }

      XpRanges.insertMany(rangeDocs)
        .then(function(docs) {
           res.sendStatus(200);
        })
        .catch(function(err) {
          console.log(err);
          res.sendStatus(500);
        });
      })
      .catch(function(err) {
         console.log(err);
         res.sendStatus(500);
      });
}

exports.get_range = function(req, res) {
  if (!req.query.index) {
    res.sendStatus(400);
  }
  else {
    XpRanges.findOne({index: req.query.index}, function (err, foundRange) {
      if (err)
      {
        console.error(err);
        res.sendStatus(500);
      }
      if (foundRange) {
        res.status(200);
        res.send({min: foundRange.min, max: foundRange.max});
      }
      else {
        res.status(404);
        res.send({});
      }
    })
  }
};