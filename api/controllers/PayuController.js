module.exports = {
    payU: function (req, res) {
        if (req.query._id) {
            Payu.makePayment(req.query, function (err, httpResponse, body) {
                console.log("this is response");
                if (httpResponse.statusCode == 302) {
                    console.log("httpResponse");
                    console.log(httpResponse);
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
    }
};