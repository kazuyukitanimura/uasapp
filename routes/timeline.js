
/*
 * GET timeline page.
 */

var description = 'Experimental short video sharing service';
var title = 'UasApp';

exports.index = function(req, res){
  var template = {
    title: title,
    description: description
  };
  res.render('timeline', template);
};
