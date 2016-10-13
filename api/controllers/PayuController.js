var PayU = require('payu');
var payu = new PayU("gtKFFx", "eCwWELxi", "https://test.payu.in");
var payukey = "gtKFFx";
var payusalt = "eCwWELxi";
var payuurl = "https://test.payu.in";
//   $MERCHANT_KEY = "gtKFFx";
//   $SALT = "eCwWELxi";
//   $PAYU_BASE_URL = "https://test.payu.in";
module.exports = {
    makePayment: function (req, res) {
        Order.getOne(req.body, function (err, data) {

            if (err) {
                res.callback(err);
            } else {
                res.json(data);
                console.log(data);

                callAPI.multipart = [{
                    "content-type": "application/json",
                    body: JSON.stringify(req.form)
                }];
                request(callAPI, function (err, httpResponse, body) {


                    // hash = sha512(key | txnid | amount | productinfo | firstname | email | udf1 | udf2 | udf3 | udf4 | udf5 || || || SALT);
                    if (err) {
                        callback(err);
                    } else if (body) {
                        body = JSON.parse(body);
                        if (noTry === 0 && body.error) {
                            refreshToken();
                        } else {
                            callback(err, body);
                        }
                    } else {
                        callback(err, body);
                    }
                });

            }

        });
    },
    test: function (req, res) {
        var txtID = parseInt(Math.random() * 10000000000);
        console.log(txtID);
        var hash = sha512("" + payukey + "|" + txtID + "|100|1|1|1|||||||||||" + payusalt);
        // sha512(key | txnid | amount | productinfo | firstname | email | udf1 | udf2 | udf3 | udf4 | udf5 || || || SALT)
        var hashtext = hash.toString('hex');

        console.log(hashtext);

        request.post({
            url: 'https://test.payu.in/_payment',
            form: {
                key: payukey,
                txnid: txtID,
                amount: 100,
                productinfo: 1,
                firstname: 1,
                email: 1,
                phone: 1,
                surl: 'http://localhost:1337/Payu/successError',
                furl: 'http://localhost:1337/Payu/successError',
                hash: hashtext
            }
        }, function (err, httpResponse, body) {
            console.log(body);
            if (httpResponse.statusCode == 302) {
                res.redirect(httpResponse.headers.location);
            } else {
                res.send(body);
            }
            // res.end();
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