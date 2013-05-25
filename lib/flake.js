var os = require('os');
var crypto = require('crypto');
var shasum = crypto.createHash('sha512');

var Flake = module.exports = function() {
  if (! (this instanceof Flake)) { // enforcing new
    return new Flake();
  }
  shasum.update(os.hostname(), 'utf8');
  this.machineId = shasum.digest('base64');
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
  return [timestamp.toString(36), this.sequenceId.toString(36), this.machineId].join('-');
};
