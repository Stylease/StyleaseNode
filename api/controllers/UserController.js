var request = require('request');
var redirect = "http://thestylease.com";
var http = require('http');
var curl = require('curl-cmd');
module.exports = {
    sort: function (req, res) {
        function callback(err, data) {
            Config.GlobalCallback(err, data, res);
        }
        if (req.body) {
            User.sort(req.body, callback);
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    save: function (req, res) {
        if (req.body) {
            User.saveData(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    req.session.user = respo;
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    saveBillingAddress: function (data, callback) {
        if (req.body) {
            User.saveBillingAddress(req.body, function (err, respo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    register: function (req, res) {
        if (req.body) {
            if (req.body.mobile && req.body.mobile !== "" && req.body.email && req.body.email !== "" && req.body.password && req.body.password !== "") {
                User.register(req.body, function (err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: "Otp Sent"
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Email ID or Mobile No."
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    resendOtp: function (req, res) {
        if (req.body) {
            if (req.body.mobile && req.body.mobile != "") {
                User.resendOtp(req.body, function (err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: {
                                message: "Otp sent"
                            }
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Params"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    checkOtp: function (req, res) {
        if (req.body) {
            if (req.body.mobile && req.body.mobile != "") {
                User.checkOtp(req.body, function (err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        if (data._id) {
                            var sendcart = {};
                            req.session.user = data;
                            sendcart.user = req.session.user._id;
                            sendcart.cartproduct = req.session.cart;
                            Cart.saveData(sendcart, function (err, data) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    req.session.cart = "";
                                    res.json({
                                        value: true,
                                        data: {
                                            message: "signup success"
                                        }
                                    });
                                }
                            });
                        } else {
                            res.json({
                                value: false,
                                data: data
                            });
                        }
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Params"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },
    getOne: function (req, res) {
        if (req.body) {
            User.getOne(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getCart: function (req, res) {
        if (req.body) {
            User.getCart(req.body, function (err, respo) {
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
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    delete: function (req, res) {
        if (req.body) {
            console.log(req.body);
            User.deleteData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
  generateExcel: function (req, res) {
        User.generateExcel(res);
    },
    getAll: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            User.getAll(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    profile: function (req, res) {
        var user = req.session.user;
        if (user) {
            res.set('Cache-Control', 'public, max-age=3600');
            res.json({
                data: user,
                value: true
            });
        } else {
            res.json({
                data: "User not logged in",
                value: false
            });
        }
    },
    forgotPassword: function (req, res) {
        if (req.body) {
            User.forgotPassword(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    changePassword: function (req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body.user = req.session.user._id;
                User.changePassword(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "User Not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    login: function (req, res) {
        if (req.body) {
            if (req.body.email && req.body.email !== "" && req.body.password && req.body.password !== "") {
                User.login(req.body, function (err, data) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        if (data._id) {
                            var sendcart = {};
                            req.session.user = data;
                            sendcart.user = req.session.user._id;
                            sendcart.cartproduct = req.session.cart;
                            Cart.saveData(sendcart, function (err, data) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    req.session.cart = "";
                                    res.json({
                                        value: true,
                                        data: {
                                            message: "login success"
                                        }
                                    });
                                }
                            });

                        } else {
                            res.json({
                                value: false,
                                data: data
                            });
                        }
                    }
                });
            } else {
                res.json({
                    data: "Please provide params",
                    value: true
                });
            }
        } else {
            res.json({
                data: "Invalid Call",
                value: true
            });
        }
    },
    getProfile: function (req, res) {
        if (req.session.user) {
            res.json({
                value: true,
                data: req.session.user
            });
        } else {
            res.json({
                value: false,
                data: {}
            });
        }
    },
    logout: function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                res.json({
                    value: false,
                    data: err
                });
            } else {
                res.json({
                    value: true,
                    data: {}
                });
            }
        });
    },
    loginGoogle: function (req, res) {
        passport.authenticate('google', {
            scope: "openid profile email"
        })(req, res);
    },
    loginGoogleCallback: function (req, res) {
        var callback = function (err, data) {
            if (err || _.isEmpty(data)) {
                res.json({
                    error: err,
                    value: false
                });
            } else {
                if (data._id) {
                    var sendcart = {};
                    req.session.user = data;
                    sendcart.user = req.session.user._id;
                    sendcart.cartproduct = req.session.cart;
                    Cart.saveData(sendcart, function (err, data) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            req.session.cart = "";
                            res.redirect(redirect);
                        }
                    });
                    // req.session.user = data;
                    // req.session.save(function (err) {
                    //     if (err) {
                    //         res.json(err);
                    //     } else {
                    //         res.redirect(redirect);
                    //     }
                    // });
                } else {
                    res.json({
                        data: "User not found",
                        value: false
                    });
                }
            }
        }
        passport.authenticate('google', {
            failureRedirect: '/login'
        }, callback)(req, res);
    },
    loginFacebook: function (req, res) {
        var callback = function (err, data) {
            if (err || _.isEmpty(data)) {
                res.json({
                    error: err,
                    value: false
                });
            } else {
                if (data._id) {
                    var sendcart = {};
                    req.session.user = data;
                    sendcart.user = req.session.user._id;
                    sendcart.cartproduct = req.session.cart;
                    Cart.saveData(sendcart, function (err, data) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            req.session.cart = "";
                            res.redirect(redirect);
                        }
                    });
                    // req.session.user = data;
                    // req.session.save(function (err) {
                    //     if (err) {
                    //         res.json(err);
                    //     } else {
                    //         res.redirect(redirect);
                    //     }
                    // });
                } else {
                    res.json({
                        data: "User not found",
                        value: false
                    });
                }
            }
        };
        passport.authenticate('facebook', {
            scope: ['public_profile', 'user_friends', 'email']
        }, callback)(req, res);
    },

    getLimited: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.body.pagesize && req.body.pagenumber) {
                User.getLimited(req.body, res.callback);
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

    sendSMS: function (req, res) {
        Config.sendSMS(req.body, res.callback);
    },


};