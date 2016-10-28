var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: ""
    },
    status: Boolean,
    discount: {
        type: Number,
        default: 0
    },
    minamt: {
        type: Number,
        default: 0
    },
    maxamt: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Coupon', schema);

var models = {
    sort: function (data, callback) {
        function callSave(num) {
            Coupon.saveData({
                _id: data[num],
                order: num + 1
            }, function (err, respo) {
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
    saveData: function (data, callback) {
        //        delete data.password;
        var coupon = this(data);
        if (data._id) {
            this.findOneAndUpdate({
                _id: data._id
            }, {
                $set: data
            }).exec(function (err, updated) {
                if (err) {
                    callback(err, null);
                } else if (updated) {
                    callback(null, updated);
                } else {
                    callback(null, {});
                }
            });
        } else {
            coupon.save(function (err, created) {
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
    deleteData: function (data, callback) {
        this.findOneAndRemove({
            _id: data._id
        }, function (err, deleted) {
            if (err) {
                callback(err, null);
            } else if (deleted) {
                callback(null, deleted);
            } else {
                callback(null, {});
            }
        });
    },
    getAll: function (data, callback) {
        this.find({}, {
            password: 0
        }).exec(function (err, found) {
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
    getOne: function (data, callback) {
        this.findOne({
            "_id": data._id
        }, {
            password: 0
        }).exec(function (err, found) {
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

    checkCoupon: function (data, callback) {
        this.findOne({
            status: true,
            name: data.name,
            minamt: {
                $lte: data.amt
            }
        }).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                var founddata = {};
                console.log("aaa", found);
                if (found) {
                    founddata.coupon = found.name;
                    founddata.discount = found.discount;
                    founddata.discountamount = (data.amt * found.discount) / 100;

                    if (founddata.discountamount >= found.maxamt) {
                        founddata.discountamount = found.maxamt;
                        callback(null, founddata);
                    } else {
                        callback(null, founddata);
                    }
                    //   callback(null, founddata);

                } else {
                    callback({
                        message: "Please enter valid coupon"
                    }, null);

                }
            }
        });
    },
    getLimited: function (data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function (callback1) {
                Coupon.count({
                    name: {
                        "$regex": checkfor
                    }
                }).exec(function (err, number) {
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
            function (callback1) {
                Coupon.find({
                    name: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    order: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).lean().exec(function (err, data2) {
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
        ], function (err, respo) {
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