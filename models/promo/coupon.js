const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const CouponStatus = require('./couponStatus');

const CouponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  setId: {
    type: String, //String, compatible with Schema.Types.ObjectId,
    required: true,
  },
  data: {
    type: Object,
    default: null,
  },
  validityStartDate: {
    type: Number,
    default: Number.MIN_SAFE_INTEGER
  },
  expirationDate: {
    type: Number,
    default: Number.MAX_SAFE_INTEGER
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  ownerUserId: {
    type: String,
    default: null,
  },
  ownerUserData: {
    type: Object,
    default: null,
  }
});

CouponSchema.methods.getStatus = function getStatus() {
  if (this.isUsed) {
    //early out
    return CouponStatus.COUPON_STATUS_USED;
  }

  let status = CouponStatus.COUPON_STATUS_ACTIVE;

  if (isFinite(this.validityStartDate) || isFinite(this.expirationDate)) {
    const timeNow = Date.now();

    if (timeNow < this.validityStartDate) {
      status = CouponStatus.COUPON_STATUS_UPCOMING;
    }
    else if (timeNow >= this.expirationDate) {
      status = CouponStatus.COUPON_STATUS_EXPIRED;
    }
  }

  return status;
};

module.exports = Mongoose.model('Coupon', CouponSchema);
