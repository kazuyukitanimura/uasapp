/*
 * API.
 */

var db = require('riak-js').getClient();
var config = require('../config');
var bucket = config.bubbleBucket;
var timeRadix = config.timeRadix;

var getDuration = exports.getDuration = function(img) {
  var durationMatch = /\w+-\d+-\d+-\d+-(\d+)\.\w+/.exec(img); // digest_height_width_size_duration.gif
  return durationMatch ? durationMatch[1] : null;
};

exports.index = function(req, res) {
  var job = req.params.job;
  if (job === 'timeline') {
    var start = parseInt(req.query.start, 10) || 0;
    var end = parseInt(req.query.end, 10) || 10;
    db.mapreduce.add(bucket).map(function(value, keydata, arg) {
      return [{
        id: value.key,
        data: Riak.mapValuesJson(value)[0]
      }];
    }).reduce(function(valueList, arg) {
      var timeRadix = arg.timeRadix;
      return valueList.sort(function(a, b) {
        var aTimeSequenceMachine = a.id.split('-');
        var bTimeSequenceMachine = b.id.split('-');
        var aTime = parseInt(aTimeSequenceMachine[0], timeRadix);
        var bTime = parseInt(bTimeSequenceMachine[0], timeRadix);
        var aSequence = parseInt(aTimeSequenceMachine[1], timeRadix);
        var bSequence = parseInt(bTimeSequenceMachine[1], timeRadix);
        return (bTime - aTime) || (bSequence - aSequence);
      }).slice(arg.start, arg.end);
    },
    {
      timeRadix: timeRadix,
      start: start,
      end: end
    }).run(function(err, data) {
      console.log(data);
      if (Array.isArray(data)) { // tentative error check
        res.send(data);
      } else {
        res.send(500);
      }
    });
  } else {
    res.send(404);
  }
  //db.get(bucket, view, function(err, data, meta) {
  //  console.log(data);
  //  console.log(meta);
  //  if (err) {
  //    res.send(500);
  //    throw err;
  //  } else {
  //    if (meta.statusCode === 300) {
  //      for (var obj in data) {
  //        // TODO reconcile siblings
  //      }
  //    }
  //    var duration = getDuration(data.url);
  //    if (duration) {
  //      data.duration = duration;
  //      res.send(data);
  //    } else {
  //      res.send(404);
  //    }
  //  }
  //});
};

