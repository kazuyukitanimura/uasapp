$(function() {
  var rand = function(max, min) {
    min = min || 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  var $allBubble = $('#all-bubble');
  var $img = $('img#target');
  $img.attr('src', $img.data('imgurl'));
  var startTime = Date.now();
  var ELAPSED = 'elapsed';
  var RMSEC = 'rmsec';
  var TEXT = 'text';
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
    var $bubble = $(['<div class="bubble animated bounce" style="top:', y, '%; left:', x, '%;">', text, '</div>'].join(''));
    var duration = parseInt($img.data('duration'), 10);
    var elapsed = (e.timeStamp - startTime) % duration;
    var $bubbleEntry = $([
      '<div class="form-inline bubble-entry">',
        '<button class="close pull-right">&times;</button>',
        '<div class="input-prepend">',
          '<span class="add-on">Time</span>',
          '<input class="input-mini" type="number" name="',  ELAPSED, '" value="', elapsed / 1000.0,'" min="0" step="any" disabled>',
        '</div>',
        '<div class="input-prepend">',
          '<span class="add-on">Hide after</span>',
          '<input class="input-mini" type="number" name="', RMSEC, '" value="', rmsec / 1000.0,'" min="0" step="any" disabled>',
        '</div>',
        '<div class="input-prepend">',
          '<span class="add-on">Text</span>',
          '<input class="input-mini" type="text" name="', TEXT, '" value="', text,'" disabled>',
        '</div>',
      '</div>'
    ].join(''));
    $allBubble.append($bubbleEntry);
    setTimeout($bubble.hide.bind($bubble, 0, function(duration) {
      this.data('hideInterval', setInterval(this.hide.bind(this), duration));
    }.bind($bubble, duration)), rmsec);
    $bubble.data('showInterval', setInterval($bubble.show.bind($bubble), duration));
    $bubbleEntry.find('.close').click(function($bubble, e){
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
    // the order of elapseds, rmsecs, texts are guaranteed by jQuery
    var elapseds = $this.find(['input[name="', ELAPSED, '"]'].join(''));
    var rmsecs = $this.find(['input[name="', RMSEC, '"]'].join(''));
    var texts = $this.find(['input[name="', TEXT, '"]'].join(''));
    var img = $this.find('input[name="img"]');
    if (elapseds && rmsecs && texts && elapseds.length === rmsecs.length && elapseds.length === texts.length && img && img.length === 1) {
      var data = {
        elapsed: elapseds.map(function() {
          return $(this).val();
        }).get(),
        text: texts.map(function() {
          return $(this).val();
        }).get(),
        rmsec: rmsecs.map(function() {
          return $(this).val();
        }).get(),
        img: img.val()
      };
      $.post('/edit', data).done(function(res) {
        console.log(res);
        $('#success-message').show(); // TODO redirect to different page
      }).fail(function() {
        console.error('post failed');
        $('#error-message').show();
      });
    } else {
      console.error('something went wrong');
      $('#error-message').show();
    }
    return false;
  });
});

