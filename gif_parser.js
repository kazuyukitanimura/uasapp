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
};
Consumable.prototype.withdraw = function(size) {
  var chunk = this.chunk;
  var rest = chunk.length - chunk.pos;
  if (rest < size) {
    var next = this.rs.read(size - rest);
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
Consumable.prototype.consume8 = function() {
  var chunk = this.chunk;
  var res = chunk.readUInt8(chunk.pos++);
  var shorting = chunk.pos - chunk.length;
  if (shorting >= 0) {
    chunk.next.pos = shorting;
    this.chunk = chunk.next;
  }
  return res;
};
Consumable.prototype.consume16LE = function() {
  var chunk = this.chunk;
  if (chunk.pos + 1 < chunk.length) {
    var pos = chunk.pos;
    chunk.pos += 2;
    return chunk.readUInt16LE(pos);
  } else {
    var lower = consume8(); // little endian
    return (consume8() << 8) | lower;
  }
};
Consumable.prototype.consume16BE = function() {
  var chunk = this.chunk;
  if (chunk.pos + 1 < chunk.length) {
    var pos = chunk.pos;
    chunk.pos += 2;
    return chunk.readUInt16BE(pos);
  } else {
    return (consume8() << 8) | consume8();
  }
};
Consumable.prototype.consume32BE = function() {
  var chunk = this.chunk;
  if (chunk.pos + 3 < chunk.length) {
    var pos = chunk.pos;
    chunk.pos += 4;
    return chunk.readUInt32BE(pos);
  } else {
    return (consume16BE() << 16) | consume16BE();
  }
};
Consumable.prototype.waste = function(size) {
  var chunk = this.chunk;
  if (chunk.length < chunk.pos + size) {
    throw new Error('Consumable: cannot waste more than withdrawn');
  }
  this.chunk.pos += size;
};

var getPaletteSize = function(palette) {
  return (palette & 0x80) ? 3 * (2 << (palette & 0x07)) : 0;
}
var getDuration = function(duration) {
  return duration * 10; // in milisec, the original accuracy is 1/100
}
var getSubBlockSize = function(cs, pos) {
  var totalSize = 0;
  var size = 0;
  do {
    size = cs.getUint8(pos + totalSize, true);
    totalSize += size + 1;
  } while (size > 0);
  return totalSize;
}

var Gify = module.exports = function(sourceStream, callback) {
  if (! (this instanceof Gify)) { // enforcing new
    return new Gify(sourceStream, callback);
  }
  sourceStream.on('readable', this.step).on('error', this._finish).on('end', this._finish);
  this.cs = new Consumable(sourceStream);
  this.step = this._readHeader;
  this.withdrawLen = 10;
  this.info = {
    valid: false,
    height: 0,
    width: 0,
    frames: 0,
    duration: 0,
  };
  this.cb = callback;
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

Gify.prototype._readHeader = function() {
  var cs = this.cs;
  if (cs.withdraw(this.withdrawLen)) {
    // check if GIF8
    if (cs.consume32BE() != 0x47494638) {
      this._finish();
    }

    // get height/width
    this.info.height = cs.consume16LE();
    this.info.width = cs.consume16LE();

    //parse global palette
    var globalPalette = cs.consume8();
    this.withdrawLen = getPaletteSize(globalPalette) + 2; // skipping bg color and aspect ratio

    this.step = this._readPalette;
    this.step();
  }
};

Gify.prototype._readPalette = function() {
  var cs = this.cs;
  if (cs.withdraw(this.withdrawLen)) {
    cs.waste(this.withdrawLen);

    this.step = this._readExtention;
    this.step();
  }
};

Gify.prototype.getInfo = function() {

  while (true) {
    try {
      var block = this.cs.getUint8(this.pos, true);

      if (block === 0x21) {
        // EXTENSION BLOCK
        var type = this.cs.getUint8(this.pos + 1, true);
        if (type === 0xF9) {
          var length = this.cs.getUint8(this.pos + 2);
          if (length === 4) {
            this.info.duration += getDuration(this.cs.getUint16(this.pos + 4, true));

            // increment frame count
            this.info.frames++;
            this.pos += 8;
          } else {
            this.pos++;
          }
        } else { // AEB, CEB, PTEB, ETC
          this.pos += 2;
          this.pos += getSubBlockSize(this.cs, this.pos);
        }
      } else if (block === 0x2C) {
        // IMAGE BLOCK
        // parse local palette
        var localPalette = this.cs.getUint8(this.pos + 9, true);
        this.pos += getPaletteSize(localPalette);
        this.pos += 11;
        this.pos += getSubBlockSize(this.cs, this.pos);
      } else if (block === 0x3B) {
        // TRAILER BLOCK (THE END)
        break;
      } else {
        // UNKNOWN BLOCK (bad)
        this.pos++;
      }
    } catch(e) {
      return this.info;
    }

    // this shouldn't happen, but if the trailer block is missing, we should bail at EOF
    if (this.pos >= sourceArrayBuffer.byteLength) {
      break;
    }
  }

  this.info.valid = true;
  return this.info;
};

