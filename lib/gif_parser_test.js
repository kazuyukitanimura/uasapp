var assert = require("assert");
var Gify = require('./gif_parser');
var fs = require('fs');

var filedir = './public/images/';
var testcases = [{
  filename: 'adam.gif',
  info: {
    valid: true,
    height: 149,
    width: 149,
    frames: 264,
    duration: 12490,
    digest: 89399633
  }
},
{
  filename: 'f8f7a03a.gif',
  info: {
    valid: true,
    height: 129,
    width: 250,
    frames: 42,
    duration: 4200,
    digest: 2344098478
  }
}];

describe('Gify', function() {
  var testFunc = function(filename, expectedInfo) {
    it('test info', function(done) {
      var sourceStream = fs.createReadStream(filename);
      Gify(sourceStream, function(err, info) {
        assert.deepEqual(info, expectedInfo);
        if (err) {
          throw err;
        }
        done();
      });
    });
  };
  for (var i = testcases.length; i--;) {
    var testcase = testcases[i];
    var filename = filedir + testcase.filename;
    describe(filename, testFunc.bind(this, filename, testcase.info));
  }
});

