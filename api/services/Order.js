var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    coupon: {
        type: String,
        default: ""
    },
    timestamp: Date,
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
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            index: true
        },
        quantity: Number,
        price: Number,
        timeFrom: Date,
        timeTo: Date,
    }],

    status: {
        type: String,
        default: ""
    },
    subtotal: Number,
    servicetax: Number,
    refundabledeposit: Number,
    deliverycharge: Number,
    total: Number,
    transactionid: {
        type: String,
        default: ""
    },
    paymentmode: {
        type: String,
        default: ""
    },
    orderstatus: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('Order', schema);

var models = {
    saveData: function(data, callback) {
        //        delete data.password;
        var order = this(data);
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

            order.save(function(err, created) {
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
    getAllDetails: function(data, callback) {
        this.find({}, {
            password: 0
        }).populate("user", "_id  name", null, {
            sort: {
                "name": 1
            }
        }).populate("product", "_id  name", null, {
            sort: {
                "name": 1
            }
        }).lean().exec(function(err, found) {
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
    getLimited: function(data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                Order.count({
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
                Order.find({
                    email: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("user", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).populate("products.product", "_id  name", null, {
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
    getOne: function(data, callback) {
        this.findOne({
            "_id": data._id
        }, {
            password: 0
        }).populate("user", "_id  name", null, {
            sort: {
                "name": 1
            }
        }).populate("products.product", "_id  name", null, {
            sort: {
                "name": 1
            }
        }).lean().exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                if (found.products && found.products.length > 0) {
                    _.each(found.products, function(n) {
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
};

module.exports = _.assign(module.exports, models);
