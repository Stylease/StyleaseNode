var request = require('request');
module.exports = {
    sort: function(req, res) {
        function callback(err, data) {
            Config.GlobalCallback(err, data, res);
        }
        if (req.body) {
            Wishlist.sort(req.body, callback);
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    save: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body.user = req.session.user._id;
                Wishlist.saveData(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Please login to Add Wishlist"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getOne: function(req, res) {

        if (req.body) {
            Wishlist.getOne(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    delete: function(req, res) {
        if (req.body) {
            console.log(req.body);
            Wishlist.deleteData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    deleteByUser: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body.user = req.session.user._id;
                Wishlist.deleteByUser(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "User Not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAll: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            Wishlist.getAll(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getLimited: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.body.pagesize && req.body.pagenumber) {
                Wishlist.getLimited(req.body, res.callback);
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
    getWishlist: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            console.log(req.body);
            if (req.body.pagesize && req.body.pagenumber) {
                Wishlist.getWishlist(req.body, res.callback);
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
    getWishlistUser: function(req, res) {
        function callback(err, data) {
            Global.response(err, data, res);
        }
        if (req.body) {
            if (req.session.user) {

                req.body.user = req.session.user._id;
                Wishlist.getWishlistUser(req.body, res.callback);

            } else {
                res.json({
                    value: false,
                    data: "User not logged in"
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
