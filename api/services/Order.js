var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectID = require('mongodb').ObjectID;
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

    rentalamount: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        default: 0
    },
    coupon: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    discountamount: {
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


    generateExcel: function (res) {
        Order.find({}).populate("user", "name").populate("cartproduct.product", "name fourdayrentalamount eightdayrentalamount").exec(function (err, data) {
            // console.log("ddd", data);
            var excelData = [];
            _.each(data, function (orderdata) {
                var obj = {};
                var sendobj = {};
                obj.OrderId = orderdata.orderid;
                obj.OrderStatus = orderdata.orderstatus;
                obj.User = orderdata.user.name;
                obj.PaymentMode = orderdata.paymentmode;
                obj.TransactionId = orderdata.transactionid;
                obj.Total = orderdata.total;
                obj.DeliveryCharge = orderdata.deliverycharge;
                obj.RefundableDeposit = orderdata.refundabledeposit;
                obj.ServiceTax = orderdata.servicetax;
                obj.DiscountAmount = orderdata.discountamount;
                obj.Discount = orderdata.discount;
                obj.Coupon = orderdata.coupon;
                obj.SubTotal = orderdata.subtotal;
                obj.Rentalamount = orderdata.Rentalamount;
                obj.FirstName = orderdata.firstname;
                obj.LastName = orderdata.lastname;
                obj.Mobile = orderdata.mobile;
                obj.Email = orderdata.email;
                obj.Date = orderdata.date;
                obj.BillingAddressFlat = orderdata.billingAddressFlat;
                obj.BillingAddressLandmark = orderdata.billingAddressLandmark;
                obj.BillingAddressStreet = orderdata.billingAddressStreet;
                obj.BillingAddressCity = orderdata.billingAddressCity;
                obj.BillingAddressPin = orderdata.billingAddressPin;
                obj.BillingAddressCountry = orderdata.billingAddressCountry;
                obj.ShippingAddressFlat = orderdata.shippingAddressFlat;
                obj.ShippingAddressLandmark = orderdata.shippingAddressLandmark;
                obj.ShippingAddressStreet = orderdata.shippingAddressStreet;
                obj.ShippingAddressCity = orderdata.shippingAddressCity;
                obj.ShippingAddressPin = orderdata.shippingAddressPin;
                obj.ShippingAddressState = orderdata.shippingAddressState;
                obj.ShippingAddressCountry = orderdata.shippingAddressCountry;
                _.each(orderdata.cartproduct, function (cartpro) {
                    // arrCartproduct.push(cartpro.product.name);
                    obj.ProductName = cartpro.product.name;
                    obj.Size = cartpro.size;
                    obj.DesignBy = cartpro.by;
                    if (cartpro.duration == 4) {
                        obj.Price = cartpro.product.fourdayrentalamount;
                    } else {
                        obj.Price = cartpro.product.eightdayrentalamount;
                    }
                    obj.Duration = cartpro.duration;
                    obj.RentalDate = cartpro.timeFrom;
                    obj.DeliveryTime = cartpro.deliveryTime;
                    obj.PickupTime = cartpro.pickupTime;
                    sendobj = _.cloneDeep(obj);
                    excelData.push(sendobj);
                });
                // excelData.push(obj);
            });
            Config.generateExcel("Order", excelData, res);

        });
    },

    saveData: function (data, callback) {
        //        delete data.password;
        var order = this(data);
        if (data._id) {
            this.findOneAndUpdate({
                _id: data._id
            }, data).exec(function (err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (updated) {
                    if (data.orderstatus === "Out for Delivery") {

                        var smsData = {};
                        smsData.mobile = data.mobile;
                        smsData.content = "Your TheStylease.Com Order No.: " + data.orderid + " has been dispatched for delivery at the designated location. Have a great event. Happy styling!";

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
                        emailData.email = data.email;
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.filename = "mailer.ejs";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "We’re as excited as you are. Your order is now out for delivery and will shortly be arriving at the selected location";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.subject = "Out for delivery - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
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
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.filename = "mailer.ejs";
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "We have received confirmation that your order has been delivered. For any comments or queries contact us on +91 97351 88624 or mail us at info@thestylease.com";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.subject = "Successfully delivered - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
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
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content1 = "Thank you for taking care of our outfit like it was one of your own. We have received the parcel. Your deposit amount of Rs." + data.refundabledeposit + " will be refunded within the next 7 working days. We will share the details shortly";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.subject = "Order picked up - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }



                    if (data.orderstatus === "Pickup reminder") {
                        Order.findOne({
                            _id: data._id
                        }).exec(function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                var smsData = {};
                                smsData.mobile = data.mobile;
                                smsData.content = "Hi! this is a gentle reminder that pick up for Order No.: " + data.orderid + " is scheduled for tomorrow.Please keep the order ready in the package provided to you our delivery person will come and pick it up. We hope you had a great event!";

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
                                emailData.email = data.email;
                                emailData.filename = "pickup.ejs";
                                emailData.fromname = 'orders@thestylease.com';
                                emailData.name = data.firstname + " " + data.lastname;
                                emailData.content3 = "http://thestylease.com/#/orders";
                                emailData.shippingAddressFlat = data.shippingAddressFlat;
                                emailData.shippingAddressStreet = data.shippingAddressStreet;
                                emailData.shippingAddressLandmark = data.shippingAddressLandmark;
                                emailData.shippingAddressCity = data.shippingAddressCity;
                                emailData.shippingAddressPin = data.shippingAddressPin;
                                emailData.shippingAddressState = data.shippingAddressState;
                                emailData.shippingAddressCountry = data.shippingAddressCountry;
                                emailData.content1 = "Thanks for taking our outfits and accessories out with you and creating some amazing memories. We are sure you shined like a star.This is a gentle reminder that our staff will be at the ";
                                emailData.content2 = "for pick-up tomorrow. Ensure that your garment and accessories are packed in the same garment bag you received it in and that it is ready at the time of pick-up. ";
                                emailData.content4 = "Order No. : " + data.orderid;
                                emailData.subject = "Pickup reminder - TheStylease";
                                // console.log("eee", emailData);
                                Config.email(emailData, function (err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        // callback(null, updated);
                                    }
                                });
                                // callback(null, found);
                            }
                        })



                    }
                    if (data.orderstatus === "Out for pick-up") {

                        var smsData = {};
                        smsData.mobile = data.mobile;
                        smsData.content = "Our delivery personnel are out to collect your TheStylease.Com Order No.: " + data.orderid + " Please keep it ready in the packaging provided. Thank you!";

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
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.content1 = "Our staff is out for pick-up of your order. They will be arriving shortly, do ensure you are ready with the parcel. You totally slayed this event, see you soon for the next one!";
                        emailData.content2 = "Order No. : " + data.orderid;
                        emailData.subject = "Out for pick-up! - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }

                    if (data.orderstatus === "Completed") {
                        var smsData = {};
                        smsData.mobile = data.mobile;

                        smsData.content = "Your deposit of Rs " + data.total + " against TheStylease.Com Order No.:  " + data.orderid + " has been credited to your account. Hope you had a great experience with us. Thank You!";

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
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.content1 = "Hope you’re having a good day! This is to notify you that we have returned your deposit for Rs. " + data.refundabledeposit + " against Order " + data.orderid;
                        emailData.content2 = "We look forward to helping you style again soon";
                        emailData.subject = "Deposit returned notification - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                            }
                        });
                    }
                    if (data.orderstatus === "Cancelled") {
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "mailer.ejs";
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.content1 = "This is to notify you that we have received your request to cancel the order. We will get in touch with you shortly. For any queries contact us on +91 97351 88624 or mail us at info@thestylease.com.";
                        emailData.content2 = "";
                        emailData.subject = "Transaction cancelled - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
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
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.content1 = "Now that all the parties are done and dusted, this is your update on the refund policy. As per our policy we will return the deposit refund against order number " + data.orderid + " , within the next 7 working days.";
                        emailData.content2 = " ";
                        emailData.subject = "Refund notification - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
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
            }).exec(function (err, found) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    if (_.isEmpty(found)) {
                        order.orderid = 1;
                    } else {
                        order.orderid = found.orderid + 1;
                    }
                    order.save(function (err, created) {
                        if (err) {
                            callback(err, null);
                        } else if (created) {
                            if (data.user != null) {
                                data._id = data.user;
                                User.saveData(data, function (err, data3) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null)
                                    } else {
                                        // console.log("user updated", data3);
                                        // callback(null, data3);
                                    }
                                });
                            }


                            // function callme(num) {
                            //     if (num === created.cartproduct.length) {
                            //         console.log("producttime completed");
                            //         // callback(null, "Done");
                            //     } else {
                            //         var create = created.toObject();
                            //         var mydata = {};
                            //         mydata = create.cartproduct[num];
                            //         delete mydata._id;
                            //         console.log("mydata", mydata._id);
                            //         //update product booking
                            //         Product.update({
                            //             _id: mydata.product
                            //         }, {
                            //             $inc: {
                            //                 booked: 1
                            //             }
                            //         }).exec(function (err, booked) {
                            //             if (err) {
                            //                 console.log(err);
                            //                 callback(err, null);
                            //             } else {
                            //                 // console.log("booked update");
                            //             }
                            //         });

                            //         ProductTime.saveData(mydata, function (err, data4) {
                            //             console.log("data save");
                            //             if (err) {
                            //                 console.log(err);
                            //                 callback(err, null);
                            //             } else {
                            //                 console.log("aaaaa");
                            //                 num++;
                            //                 callme(num);
                            //                 // console.log("save products to ProductTime");
                            //             }
                            //         });
                            //     }
                            // }

                            // if (created.cartproduct.length > 0) {
                            //     callme(0);
                            // }


                            // var emailData = {};
                            // var monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
                            //     "July", "Aug", "Sep", "Oct", "Nov", "Dec"
                            // ];
                            // var dd = new Date(data.cartproduct[0].timeFrom);
                            // var month = monthNames[dd.getMonth()];
                            // var year = dd.getFullYear();
                            // var day = dd.getDate();
                            // var timeFrom = month + " " + day + ", " + year;
                            // var ddt = new Date(data.cartproduct[0].timeTo);
                            // var monthd = monthNames[ddt.getMonth()];
                            // var yeard = ddt.getFullYear();
                            // var dayd = ddt.getDate();
                            // var timeTo = monthd + " " + dayd + ", " + yeard;

                            // var smsData = {};
                            // smsData.mobile = data.mobile;
                            // smsData.content = "Your TheStylease.Com Order No.: " + created.orderid + " has been successfully placed. It will be delivered to your address on " + timeFrom + ". Thank you. Happy styling!";

                            // Config.sendSMS(smsData, function (err, smsRespo) {
                            //     if (err) {
                            //         console.log(err);
                            //         callback(err, null);
                            //     } else {
                            //         console.log("sms sent");
                            //         // callback(null, smsRespo);
                            //     }
                            // });
                            // emailData.email = data.email;
                            // emailData.timeFrom = timeFrom;
                            // emailData.timeTo = timeTo;
                            // emailData.filename = "invoice.ejs";
                            // emailData.name = data.firstname + " " + data.lastname;
                            // emailData.cartproduct = data.cartproduct;
                            // emailData.billingAddressFlat = data.billingAddressFlat;
                            // emailData.billingAddressStreet = data.billingAddressStreet;
                            // emailData.billingAddressLandmark = data.billingAddressLandmark;
                            // emailData.billingAddressPin = data.billingAddressPin;
                            // emailData.billingAddressCity = data.billingAddressCity;
                            // emailData.billingAddressState = data.billingAddressState;
                            // emailData.billingAddressCountry = data.billingAddressCountry;
                            // emailData.mobile = data.mobile;
                            // emailData.shippingAddressFlat = data.shippingAddressFlat;
                            // emailData.shippingAddressStreet = data.shippingAddressStreet;
                            // emailData.shippingAddressLandmark = data.shippingAddressLandmark;
                            // emailData.shippingAddressPin = data.shippingAddressPin;
                            // emailData.shippingAddressCity = data.shippingAddressCity;
                            // emailData.shippingAddressState = data.shippingAddressState;
                            // emailData.shippingAddressCountry = data.shippingAddressCountry;
                            // emailData.total = created.total;
                            // emailData.subtotal = created.subtotal;
                            // emailData.servicetax = created.servicetax;
                            // emailData.refundabledeposit = created.refundabledeposit;
                            // emailData.content1 = "Your payment for Rs." + created.total + " has been successfully received on our end. Your outfit will be out for dispatch on your selected date.";
                            // emailData.orderno = created.orderid;
                            // emailData.subject = "Order confirmation - Stylease";
                            // // console.log("eee", emailData);
                            // Config.email(emailData, function (err, emailRespo) {
                            //     if (err) {
                            //         console.log(err);
                            //         callback(err, null);
                            //     } else {
                            //         callback(null, created);
                            //     }
                            // });
                            callback(null, created);
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
    test: function (data, callback) {
        var subcategoryArray = [];
        var objArray = [];
        if (data.designer && data.designer !== '') {
            var obj = {
                'product.designer': ObjectID(data.designer)
            };
            objArray.push(obj);
        }
        if (data.subcategory && data.subcategory !== '') {
            subcategoryArray.push(ObjectID(data.subcategory));
            console.log(subcategoryArray);
            var obj = {
                'product.subcategory': {
                    $in: subcategoryArray
                }
            };
            objArray.push(obj);
        }
        if (data.status && data.status !== '') {
            var obj = {
                orderstatus: {
                    $regex: data.status
                }
            };
            objArray.push(obj);
        }
        if (data.coupon && data.coupon !== '') {
            var obj = {
                coupon: {
                    $regex: data.coupon
                }
            };
            objArray.push(obj);
        }
        if (data.search && data.search !== '') {
            var obj = {
                firstname: {
                    $regex: data.search
                }
            };
            objArray.push(obj);
        }
        if (data.price && data.price !== '') {
            var pricearr = data.price.split('-');
            var obj = {
                total: {
                    $gte: parseInt(pricearr[0]),
                    $lte: parseInt(pricearr[1])
                }
            };
            objArray.push(obj);
        }
        if (data.coupon == '' && data.status == '' && data.subcategory == '' && data.designer == '' && data.search == '' && data.price == '') {
            var obj = {
                firstname: {
                    $regex: ''
                }
            };
            objArray.push(obj);
        }
        console.log("obj aray", objArray);
        Order.aggregate([{
                $unwind: "$cartproduct"
            }, {
                "$lookup": {
                    "from": "products",
                    "localField": "cartproduct.product",
                    "foreignField": "_id",
                    "as": "product"
                }
            }, {
                $match: {
                    $and: objArray
                }
            }

        ]).exec(function (err, response) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                console.log(" res ");
                console.log(response);
                callback(null, response);
            }
        });
    },
    getAllDetails: function (data, callback) {
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
        }).lean().exec(function (err, found) {
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
    getLimited: function (data, callback) {
        var obj = {};
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        // var checkfor = new RegExp(data.search, "i");
        //     if (data.coupon && data.coupon !=='') {
        //     var obj = {
        //         coupon: data.coupon
        //     }
        // } 
        //     if (data.status && data.status !=='') {
        //     var obj = {
        //         orderstatus: data.status
        //     }
        // } 
        console.log(obj, data);
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function (callback1) {
                Order.count(obj).exec(function (err, number) {
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

                Order.find(obj, {}).sort({
                    name: 1
                }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("user", "_id  name", null, {
                    sort: {
                        "name": 1
                    }
                }).populate("cartproduct.product", "_id  name fourdayrentalamount designer eightdayrentalamount", null, {
                    "cartproduct": {
                        $elemMatch: {
                            "product.designer": "5800a8367b8b5e154ba44d7c"
                        }
                    }
                }).sort({
                    _id: -1
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
    // getLimited: function (data, callback) {
    //     data.pagenumber = parseInt(data.pagenumber);
    //     data.pagesize = parseInt(data.pagesize);
    //     // var checkfor = new RegExp(data.search, "i");
    //     if (data.status === "") {
    //         var search = {
    //             coupon: data.coupon
    //         }
    //     } 
    //     else {
    //         var search = {
    //             orderstatus: data.status,
    //             coupon: data.coupon
    //         }
    //     }
    //     if (search.coupon === "" || search.coupon == undefined) {
    //         delete search.coupon;
    //     }
    //     var newreturns = {};
    //     newreturns.data = [];
    //     async.parallel([
    //         function (callback1) {
    //             Order.count(search).exec(function (err, number) {
    //                 if (err) {
    //                     console.log(err);
    //                     callback1(err, null);
    //                 } else if (number) {
    //                     newreturns.totalpages = Math.ceil(number / data.pagesize);
    //                     callback1(null, newreturns);
    //                 } else {
    //                     newreturns.totalpages = 0;
    //                     callback1(null, newreturns);
    //                 }
    //             });
    //         },
    //         function (callback1) {
    //             Order.find(search, {}).sort({
    //                 name: 1
    //             }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("user", "_id  name", null, {
    //                 sort: {
    //                     "name": 1
    //                 }
    //             }).populate("cartproduct.product", "_id  name fourdayrentalamount eightdayrentalamount", null, {
    //                 sort: {
    //                     "name": 1
    //                 }
    //             }).sort({
    //                 _id: -1
    //             }).lean().exec(function (err, data2) {
    //                 if (err) {
    //                     console.log(err);
    //                     callback1(err, null);
    //                 } else {
    //                     if (data2 && data2.length > 0) {
    //                         newreturns.data = data2;
    //                         newreturns.pagenumber = data.pagenumber;
    //                         callback1(null, newreturns);
    //                     } else {
    //                         callback1({
    //                             message: "No data found"
    //                         }, null);
    //                     }
    //                 }
    //             });
    //         }
    //     ], function (err, respo) {
    //         if (err) {
    //             console.log(err);
    //             callback(err, null);
    //         } else {
    //             callback(null, newreturns);
    //         }
    //     });
    // },
    getLimitedByUser: function (data, callback) {
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var checkfor = new RegExp(data.search, "i");
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function (callback1) {
                Order.count({
                    user: data.user
                        // email: {
                        //     "$regex": checkfor
                        // }
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
    getLimitedWithFilter: function (data, callback) {
        var subcategoryArray = [];
        var objArray = [];
        if (data.designer && data.designer !== '') {
            var obj = {
                'product.designer': ObjectID(data.designer)
            };
            objArray.push(obj);
        }
        if (data.subcategory && data.subcategory !== '') {
            subcategoryArray.push(ObjectID(data.subcategory));
            console.log(subcategoryArray);
            var obj = {
                'product.subcategory': {
                    $in: subcategoryArray
                }
            };
            objArray.push(obj);
        }
        if (data.status && data.status !== '') {
            var obj = {
                orderstatus: {
                    $regex: data.status
                }
            };
            objArray.push(obj);
        }
        if (data.coupon && data.coupon !== '') {
            var obj = {
                coupon: {
                    $regex: data.coupon
                }
            };
            objArray.push(obj);
        }
        if (data.search && data.search !== '') {

            var obj = {
                $or: [{
                    firstname: {
                        $regex: data.search
                    }
                }, {
                    lastname: {
                        $regex: data.search
                    }
                }, {
                    mobile: {
                        $regex: data.search
                    }
                }]
            };
            objArray.push(obj);
        }
        if (data.price && data.price !== '') {
            var pricearr = data.price.split('-');
            var obj = {
                total: {
                    $gte: parseInt(pricearr[0]),
                    $lte: parseInt(pricearr[1])
                }
            };
            objArray.push(obj);
        }
        if (data.coupon == '' && data.status == '' && data.subcategory == '' && data.designer == '' && data.search == '' && data.price == '') {
            var obj = {
                firstname: {
                    $regex: ''
                }
            };
            objArray.push(obj);
        }
        var newreturns = {};
        newreturns.data = [];
        async.parallel([
            function (callback1) {
                Order.aggregate([{
                        $unwind: "$cartproduct"
                    }, {
                        "$lookup": {
                            "from": "products",
                            "localField": "cartproduct.product",
                            "foreignField": "_id",
                            "as": "product"
                        }
                    }, {
                        $match: {
                            $and: objArray
                        }
                    }, {
                        $group: {
                            _id: null,
                            count: {
                                $sum: 1
                            }
                        }
                    }

                ]).exec(function (err, number) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else if (number) {
                        console.log(" number ");
                        console.log(number);
                        console.log(number[0].count);
                        if (_.isEmpty(number[0].count)) {
                            newreturns.totalpages = 0;
                        } else {
                            newreturns.totalpages = Math.ceil(number[0].count / data.pagesize);
                        }

                        callback1(null, newreturns);
                    } else {
                        newreturns.totalpages = 0;
                        callback1(null, newreturns);
                    }
                });
            },
            function (callback1) {
                Order.aggregate([{
                        $unwind: "$cartproduct"
                    }, {
                        "$lookup": {
                            "from": "products",
                            "localField": "cartproduct.product",
                            "foreignField": "_id",
                            "as": "product"
                        }
                    }, {
                        $match: {
                            $and: objArray
                        }
                    }

                ]).exec(function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback1(err, null);
                    } else {
                        if (data2 && data2.length > 0) {
                            console.log(" ##### ");
                            console.log(data2);
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
    getOne: function (data, callback) {
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
        }).lean().exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                if (found.products && found.products.length > 0) {
                    _.each(found.products, function (n) {
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


    getOrderByUser: function (data, callback) {
        Order.find({
            user: data.user
        }).populate("cartproduct.product", "name rentalamount images").sort({
            _id: -1
        }).exec(function (err, data2) {
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

    getOrderById: function (data, callback) {
        Order.findOne({
            orderid: data.orderid
        }).select("orderid total transactionid servicetax subtotal refundabledeposit").exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, found);
            }
        })
    },

    checkoutCheck: function (data, callback) {
        Order.find({
            orderid: data.orderid
        }).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, found);
            }
        })
    },

    getPickupreminder: function (data, callback) {
        var nextday = new Date();
        nextday.setDate(nextday.getDate() + 1);
        var currdate = new Date();
        nextday.setHours(18, 0, 0, 0);
        currdate.setHours(18, 0, 0, 0);
        console.log("ccc", currdate, nextday);

        Order.find({
            // date: {
            //     $gte: currdate,
            //     $lt: nextday
            // }
            cartproduct: {
                $elemMatch: {
                    timeTo: {
                        $gte: currdate,
                        $lt: nextday
                    }
                }
            }
        }).exec(function (err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // callback(null, respo);
                async.each(respo, function (data, callback1) {
                    if (data.email) {
                        console.log("bbb", data.email);
                        var smsData = {};
                        smsData.mobile = data.mobile;
                        smsData.content = "Hi! this is a gentle reminder that pick up for Order No.: " + data.orderid + " is scheduled for tomorrow.Please keep the order ready in the package provided to you our delivery person will come and pick it up. We hope you had a great event!";

                        Config.sendSMS(smsData, function (err, smsRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                console.log("sms sent", smsRespo);
                                // callback(null, smsRespo);
                            }
                        });
                        var emailData = {};
                        emailData.email = data.email;
                        emailData.filename = "pickup.ejs";
                        emailData.fromname = 'orders@thestylease.com';
                        emailData.name = data.firstname + " " + data.lastname;
                        emailData.content3 = "http://thestylease.com/#/orders";
                        emailData.shippingAddressFlat = data.shippingAddressFlat;
                        emailData.shippingAddressStreet = data.shippingAddressStreet;
                        emailData.shippingAddressLandmark = data.shippingAddressLandmark;
                        emailData.shippingAddressCity = data.shippingAddressCity;
                        emailData.shippingAddressPin = data.shippingAddressPin;
                        emailData.shippingAddressState = data.shippingAddressState;
                        emailData.shippingAddressCountry = data.shippingAddressCountry;
                        emailData.content1 = "Thanks for taking our outfits and accessories out with you and creating some amazing memories. We are sure you shined like a star.This is a gentle reminder that our staff will be at the ";
                        emailData.content2 = "for pick-up tomorrow. Ensure that your garment and accessories are packed in the same garment bag you received it in and that it is ready at the time of pick-up. ";
                        emailData.content4 = "Order No. : " + data.orderid;
                        emailData.subject = "Pickup reminder - TheStylease";
                        // console.log("eee", emailData);
                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                // callback(null, updated);
                                callback1(null, data.email);
                            }
                        });

                    } else {
                        callback1(null, "Done");
                    }
                }, function (err) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        callback(null, "Done");
                    }
                });
            }
        });
    }


};

module.exports = _.assign(module.exports, models);