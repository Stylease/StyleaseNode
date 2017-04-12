var request = require('request');
module.exports = {
    sort: function (req, res) {
        function callback(err, data) {
            Config.GlobalCallback(err, data, res);
        }
        if (req.body) {
            Designer.sort(req.body, callback);
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    save: function (req, res) {
        if (req.body) {
            Designer.saveData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getOne: function (req, res) {

        if (req.body) {
            Designer.getOne(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    delete: function (req, res) {
        if (req.body) {
            console.log(req.body);
            Designer.deleteData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    generateExcel: function (req, res) {
        Designer.generateExcel(res);
    },
    getAll: function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            Designer.getAll(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    // getAllAlphabetically: function (req, res) {
    //     function callback(err, data) {
    //         Global.response(err, data, res);
    //     }
    //     if (req.body) {
    //         Designer.getAllAlphabetically(req.body, res.callback);
    //     } else {
    //         res.json({
    //             value: false,
    //             data: "Invalid Request"
    //         });
    //     }
    // },
    getByDesignerTypeAlpha:function (req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            Designer.getByDesignerTypeAlpha(req.body, res.callback);
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
                Designer.getLimited(req.body, res.callback);
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


};