$(function() {
  var rand = function(max, min) {
    min = min || 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  var $allBubble = $('#all-bubble');
  var $img = $('img#target');
  $img.attr('src', $img.data('imgurl'));
  var startTime = Date.now();
  $('#submit-bubble').submit(function(e) {
    e.preventDefault();
    var $this = $(this);
    var $input = $this.find('#bubble-input');
    var text = $input.val();
    var rmsec = parseFloat($this.find('#rmsec').val()) * 1000;
    if (!text || rmsec <= 0) {
      return false;
    }
    var x = rand(90);
    var y = rand(90);
    var $bubble = $(['<div class="bubble animated bounce" style="top:', y, '%; left:', x, '%;">', text, '</div>'].join(''));
    var duration = parseInt($img.data('duration'), 10);
    var elapsed = (e.timeStamp - startTime) % duration;
    var data = {
      elapsed: elapsed,
      x: x,
      y: y,
      text: text,
      rmsec: rmsec
    };
    var $bubbleEntry = $([
      '<div class="form-inline bubble-entry">',
        '<button class="close pull-right">&times;</button>',
        '<div class="input-prepend">',
          '<span class="add-on">Time</span>',
          '<input class="input-mini" type="number" name="elapsed" value="', data.elapsed / 1000.0,'" min="0" step="any">',
        '</div>',
        '<div class="input-prepend">',
          '<span class="add-on">Hide after</span>',
          '<input class="input-mini" type="number" name="rmsec" value="', data.rmsec / 1000.0,'" min="0" step="any">',
        '</div>',
        '<div class="input-prepend">',
          '<span class="add-on">Text</span>',
          '<input class="input-mini" type="text" name="text" value="', data.text,'">',
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
});

