const VoucherCodes = require('voucher-code-generator');

const VoucherCodesLength = 16;
const VoucherCodesCharset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


const GenerateVoucherCodes = (count, length = VoucherCodesLength, charset = VoucherCodesCharset) => {
    return (VoucherCodes.generate({
        length: length,
        count: count,
        charset: charset
    }));
}

exports.generate_voucher_codes = GenerateVoucherCodes;