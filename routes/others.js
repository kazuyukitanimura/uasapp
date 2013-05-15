
/*
 * robots.txt
 */

exports.robots = function(req, res){
  res.sendfile('./views/robots.txt');
};

/*
 * humans.txt
 */

exports.humans = function(req, res){
  res.sendfile('./views/humans.txt');
};

