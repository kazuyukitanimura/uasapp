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

exports.timeline = function(req, res) {
  var mapArg = {
    timeRadix: timeRadix
  };
  var reduceArg = {
    start: parseInt(req.query.start, 10) || 0,
    end: parseInt(req.query.end, 10) || 10
  };
  db.mapreduce.add(bucket).map(function(value, keydata, arg) {
    var timeRadix = arg.timeRadix;
    var timeSequenceMachine = value.key.split('-');
    var time = parseInt(timeSequenceMachine[0], timeRadix);
    var sequence = parseInt(timeSequenceMachine[1], timeRadix);
    return [{
      id: value.key,
      time: time,
      sequence: sequence,
      data: Riak.mapValuesJson(value)[0]
    }];
  },
  mapArg).reduce(function(valueList, arg) {
    // TODO This is O(n log n). It can be O(n) maybe.
    return valueList.sort(function(a, b) {
      return (b.time - a.time) || (b.sequence - a.sequence);
    }).slice(arg.start, arg.end);
  },
  reduceArg).run(function(err, data) {
    console.log(data);
    if (err) {
      res.send(500);
      throw err;
    } else {
      console.log(req.session);
      req.session = req.session || {};
      req.session.newestId = data[0].id;
      req.session.oldestId = data[data.length - 1].id;
      res.send(data);
    }
  });
};

exports.index = function(req, res) {
  var job = req.params.job;
  if (job === 'timeline') {
    exports.timeline(req, res);
  } else {
    res.send(404);
  }
};

