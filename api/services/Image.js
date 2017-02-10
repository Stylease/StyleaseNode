var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectid = require("mongodb").ObjectId;
var schema = new Schema({
   
    images: [{
        image: {
            type: String,
            default: ""
        },
        order: {
            type: Number,
            default: 0
        }
    }],


});

module.exports = mongoose.model('Image', schema);

var models = {
    
    saveData: function (data, callback) {
       
        var image = this(data);
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
            image.save(function (err, created) {
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
   

};

module.exports = _.assign(module.exports, models);