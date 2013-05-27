var os = require('os');
var crypto = require('crypto');
var shasum = crypto.createHash('sha512');
shasum.update(os.hostname(), 'utf8');
var machineId = shasum.digest('base64').substring(0, 6);

var Flake = module.exports = function() {
  if (! (this instanceof Flake)) { // enforcing new
    return new Flake();
  }
  this.sequenceId = 0;
  this.timestamp = Date.now();
};

Flake.prototype.next = function() {
  var timestamp = Date.now();
  if (this.timestamp === timestamp) {
    ++this.sequenceId;
  } else if (this.timestamp < timestamp) {
    this.sequenceId = 0;
    this.timestamp = timestamp;
  } else {
    return null;
  }
  return [timestamp.toString(36), this.sequenceId.toString(36), machineId].join('-');
};
