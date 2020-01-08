const ObjectHelper = require('../helpers/object_helper');

const CouponSet = require('../models/promo/couponSet');

exports.create_coupon_set = function(req, res) {
    if (!req.body.name) {
        res.sendStatus(400);
    }
    else {
        const newCouponSet = new CouponSet({
            name: req.body.name
        });

        newCouponSet.save()
        .then((result) => {
            res.status(200);
            res.send(result);
        })
        .catch((error) => {
            console.log(error);
            if (error.code === 11000) {
                res.status(400);
                res.send(`Set "${req.body.name}" already exists!`)
            }
            else {
                res.sendStatus(500);
            }
        });
    }
}

exports.update_coupon_set = function(req, res) {
    if (!req.body._id) {
        res.sendStatus(400);
    }
    else {
      let updateData = {};

      ObjectHelper.copyProperties(req.body, updateData, {_id: null, __v: null});

      CouponSet.findOneAndUpdate({_id: req.body._id}, updateData, {upsert:false, new: true})
      .then((document) => {
        if (document) {
          res.status(200);
          res.send(document);
        }
        else {
            res.sendStatus(404);
        }
      })
      .catch((error) => {
        console.log(error);
        res.sendStatus(500);
      });
  }
}

exports.delete_coupon_set = function(req, res) {
    if (!req.body._id) {
        res.sendStatus(400);
    }
    else {
        CouponSet.findByIdAndRemove(req.body._id)
        .then(() => {
          res.sendStatus(200);
        })
        .catch((error) => {
          console.log(error);
          res.sendStatus(500);
        });
    }
}

exports.delete_coupon_sets = function(req, res) {
    CouponSet.remove({})
    .then(() => {
        CouponSet.collection.dropIndexes()
        .then(() => {
            res.sendStatus(200);
        })
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(500);
    });
}

exports.get_coupon_set = function(req, res) {
    if (!req.query.id) {
        res.sendStatus(400);
    }
    else {
        CouponSet.findOne({_id: req.query.id})
        .then((result) => {
            if (result) {
              res.status(200);
              res.send(result);
            }
            else {
                res.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        })
    }
}

exports.get_coupon_sets = function(req, res) {
    CouponSet.find({})
    .then((results) => {
        if (results) {
            res.status(200);
            res.send(results);
        }
        else {
            res.sendStatus(404);
        }
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(500);
    })
}