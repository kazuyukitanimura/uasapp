$(function() {
  var rand = function(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + (min? min: 0);
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
    var x = rand(90, 10);
    var y = rand(90, 10);
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
    $allBubble.append($([
      '<li><a>',
        JSON.stringify(data),
      '</a></li>'
    ].join('')));
    setTimeout($bubble.hide.bind($bubble, 0, function(duration) {
      this.data('hideTimer', setInterval(this.hide.bind(this), duration));
    }.bind($bubble, duration)), rmsec);
    $bubble.data('showTimer', setInterval($bubble.show.bind($bubble), duration));
    $this.after($bubble);
    $input.val('').focus();
    return false;
  });
});

