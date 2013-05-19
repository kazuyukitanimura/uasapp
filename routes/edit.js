/*
 * GET search page.
 */

exports.index = function(req, res) {
  res.render('edit', {
    title: 'UasApp',
    description: 'Experimental short video sharing service',
    img: {
      title: 'neko',
      url: '/images/f8f7a03a.gif',
      duration: '4200'
    }
  });
};

