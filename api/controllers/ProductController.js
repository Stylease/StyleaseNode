var request = require('request');
module.exports = {
    sort: function (req, res) {
        function callback(err, data) {
            Config.GlobalCallback(err, data, res);
        }
        if (req.body) {
            Product.sort(req.body, callback);
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    generateExcel: function (req, res) {
        Product.generateExcel(res);
    },


    import: function (req, res) {
        if (req.body.file) {
            Config.importGS(req.body.file, function (err, data) {
                if (err) {
                    callback(err, callback);
                } else {
                    // req.model.import(data, res.callback);
                    Product.import(data, res.callback);
                }
            });
        } else {
            res.callback("Incorrect Data Format");
        }
    },


    save: function (req, res) {
        if (req.body) {
            Product.saveData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getOne: function (req, res) {
        if (req.body) {
            Product.getOne(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getOneProduct: function (req, res) {
        if (req.body) {
            Product.getOneProduct(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getProductById: function (req, res) {
        if (req.body) {
            Product.getProductById(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getProductByCatName: function (req, res) {
        if (req.body) {
            Product.getProductByCatName(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getProductByCat: function (req, res) {
        if (req.body) {
            Product.getProductByCat(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    delete: function (req, res) {
        if (req.body) {
            // console.log(req.body);
            Product.deleteData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAll: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            Product.getAll(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getAllDetails: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            Product.getAllDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getLimited: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.body.pagesize && req.body.pagenumber) {
                Product.getLimited(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Invalid Params"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    findSize: function (req, res) {
        if (req.body) {
            Product.findSize(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    findOneSize: function (req, res) {
        if (req.body) {
            Product.findOneSize(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    deleteSize: function (req, res) {
        if (req.body) {
            if (req.body._id && req.body._id !== "") {
                //	console.log("not valid");
                Product.deleteSize(req.body, function (err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: respo
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Id"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    saveSize: function (req, res) {
        if (req.body) {
            Product.saveSize(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    // gallery

    getAllGallery: function (req, res) {
        if (req.body.pagenumber && req.body.pagesize) {
            Product.getAllGallery(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    getOneGallery: function (req, res) {
        if (req.body) {
            Product.getOneGallery(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    deleteGallery: function (req, res) {
        if (req.body) {
            if (req.body._id && req.body._id !== "") {
                //	console.log("not valid");
                Product.deleteGallery(req.body, function (err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: respo
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Id"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    saveGallery: function (req, res) {
        console.log(req.body);
        if (req.body) {
            Product.saveGallery(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },


};