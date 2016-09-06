var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectid = require("mongodb").ObjectId;
var schema = new Schema({
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true
    }],
    subcategory: [{
        type: Schema.Types.ObjectId,
        ref: 'Subcategory',
        index: true
    }],
    designer: {
        type: Schema.Types.ObjectId,
        ref: 'Designer',
        index: true
    },
    name: {
        type: String,
        default: ""
    },
    sku: {
        type: String,
        default: ""
    },
    images: [{
        image: String
    }],
    details: {
        type: String,
        default: ""
    },
    care: {
        type: String,
        default: ""
    },
    suggestedProduct: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        index: true
    }],
    color: [{
        type: Schema.Types.ObjectId,
        ref: 'Color',
        index: true
    }],
    notes: {
        type: String,
        default: ""
    },
    additionalnotes: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    // size: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Size',
    //     index: true
    // }],
    rentalamount: {
        type: Number,
        default: 0
    },
    securitydeposit: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    status: Boolean,
    size: [{
        name: {
            type: String,
            default: ""
        },
        text1: {
            type: String,
            default: ""
        },
        text2: {
            type: String,
            default: ""
        },
        text3: {
            type: String,
            default: ""
        },
        text4: {
            type: String,
            default: ""
        }
    }],

});

module.exports = mongoose.model('Product', schema);

var models = {
    sort: function(data, callback) {
        function callSave(num) {
            Product.saveData({
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
    saveData: function(data, callback) {
        // console.log("pro", data.suggestedProduct);
        //delete data.password;
        if (data.suggestedProduct != undefined) {
            if (data.suggestedProduct.length <= 0 || data.suggestedProduct === "") {
                // console.log("inn");
                delete data.suggestedProduct;
            } else {
                // console.log("ou=");
            }
        }
        var product = this(data);
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
            product.save(function(err, created) {
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
        }).populate("category", "_id  name", null, {
            sort: {
                "name": 1
            }
        }).populate("subcategory", "_id  name", null, {
            sort: {
                "name": 1
            }
        }).populate("size", "_id  name", null, {
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
    getProductById: function(data, callback) {
        var newreturns = {};
        async.parallel([
            function(callback) {
                Product.findOne({
                    _id: data._id
                }).populate("category","name").populate("designer","name").populate("suggestedProduct", "_id name rentalamount images").lean().exec(function(err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null)
                    } else {
                        newreturns.product = found;
                        callback(null, newreturns);
                    }
                });
            },
            function(callback) {
                ProductTime.find({
                    product: data._id
                }).exec(function(err, data1) {
                    if (err) {
                        console.log(err);
                        callback(err, null)
                    } else {
                        console.log("ddd", data1);
                        newreturns.producttime = data1;
                        callback(null, newreturns);
                    }
                });
            }

        ], function(err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, newreturns);
            }
        });
        // this.findOne({
        //     "_id": data._id
        // }, {
        //     password: 0
        // }).populate("suggestedProduct", "_id name rentalamount images").lean().exec(function(err, found) {
        //     if (err) {
        //         console.log(err);
        //         callback(err, null);
        //     } else if (found && Object.keys(found).length > 0) {
        //         callback(null, found);
        //     } else {
        //         callback(null, {});
        //     }
        // });
    },

    getProductByCat: function(data, callback) {
        var matchobj = {
            subcategory: {
                $in: data.subcategory
            },
            rentalamount: {
                $gte: data.pricefrom,
                $lt: data.priceto
            },
            size: {
                $elemMatch: {
                    name: data.size
                }
            },
            color: {
                $in: data.color
            }
        };
        if (!data.size || data.size == "") {
            delete matchobj.size;
        }
        if (!data.color || data.color == "") {
            delete matchobj.color;
        }
        var newreturns = {};
        newreturns.data = [];
        data.pagesize = parseInt(data.pagesize);
        data.pagenumber = parseInt(data.pagenumber);
        async.parallel([
            function(callback) {
                Product.find(matchobj).select('_id name rentalamount images subcategory').skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).exec(function(err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        newreturns.data = found;
                        callback(null, newreturns);
                    }
                });
            },
            function(callback) {
                Product.find(matchobj).count(function(err, count) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        console.log("Number of docs: ", count);
                        newreturns.totalpages = Math.ceil(count / data.pagesize);
                        callback(null, newreturns);
                    }

                });
            }
        ], function(err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, newreturns);
            }
        });
    },

    getProductByCatName: function(data, callback) {
        var newreturns = {};
        newreturns.data = [];
        data.pagesize = parseInt(data.pagesize);
        data.pagenumber = parseInt(data.pagenumber);
        async.parallel([
            function(callback) {
                Product.aggregate([{
                    $unwind: "$subcategory"
                }, {
                    $lookup: {
                        from: "subcategories",
                        localField: "subcategory",
                        foreignField: "_id",
                        as: "subcategory"
                    }
                }, {
                    $unwind: "$subcategory"
                }, {
                    $match: {
                        "subcategory.name": data.name
                    }
                }, {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }]).exec(function(err, found) {
                    // console.log(found[0].count);
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (found && found.length > 0) {
                        newreturns.totalpages = Math.ceil(found[0].count / data.pagesize);
                        callback(null, newreturns);
                    } else {
                        newreturns.totalpages = 0;
                        callback(null, newreturns);
                    }
                });
            },
            function(callback) {
                Product.aggregate([{
                    $unwind: "$subcategory"
                }, {
                    $lookup: {
                        from: "subcategories",
                        localField: "subcategory",
                        foreignField: "_id",
                        as: "subcategory"
                    }
                }, {
                    $unwind: "$subcategory"
                }, {
                    $match: {
                        "subcategory.name": data.name
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        subcategory: {
                            $addToSet: "$subcategory"
                        },
                        images: {
                            $addToSet: "$images"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        rentalamount: {
                            $addToSet: "$rentalamount"
                        }
                    }
                }, {
                    $unwind: "$name"
                }, {
                    $unwind: "$images"
                }, {
                    $unwind: "$subcategory"
                }, {
                    $unwind: "$rentalamount"
                }, {
                    $project: {
                        images: 1,
                        name: 1,
                        rentalamount: 1,
                        subcategory: 1
                    }
                }]).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).exec(function(err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        newreturns.data = found;
                        callback(null, newreturns);
                    }
                });
            }
        ], function(err, data3) {
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
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function(callback1) {
                Product.count({
                    name: {
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
                Product.find({
                    name: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    order: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("category", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).populate("subcategory", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).populate("size", "_id  name", null, {
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

    findSize: function(data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var skip = parseInt(data.pagesize * (data.pagenumber - 1));
        async.parallel([
                function(callback) {
                    Product.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$size"
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
                    Product.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$size"
                    }, {
                        $group: {
                            _id: "_id",
                            size: {
                                $push: "$size"
                            }
                        }
                    }, {
                        $project: {
                            _id: 0,
                            size: {
                                $slice: ["$size", skip, data.pagesize]
                            }
                        }
                    }]).exec(function(err, found) {
                        console.log(found);
                        if (found && found.length > 0) {
                            newreturns.data = found[0].size;
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

    deleteSize: function(data, callback) {
        Product.update({
            "size._id": data._id
        }, {
            $pull: {
                "size": {
                    "_id": objectid(data._id)
                }
            }
        }, function(err, updated) {
            console.log(updated);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, updated);
            }
        });

    },

    saveSize: function(data, callback) {
        var product = data.product;
        console.log(product);
        if (!data._id) {
            Product.update({
                _id: product
            }, {
                $push: {
                    size: data
                }
            }, function(err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, updated);
                }
            });
        } else {
            data._id = objectid(data._id);
            tobechanged = {};
            var attribute = "size.$.";
            _.forIn(data, function(value, key) {
                tobechanged[attribute + key] = value;
            });
            Product.update({
                "size._id": data._id
            }, {
                $set: tobechanged
            }, function(err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, updated);
                }
            });
        }
    },
    findOneSize: function(data, callback) {
        // aggregate query
        Product.aggregate([{
            $unwind: "$size"
        }, {
            $match: {
                "size._id": objectid(data._id)
            }
        }, {
            $project: {
                size: 1
            }
        }]).exec(function(err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (respo && respo.length > 0 && respo[0].size) {
                callback(null, respo[0].size);
            } else {
                callback({
                    message: "No data found"
                }, null);
            }
        });
    },
};

module.exports = _.assign(module.exports, models);
