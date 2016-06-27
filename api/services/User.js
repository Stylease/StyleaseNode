var mongoose = require('mongoose');
var md5 = require('md5');
var Schema = mongoose.Schema;
var schema = new Schema({
  name: {
    type: String,
    default: ""
  },
  email: String,
  password: {
    type: String,
    default: ""
  },
  mobile: {
    type: String,
    default: ""
  },
  oauthLogin: {
    type: [{
      socialProvider: String,
      socialId: String,
      modificationTime: Date
    }],
    index: true
  },
  timestamp: Date,
  // notification: {
  //   type: [],
  //   index:true
  // },
  cart: {
    type: [{
      timestamp: Date,
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        index: true
      }
    }],
    index: true
  },
  wishlist: {
    type: [{
      timestamp: Date,
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        index: true
      }
    }],
    index: true
  }

});

module.exports = mongoose.model('User', schema);

var models = {
  saveData: function(data, callback) {
    //        delete data.password;
    var user = this(data);
    if (data._id) {
      data.expiry = new Date(data.expiry);
      data.password = md5(data.password);
      data.userid = new Date();
      this.findOneAndUpdate({
        _id: data._id
      }, data).exec(function(err, updated) {
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
      user.timestamp = new Date();
      data.expiry = new Date();
      user.password = md5(user.password);

      user.save(function(err, created) {
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
  deleteData: function(data, callback) {
    this.findOneAndRemove({
      _id: data._id
    }, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else if (deleted) {
        callback(null, deleted);
      } else {
        callback(null, {});
      }
    });
  },
  getAll: function(data, callback) {
    this.find({}, {
      password: 0
    }).exec(function(err, found) {
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
  getOne: function(data, callback) {
    this.findOne({
      "_id": data._id
    }, {
      password: 0
    }).exec(function(err, found) {
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
  login: function(data, callback) {
         data.password = md5(data.password);
         User.findOne({
             email: data.email,
             password: data.password
         }, function(err, data2) {
             if (err) {
                 console.log(err);
                 callback(err, null);
             } else {
                callback(null, data2)
             }
         });
     },

};

module.exports = _.assign(module.exports, models);
