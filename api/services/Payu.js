var mongoose = require('mongoose');
// var payukey = "nnrXnB";
var payukey = "gtKFFx";
// var payusalt = "FqSHaI28";
var payusalt = "eCwWELxi";
var payuurl = "https://test.payu.in/_payment";
var models = {

    makePayment: function (data, callback) {
        Order.findOne({
            "_id": data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (found) {
                var txnid = found.orderid + 1;
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
                        // surl: 'http://localhost:1337/Payu/successError',
                        surl: 'http://www.google.com',
                        // furl: 'http://localhost:1337/Payu/successError',
                        furl: 'http://www.wohlig.com',
                        hash: hashtext
                    }
                }, callback);
            } else {
                callback(null, {});
            }
        });
    },
    successError: function (req, res) {
        var data = req.allParams();
        if (data.status == "success") {
            var txtID = data.txtID;
        } else {

        }
        res.json(req.allParams());
    }
};

module.exports = _.assign(module.exports, models);