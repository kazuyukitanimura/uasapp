/*
 * GET search page.
 */

exports.index = function(req, res) {
  var result = [{
    title: 'neko',
    url: '/images/f8f7a03a.gif',
    comments: [
      {time:0, text:'neko neko neko'}
    ]
  }];
  res.send(JSON.stringify(result));
};

