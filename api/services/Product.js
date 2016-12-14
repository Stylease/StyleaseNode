var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var requrl = "http://localhost:81/";
var FileReader = require('filereader');
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
        image: String,
        order: Number
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
    booked: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    size: [{
        type: Schema.Types.ObjectId,
        ref: 'Size',
        index: true
    }],
    fourdayrentalamount: {
        type: Number,
        default: 0
    },
    eightdayrentalamount: {
        type: Number,
        default: 0
    },
    fourdaysecuritydeposit: {
        type: Number,
        default: 0
    },
    eightdaysecuritydeposit: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    status: Boolean
        // size: [{
        //     name: {
        //         type: String,
        //         default: ""
        //     },
        //     chest: {
        //         type: String,
        //         default: ""
        //     },
        //     waist: {
        //         type: String,
        //         default: ""
        //     },
        //     hips: {
        //         type: String,
        //         default: ""
        //     },
        //     length: {
        //         type: String,
        //         default: ""
        //     }
        // }]

});

module.exports = mongoose.model('Product', schema);

var models = {
    sort: function (data, callback) {
        function callSave(num) {
            Product.saveData({
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


    generateExcel: function (res) {
        Product.find().populate("category", "name").populate("subcategory", "name").populate("designer", "name")
            .populate("suggestedProduct", "name").populate("color", "name").populate("size", "name").exec(function (err, data) {
                var excelData = [];
                _.each(data, function (n) {
                    var obj = {};
                    var arrCategory = [];
                    _.each(n.category, function (m) {
                        arrCategory.push(m.name);
                    });
                    var arrSubCategory = [];
                    _.each(n.subcategory, function (m) {
                        arrSubCategory.push(m.name);
                    });
                    var arrSuggested = [];
                    var suggObj;
                    if (n.suggestedProduct) {
                        _.each(n.suggestedProduct, function (m) {
                            arrSuggested.push(m.name);
                        });
                    }
                    var arrColor = [];
                    _.each(n.color, function (m) {
                        arrColor.push(m.name); //
                    });

                    var arrSize = [];
                    _.each(n.size, function (m) {
                        arrSize.push(m.name);

                    });
                    var arrImage = [];
                    _.each(n.images, function (m) {
                        arrImage.push(m.image);
                    });

                    obj.name = n.name;
                    obj.sku = n.sku;
                    // obj.subcategory = n.subcategory;
                    obj.category = arrCategory.toString();
                    obj.subcategory = arrSubCategory.toString();
                    if (n.designer) {
                        obj.designer = n.designer.name;

                    }
                    obj.color = arrColor.toString();
                    obj.size = arrSize.toString();
                    obj.details = n.details;
                    obj.care = n.care;
                    obj.notes = n.notes;
                    obj.additionalnotes = n.additionalnotes;
                    // obj.quantity = n.quantity;
                    // obj.booked = n.booked;
                    obj.price = n.price;
                    obj.fourdayrentalamount = n.fourdayrentalamount;
                    obj.eightdayrentalamount = n.eightdayrentalamount;
                    obj.fourdaysecuritydeposit = n.fourdaysecuritydeposit;
                    obj.eightdaysecuritydeposit = n.eightdaysecuritydeposit;
                    obj.order = n.order;
                    obj.suggestedProduct = arrSuggested.toString();
                    obj.images = "";
                    // obj.images = arrImage.toString();
                    excelData.push(obj);
                });
                Config.generateExcel("Product", excelData, res);
            });
    },
    import: function (data, callback) {
        var Model = this;
        var retVal = [];
        async.eachSeries(data, function (n, callback) {
//             Product.findOne({
//                 sku: n.sku
//             }).exec(function (err, found) {
//                 if (err) {
//                     callback(err);
//                 } else {
                    
//                     if (found) {

//                                 console.log("product exists");
//                         // callback({
//                         //     message: "Product Already Exists"
//                         // }, null);
//                     } else {
               
// console.log("found", found);

                         var strsubcat = n.subcategory;
                          if (!_.isEmpty(strsubcat)) {
                          var subcatarray = strsubcat.split(',');
                        }
                        
                        var strcat = n.category;
                        if (!_.isEmpty(strcat)) {
                            var catarray = strcat.split(',');
                        }

                        var strcolor = n.color;
                        if (!_.isEmpty(strcolor)) {
                            var colorarray = strcolor.split(',');
                        }

                        var strsize = n.size;
                        if (!_.isEmpty(strsize)) {
                            var sizearray = strsize.split(',');
                        }

                        // var strsuggested = n.suggestedProduct;
                        // if (!_.isEmpty(strsuggested)) {
                        //     var suggestedarray = strsuggested.split(',');
                        // }
                        n.suggestedProduct = [];
                        var strimages = n.images;
                        if (!_.isEmpty(strimages)) {
                            var stimg = strimages.split(',');
                        }
                        async.parallel([function (callback1) {
                                Subcategory.find({
                                    name: {
                                        $in: subcatarray
                                    }
                                }).exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        subcatarr = [];
                                        _.each(found, function (subcat) {
                                            subcatarr.push(subcat._id.toString());
                                        });
                                        // n.subcategory = [];
                                        n.subcategory = subcatarr;
                                        callback1(null, "done");
                                    }
                                });
                            }, function (callback1) {
                                Category.find({
                                    name: {
                                        $in: catarray
                                    }
                                }).exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        catarr = [];
                                        _.each(found, function (cat) {
                                            catarr.push(cat._id.toString());
                                        });
                                        // n.category = [];
                                        n.category = catarr;
                                        callback1(null, "done");
                                    }
                                });
                            },
                            function (callback1) {
                                Designer.findOne({
                                    name: n.designer
                                }).exec(function (err, found) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(found)) {
                                            n.designer = null;
                                        } else {
                                            n.designer = found._id;
                                        }

                                        callback1(null, "done");
                                    }
                                });
                            },
                            function (callback1) {
                                Color.find({
                                    name: {
                                        $in: colorarray
                                    }
                                }).exec(function (err, found) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        colarray = [];
                                        _.each(found, function (color) {
                                            colarray.push(color._id.toString());
                                        });
                                        // n.category = [];
                                        n.color = colarray;
                                        callback1(null, "done");
                                    }
                                });
                            },
                            function (callback1) {
                                Size.find({
                                    name: {
                                        $in: sizearray
                                    }
                                }).exec(function (err, found) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        sizearr = [];
                                        _.each(found, function (size) {
                                            sizearr.push(size._id.toString());
                                        });
                                        // n.category = [];
                                        n.size = sizearr;
                                        callback1(null, "done");
                                    }
                                });
                            }
                            // ,
                            //  function (callback1) {
                            //     Product.find({
                            //         name: {
                            //             $in: suggestedarray
                            //         }
                            //     }).exec(function (err, found) {
                            //         if (err) {
                            //             console.log(err);
                            //             callback(err, null);
                            //         } else {
                            //             console.log("aaaaa",found);
                            //             sugesarr = [];
                            //             _.each(found, function (suges) {
                            //                 sugesarr.push(suges._id.toString());
                            //             });
                            //             // n.sugesegory = [];
                            //             n.suggestedProduct = sugesarr;
                            //             callback1(null, "done");
                            //         }
                            //     });
                            // }

                            ,
                            function (callback1) {
                                var imagesarr = [];
                                var i = 0;
                                var imgurl = "http://storage.googleapis.com/styleaseproducts/";
                                if (!_.isEmpty(stimg)) {
                                    async.each(stimg, function (filename, callback) {
                                        var newImg = imgurl + filename;
                                        Config.downloadFromUrl(newImg, function (err, resimg) {
                                            if (err) {
                                                callback(null, "not went");
                                            } else {
                                                imagesarr.push({
                                                    "image": resimg.name,
                                                    "order": i
                                                });
                                                callback(null, resimg);
                                            }
                                        });
                                    }, function (err, result) {
                                        n.images = imagesarr;
                                        callback1(null, "done");
                                    });

                                } else {
                                    callback1(null, "done");
                                }
                            }
                        ], function (err, respo) {
                            if (err) {
                                console.log(err);
                                callback1(err, null);
                            } else {
                                Model(n).save(n, function (err, data) {
                                    if (err) {
                                        err.val = data;
                                        retVal.push(err);
                                    } else {
                                        retVal.push(data._id);
                                    }
                                    callback();
                                });
                                // callback();
                            }
                        });

                    // }
                // }
            // })
        }, function (err) {
            if (err) {
                callback(err, data);
            } else {
                callback(err, {
                    total: retVal.length,
                    value: retVal
                });
            }
        });
    },

    saveData: function (data, callback) {
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
        if (data.designer == "") {
            // delete data.designer;
            data.designer = null;
        }
        if (data.size == "") {
            // delete data.size;
            data.size = null;
        }
        if (data.color == "") {
            // delete data.color;
            data.color = null;
        }
        var product = this(data);
        if (data._id) {
            this.findOneAndUpdate({
                _id: data._id
            }, data).exec(function (err, updated) {
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
            product.save(function (err, created) {
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
    getAllDetails: function (data, callback) {
        this.find({
            status: true
        }, {
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
    getOne: function (data, callback) {
        this.findOne({
            "_id": data._id
        }, {
            password: 0
        }).exec(function (err, found) {
            // console.log("fff", found);
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
    getOneProduct: function (data, callback) {
        this.findOne({
            "_id": data._id
        }, {
            password: 0
        }).populate("size", "name").exec(function (err, found) {
            // console.log("fff", found);
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
    getProductById: function (data, callback) {
        var newreturns = {};
        async.parallel([
            function (callback) {
                Product.findOne({
                    _id: data._id,
                    status: true
                }).populate("category", "name").populate("subcategory", "name").populate("size").populate("designer", "name").populate({
                    path: 'suggestedProduct',
                    select: '_id name fourdayrentalamount eightdayrentalamount images',
                    options: {
                        limit: 6,
                        sort: {
                            "images.order": 1
                        }
                    }
                }).lean().exec(function (err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null)
                    } else {
                        newreturns.product = found;
                        callback(null, newreturns);
                    }
                });
            },
            function (callback) {
                ProductTime.find({
                    product: data._id,
                    timeTo: {
                        $gte: new Date()
                    }
                }).exec(function (err, data1) {
                    if (err) {
                        console.log(err);
                        callback(err, null)
                    } else {
                        // console.log("ddd", data1);
                        newreturns.producttime = data1;
                        callback(null, newreturns);
                    }
                });
            }

        ], function (err, data3) {
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

    getProductByCat: function (data, callback) {
        var matchobj = {
            subcategory: {
                $in: data.subcategory
            },
            fourdayrentalamount: {
                $gte: data.pricefrom,
                $lt: data.priceto
            },
            size: {
                $in: data.size
            },
            // size: {
            //     $elemMatch: {
            //         name: data.size
            //     }
            // },
            color: {
                $in: data.color
            },
            status: true
        };

        if (data.sort === "Recent Addition") {
            var sortfilter = {
                _id: -1
            }
        } else if (data.sort === "Price : Low - High") {
            var sortfilter = {
                fourdayrentalamount: 1
            }
        } else if (data.sort === "Price : High - Low") {
            console.log('High to low')
            var sortfilter = {
                fourdayrentalamount: -1
            }
        } else if (data.sort === "Popularity") {
            var sortfilter = {
                booked: 1
            }
        } else {
            var sortfilter = {
                _id: -1
            }
        }
        if (data.subcategory.length == 0 || data.subcategory == null) {
            delete matchobj.subcategory;
        }
        if (!data.size || data.size == "") {
            delete matchobj.size;
        }
        if (!data.color || data.color == "") {
            delete matchobj.color;
        }
        console.log(sortfilter);
        var newreturns = {};
        newreturns.data = [];
        data.pagesize = parseInt(data.pagesize);
        data.pagenumber = parseInt(data.pagenumber);
        async.parallel([
            function (callback) {
                Product.find(matchobj).select('_id name designer fourdayrentalamount eightdayrentalamount images subcategory').populate('designer', 'name').sort(sortfilter).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).exec(function (err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        newreturns.data = found;
                        callback(null, newreturns);
                    }
                });
            },
            function (callback) {
                Product.find(matchobj).count(function (err, count) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        // console.log("Number of docs: ", count);
                        newreturns.totalpages = Math.ceil(count / data.pagesize);
                        callback(null, newreturns);
                    }

                });
            }
        ], function (err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, newreturns);
            }
        });
    },

    getProductByCatName: function (data, callback) {
        var newreturns = {};
        newreturns.data = [];
        data.pagesize = parseInt(data.pagesize);
        data.pagenumber = parseInt(data.pagenumber);
        async.parallel([
            function (callback) {
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
                }]).exec(function (err, found) {
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
            function (callback) {
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
                }]).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).sort({
                    order: 1
                }).exec(function (err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        newreturns.data = found;
                        callback(null, newreturns);
                    }
                });
            }
        ], function (err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, newreturns);
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
                Product.count({
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

    findSize: function (data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var skip = parseInt(data.pagesize * (data.pagenumber - 1));
        async.parallel([
                function (callback) {
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
                    }]).exec(function (err, found) {
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

    deleteSize: function (data, callback) {
        Product.update({
            "size._id": data._id
        }, {
            $pull: {
                "size": {
                    "_id": objectid(data._id)
                }
            }
        }, function (err, updated) {
            console.log(updated);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, updated);
            }
        });

    },

    saveSize: function (data, callback) {
        var product = data.product;
        console.log(product);
        if (!data._id) {
            Product.update({
                _id: product
            }, {
                $push: {
                    size: data
                }
            }, function (err, updated) {
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
            _.forIn(data, function (value, key) {
                tobechanged[attribute + key] = value;
            });
            Product.update({
                "size._id": data._id
            }, {
                $set: tobechanged
            }, function (err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, updated);
                }
            });
        }
    },
    findOneSize: function (data, callback) {
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
        }]).exec(function (err, respo) {
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


    //SIDEMENU Gallery

    saveGallery: function (data, callback) {
        var product = data.product;
        if (!data._id) {
            Product.update({
                _id: data.product
            }, {
                $push: {
                    images: data
                }
            }, function (err, updated) {
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
            var attribute = "images.$.";
            _.forIn(data, function (value, key) {
                tobechanged[attribute + key] = value;
            });
            Product.update({
                "images._id": data._id
            }, {
                $set: tobechanged
            }, function (err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, updated);
                }
            });
        }
    },

    getAllGallery: function (data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var skip = parseInt(data.pagesize * (data.pagenumber - 1));
        async.parallel([
                function (callback) {
                    Product.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$images"
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
                    Product.aggregate([{
                        $match: {
                            _id: objectid(data._id)
                        }
                    }, {
                        $unwind: "$images"
                    }, {
                        $group: {
                            _id: "_id",
                            images: {
                                $push: "$images"
                            }
                        }
                    }, {
                        $project: {
                            _id: 0,
                            images: {
                                $slice: ["$images", skip, data.pagesize]
                            }
                        }
                    }]).exec(function (err, found) {
                        console.log(found);
                        if (found && found.length > 0) {
                            newreturns.data = found[0].images;
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


    deleteGallery: function (data, callback) {
        Product.update({
            "images._id": data._id
        }, {
            $pull: {
                "images": {
                    "_id": objectid(data._id)
                }
            }
        }, function (err, updated) {
            console.log(updated);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, updated);
            }
        });

    },

    getOneGallery: function (data, callback) {
        // aggregate query
        Product.aggregate([{
            $unwind: "$images"
        }, {
            $match: {
                "images._id": objectid(data._id)
            }
        }, {
            $project: {
                images: 1
            }
        }]).exec(function (err, respo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (respo && respo.length > 0 && respo[0].images) {
                callback(null, respo[0].images);
            } else {
                callback({
                    message: "No data found"
                }, null);
            }
        });
    },

};

module.exports = _.assign(module.exports, models);