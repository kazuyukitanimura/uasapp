/*
 * GET search page.
 */

exports.index = function(req, res) {
  var result = [{
    title: 'neko',
    url: '/images/f8f7a03a.gif'
  }];
  res.send(JSON.stringify(result));
};

