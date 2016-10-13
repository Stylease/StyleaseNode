var mongoose = require('mongoose');
var development = false;
if (development) {
    var payukey = "gtKFFx";
    var payusalt = "eCwWELxi";
    var payuurl = "https://test.payu.in/_payment";
} else {
    var payukey = "yyhHd2";
    var payusalt = "FqSHaI28";
    var payuurl = "https://secure.payu.in/_payment";
}


var models = {

    makePayment: function (data, callback) {
        Order.findOne({
            "_id": data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (found) {
                // var txnid = found.orderid + parseInt(Math.random() * 100000);
                var txnid = found.orderid;
                var amount = found.total;
                var firstname = found.firstname;
                var email = found.email;
                var phone = found.mobile;
                var productinfo = "Purchase of Stylease";
                var hash = sha512("" + payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
                var hashtext = hash.toString('hex');
                request.post({
                    url: payuurl,
                    form: {
                        key: payukey,
                        txnid: txnid,
                        amount: amount,
                        productinfo: productinfo,
                        firstname: firstname,
                        email: email,
                        phone: phone,
                        surl: sails.getBaseUrl() + '/payu/successError',
                        furl: sails.getBaseUrl() + '/payu/successError',
                        hash: hashtext
                    }
                }, callback);
            } else {
                callback(null, {});
            }
        });
    },




    updateOrderStatus: function (transactionid, orderid, status, callback) {
        if (status == 'failure') {
            orderstatus = 'Cancelled'
        } else {
            orderstatus = 'Processing'
        }
        Order.findOneAndUpdate({
            orderid: orderid
        }, {
            transactionid: transactionid,
            orderstatus: orderstatus
        }).exec(function (err, updated) {
            if (err) {
                callback(err, null);
            } else if (updated) {
                callback(null, updated);
            } else {
                callback(null, {});
            }
        });

    },

};

module.exports = _.assign(module.exports, models);