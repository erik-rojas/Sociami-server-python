const Routes = require('express').Router();

const ControllerPromo = require('../controllers/promo');
const ControllerCouponSet = require('../controllers/couponSet');
const ControllerCoupon = require('../controllers/coupon');

Routes.post('/generateVoucherCodes', ControllerPromo.generate_voucher_codes); //this should be 'post' or 'put', but leaving 'get' for now, so Dan can use it from browser

//coupon sets
Routes.put('/couponSetCreate', ControllerCouponSet.create_coupon_set);
Routes.post('/couponSetUpdate', ControllerCouponSet.update_coupon_set);
Routes.delete('/couponSetDelete', ControllerCouponSet.delete_coupon_set);
Routes.delete('/couponSetDeleteAll', ControllerCouponSet.delete_coupon_sets);
Routes.get('/couponSetGet', ControllerCouponSet.get_coupon_set);
Routes.get('/couponSetsGet', ControllerCouponSet.get_coupon_sets);

//coupons
Routes.put('/couponCreate', ControllerCoupon.create_coupon);
Routes.post('/couponUpdate', ControllerCoupon.update_coupon);
Routes.delete('/couponDelete', ControllerCoupon.delete_coupon);
Routes.delete('/couponDeleteAll', ControllerCoupon.delete_coupons);
Routes.get('/couponGet', ControllerCoupon.get_coupon);
Routes.get('/couponsGet', ControllerCoupon.get_coupons);
Routes.get('/couponsGetPDF', ControllerCoupon.get_coupons_pdf);
Routes.get('/couponsGetXLSX', ControllerCoupon.get_coupons_xlsx);
Routes.post('/couponRedeem', ControllerCoupon.redeem_coupon);

/*coupon set JSON PUT 
{
    "name": "Effective Date Voucher"
}
*/
/*coupons generating
{
	"setId": "5aaea3f44af87140dc18ff12",
	"count": 1000,
	"fields": {
		"benefit": {
			"date": "TBC",
			"value": "20 SOQQ TOKENS"
	    }
	}
}
*/
module.exports = Routes;