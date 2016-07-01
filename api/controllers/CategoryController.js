var request = require('request');
module.exports = {

  save: function(req, res) {
    if (req.body) {
      Category.saveData(req.body, res.callback);
    } else {
      res.json({
        value: false,
        data: "Invalid Request"
      });
    }
  },
  getOne: function(req, res) {

    if (req.body) {
      Category.getOne(req.body, res.callback);
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
      Category.deleteData(req.body, res.callback);
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
      Category.getAll(req.body, res.callback);
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
              Category.getLimited(req.body, res.callback);
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
