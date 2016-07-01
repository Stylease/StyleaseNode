var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory',
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
    notes: {
        type: String,
        default: ""
    },
    quantity: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        default: ""
    },
    size: {
      type: Schema.Types.ObjectId,
      ref: 'Size',
      index: true
     },
    rentalamount: {
        type: String,
        default: ""
    },
    securitydeposit: {
        type: String,
        default: ""
    }

});

module.exports = mongoose.model('Product', schema);

var models = {
    saveData: function(data, callback) {
        //delete data.password;
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
        }).populate("category","_id  name", null, { sort: { "name": 1 } }).populate("subcategory","_id  name", null, { sort: { "name": 1 } }).populate("size","_id  name", null, { sort: { "name": 1 } }).lean().exec(function(err, found) {
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
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("category","_id  name", null, { sort: { "name": 1 } }).populate("subcategory","_id  name", null, { sort: { "name": 1 } }).populate("size","_id  name", null, { sort: { "name": 1 } }).lean().exec(function(err, data2) {
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
