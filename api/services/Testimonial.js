var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
  user: {
    type:Schema.Types.ObjectId,
    ref:'User',
    index:true
  },
  // description: {type:Number,default:""},
  testimonial: {type:String,default:""},
  timestamp: { type: Date, default: Date.now },
  order: {type:Number,default:""}

});

module.exports = mongoose.model('Testimonial', schema);

var models = {
  saveData: function(data, callback) {
    //        delete data.password;
    var testimonial = this(data);
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
      // data.timestamp= new Date();
      testimonial.save(function(err, created) {
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
    }).populate("user", "_id  name email", null, { sort: { "name": 1 } }).lean().exec(function(err, found) {
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
  getLimited: function(data, callback) {
  data.pagenumber = parseInt(data.pagenumber);
  data.pagesize = parseInt(data.pagesize);
  var checkfor = new RegExp(data.search, "i");
  var newreturns = {};
  newreturns.data = [];
  async.parallel([
      function(callback1) {
          Testimonial.count({
              name: {
                  "$regex": checkfor
              }
          }).exec(function(err, number) {
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
      function(callback1) {
          Testimonial.find({
              testimonial: {
                  "$regex": checkfor
              }
          }, {}).sort({
              name: 1
          }).skip((data.pagenumber - 1) * data.pagesize).limit(data.pagesize).populate("user", "_id  name", null, {
              sort: {
                  "testimonial": 1
              }
          }).lean().exec(function(err, data2) {
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
  ], function(err, respo) {
      if (err) {
          console.log(err);
          callback(err, null);
      } else {
          callback(null, newreturns);
      }
  });
},
};

module.exports = _.assign(module.exports, models);
