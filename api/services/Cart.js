var mongoose = require('mongoose');
var objectid = require("mongodb").ObjectId;
var Schema = mongoose.Schema;
var schema = new Schema({
    timestamp: Date,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    cartproduct: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            index: true
        },
        size: String,
        by: String,
        // size: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Size',
        //     index: true
        // },
        timeFrom: Date,
        timeTo: Date,
        deliveryTime: String,
        pickupTime: String,
    }]
});

module.exports = mongoose.model('Cart', schema);

var models = {
    saveData: function(data, callback) {
        //online cart insert;
        // console.log(data);
        if (data.fromsession == true) {
            // Cart.find({
            //     user: data.user,
            //     // cartproduct: {
            //     //     $elemMatch: {
            //     //         product: data.cartproduct.product
            //     //     }
            //     // }
            // })
            Cart.aggregate([{
                    $match: {
                        user: objectid(data.user)
                    }
                }, {
                    $unwind: {
                        path: "$cartproduct",
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $project: {
                        "cartproduct": 1
                    }
                }, {
                    $match: {
                        "cartproduct.product": objectid(data.cartproduct.product)
                    }
                }])
                .exec(function(err, data4) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (data4 && data4.length > 0) {
                            //update existing product
                            data4._id = objectid(data4[0].cartproduct._id);
                            //assign id to cart product sent by user
                            data.cartproduct._id = data4._id;
                            Cart.update({
                                "cartproduct._id": data4._id
                            }, {
                                $set: {
                                    "cartproduct.$": data.cartproduct
                                }
                            }, function(err, updated) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    callback(null, {
                                        message: "Product updated"
                                    });
                                }
                            });
                        } else {
                            //add new product
                            Cart.update({
                                user: data.user
                            }, {
                                $push: {
                                    cartproduct: data.cartproduct
                                }
                            }, function(err, updated) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    callback(null, {
                                        message: "Product added"
                                    });
                                }
                            });

                        }
                    }
                });
        } else {
            //check offline cart insert
            if (data.cartproduct) {
                if (data.cartproduct.length > 1) {
                    var upobj = {
                        $pushAll: {
                            cartproduct: data.cartproduct
                        }
                    };
                } else if (data.cartproduct.length < 2) {
                    var upobj = {
                        $push: {
                            cartproduct: data.cartproduct[0]
                        }
                    };
                }
            } else {
                var upobj = {};
            }
            // console.log("in save else");
            Cart.findOneAndUpdate({
                user: data.user
            }, upobj, {
                upsert: true
            }).exec(function(err, respo) {
                if (err) {
                    console.log(err);
                    callback(err, null)
                } else {
                    console.log("save data log");
                    // console.log(respo);
                    callback(null, respo)
                }
            });
        }

        // console.log(data);
        var cart = this(data);

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
        }).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                callback(null, found);
            } else {
                callback(null, {});
            }
        });
    },

    getCart: function(data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        console.log(data);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                Cart.count({
                    user: data.user
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
                Cart.find({
                    user: data.user
                }, {}).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("cartproduct.product", "name rentalamount securitydeposit images").lean().exec(function(err, data2) {
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
    getLimited: function(data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagecart = parseInt(data.pagecart);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                Cart.count({
                    name: {
                        "$regex": checkfor
                    }
                }).exec(function(err, number) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else if (number) {
                        newreturns.totalpages = Math.ceil(number / data.pagecart);
                        callback1(null, newreturns);
                    } else {
                        newreturns.totalpages = 0;
                        callback1(null, newreturns);
                    }
                });
            },
            function(callback1) {
                Cart.find({
                    name: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagecart).limit(data.pagecart).lean().exec(function(err, data2) {
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

    removeCart: function(data, callback) {
        console.log("in remove", data);
        Cart.update({
            user: data.user
        }, {
            $pull: {
                "cartproduct": {
                    "product": data.product
                }
            }
        }).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null)
            } else {
                callback(null, found)
            }
        });
    },
};

module.exports = _.assign(module.exports, models);
