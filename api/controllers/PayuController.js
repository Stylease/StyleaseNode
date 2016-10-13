module.exports = {
    payU: function (req, res) {
        if (req.query._id) {
            console.log(sails.getBaseUrl());
            Payu.makePayment(req.query, function (err, httpResponse, body) {
                if (httpResponse.statusCode == 302) {
                    res.redirect(httpResponse.headers.location);
                } else {
                    res.send(body);
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    successError: function (req, res) {
        var data = req.allParams();
        if (data.status != "success") {
            // failure
            var transactionid = data.mihpayid;
            var orderid = data.txnid;
            var status = data.status;

            function callback(err, data) {
                console.log("  fali url ");
                console.log(data);
                if (data) {
                    // go to fail url
                    res.redirect("http://thestylease.com/newsite/testing/#/sorry");
                } else {
                    res.redirect("http://thestylease.com/newsite/testing/#/sorry");
                }
            }
            Payu.updateOrderStatus(transactionid, orderid, status, callback)
        } else {
            var transactionid = data.mihpayid;
            var orderid = data.txnid;
            var status = data.status;

            function callback(err, data) {
                console.log("  success url ");
                console.log(data);
                if (data) {
                    // go to success url
                    res.redirect("http://thestylease.com/newsite/testing/#/thankyou/" + data.orderid);
                } else {
                    res.redirect("http://thestylease.com/newsite/testing/#/sorry");
                }
            }
            Payu.updateOrderStatus(transactionid, orderid, status, callback)
                //    success
        }
        res.json(req.allParams());
    }
};