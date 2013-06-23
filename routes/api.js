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
  var gt_id = req.query.gt_id;
  var lt_id = req.query.lt_id;
  var mapArg = {
    timeOffset: timeOffset,
    timeRadix: timeRadix,
    gt_id: gt_id,
    lt_id: lt_id
  };
  var reduceArg = {
    count: parseInt(req.query.count, 10) || 5,
    gt_id: gt_id,
    lt_id: lt_id
  };
  var key_filters = [];
  //var gt_id = req.query.gt_id;
  //var lt_id = req.query.lt_id;
  //if (gt_id) {
  //   gt_id = gt_id.split('-');
  //   key_filters.push(['or', [['tokenize', '-', 1], ['greater_than', gt_id[0]]], [['tokenize', '-', 2], ['greater_than', gt_id[1]]]]);
  //}
  //if (lt_id) {
  //}
  var inputs = bucket;
  //if (key_filters.length > 0) {
  //  inputs = {
  //    bucket: bucket,
  //    key_filters: key_filters
  //  };
  //}
  //console.log(inputs);
  db.mapreduce.add(inputs).map(function(value, keydata, arg) {
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
      links: value.values[0].metadata.Links,
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
    var start = 0;
    var end = arg.count;
    if (arg.gt_id && !arg.lt_id) {
      start = Math.max(0, valueList.length - end);
      end = valueList.length;
    }
    // TODO This is O(n log n). It can be O(n) maybe.
    return valueList.sort(function(a, b) {
      return (b.time - a.time) || (b.sequence - a.sequence);
    }).slice(start, end);
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

exports.update = function(req, res) {
};

exports.index = function(req, res) {
  var job = req.params.job;
  if (job === 'timeline') {
    exports.timeline(req, res);
  } else if (job === 'update') {
    exports.update(req, res);
  } else {
    res.send(404);
  }
};

