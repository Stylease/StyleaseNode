var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
     designerType: {
        type: Schema.Types.ObjectId,
        ref: 'DesignerType',
        index: true
    },
    order: {
        type: Number,
        default: ""
    },
    status: Boolean,
});

module.exports = mongoose.model('Designer', schema);

var models = {
    sort: function (data, callback) {
        function callSave(num) {
            Designer.saveData({
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
        var size = this(data);
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
            size.save(function (err, created) {
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
        }).sort({
            _id: -1
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


    getAllAlphabetically: function (reqBody, callback) {

        var resObj = {};

        var trimText = reqBody.searchText;
        async.parallel([
            //Function to search event name
            function (callback) {
                 resObj.firstObj = [];
                var search = new RegExp('^' + trimText[0]);
                Designer.find({
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                }).sort({
                    _id: -1
                }).exec(function (err, designerNameFound) {
                    if (err) {
                        console.log("Designer >>> searchDesigner >>> async.parallel >>> err", err);
                        callback(err, []);
                    } else {
                        resObj.firstObj=designerNameFound;
                        callback(null, resObj);
                    }
                })
            },
            //Function to search venue name
            function (callback) {
                resObj.secondObj = [];
                var search = new RegExp('^' + trimText[1]);
                Designer.find({
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                }).sort({
                    name: 1
                }).exec(function (err, designerNameFound) {
                    if (err) {
                        console.log("Designer >>> searchDesigner >>> async.parallel >>> err", err);
                        callback(err, []);
                    } else {
                        resObj.secondObj=designerNameFound;
                        callback(null, resObj);
                    }
                })
            },
            function (callback) {
                 resObj.thirdObj = [];
                var search = new RegExp('^' + trimText[2]);
                Designer.find({
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                }).sort({
                    name: 1
                }).exec(function (err, designerNameFound) {
                    if (err) {
                        console.log("Events >>> searchEvent >>> async.parallel  >>> err", err);
                        callback(err, []);
                    } else {
                        resObj.thirdObj=designerNameFound;
                        callback(null, resObj);
                    }
                })
            }
        ], function (error, data) {
            if (error) {
                console.log("designer >>> searchdesigner>>> async.parallel >>> final callback  >>> error", error);
                callback(error, null);
            } else {
                callback(null, resObj);
            }
        }) //End of async.parallel
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
    generateExcel: function (res) {
        Designer.find().exec(function (err, data) {
            var excelData = [];
            _.each(data, function (n) {
                var obj = {};
                obj.name = n.name;
                excelData.push(obj);
            });
            Config.generateExcel("Designer", excelData, res);
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
                Designer.count({
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
                Designer.find({
                    name: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    _id: -1
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