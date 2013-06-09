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
      return valueList.sort(function(a, b) {
        var aTimeSequenceMachine = a.id.split('-');
        var bTimeSequenceMachine = b.id.split('-');
        if (aTimeSequenceMachine.length === 3 && bTimeSequenceMachine.length === 3) {
          var aTime = parseInt(aTimeSequenceMachine[0], 36);
          var bTime = parseInt(bTimeSequenceMachine[0], 36);
          var aSequence = parseInt(aTimeSequenceMachine[1], 36);
          var bSequence = parseInt(bTimeSequenceMachine[1], 36);
          if (aTime > bTime) {
            return - 1;
          } else if (aTime < bTime) {
            return 1;
          } else if (aSequence > bSequence) {
            return - 1;
          } else if (aSequence < bSequence) {
            return 1;
          }
        }
        return 0;
      });
    }).reduce('Riak.reduceSlice', [start, end]).run(function(err, data) {
      console.log(data);
      res.send(data);
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

