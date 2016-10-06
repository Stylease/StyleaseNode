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
        duration: String,
        by: String,
        timeFrom: Date,
        timeTo: Date,
        deliveryTime: String,
        pickupTime: String,
    }]
});

module.exports = mongoose.model('Cart', schema);

var models = {
    saveData: function(data, callback) {
        function callme(num) {
            if (data.fromsession == true) {
                // console.log("cart completed");
                callback(null, "Done");
            } else {
                if (num === data.cartproduct.length) {
                    // console.log("cart completed");
                    callback(null, "Done");
                } else {
                    var mydata = {};
                    mydata.cartproduct = {};
                    mydata.user = data.user;
                    mydata.cartproduct = data.cartproduct[num];
                    callcartsave(mydata, num);
                }
            }
        }

        function callcartsave(data, num) {
            // console.log("mdata", data, num);
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
            }]).exec(function(err, data4) {
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
                            } else {
                                num++;
                                callme(num);
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
                            } else {
                                num++;
                                callme(num);
                            }
                        });
                    }
                }
            });
        }
        if (data.fromsession == true) {

            callcartsave(data, 0);
        } else {
            Cart.findOneAndUpdate({
                user: data.user
            }, {}, {
                upsert: true
            }).exec(function(err, respo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    if (respo) {
                        if (respo && respo.length > 0) {
                            callback(null, respo);
                        } else {
                            if (data.cartproduct == undefined) {
                                callback(null, "Cart is empty")
                            } else {
                                callme(0);
                            }
                        }
                        four
                    } else {
                        if (data.cartproduct == undefined) {
                            callback(null, "Cart is empty")
                        } else {
                            callme(0);
                        }
                    }
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
        var newreturns = {};
        async.parallel([
            function(callback1) {
                Cart.aggregate([{
                        $match: {
                            user: objectid(data.user)
                        }
                    }, {
                        $unwind: "$cartproduct"
                    }, {
                        $lookup: {
                            from: "products",
                            localField: "cartproduct.product",
                            foreignField: "_id",
                            as: "product"
                        }
                    }, {
                        $unwind: "$product"
                    }, {
                        $project: {
                            "product.name": 1,
                            "product.eightdayrentalamount": 1,
                            "product.fourdayrentalamount": 1,
                            "product.fourdaysecuritydeposit": 1,
                            "product.price": 1
                        }
                    }, {
                        $group: {
                            "_id": null,
                            "totalrentalamount": {
                                $sum: "$product.fourdayrentalamount"
                            },
                            "totalsecuritydeposit": {
                                $sum: "$product.fourdaysecuritydeposit"
                            },
                            count: {
                                $sum: 1
                            }
                        }
                    }

                ], function(err, cartco) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else {
                        newreturns.cartcount = cartco[0];
                        // console.log("cartcount", cartco);
                        callback1(null, newreturns);
                    }
                });
            },
            function(callback1) {
                Cart.find({
                    user: data.user
                }, {}).populate("cartproduct.product", "name price fourdayrentalamount eightdayrentalamount fourdaysecuritydeposit eightdaysecuritydeposit images").lean().exec(function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else {
                        if (data2 && data2.length > 0) {
                            // console.log("data2", data2);
                            newreturns.cartproduct = data2[0].cartproduct;
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

    getCartOffline: function(data, callback) {
        // console.log("in offline cart");
        var newcartdata = _.cloneDeep(data);
        // console.log("newcartdata", newcartdata);
        var newdata = {};
        var cartcount = {};
        if (newcartdata && newcartdata.length > 0) {
            Product.populate(newcartdata, {
                path: "product",
                select: "name fourdayrentalamount eightdayrentalamount fourdaysecuritydeposit eightdaysecuritydeposit images price",
                options: {
                    lean: true
                }
            }, function(err, response) {
                if (err) {
                    callback(err, null);
                } else {
                    var totalrentalamount = 0;
                    var totalsecuritydeposit = 0;
                    newdata.cartproduct = response;
                    // console.log("resss", response);
                    _.each(response, function(res) {
                        totalrentalamount = parseInt(totalrentalamount) + parseInt(res.product.rentalamount);
                        totalsecuritydeposit = parseInt(totalsecuritydeposit) + parseInt(res.product.securitydeposit);
                    });
                    cartcount.totalrentalamount = totalrentalamount;
                    cartcount.totalsecuritydeposit = totalsecuritydeposit;
                    cartcount.count = response.length;
                    newdata.cartcount = cartcount;
                    callback(null, newdata);
                }
            });
        } else {
            callback({
                message: "No products"
            }, null)
        }

    },

    getCartBackend: function(data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                Cart.count({
                    user: data._id
                }).exec(function(err, number) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else if (number) {
                        newreturns.cartcount = number;
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
                }, {}).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("cartproduct.product", "name fourdayrentalamount eightdayrentalamount").lean().exec(function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else {
                        if (data2 && data2.length > 0) {
                            newreturns.data = data2[0].cartproduct;
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
    emptyCart: function(data, callback) {
        Cart.update({
            user: data.user
        }, {
            "$set": {
                "cartproduct": []
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

    updateCartDate: function(data, callback) {
        // tobechanged = {};
        // var attribute = "cartproduct.$.";
        // _.forIn(data, function(value, key) {
        //     console.log("val", value, "key", key);
        //     tobechanged[attribute + key] = value;
        // });
        console.log("dd", data);
        Cart.update({
            user: data.user
        }, {
            $each: {
                $set: {
                    "cartproduct.deliveryTime": data.deliveryTime
                }
            }
        }, {
            multi: true
        }).exec(function(err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, respo);
            }
        });
    },
};

module.exports = _.assign(module.exports, models);
