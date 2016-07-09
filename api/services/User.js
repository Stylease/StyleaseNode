var mongoose = require('mongoose');
var md5 = require('md5');
var objectid = require("mongodb").ObjectId;
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
    email: String,
    password: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
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
    cart: {
        type: [{
            timestamp: Date,
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                index: true
            },
            size: String,
            timeFrom: Date,
            timeTo: Date,
            deliveryTime: String,
            pickupTime: String
        }],
        index: true
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
                            delete n.product
                        }
                    })
                }
                callback(null, found);
            } else {
                callback(null, {});
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
                            cart: { $slice: ["$cart", skip, data.pagesize] }
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
                callback(err, null);
            } else {
                callback(null, data2)
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
