var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    orderid: Number,
    date: {
        type: Date,
        default: Date.now
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
    billingAddressFlat: {
        type: String,
        default: ""
    },
    billingAddressLandmark: {
        type: String,
        default: ""
    },
    billingAddressStreet: {
        type: String,
        default: ""
    },
    billingAddressPin: {
        type: String,
        default: ""
    },
    billingAddressCity: {
        type: String,
        default: ""
    },
    billingAddressState: {
        type: String,
        default: ""
    },
    billingAddressCountry: {
        type: String,
        default: ""
    },
    shippingAddressFlat: {
        type: String,
        default: ""
    },
    shippingAddressLandmark: {
        type: String,
        default: ""
    },
    shippingAddressStreet: {
        type: String,
        default: ""
    },
    shippingAddressPin: {
        type: String,
        default: ""
    },
    shippingAddressCity: {
        type: String,
        default: ""
    },
    shippingAddressState: {
        type: String,
        default: ""
    },
    shippingAddressCountry: {
        type: String,
        default: ""
    },
    cartproduct: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            index: true
        },
        size: String,
        duration: String,
        by: String,
        timeFrom: Date,
        timeTo: Date,
        deliveryTime: String,
        pickupTime: String,
    }],

    subtotal: {
        type: Number,
        default: 0
    },
    servicetax: {
        type: Number,
        default: 0
    },
    refundabledeposit: {
        type: Number,
        default: 0
    },
    deliverycharge: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
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
        default: "Processing"
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
                    if (data.orderstatus === "Out for Delivery") {
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "We’re as excited as you are. Your order is now out for delivery and will shortly be arriving at the selected location";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.subject = "Out for delivery - Stylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function(err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }
                    if (data.orderstatus === "Delivered") {
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "We have received confirmation that your order has been delivered. For any comments or queries contact us on +91 97351 88624 or mail us at info@thestylease.com";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.subject = "Successfully delivered - Stylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function(err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }
                    if (data.orderstatus === "Pick-up") {
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "Thank you for taking care of our outfit like it was one of your own. We have received the parcel. Your deposit amount of Rs." + data.refundabledeposit + " will be refunded within the next 7 working days. We will share the details shortly";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.subject = "Order picked up - Stylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function(err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }
                    if (data.orderstatus === "Completed") {
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "Hope you’re having a good day! This is to notify you that we have returned your deposit for Rs. " + data.refundabledeposit + " against Order " + data.orderid;
                        emailData.content2 = "We look forward to helping you style again soon";
                        emailData.subject = "Deposit returned notification - Stylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function(err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }
                    if (data.orderstatus === "Refund") {
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "Now that all the parties are done and dusted, this is your update on the refund policy. As per our policy we will return the deposit refund against order number " + data.orderid + " , within the next 7 working days.";
                        emailData.content2 = " ";
                        emailData.subject = "Refund notification - Stylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function(err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }
                    callback(null, updated);
                } else {
                    callback(null, {});
                }
            });
        } else {
            Order.findOne({}, {
                _id: 0,
                orderid: 1
            }, {
                sort: {
                    '_id': -1
                },
            }).exec(function(err, found) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    if (_.isEmpty(found)) {
                        order.orderid = 1;
                    } else {
                        order.orderid = found.orderid + 1;
                    }
                    order.save(function(err, created) {
                        if (err) {
                            callback(err, null);
                        } else if (created) {
                            if (data.user != null) {
                                data._id = data.user;
                                User.saveData(data, function(err, data3) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null)
                                    } else {
                                        // console.log("user updated", data3);
                                        // callback(null, data3);
                                    }
                                });
                            }

                            function callme(num) {
                                if (num === created.cartproduct.length) {
                                    console.log("producttime completed");
                                    // callback(null, "Done");
                                } else {
                                    var create = created.toObject();
                                    var mydata = {};
                                    mydata = create.cartproduct[num];
                                    delete mydata._id;
                                    console.log("mydata", mydata._id);
                                    ProductTime.saveData(mydata, function(err, data4) {
                                        console.log("data save");
                                        if (err) {
                                            console.log(err);
                                            callback(err, null);
                                        } else {
                                            console.log("aaaaa");
                                            // console.log("save products to ProductTime");
                                        }
                                    });
                                }

                            }

                            if (created.cartproduct.length > 0) {
                                callme(0);
                            }
                            var emailData = {};
                            emailData.email = data.email;
                            emailData.filename = "order.ejs";
                            emailData.name = data.firstname + " " + data.lastname;
                            emailData.cartproduct = data.cartproduct;
                            emailData.total = created.total;
                            emailData.subtotal = created.subtotal;
                            emailData.servicetax = created.servicetax;
                            emailData.refundabledeposit = created.refundabledeposit;
                            emailData.content1 = "Your payment for Rs." + created.total + " has been successfully received on our end. Your outfit will be out for dispatch on your selected date.";
                            emailData.orderno = created.orderid;
                            emailData.subject = "Order confirmation - Stylease";
                            // console.log("eee", emailData);
                            Config.email(emailData, function(err, emailRespo) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    callback(null, created);
                                }
                            });
                            // callback(null, created);
                        } else {
                            callback({
                                message: "Not created"
                            }, null);
                        }
                    });
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
                }).populate("cartproduct.product", "_id  name fourdayrentalamount eightdayrentalamount", null, {
                    sort: {
                        "name": 1
                    }
                }).sort({
                    _id: -1
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
    getLimitedByUser: function(data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                Order.count({
                    user: data.user
                        // email: {
                        //     "$regex": checkfor
                        // }
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
                    user: data.user
                        // email: {
                        //     "$regex": checkfor
                        // }
                }, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("user", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).populate("cartproduct.product", "_id  name fourdayrentalamount eightdayrentalamount", null, {
                    sort: {
                        "name": 1
                    }
                }).sort({
                    _id: -1
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
        }).populate("cartproduct.product", "_id  name fourdayrentalamount images eightdayrentalamount", null, {
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
                            n.productprice = n.product.rentalamount;
                            delete n.product
                        }
                        if (n.size && n.size.name) {
                            n.sizename = n.size.name;
                            delete n.size
                        }
                    })
                }
                callback(null, found);
            } else {
                callback(null, {});
            }
        });
    },


    getOrderByUser: function(data, callback) {
        Order.find({
            user: data.user
        }).populate("cartproduct.product", "name rentalamount images").sort({
            _id: -1
        }).exec(function(err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (data2 && data2.length > 0) {
                    console.log(data2);
                    callback(null, data2);
                } else {
                    callback({
                        message: "No data found"
                    }, null);
                }
            }
        });
    },

    getOrderById: function(data, callback) {
        Order.findOne({
            orderid: data.orderid
        }).select("orderid total transactionid servicetax subtotal refundabledeposit").exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, found);
            }
        })
    }


};

module.exports = _.assign(module.exports, models);
