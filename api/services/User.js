var mongoose = require('mongoose');
var md5 = require('md5');
var objectid = require("mongodb").ObjectId;
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        default: ""
    },
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    email: String,
    password: {
        type: String
    },
    forgotpassword: {
        type: String,
        default: ""
    },
    forgotpassworddate: Date,
    mobile: {
        type: String,
        default: ""
    },
    facebook: String,
    google: String,
    oauthLogin: {
        type: [{
            socialProvider: String,
            socialId: String,
            modificationTime: Date
        }],

        index: true
    },
    accesslevel: String,
    status: Boolean,
    image: String,
    timestamp: Date,
    // notification: {
    //   type: [],
    //   index:true
    // },
    billingAddress: [{
        billingTitle: {
            type: String,
            default: ""
        },
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
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    shippingAddress: [{
        shippingTitle: {
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
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    beneficiaryName: {
        type: String,
        default: ""
    },
    accountNumber: {
        type: String,
        default: ""
    },
    bankName: {
        type: String,
        default: ""
    },
    IFSC: {
        type: String,
        default: ""
    },
    wishlist: {
        type: [{
            timestamp: Date,
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                index: true
            }
        }],
        index: true
    },
    otp: String,
    otptimestamp: Date,
    otpstatus: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('User', schema);

var models = {
    sort: function (data, callback) {
        function callSave(num) {
            User.saveData({
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
    register: function (data, callback) {
        if (data.password && data.password !== "") {
            data.password = md5(data.password);
        }
        data.otp = (Math.random() + "").substring(2, 6);
        data.otptimestamp = Date.now();
        var user = this(data);
        user.email = data.email;
        User.count({
            // "email": user.email
            mobile: data.mobile
        }).exec(function (err, data2) {
            if (err) {
                callback(err, data);
            } else {
                if (data2 === 0) {
                    user.save(function (err, data3) {
                        data3.password = '';
                        if (err) {
                            callback(err, null);
                        } else {
                            var smsData = {};
                            smsData.mobile = data.mobile;
                            smsData.content = data.otp + " is your TheStylease.com verification code.";
                            Config.sendSMS(smsData, function (err, smsRespo) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    console.log(smsRespo, "sms sent");
                                    // callback(null, smsRespo);
                                    callback(null, data3);
                                }
                            });

                        }
                    });
                } else {
                    User.findOne({
                        mobile: data.mobile,
                        otpstatus: false
                    }).exec(function (err, found) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            if (found) {

                                User.update({
                                    _id: found._id
                                }, {
                                    $set: {
                                        otptimestamp: data.otptimestamp,
                                        otp: data.otp
                                    }
                                }, function (err, data3) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        var smsData = {};
                                        smsData.mobile = data.mobile;
                                        smsData.content = data.otp + " is your TheStylease.com verification code.";
                                        Config.sendSMS(smsData, function (err, smsRespo) {
                                            if (err) {
                                                console.log(err);
                                                callback(err, null);
                                            } else {
                                                console.log(smsRespo, "sms sent");
                                                // callback(null, smsRespo);
                                                callback(null, found);
                                            }
                                        });
                                    }
                                });



                            } else {
                                callback("User already Exists", false);
                            }
                        }
                    });

                }
            }
        });
    },

    resendOtp: function (data, callback) {
        data.otp = (Math.random() + "").substring(2, 6);
        data.otptimestamp = Date.now();
        User.findOne({
            mobile: data.mobile
        }).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (found) {

                    User.update({
                        _id: found._id
                    }, {
                        $set: {
                            otptimestamp: data.otptimestamp,
                            otp: data.otp
                        }
                    }, function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            var smsData = {};
                            smsData.mobile = data.mobile;
                            smsData.content = data.otp + " is your TheStylease.com verification code.";
                            Config.sendSMS(smsData, function (err, smsRespo) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    // console.log(smsRespo, "sms sent");
                                    // callback(null, smsRespo);
                                    callback(null, found);
                                }
                            });
                        }
                    });



                } else {
                    callback("User not found", false);
                }
            }
        });

    },

    saveData: function (data, callback) {
        //        delete data.password;
        var user = this(data);
        if (data._id) {
            data.expiry = new Date(data.expiry);
            // data.password = md5(data.password);
            data.userid = new Date();
            delete data.password;
            this.findOneAndUpdate({
                _id: data._id
            }, {
                $set: data
            }).exec(function (err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (updated) {
                    callback(null, data);
                } else {
                    callback(null, {});
                }
            });
        } else {
            user.timestamp = new Date();
            data.expiry = new Date();
            if (user.password) {
                user.password = md5(user.password);
            }
            user.save(function (err, created) {
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
        }).populate("cart.product", "_id  name", null, {
            sort: {}
        }).lean().exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                if (found.cart && found.cart.length > 0) {
                    _.each(found.cart, function (n) {
                        if (n.product && n.product.name) {
                            n.productname = n.product.name;
                            delete n.product;
                        }
                    });
                }
                callback(null, found);
            } else {
                callback(null, {});
            }
        });
    },
    changePassword: function (data, callback) {
        User.findOne({
            _id: data.user,
            // forgotpassword: md5(data.oldPassword)
            $or: [{
                password: md5(data.oldPassword)
            }, {
                forgotpassword: md5(data.oldPassword)
            }]
        }).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (found) {
                    User.update({
                        _id: data.user
                    }, {
                        password: md5(data.newPassword)
                    }).exec(function (err, data3) {
                        console.log("data3", data3);
                        if (err) {
                            console.log(err);
                            callback(err, null)
                        } else {
                            callback(null, data3);
                        }

                    });
                } else {
                    callback({
                        message: "No data found"
                    }, null);
                }
            }
        });
    },
    forgotPassword: function (data, callback) {
        User.findOne({
            email: data.email
        }, {
            password: 0,
            forgotpassword: 0
        }, function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (found) {
                    if (!found.oauthLogin || (found.oauthLogin && found.oauthLogin.length <= 0)) {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < 8; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        console.log("text", text);
                        var updateddate = new Date();
                        var encrypttext = md5(text);
                        User.findOneAndUpdate({
                            _id: found._id
                        }, {
                            forgotpassword: encrypttext,
                            forgotpassworddate: updateddate
                        }, function (err, data2) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                var emailData = {};
                                emailData.email = data.email;
                                console.log('data.email', data.email);
                                emailData.content = text;
                                emailData.filename = "forgotpassword.ejs";
                                emailData.fromname = 'contact@thestylease.com';
                                emailData.subject = "Forgot Password";
                                Config.email(emailData, function (err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        console.log(emailRespo);
                                        callback(null, {
                                            comment: "Mail Sent"
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        callback(null, {
                            comment: "User logged in through social login"
                        });
                    }
                } else {
                    callback({
                        comment: "User not found"
                    }, null);
                }
            }
        });
    },
    getCart: function (data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var skip = parseInt(data.pagesize * (data.pagenumber - 1));
        async.parallel([
                function (callback) {
                    User.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$cart"
                    }, {
                        $match: {
                            "cart.size": {
                                '$regex': check
                            }
                        }
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
                    }]).exec(function (err, result) {
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
                function (callback) {
                    User.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$cart"
                    }, {
                        $match: {
                            "cart.size": {
                                $regex: check
                            }
                        }
                    }, {
                        $group: {
                            _id: "_id",
                            cart: {
                                $push: "$cart"
                            }
                        }
                    }, {
                        $project: {
                            _id: 0,
                            cart: {
                                $slice: ["$cart", skip, data.pagesize]
                            }
                        }
                    }]).exec(function (err, found) {
                        console.log(found);
                        if (found && found.length > 0) {
                            newreturns.data = found[0].cart;
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
            function (err, data4) {
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
    // login: function(data, callback) {
    //     data.password = md5(data.password);
    //     User.findOne({
    //         email: data.email,
    //         password: data.password
    //     }, function(err, data2) {
    //         if (err) {
    //             console.log(err);
    //             callback(er, null);
    //         } else {
    //             var d = new Date();
    //             d.setMinutes(d.getMinutes() - 180);
    //             if (_.isEmpty(data2)) {
    //                 User.findOne({
    //                     email: data.email,
    //                     forgotpassword: data.password,
    //                     forgotpassworddate: {
    //                         $gte: d
    //                     }
    //                 }, function(err, data4) {
    //                     if (err) {
    //                         console.log(err);
    //                         callback(err, null);
    //                     } else {
    //                         if (_.isEmpty(data4)) {
    //                             callback(null, {
    //                                 message: "User Not Found"
    //                             });
    //                         } else {
    //                             User.findOneAndUpdate({
    //                                 _id: data4._id
    //                             }, {
    //                                 password: data.password,
    //                                 forgotpassword: ""
    //                             }, function(err, data5) {
    //                                 if (err) {
    //                                     console.log(err);
    //                                     callback(err, null);
    //                                 } else {
    //                                     data5.password = "";
    //                                     data5.forgotpassword = "";
    //                                     callback(null, data5);
    //                                 }
    //                             });
    //                         }
    //                     }
    //                 });
    //             } else {
    //                 User.findOneAndUpdate({
    //                     _id: data2._id
    //                 }, {
    //                     forgotpassword: ""
    //                 }, function(err, data3) {
    //                     if (err) {
    //                         console.log(err);
    //                         callback(err, null);
    //                     } else {
    //                         data3.password = "";
    //                         data3.forgotpassword = "";
    //                         callback(null, data3);
    //                     }
    //                 });
    //             }
    //         }
    //     });
    // },

    login: function (data, callback) {
        data.password = md5(data.password);
        var d = new Date();
        d.setMinutes(d.getMinutes() - 180);
        User.findOne({
            email: data.email,
            password: data.password,
            otpstatus: true
        }).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // console.log(found);
                if (found) {
                    callback(null, found);
                } else {
                    // callback(null,{message:"no data found"});
                    User.findOne({
                        email: data.email,
                        forgotpassword: data.password,
                        forgotpassworddate: {
                            $gte: d
                        }
                    }).exec(function (err, forgotdata) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            if (forgotdata) {
                                callback(null, forgotdata);
                            } else {
                                callback(null, {
                                    message: "Invalid Username Or Password"
                                });
                            }
                        }
                    });
                }
            }
        });
    },

    checkOtp: function (data, callback) {
        var d = new Date();
        d.setMinutes(d.getMinutes() - 10);
        User.findOne({
            mobile: data.mobile,
            otp: data.otp,
            otptimestamp: {
                $gte: d
            }
        }, function (err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (data2 !== null) {
                    callback(null, data2);
                    User.update({
                        _id: data2._id
                    }, {
                        $set: {
                            otpstatus: true
                        }
                    }, function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            var smsData = {};
                            smsData.mobile = data2.mobile;
                            smsData.content = "Welcome to TheStylease.com! Rent from a wide range of exclusive designer wear and accessories. Happy styling!";

                            Config.sendSMS(smsData, function (err, smsRespo) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    // console.log("sms sent");
                                    // callback(null, smsRespo);
                                }
                            });
                            var emailData = {};
                            emailData.email = data2.email;
                            emailData.filename = "mailer.ejs";
                            emailData.name = data2.name;
                            emailData.fromname = "contact@thestylease.com";
                            emailData.content1 = "Congratulations on successfully signing up. We’re glad we can be your fashion brand on speed dial.";
                            emailData.content2 = " Enjoy the world of couture and embrace the latest fashions at your next event.";
                            emailData.content3 = "http://thestylease.com/#/home";
                            emailData.subject = "Sign Up Successful";
                            console.log("eee", emailData);
                            Config.email(emailData, function (err, emailRespo) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    // callback(null, data3);
                                }
                            });
                            // callback(null, data3);
                        }
                    });
                } else {
                    callback(null, {
                        message: "Invalid OTP"
                    });
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
                User.count({
                    email: {
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
                User.find({
                    email: {
                        "$regex": checkfor
                    }
                }, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("cart.product", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).lean().exec(function (err, data2) {
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