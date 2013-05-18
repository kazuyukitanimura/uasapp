var Gify = require('./gif_parser');
var fs = require('fs');

var filename = process.argv[2];
var sourceStream = fs.createReadStream(filename);
Gify(sourceStream, function(err, info){
  if (err) {
    console.log(info);
    throw err;
  } else {
    console.log(info);
  }
});
