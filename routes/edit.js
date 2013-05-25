/*
 * GET search page.
 */

var db = require('riak-js').getClient();

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
  console.log(req.body);
  // save
  res.end('success');
};
