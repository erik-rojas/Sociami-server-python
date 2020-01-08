const PromoManager = require('../utils/promo/PromoManager');

const Coupon = require('../models/promo/coupon');
const CouponSet = require('../models/promo/couponSet');

exports.generate_voucher_codes = async function(req, res) {
    if (!req.body.count || !req.body.setId) {
        res.sendStatus(400);
    }
    else {
        const CouponSetFound = await CouponSet.findOne({_id: req.body.setId}).then((foundCouponSet) => foundCouponSet).catch((error) => {
            console.log(error);
        });

        if (!CouponSetFound) {
            res.status(400);
            res.send("Failed to generate voucher codes. Invalid setId!");
        }
        else {
          const VoucherCodesGenerated = PromoManager.generate_voucher_codes(req.body.count);

          if (VoucherCodesGenerated.length > 0) {
              //map generated vouchers to Coupon model
            const couponModels = VoucherCodesGenerated.map((voucher) => {
                let couponModelData = {
                    code: voucher,
                    setId: req.body.setId
                };

                
                if (req.body.fields) {
                    //copy additional props if any...
                    couponModelData = Object.assign({}, couponModelData, {data: req.body.fields});
                }

                return (
                    new Coupon({
                        ...couponModelData
                    })
                )
            });

            Coupon.remove({})
            .then(() => {
                Coupon.collection.dropIndexes()
                .then(() => {
                    Coupon.insertMany(couponModels)
                   .then((documents) => {
                     res.send(VoucherCodesGenerated);
                   })
                })
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
          }
          else {
            res.sendStatus(500);
          }
        }
    }
}