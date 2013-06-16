/*
 * API.
 */

var db = require('riak-js').getClient();
var config = require('../config');
var bucket = config.bubbleBucket;
var timeOffset = config.timeOffset;
var timeRadix = config.timeRadix;

var getDuration = exports.getDuration = function(img) {
  var durationMatch = /\w+-\d+-\d+-\d+-(\d+)\.\w+/.exec(img); // digest_height_width_size_duration.gif
  return durationMatch ? durationMatch[1] : null;
};

exports.timeline = function(req, res) {
  var mapArg = {
    timeOffset: timeOffset,
    timeRadix: timeRadix,
    gt_id: req.query.gt_id || null,
    lt_id: req.query.lt_id || null
  };
  var reduceArg = {
    start: parseInt(req.query.start, 10) || 0,
    end: parseInt(req.query.end, 10) || 10
  };
  db.mapreduce.add(bucket).map(function(value, keydata, arg) {
    var timeOffset = arg.timeOffset;
    var timeRadix = arg.timeRadix;
    var splitStr = '-';
    var id = value.key.split(splitStr);
    var time = parseInt(id[0], timeRadix) + timeOffset;
    var sequence = parseInt(id[1], timeRadix);
    var result = [{
      id: value.key,
      time: time,
      sequence: sequence,
      data: Riak.mapValuesJson(value)[0]
    }];
    if (arg.gt_id) {
      var gt_id = arg.gt_id.split(splitStr);
      var gt_time = parseInt(gt_id[0], timeRadix) + timeOffset;
      var gt_sequence = parseInt(gt_id[1], timeRadix);
      if (time <= gt_time && sequence <= gt_sequence) {
        result = [];
      }
    }
    if (arg.lt_id) {
      var lt_id = arg.lt_id.split(splitStr);
      var lt_time = parseInt(lt_id[0], timeRadix) + timeOffset;
      var lt_sequence = parseInt(lt_id[1], timeRadix);
      if (time >= lt_time && sequence >= lt_sequence) {
        result = [];
      }
    }
    return result;
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
      //console.log(req.session);
      //req.session = req.session || {};
      //req.session.newestId = data[0].id;
      //req.session.oldestId = data[data.length - 1].id;
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

