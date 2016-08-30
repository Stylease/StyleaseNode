var mongoose = require('mongoose');
var md5 = require('md5');
var objectid = require("mongodb").ObjectId;
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    email: String,
    password: {
        type: String,
        default: ""
    },
    forgotpassword: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
    facebook: String,
    google: String,
    oauthLogin: {
        type: [{
            socialProvider: String,
            socialId: String,
            modificationTime: Date
        }],
        index: true
    },
    accesslevel: String,
    status: Boolean,
    image: String,
    timestamp: Date,
    // notification: {
    //   type: [],
    //   index:true
    // },
    billingaddressflat: {
        type: String,
        default: ""
    },
    billingaddresslandmark: {
        type: String,
        default: ""
    },
    billingaddressstreet: {
        type: String,
        default: ""
    },
    billingaddresspin: {
        type: String,
        default: ""
    },
    billingaddresscity: {
        type: String,
        default: ""
    },
    billingaddressstate: {
        type: String,
        default: ""
    },
    billingaddresscountry: {
        type: String,
        default: ""
    },
    shippingaddressflat: {
        type: String,
        default: ""
    },
    shippingaddresslandmark: {
        type: String,
        default: ""
    },
    shippingaddressstreet: {
        type: String,
        default: ""
    },
    shippingaddresspin: {
        type: String,
        default: ""
    },
    shippingaddresscity: {
        type: String,
        default: ""
    },
    shippingaddressstate: {
        type: String,
        default: ""
    },
    shippingaddresscountry: {
        type: String,
        default: ""
    },
    wishlist: {
        type: [{
            timestamp: Date,
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                index: true
            }
        }],
        index: true
    }

});

module.exports = mongoose.model('User', schema);

var models = {
    sort: function(data, callback) {
        function callSave(num) {
            User.saveData({
                _id: data[num],
                order: num + 1
            }, function(err, respo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    num++;
                    if (num == data.length) {
                        callback(null, {
                            comment: "Data sorted"
                        });
                    } else {
                        callSave(num);
                    }
                }
            });
        }
        if (data && data.length > 0) {
            callSave(0);
        } else {
            callback(null, {});
        }
    },
    register: function(data, callback) {
        if (data.password && data.password !== "") {
            data.password = md5(data.password);
        }
        var user = this(data);
        user.email = data.email;
        this.count({
            "email": user.email
        }).exec(function(err, data2) {
            if (err) {
                callback(err, data);
            } else {
                if (data2 === 0) {
                    user.save(function(err, data3) {
                        data3.password = '';
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, data3);
                        }
                    });
                } else {
                    callback("User already Exists", false);
                }
            }
        });
    },
    saveData: function(data, callback) {
        //        delete data.password;
        var user = this(data);
        if (data._id) {
            data.expiry = new Date(data.expiry);
            data.password = md5(data.password);
            data.userid = new Date();
            this.findOneAndUpdate({
                _id: data._id
            }, data).exec(function(err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (updated) {
                    callback(null, updated);
                } else {
                    callback(null, {});
                }
            });
        } else {
            user.timestamp = new Date();
            data.expiry = new Date();
            user.password = md5(user.password);
            user.save(function(err, created) {
                if (err) {
                    callback(err, null);
                } else if (created) {
                    callback(null, created);
                } else {
                    callback(null, {});
                }
            });
        }
    },
    deleteData: function(data, callback) {
        this.findOneAndRemove({
            _id: data._id
        }, function(err, deleted) {
            if (err) {
                callback(err, null);
            } else if (deleted) {
                callback(null, deleted);
            } else {
                callback(null, {});
            }
        });
    },
    getAll: function(data, callback) {
        this.find({}, {
            password: 0
        }).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && found.length > 0) {
                callback(null, found);
            } else {
                callback(null, []);
            }
        });
    },
    getOne: function(data, callback) {
        this.findOne({
            "_id": data._id
        }, {
            password: 0
        }).populate("cart.product", "_id  name", null, {
            sort: {}
        }).lean().exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                if (found.cart && found.cart.length > 0) {
                    _.each(found.cart, function(n) {
                        if (n.product && n.product.name) {
                            n.productname = n.product.name;
                            delete n.product;
                        }
                    });
                }
                callback(null, found);
            } else {
                callback(null, {});
            }
        });
    },
    forgotPassword: function(data, callback) {
        this.findOne({
            email: data.email
        }, {
            password: 0,
            forgotpassword: 0
        }, function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (found) {
                    if (!found.oauthLogin || (found.oauthLogin && found.oauthLogin.length <= 0)) {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < 8; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        var encrypttext = md5(text);
                        User.findOneAndUpdate({
                            _id: found._id
                        }, {
                            forgotpassword: encrypttext
                        }, function(err, data2) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                var emailData = {};
                                emailData.email = data.email;
                                console.log('data.email', data.email);
                                emailData.content = text;
                                emailData.filename = "forgotpassword.ejs";
                                emailData.subject = "Forgot Password";
                                Config.email(emailData, function(err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        console.log(emailRespo);
                                        callback(null, {
                                            comment: "Mail Sent"
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        callback(null, {
                            comment: "User logged in through social login"
                        });
                    }
                } else {
                    callback(null, {
                        comment: "User not found"
                    });
                }
            }
        });
    },
    getCart: function(data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var skip = parseInt(data.pagesize * (data.pagenumber - 1));
        async.parallel([
                function(callback) {
                    User.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$cart"
                    }, {
                        $match: {
                            "cart.size": {
                                '$regex': check
                            }
                        }
                    }, {
                        $group: {
                            _id: null,
                            count: {
                                $sum: 1
                            }
                        }
                    }, {
                        $project: {
                            count: 1
                        }
                    }]).exec(function(err, result) {
                        console.log(result);
                        if (result && result[0]) {
                            newreturns.total = result[0].count;
                            newreturns.totalpages = Math.ceil(result[0].count / data.pagesize);
                            callback(null, newreturns);
                        } else if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback({
                                message: "Count of null"
                            }, null);
                        }
                    });
                },
                function(callback) {
                    User.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$cart"
                    }, {
                        $match: {
                            "cart.size": {
                                $regex: check
                            }
                        }
                    }, {
                        $group: {
                            _id: "_id",
                            cart: {
                                $push: "$cart"
                            }
                        }
                    }, {
                        $project: {
                            _id: 0,
                            cart: {
                                $slice: ["$cart", skip, data.pagesize]
                            }
                        }
                    }]).exec(function(err, found) {
                        console.log(found);
                        if (found && found.length > 0) {
                            newreturns.data = found[0].cart;
                            callback(null, newreturns);
                        } else if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback({
                                message: "Count of null"
                            }, null);
                        }
                    });
                }
            ],
            function(err, data4) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data4) {
                    callback(null, newreturns);
                } else {
                    callback(null, newreturns);
                }
            });
    },
    login: function(data, callback) {
        data.password = md5(data.password);
        User.findOne({
            email: data.email,
            password: data.password
        }, function(err, data2) {
            if (err) {
                console.log(err);
                callback(er, null);
            } else {
                if (_.isEmpty(data2)) {
                    User.findOne({
                        email: data.email,
                        forgotpassword: data.password
                    }, function(err, data4) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            if (_.isEmpty(data4)) {
                                callback(null, {
                                    comment: "User Not Found"
                                });
                            } else {
                                User.findOneAndUpdate({
                                    _id: data4._id
                                }, {
                                    password: data.password,
                                    forgotpassword: ""
                                }, function(err, data5) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        data5.password = "";
                                        data5.forgotpassword = "";
                                        callback(null, data5);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    User.findOneAndUpdate({
                        _id: data2._id
                    }, {
                        forgotpassword: ""
                    }, function(err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            data3.password = "";
                            data3.forgotpassword = "";
                            callback(null, data3);
                        }
                    });
                }
            }
        });
    },
    getLimited: function(data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                User.count({
                    email: {
                        "$regex": checkfor
                    }
                }).exec(function(err, number) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else if (number) {
                        newreturns.totalpages = Math.ceil(number / data.pagesize);
                        callback1(null, newreturns);
                    } else {
                        newreturns.totalpages = 0;
                        callback1(null, newreturns);
                    }
                });
            },
            function(callback1) {
                User.find({
                    email: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("cart.product", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).lean().exec(function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else {
                        if (data2 && data2.length > 0) {
                            newreturns.data = data2;
                            newreturns.pagenumber = data.pagenumber;
                            callback1(null, newreturns);
                        } else {
                            callback1({
                                message: "No data found"
                            }, null);
                        }
                    }
                });
            }
        ], function(err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, newreturns);
            }
        });
    },

};

module.exports = _.assign(module.exports, models);
