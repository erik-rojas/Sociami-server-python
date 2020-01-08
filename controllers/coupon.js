const ObjectHelper = require('../helpers/object_helper');

const PDFDocument = require('pdfkit');

const Coupon = require('../models/promo/coupon');
const CouponStatus = require('../models/promo/couponStatus');
const CouponSet = require('../models/promo/couponSet');

exports.create_coupon = async function (req, res) {
    if (!req.body.code || !req.body.setId) {
        res.sendStatus(400);
    }
    else {
        const CouponSetFound = await CouponSet.findOne({ _id: req.body.setId }).then((foundCouponSet) => foundCouponSet).catch((error) => {
            console.log(error);
        });

        if (!CouponSetFound) {
            res.status(404);
            res.send(`Attempt to create Coupon for invalid setId: ${req.body.setId}`);
        }
        else {
            const newCoupon = new Coupon({
                ...req.body
            });

            newCoupon.save()
                .then((result) => {
                    res.status(200);
                    res.send(result);
                })
                .catch((error) => {
                    console.log(error);
                    if (error.code === 11000) {
                        res.status(400);
                        res.send(`Coupon "${req.body.code}" already exists!`)
                    }
                    else {
                        res.sendStatus(500);
                    }
                });
        }
    }
}

exports.update_coupon = async function (req, res) {
    if (!req.body._id) {
        res.sendStatus(400);
    }
    else {
        let updateData = {};

        ObjectHelper.copyProperties(req.body, updateData, { _id: null, __v: null });

        if (updateData.setId) {
            const CouponSetFound = await CouponSet.findOne({ _id: req.body.setId }).then((foundCouponSet) => foundCouponSet).catch((error) => {
                console.log(error);
            });

            if (!CouponSetFound) {
                res.status(404);
                res.send(`Attempt to set invalid setId: ${req.body.setId}`);
                return;
            }
        }

        Coupon.findOneAndUpdate({ _id: req.body._id }, updateData, { upsert: false, new: true })
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

exports.delete_coupon = function (req, res) {
    if (!req.body._id) {
        res.sendStatus(400);
    }
    else {
        Coupon.findByIdAndRemove(req.body._id)
            .then(() => {
                res.sendStatus(200);
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
    }
}

exports.delete_coupons = function (req, res) {
    Coupon.remove({})
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

exports.get_coupon = function (req, res) {
    if (!req.query.id) {
        res.sendStatus(400);
    }
    else {
        Coupon.findOne({ _id: req.query.id })
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

exports.get_coupons = function (req, res) {
    Coupon.find(req.query ? req.query : {})
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

exports.get_coupons_pdf = function (req, res) {
    Coupon.find({})
        .then((results) => {
            if (results) {
                const DocPDF = new PDFDocument();
                let filename = "couponCodes";
                // Stripping special characters
                filename = encodeURIComponent(filename) + '.pdf'
                // Setting response to 'attachment' (download).
                // If you use 'inline' here it will automatically open the PDF
                res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
                res.setHeader('Content-type', 'application/pdf')

                let content = "";

                let numCodes = 0;

                results.forEach(couponDoc => {
                    if (couponDoc.getStatus() == CouponStatus.COUPON_STATUS_ACTIVE) {
                        let benefit = "";
                        if (couponDoc.data && couponDoc.data.benefit && couponDoc.data.benefit.date && couponDoc.data.benefit.value) {
                            benefit = couponDoc.data.benefit.date + " " + couponDoc.data.benefit.value;
                        }
                        content += couponDoc.code + "\n" + benefit + "\n\n";
                        ++numCodes;
                    }
                });

                content = `${numCodes} Coupon codes available:` + "\n\n" + content;

                DocPDF.y = 0;
                DocPDF.text(content, 50, 50);
                DocPDF.pipe(res);
                DocPDF.end();
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

exports.get_coupons_xlsx = function (req, res) {
    Coupon.find({})
        .then((results) => {
            if (results) {

                let filename = "couponCodes";
                // Stripping special characters
                filename = encodeURIComponent(filename) + '.xlsx'
                // Setting response to 'attachment' (download).
                res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
                res.setHeader('Content-type', 'application/xlsx')

                let content = "";

                let numCodes = 0;

                // Require library
                var excel = require('excel4node');

                // Create a new instance of a Workbook class
                var workbook = new excel.Workbook();

                // Add Worksheets to the workbook
                var worksheet = workbook.addWorksheet('Sheet 1');
                var worksheet2 = workbook.addWorksheet('Sheet 2');

                let row = 3;
                let col = 1;


                results.forEach(couponDoc => {
                    if (couponDoc.getStatus() == CouponStatus.COUPON_STATUS_ACTIVE) {
                        let benefit = "";
                        if (couponDoc.data && couponDoc.data.benefit && couponDoc.data.benefit.date && couponDoc.data.benefit.value) {
                            benefit = couponDoc.data.benefit.date + " " + couponDoc.data.benefit.value;
                        }
                        content += couponDoc.code + "\n" + benefit + "\n\n";

                        worksheet.cell(row, col).string(couponDoc.code);
                        worksheet.cell(row, col + 1).string(benefit);
                        row += 2;

                        ++numCodes;
                    }
                });

                worksheet.cell(1, 1).string("Coupon codes available:");
                worksheet.cell(1, 2).number(numCodes);

                res.status(200);
                workbook.write('Excel.xlsx', res);
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

exports.redeem_coupon = async function (req, res) {
    if (!req.body.code || !req.body.owner || !req.body.owner.id || !req.body.owner.firstName || !req.body.owner.lastName) {
        res.sendStatus(400);
    }
    else {
        Coupon.findOne({ code: req.body.code })
            .then((document) => {
                if (document) {
                    const currentCouponStatus = document.getStatus();
                    if (currentCouponStatus != CouponStatus.COUPON_STATUS_ACTIVE) {
                        res.status(423);
                        res.send({ status: currentCouponStatus });
                        return;
                    }
                    document.set('isUsed', true);
                    document.set('ownerUserId', req.body.owner.id);
                    document.set('ownerUserData', { firstName: req.body.owner.firstName, lastName: req.body.owner.lastName });

                    document.save()
                        .then((result) => {
                            res.status(200);
                            res.send(result);
                        })
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