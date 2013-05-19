$(function() {
  var self = this;
  var baseLinkId = 'link';

  var page = ['<div id="', baseLinkId, i, '" class="row-fluid">',
                '<a class="span12" target="_blank" href>',
                  '<h3>', (i + 1), '. ', link.title, '</h3>',
                  '<div class="url">', link.url, '</div>',
                  '<img src="', link.url, '" data-start="', Date.now(), '" data-duration="', 4200, '" id="imgid', i, '">',
                '</a>',
                '<form class="input-append" data-imgid="imgid', i, '">',
                  '<input class="bubble-input" type="text">',
                  '<input class="btn" type="submit" value="Bubble">',
                  '<label>Remove after</label>',
                  '<input class="rmsec" type="number" value="2.0">',
                  '<span class="add-on">sec</span>',
                '</form>',
              '</div>'].join('');
  var $container = $('div#main.container');
  $container.append(page);
  
  var rand = function(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + (min? min: 0);
  };
  $('.input-append').submit(function(e) {
    e.preventDefault();
    var $this = $(this);
    var $input = $this.find('.bubble-input');
    var text = $input.val();
    var imageid = $this.data('imgid');
    var $img = $('img#' + imageid);
    var rmsec = parseFloat($this.find('.rmsec').val()) * 1000;
    var x = rand(90, 10);
    var y = rand(90, 10);
    var $bubble = $(['<div class="bubble animated bounce" style="top:', y, '%; left:', x, '%;">', text, '</div>'].join(''));
    var duration = parseInt($img.data('duration'), 10);
    var elapsed = (e.timeStamp - parseInt($img.data('start'), 10)) % duration;
    var data = {
      elapsed: elapsed,
      x: x,
      y: y,
      text: text,
      rmsec: rmsec
    };
    setTimeout($bubble.hide.bind($bubble, 0, function(duration) {
      this.data('hideTimer', setInterval(this.hide.bind(this), duration));
    }.bind($bubble, duration)), rmsec);
    $bubble.data('showTimer', setInterval($bubble.show.bind($bubble), duration));
    $this.after($bubble);
    $input.val('').focus();
    return false;
  };
});

