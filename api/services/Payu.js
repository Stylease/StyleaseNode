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
                        surl: 'http://admin.thestylease.com/payu/successError',
                        furl: 'http://admin.thestylease.com/payu/successError',
                        hash: hashtext
                    }
                }, callback);
            } else {
                callback(null, {});
            }
        });
    },


    sendMail: function (id, callback) {
        console.log("iddd", id);
        Order.findOne(
            id
        ).populate("cartproduct.product", "name images fourdayrentalamount eightdayrentalamount").exec(function (err, data) {
            console.log("dddd", data);
            var emailData = {};
            var monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
                "July", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            var dd = new Date(data.cartproduct[0].timeFrom);
            var month = monthNames[dd.getMonth()];
            var year = dd.getFullYear();
            var day = dd.getDate();
            var timeFrom = month + " " + day + ", " + year;
            var ddt = new Date(data.cartproduct[0].timeTo);
            var monthd = monthNames[ddt.getMonth()];
            var yeard = ddt.getFullYear();
            var dayd = ddt.getDate();
            var timeTo = monthd + " " + dayd + ", " + yeard;

            var smsData = {};
            smsData.mobile = data.mobile;
            smsData.content = "Your TheStylease.Com Order No.: " + data.orderid + " has been successfully placed. It will be delivered to your address on " + timeFrom + ". Thank you. Happy styling!";

            Config.sendSMS(smsData, function (err, smsRespo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    console.log("sms sent");
                    // callback(null, smsRespo);
                }
            });
            emailData.email = data.email;
            emailData.timeFrom = timeFrom;
            emailData.timeTo = timeTo;
            emailData.filename = "invoice.ejs";
            emailData.name = data.firstname + " " + data.lastname;
            emailData.cartproduct = data.cartproduct;
            emailData.billingAddressFlat = data.billingAddressFlat;
            emailData.billingAddressStreet = data.billingAddressStreet;
            emailData.billingAddressLandmark = data.billingAddressLandmark;
            emailData.billingAddressPin = data.billingAddressPin;
            emailData.billingAddressCity = data.billingAddressCity;
            emailData.billingAddressState = data.billingAddressState;
            emailData.billingAddressCountry = data.billingAddressCountry;
            emailData.mobile = data.mobile;
            emailData.shippingAddressFlat = data.shippingAddressFlat;
            emailData.shippingAddressStreet = data.shippingAddressStreet;
            emailData.shippingAddressLandmark = data.shippingAddressLandmark;
            emailData.shippingAddressPin = data.shippingAddressPin;
            emailData.shippingAddressCity = data.shippingAddressCity;
            emailData.shippingAddressState = data.shippingAddressState;
            emailData.shippingAddressCountry = data.shippingAddressCountry;
            emailData.total = data.total;
            emailData.subtotal = data.subtotal;
            emailData.servicetax = data.servicetax;
            emailData.refundabledeposit = data.refundabledeposit;
            emailData.content1 = "Your payment for Rs." + data.total + " has been successfully received on our end. Your outfit will be out for dispatch on your selected date.";
            emailData.orderno = data.orderid;
            emailData.subject = "Order confirmation - TheStylease";
            // console.log("eee", emailData);
            Config.email(emailData, function (err, emailRespo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, emailRespo);
                }
            });
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