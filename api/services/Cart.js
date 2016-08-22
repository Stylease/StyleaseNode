var mongoose = require('mongoose');
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
            size: {
                type: Schema.Types.ObjectId,
                ref: 'Size',
                index: true
            },
            timeFrom: Date,
            timeTo: Date,
            deliveryTime: String,
            pickupTime: String
        }]
        // ,
        // size: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Size',
        //     index: true
        // },
        // timeFrom: Date,
        // timeTo: Date,
        // deliveryTime: String,
        // pickupTime: String

});

module.exports = mongoose.model('Cart', schema);

var models = {
    saveData: function(data, callback) {
        //        delete data.password;
        if (data.fromsession == true) {
            var upobj = {
                $push: {
                    cartproduct: data.cartproduct
                }
            };
        } else {
            var upobj = {
                cartproduct: data.cartproduct
            };
        }
        console.log(data);
        var cart = this(data);
        if (data._id) {
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
Cart.find({})

            Cart.findOneAndUpdate({
                user: data.user
            }, upobj, {
                upsert: true,
                returnNewDocument: true
            }).exec(function(err, respo) {
                if (err) {
                    console.log(err);
                    callback(err, null)
                } else {
                    console.log(respo);
                    callback(null, respo)
                }
            });

            // cart.save(function(err, created) {
            //     if (err) {
            //         callback(err, null);
            //     } else if (created) {
            //         callback(null, created);
            //     } else {
            //         callback(null, {});
            //     }
            // });

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
                    user: data._id
                }, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("product", "_id  name", null, {
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
};

module.exports = _.assign(module.exports, models);
