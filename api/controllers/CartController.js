var request = require('request');
var lodash = require('lodash');
module.exports = {

    save: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                var sendcart = {};
                sendcart.fromsession = true;
                sendcart.user = req.session.user._id;
                sendcart.cartproduct = req.body;
                Cart.saveData(sendcart, function(err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: respo
                        });
                    }
                });
            } else {
                // console.log("Not logged");
                var newpro = {};
                if (req.session.cart && req.session.cart.length > 0) {
                    var abc = _.findIndex(req.session.cart, function(o) {
                        newpro = req.body.product;
                        return o.product == req.body.product;
                    });
                    if (abc === -1) {
                        //add new product
                        req.session.cart.push(req.body);
                    } else {
                        //edit cart product
                        var index = _.indexOf(req.session.cart, _.find(req.session.cart, {
                            product: req.body.product
                        }));
                        req.session.cart.splice(index, 1, req.body);
                    }
                } else {
                    // console.log("first new");
                    req.session.cart = [];
                    req.session.cart.push(req.body);
                }
                //save product to product
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

    removeCart: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                // Remove product from online cart
                if (req.body.product) {
                    req.body.user = req.session.user._id;
                    Cart.removeCart(req.body, res.callback);
                } else {
                    res.json({
                        value: false,
                        data: "Please Enter Product ID to Remove"
                    });
                }
            } else {
                // Remove product from offline cart
                var id = req.body.product;
                if (req.session.cart.length > 0) {
                    _.remove(req.session.cart, function(n) {
                        return n.product === id;
                    });
                    res.json({
                        value: true,
                        message: "Product Removed",
                        data: req.session.cart
                    });
                } else {
                    res.json({
                        value: false,
                        data: "Cart is Empty"
                    });
                }
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    emptyCart: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body.user = req.session.user._id;
                Cart.emptyCart(req.body, res.callback);
            } else {
                req.session.cart = [];
                res.json({
                    value: true,
                    data: {
                        message: "Cart is Empty"
                    }
                });
            }
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
        if (req.query) {
            Cart.getAll(req.query, res.callback);
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
        // function callback(err, data) {
        //     Global.response(err, data, res);
        // }
        if (req.body) {
            if (req.session.user) {
                req.body.user = req.session.user._id;
                Cart.getCart(req.body, res.callback);
            } else {
                // console.log("not logged in");
                var sendcartoffline = req.session.cart;
                Cart.getCartOffline(sendcartoffline, res.callback);
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getCartBackend: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.body.pagesize && req.body.pagenumber) {
                Cart.getCartBackend(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Invalid params"
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
