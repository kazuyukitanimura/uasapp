/*
 * gify v0.3 modified version
 * original source https://github.com/rfrench/gify
 *
 * Copyright 2013, Ryan French
 *
 * Licence: Do What The Fuck You Want To Public License
 * http://www.wtfpl.net/
 */

'use strict';

var Consumable = function(readableStream) {
  if (! (this instanceof Consumable)) { // enforcing new
    return new Consumable(readableStream);
  }
  this.rs = readableStream;
  this.chunk = new Buffer(0);
  this.chunk.pos = 0;
};
Consumable.prototype.withdraw = function(size) {
  var chunk = this.chunk;
  var rest = chunk.length - chunk.pos;
  var shorting = size - rest - (chunk.next ? chunk.next.length: 0);
  if (shorting > 0) {
    var next = this.rs.read(shorting);
    if (!next) {
      return false;
    } else if (rest > 0) {
      chunk.next = next;
    } else if (chunk.next) {
      // should not achieve here
      throw new Error('Consumable: something went wrong');
    } else {
      next.pos = 0;
      this.chunk = next;
    }
  }
  return true;
};
Consumable.prototype._checkNext = function() {
  var chunk = this.chunk;
  var shorting = chunk.pos - chunk.length;
  if (shorting >= 0 && chunk.next) {
    chunk.next.pos = shorting;
    this.chunk = chunk.next;
  }
};
Consumable.prototype.consume8 = function() {
  var chunk = this.chunk;
  var res = chunk.readUInt8(chunk.pos++);
  this._checkNext();
  return res;
};
Consumable.prototype.consume16LE = function() {
  var chunk = this.chunk;
  if (chunk.pos + 1 < chunk.length) {
    var pos = chunk.pos;
    chunk.pos += 2;
    return chunk.readUInt16LE(pos);
  } else {
    var lower = this.consume8(); // little endian
    return (this.consume8() << 8) | lower;
  }
};
Consumable.prototype.consume16BE = function() {
  var chunk = this.chunk;
  if (chunk.pos + 1 < chunk.length) {
    var pos = chunk.pos;
    chunk.pos += 2;
    return chunk.readUInt16BE(pos);
  } else {
    return (this.consume8() << 8) | this.consume8();
  }
};
Consumable.prototype.consume32BE = function() {
  var chunk = this.chunk;
  if (chunk.pos + 3 < chunk.length) {
    var pos = chunk.pos;
    chunk.pos += 4;
    return chunk.readUInt32BE(pos);
  } else {
    return (this.consume16BE() << 16) | this.consume16BE();
  }
};
Consumable.prototype.waste = function(size) {
  this.chunk.pos += size; // chunk.pos < chunck.length is checked at consume8
  this._checkNext();
};

var getPaletteSize = function(palette) {
  return (palette & 0x80) ? 3 * (2 << (palette & 0x07)) : 0;
};

var Gify = module.exports = function(sourceStream, callback) {
  if (! (this instanceof Gify)) { // enforcing new
    return new Gify(sourceStream, callback);
  }
  this.cs = new Consumable(sourceStream);
  this.step = this._readHeader;
  this.withdrawLen = 11;
  this.info = {
    valid: false,
    height: 0,
    width: 0,
    frames: 0,
    duration: 0
  };
  this.cb = callback;
  this.inputEnd = false;
  sourceStream.on('readable', this._onReadable.bind(this)).on('error', this._finish.bind(this)).on('end', this._onEnd.bind(this));
};
Gify.prototype._onReadable = function() {
  this.step();
};
Gify.prototype._onEnd = function() {
  this.inputEnd = true;
};
Gify.prototype._finish = function(err) {
  if (this.step) { // fire only once
    if (!err && ! this.info.valid) {
      err = new Error('Invalid gif format');
    }
    setImmediate(this.cb, err, this.info);
  }
  this.step = null;
};
Gify.prototype._reader = function(callback) {
  var cs = this.cs;
  if (cs.withdraw(this.withdrawLen)) {
    callback.call(this, cs);
    this.step();
  } else if (this.inputEnd) {
    this._finish();
  }
};
Gify.prototype._readHeader = function() {
  this._reader(function(cs) {
    // check if GIF8
    if (cs.consume32BE() != 0x47494638) {
      this.step = this._finish;
    } else {
      cs.waste(2);
      // get height/width
      this.info.width = cs.consume16LE();
      this.info.height = cs.consume16LE();
      //parse global palette
      this.withdrawLen = getPaletteSize(cs.consume8()) + 2; // skipping bg color and aspect ratio
      this.step = this._readWaste;
    }
  });
};
Gify.prototype._readWaste = function() {
  this._reader(function(cs) {
    cs.waste(this.withdrawLen);
    this.withdrawLen = 1;
    this.step = this._readBlock;
  });
};
Gify.prototype._readBlock = function() {
  this._reader(function(cs) {
    var block = cs.consume8();
    if (block === 0x21) { // EXTENSION BLOCK
      this.withdrawLen = 5;
      this.step = this._readExtention;
    } else if (block === 0x2C) { // IMAGE BLOCK
      this.withdrawLen = 9;
      this.step = this._readImage;
    } else if (block === 0x3B) { // TRAILER BLOCK (THE END)
      this.info.valid = true;
      this.step = this._finish;
    } else { // UNKNOWN BLOCK (bad)
      this.step = this._finish;
    }
  });
};
Gify.prototype._readExtention = function() {
  this._reader(function(cs) {
    if (cs.consume8() === 0xF9) {
      if (cs.consume8() === 4) {
        cs.waste(1);
        this.info.duration += cs.consume16LE() * 10; // in milisec, the original accuracy is 1/100 sec
        this.info.frames++; // increment frame count
        this.withdrawLen = 2;
        this.step = this._readWaste;
      } else {
        this.withdrawLen = 1;
        this.step = this._readBlock;
      }
    } else { // AEB, CEB, PTEB, ETC
      this.withdrawLen = 1;
      this.step = this._readSubBlock;
    }
  });
};
Gify.prototype._readSubBlock = function() {
  this._reader(function(cs) {
    cs.waste(this.withdrawLen - 1);
    var size = cs.consume8();
    this.withdrawLen = size + 1;
    if (!size) {
      this.step = this._readBlock;
    }
  });
};
Gify.prototype._readImage = function() {
  this._reader(function(cs) {
    cs.waste(8);
    // parse local palette
    this.withdrawLen = getPaletteSize(cs.consume8()) + 2;
    this.step = this._readSubBlock;
  });
};
