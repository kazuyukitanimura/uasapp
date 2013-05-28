/*
 * GET search page.
 */

var db = require('riak-js').getClient();
var config = require('../config');
var bucket = config.bubbleBucket;
var imgPath = config.imgPath;
var Flake = require('../lib/flake');
var flake = new Flake();

var getDuration = function(img) {
  var durationMatch = /\w+-\d+-\d+-\d+-(\d+)\.\w+/.exec(img); // digest_height_width_size_duration.gif
  return durationMatch ? durationMatch[1] : null;
};
var description = 'Experimental short video sharing service';
var title = 'UasApp';

exports.get = function(req, res) {
  var img = req.query.img;
  var view = req.query.view;
  console.log(img, view);
  var template = {
    title: title,
    description: description
  };
  if (img) {
    var duration = getDuration(img);
    if (duration) {
      template.img = {
        title: '',
        url: img.indexOf(imgPath) === 0 ? img: imgPath + img,
        duration: duration
      };
      res.render('edit', template);
    } else {
      res.send(404);
    }
  } else if (view) {
    db.get(bucket, view, function(err, data, meta) {
      console.log(data);
      console.log(meta);
      if (err) {
        res.send(500);
        throw err;
      } else {
        var duration = getDuration(data.url);
        if (duration) {
          data.duration = duration;
          template.img = data;
          res.render('edit', template);
        } else {
          res.send(404);
        }
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
      res.send(500);
      throw err;
    } else {
      res.send(200);
    }
  });
};

