var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterSchema = Schema({
  _id: {type: String, required: true},
  seq: { type: Number, default: 0 }
});

var counter = mongoose.model('counter', CounterSchema);

var url_count = new counter({_id: "url_count", seq:0});
url_count.save();

var urlSchema = new Schema({
  _id: {type: Number, index: true},
  long_url: String,
  created_at: Date
});



urlSchema.pre('save', function(next){
  var doc = this;
  counter.findByIdAndUpdate({_id: 'url_count'}, {$inc: {seq: 1} }, {new: true}, function(error, counter) {
      if (error)
          return next(error);
      doc._id = counter.seq;//typeof counter.seq === "undefined" ? 1 : counter.seq;
      doc.created_at = new Date();
      next();
  });
});

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;
