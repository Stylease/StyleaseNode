var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
  user: {
    type:Schema.Types.ObjectId,
    ref:'User',
    index:true
  },
  coupon: {type:String,default:""},
  timestamp: Date,
  email: {type:String, default:""},
  mobile: {type:String, default:""},
  products: [{
    product:{
      type: Schema.Types.ObjectId,
      ref: 'Product',
      index: true
    },
    quantity: Number,
    price: Number
  }],
  // billingAddress: {
  //   address:String,
  //   zipcode:Number,
  //   country:String,
  //
  // },
  // shippingAddress:
  status:{type:String,default:""},
  tax:{type:String, default:""},
  timeFrom:Date,
  timeTo:Date

});

module.exports = mongoose.model('Order', schema);

var models = {
  saveData: function(data, callback) {
    //        delete data.password;
    var order = this(data);
    if (data._id) {
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

      order.save(function(err, created) {
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
  getAllDetails: function(data, callback) {
    this.find({}, {
      password: 0
    }).populate("user","_id  name", null, { sort: { "name": 1 } }).populate("product","_id  name", null, { sort: { "name": 1 } }).lean().exec(function(err, found) {
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
};

module.exports = _.assign(module.exports, models);
