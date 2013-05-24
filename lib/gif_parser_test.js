var assert = require("assert");
var Gify = require('./gif_parser');
var fs = require('fs');

var filedir = './public/images/';
var testcases = [{
  filename: '164.gif',
  info: {
    valid: true,
    height: 300,
    width: 400,
    size: 1027353,
    frames: 62,
    duration: 6400,
    digest: 2730931815 // 195xch3
  }
},
{
  filename: 'f8f7a03a.gif',
  info: {
    valid: true,
    height: 129,
    width: 250,
    size: 509425,
    frames: 42,
    duration: 4200,
    digest: 2344098478 // 12rm5ym
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

