/*
 * GET search page.
 */

var db = require('riak-js').getClient();
var config = require('../config');
var bucket = config.bubbleBucket;
var Flake = require('../lib/flake');
var flake = new Flake();

exports.get = function(req, res) {
  var img = req.query.img;
  console.log(img);
  var durationMatch = /\w+-\d+-\d+-\d+-(\d+)\.\w+/.exec(img); // digest_height_width_size_duration.gif
  if (durationMatch) {
    res.render('edit', {
      title: 'UasApp',
      description: 'Experimental short video sharing service',
      img: {
        title: 'neko',
        url: '/images/' + img,
        duration: durationMatch[1]
      }
    });
  } else {
    res.send(404);
  }
};

exports.post = function(req, res) {
  // TODO check the order of req.body
  var data = req.body;
  console.log(data);
  db.save(bucket, flake.next(), data, function(err, data, meta) {
    console.log(data);
    console.log(meta);
    if (err) {
      console.error(err);
      res.send(500);
    } else {
      res.send(200);
    }
  });
};
