/*
 * API.
 */

var db = require('riak-js').getClient();
var config = require('../config');
var bucket = config.bubbleBucket;

var getDuration = exports.getDuration = function(img) {
  var durationMatch = /\w+-\d+-\d+-\d+-(\d+)\.\w+/.exec(img); // digest_height_width_size_duration.gif
  return durationMatch ? durationMatch[1] : null;
};

exports.index = function(req, res) {
  db.mapreduce.add(bucket).map('Riak.mapValuesJson')
  db.get(bucket, view, function(err, data, meta) {
    console.log(data);
    console.log(meta);
    if (err) {
      res.send(500);
      throw err;
    } else {
      if (meta.statusCode === 300) {
        for (var obj in data) {
          // TODO reconcile siblings
        }
      }
      var duration = getDuration(data.url);
      if (duration) {
        data.duration = duration;
        res.send(data);
      } else {
        res.send(404);
      }
    }
  });
};

