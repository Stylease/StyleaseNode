var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Contact', schema);

var models = {
    saveData: function (data, callback) {
        //        delete data.password;
        var contact = this(data);
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
            contact.save(function (err, created) {
                if (err) {
                    callback(err, null);
                } else if (created) {
                    var emailData = {};
                    emailData.name = data.name;
                    emailData.email = 'vinodwohlig@gmail.com';
                    emailData.useremail = data.email;
                    emailData.mobile = data.mobile;
                    emailData.message = data.message;
                    emailData.filename = "contact.ejs";
                    emailData.subject = "Contact Form Submission - Stylease";
                    // console.log("eee", emailData);
                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            console.log("emailRespo", emailRespo);
                            callback(null, created);
                        }
                    });
                    // callback(null, created);
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
    getLimited: function (data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagecontact = parseInt(data.pagecontact);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function (callback1) {
                Contact.count({
                    email: {
                        "$regex": checkfor
                    }
                }).exec(function (err, number) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else if (number) {
                        newreturns.totalpages = Math.ceil(number / data.pagecontact);
                        callback1(null, newreturns);
                    } else {
                        newreturns.totalpages = 0;
                        callback1(null, newreturns);
                    }
                });
            },
            function (callback1) {
                Contact.find({
                    email: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    _id: -1
                }).skip((data.pagenumber - 1) * data.pagecontact).limit(data.pagecontact).lean().exec(function (err, data2) {
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