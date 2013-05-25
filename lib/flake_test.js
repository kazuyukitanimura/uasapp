var Flake = require('./flake');
var flake = new Flake();

var max = 10 * 1000;
var start = Date.now();
for (var i = max; i--;) {
  flake.next();
}
console.log(max * 1000 / (Date.now() - start), 'ids/sec');
