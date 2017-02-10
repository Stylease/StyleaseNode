/**
 * Otp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var request = require("request");
var schema = new Schema({
    name: String,
    mobile: String,
    email: String,
    password: String,
    otp: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
var d = new Date();
d.setMinutes(d.getMinutes() - 10);
module.exports = mongoose.model("Otp", schema);
var model = {
    saveData: function (data, callback) {
        data.otp = (Math.random() + "").substring(2, 10);
        var otp = this(data);
        this.count({
            contact: data.contact
        }, function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (found == 0) {
                    otp.save(function (err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, data2);
                        }
                    });
                } else {
                    callback(null, {
                        message: "User already exist"
                    });
                }
            }
        });
    },
    checkOtp: function (data, callback) {
        Otp.findOne({
            mobile: data.mobile,
            otp: data.otp,
            timestamp: {
                $gte: d
            }
        }, function (err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (data2 !== null) {
                    console.log("data2", data2);
                    delete data2._id;
                    User.register(data2, function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(err, data3);
                        }
                    });

                } else {
                    callback(null, {
                        message: "OTP expired"
                    });
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, model);