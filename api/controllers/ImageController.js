var request = require('request');
module.exports = {
  

    save: function (req, res) {
        if (req.body) {
            Image.saveData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

  

};