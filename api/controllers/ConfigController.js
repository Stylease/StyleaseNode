/**
 * ConfigController
 *
 * @description :: Server-side logic for managing Configs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require("fs");
var request = require("request");
var moment = require('moment');
// var checksum = require('./checksum');
module.exports = {
    saveData: function(req, res) {
        if (req.body) {
            Config.saveData(req.body, function(err, respo) {
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
    getAll: function(req, res) {
        if (req.body) {
            Config.getAll(req.body, function(err, respo) {
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
    delete: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "") {
                Config.deleteData(req.body, function(err, respo) {
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
    emailReader: function(req, res) {
        var isfile2 = fs.existsSync('./views/' + req.body.filename);
        if (isfile2) {
            res.view(req.body.filename, req.body);
        } else {
            res.json({
                value: false,
                message: "Please provide params"
            });
        }
    },
    response: function(req, res) {
        console.log(req.body);
        if (req.body) {
            res.json({
                value: true,
                data: "API Called successfully"
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    }
};
