var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');

var Url = require('./models/url');

mongoose.Promise = Promise;
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {useMongoClient: true,/* other options */});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
})

app.post('/api/shorten', function (req, res) {
  var longUrl = req.body.url;
  var shortUrl = '';
  Url.findOne({
    long_url: longUrl
  }, function (err, doc) {
    if (doc) {
      res.status(200);
      shortUrl = config.webhost + base58.encode(doc._id);
      res.send({
        'shortUrl': shortUrl
      });
    } else {
      var newUrl = Url({
        long_url: longUrl
      });

      newUrl.save(function (err) {
        if (err) {
          console.log(err);
        }

        shortUrl = config.webhost + base58.encode(newUrl._id);

        res.status(200);
        res.send({
          'shortUrl': shortUrl
        });
      });
    }

  });

});


app.get('/:encoded_id', function(req, res){
  
    var base58Id = req.params.encoded_id;
  
    var id = base58.decode(base58Id);

    Url.findOne({_id: id}, function (err, doc){
      if (doc) {
        
        res.redirect(301, doc.long_url);
        console.log(doc.long_url);
      } else {
        res.redirect(config.webhost);
      }
  });

});

var server = app.listen(3000, function () {
  console.log('Server listening on port 3000');
});