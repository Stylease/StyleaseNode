var request = require('request');
module.exports = {
        sort: function(req, res) {
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

        save: function(req, res) {
            if (req.body) {
                User.saveData(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Invalid Request"
                });
            }
        },
        getOne: function(req, res) {

            if (req.body) {
                User.getOne(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Invalid Request"
                });
            }
        },
        getCart: function(req, res) {
            if (req.body) {
                User.getCart(req.body, function(err, respo) {
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

        delete: function(req, res) {
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

        getAll: function(req, res) {
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

        profile: function(req, res) {
            var user = req.session.user;
            if (user) {
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

        login: function(req, res) {
            if (req.body) {
                if (req.body.email && req.body.email !== "" && req.body.password && req.body.password !== "") {
                    User.login(req.body, function(err, data) {
                            if (err) {
                                res.json({
                                    value: false,
                                    data: err
                                });
                            } else {
                                if (data._id) {
                                    req.session.user = data;
                                    res.json({
                                        value: true,
                                        data: {
                                            message: "login success"
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
                    }
                    else {
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
            getProfile: function(req, res) {
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
                logout: function(req, res) {
                    req.session.destroy(function(err) {
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
                getLimited: function(req, res) {
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

        };
