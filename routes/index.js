
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'UasApp', description: 'Experimental short video sharing service' });
};
