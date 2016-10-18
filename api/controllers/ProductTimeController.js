var request = require('request');
module.exports = {
    sort: function (req, res) {
        function callback(err, data) {
            Config.GlobalCallback(err, data, res);
        }
        if (req.body) {
            ProductTime.sort(req.body, callback);
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    save: function (req, res) {
        if (req.body) {
            ProductTime.saveData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getOne: function (req, res) {

        if (req.body) {
            ProductTime.getOne(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    delete: function (req, res) {
        if (req.body) {
            console.log(req.body);
            ProductTime.deleteData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAll: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            ProductTime.getAll(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getLimited: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.body.pagesize && req.body.pagenumber) {
                ProductTime.getLimited(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Invalid Params"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getBookedProductByCart: function (req, res) {
        if (req.body) {
            if (req.session.user) {
                ProductTime.getBookedProductOnline(req.body, res.callback);
            } else {
                req.body = req.session.cart;
                console.log("req body", req.body);
                ProductTime.getBookedProductOffline(req.body, res.callback);
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },


};