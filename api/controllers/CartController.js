var request = require('request');
var lodash = require('lodash');
module.exports = {

    save: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                // console.log("logged in");
                Cart.saveData(req.body, res.callback);
            } else {
                // console.log("Not logged");
                if (req.session.cart && req.session.cart.length > 0) {
                    var abc = _.findIndex(req.session.cart, function(o) {
                        return o.product == req.body.product;
                    });
                    if (abc === -1) {
                        req.session.cart.push(req.body);
                    } else {
                        // console.log("already in cart");
                        res.json({
                            value: false,
                            data: req.session.cart,
                            message: "already in cart"
                        });
                    }
                } else {
                    req.session.cart = [];
                    req.session.cart.push(req.body);
                }
                // console.log(req.session.cart);
                res.json({
                    value: true,
                    data: req.session.cart,
                    message: "Offline cart"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOne: function(req, res) {

        if (req.body) {
            Cart.getOne(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    delete: function(req, res) {
        if (req.body) {
            console.log(req.body);
            Cart.deleteData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAll: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            Cart.getAll(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getLimited: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.body.pagesize && req.body.pagenumber) {
                Cart.getLimited(req.body, res.callback);
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
    getCart: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.session.user) {
                console.log(req.body);
                if (req.body.pagesize && req.body.pagenumber) {
                    Cart.getCart(req.body, res.callback);
                } else {
                    res.json({
                        value: false,
                        data: "Invalid Params"
                    });
                }
            } else {
                console.log("not logged in");
                res.json({
                    value: true,
                    data: req.session.cart,
                    message: "Offline cart"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },


};
