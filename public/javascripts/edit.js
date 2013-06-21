$(function() {
  var ELAPSED = 'elapsed';
  var RMSEC = 'rmsec';
  var TEXT = 'text';
  var X = 'x';
  var Y = 'y';
  var LANG = 'lang';
  var rand = function(max, min) {
    min = min || 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  var $allBubble = $('#all-bubble');
  var $img = $('img#target');
  $img.attr('src', $img.data('imgurl'));
  var duration = $img.data('duration');
  var startTime = Date.now();
  $('.bubble.bubble-old').each(function(){
    var $this = $(this);
    var elapsed = $this.data(ELAPSED);
    var rmsec = $this.data(RMSEC);
    setTimeout($this.hide.bind($this, 0, function(duration) {
      setInterval(this.hide.bind(this), duration);
    }.bind($this, duration)), elapsed + rmsec);
    setTimeout($this.show.bind($this, 0, function(duration) {
      setInterval(this.show.bind(this), duration);
    }.bind($this, duration)), elapsed);
  });
  $('#submit-bubble').submit(function(e) {
    e.preventDefault();
    var $this = $(this);
    var $input = $this.find('#bubble-input');
    var text = $input.val();
    var rmsec = parseFloat($this.find('#' + RMSEC).val()) * 1000;
    if (!text || rmsec <= 0) {
      return false;
    }
    var x = rand(90);
    var y = rand(90);
    var $bubble = $(['<div draggable="true" class="bubble animated bounce" style="top:', y, '%; left:', x, '%;">', text, '</div>'].join(''));
    var elapsed = (e.timeStamp - startTime) % duration;
    var $bubbleEntry = $([
      '<div class="form-inline bubble-entry">',
        '<button class="close pull-right">&times;</button>',
        '<div class="input-prepend">',
          '<span class="add-on">Time</span>',
          '<input class="input-mini" type="number" name="',  ELAPSED, '" value="', elapsed / 1000.0, '" min="0" step="any" disabled>',
        '</div>',
        '<div class="input-prepend">',
          '<span class="add-on">Hide after</span>',
          '<input class="input-mini" type="number" name="', RMSEC, '" value="', rmsec / 1000.0, '" min="0" step="any" disabled>',
        '</div>',
        '<div class="input-prepend">',
          '<span class="add-on">Text</span>',
          '<input class="input-mini" type="text" name="', TEXT, '" value="', text, '" disabled>',
        '</div>',
      '</div>'
    ].join(''));
    $bubbleEntry.data(X, x).data(Y, y).data(LANG, (navigator.language || navigator.userLanguage));
    $allBubble.append($bubbleEntry);
    setTimeout($bubble.hide.bind($bubble, 0, function(duration) {
      this.data('hideInterval', setInterval(this.hide.bind(this), duration));
    }.bind($bubble, duration)), rmsec);
    $bubble.data('showInterval', setInterval($bubble.show.bind($bubble), duration));
    $bubbleEntry.find('.close').click(function($bubble, e) {
      clearInterval($bubble.data('showInterval'));
      clearInterval($bubble.data('hideInterval'));
      $(this).remove();
      $bubble.remove();
    }.bind($bubbleEntry, $bubble));
    $img.after($bubble);
    $input.val('').focus();
    return false;
  });
  $('#save').submit(function(e) {
    e.preventDefault();
    var $this = $(this);
    var bubbleEntries = $this.find('.bubble-entry');
    var imgTitle = $('h1.img-title span.title');
    if (bubbleEntries && bubbleEntries.length > 0 && $img && $img.length === 1 && imgTitle && imgTitle.length === 1) {
      var bubbles = bubbleEntries.map(function() {
        var $elm = $(this);
        var elapsed = Math.round(parseFloat($elm.find(['input[name="', ELAPSED, '"]'].join('')).val()) * 1000);
        var rmsec = Math.round(parseFloat($elm.find(['input[name="', RMSEC, '"]'].join('')).val()) * 1000);
        var text = $elm.find(['input[name="', TEXT, '"]'].join('')).val();
        var x = $elm.data(X);
        var y = $elm.data(Y);
        var lang = $elm.data(LANG);
        return {
          elapsed: elapsed,
          rmsec: rmsec,
          text: text,
          x: x,
          y: y,
          lang: lang
        };
      }).get();
      $('.bubble.bubble-old').each(function() {
        var $elm = $(this);
        var elapsed = $elm.data(ELAPSED);
        var rmsec = $elm.data(RMSEC);
        var text = $elm.text();
        var x = $elm.data(X);
        var y = $elm.data(Y);
        var lang = $elm.data(LANG);
        bubbles.push({
          elapsed: elapsed,
          rmsec: rmsec,
          text: text,
          x: x,
          y: y,
          lang: lang
        });
      });
      var data = {
        bubbles: bubbles,
        url: $img.data('imgurl'),
        title: imgTitle.text()
      };
      $.post('/edit', data).done(function(res) {
        console.log(res);
        $('#success-message').show(); // TODO redirect to different page
      }).fail(function() {
        console.error('post failed');
        $('#error-message').show();
      });
    } else {
      console.error('Nothing to save');
    }
    return false;
  });
});

